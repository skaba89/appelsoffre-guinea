"""TenderFlow Guinea — RAG (Retrieval Augmented Generation) Service.

Provides document ingestion, chunking, embedding, semantic search,
and question-answering over tender documents.
"""
import json
import math
from typing import Optional

from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.tender import TenderDocument, TenderChunk


# ─── Chunking ────────────────────────────────────────────────────────────

CHUNK_SIZE = 1000  # Characters per chunk
CHUNK_OVERLAP = 200  # Overlap between chunks


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks of approximately chunk_size characters.

    Tries to split on paragraph or sentence boundaries when possible.
    """
    if not text:
        return []

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size

        # If we're not at the end, try to find a natural break
        if end < text_len:
            # Look for paragraph break
            paragraph_break = text.rfind("\n\n", start, end)
            if paragraph_break != -1 and paragraph_break > start + chunk_size // 2:
                end = paragraph_break + 2
            else:
                # Look for sentence break
                sentence_break = text.rfind(". ", start, end)
                if sentence_break != -1 and sentence_break > start + chunk_size // 2:
                    end = sentence_break + 2

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap if end < text_len else end

    return chunks


# ─── Embedding ────────────────────────────────────────────────────────────

async def get_embedding(text: str) -> list[float]:
    """Get embedding vector for a text using the configured embedding provider.

    Falls back to a simple hash-based pseudo-embedding for development without an API key.
    """
    if settings.EMBEDDING_PROVIDER == "openai" and settings.LLM_API_KEY:
        try:
            import httpx
            base_url = settings.LLM_BASE_URL or "https://api.openai.com/v1"
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{base_url}/embeddings",
                    headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
                    json={"model": settings.EMBEDDING_MODEL, "input": text[:8000]},
                    timeout=30.0,
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["data"][0]["embedding"]
        except Exception:
            pass

    # Fallback: deterministic pseudo-embedding for development
    import hashlib
    dimension = settings.EMBEDDING_DIMENSION
    text_hash = hashlib.sha256(text.encode()).digest()
    embedding = []
    for i in range(dimension):
        byte_idx = (i * 4) % len(text_hash)
        val = int.from_bytes(text_hash[byte_idx:byte_idx+4], "big") / (2**32)
        embedding.append(val * 2 - 1)
    return embedding


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x ** 2 for x in a))
    norm_b = math.sqrt(sum(x ** 2 for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


# ─── Document Ingestion ──────────────────────────────────────────────────

async def ingest_document(db: AsyncSession, document_id: str) -> dict:
    """Ingest a tender document: chunk the text and generate embeddings.

    Returns a summary of the ingestion process.
    """
    result = await db.execute(
        select(TenderDocument).where(TenderDocument.id == document_id)
    )
    document = result.scalar_one_or_none()
    if not document:
        return {"error": "Document introuvable", "chunks_created": 0}

    if not document.content_text:
        return {"error": "Le document ne contient pas de texte extractible", "chunks_created": 0}

    # Delete existing chunks for this document (re-ingestion)
    await db.execute(
        delete(TenderChunk).where(TenderChunk.tender_document_id == document_id)
    )
    await db.flush()

    # Chunk the text
    text_chunks = chunk_text(document.content_text)
    chunks_created = 0

    for idx, chunk_text_content in enumerate(text_chunks):
        # Generate embedding
        embedding = await get_embedding(chunk_text_content)

        chunk = TenderChunk(
            tender_document_id=document_id,
            chunk_index=idx,
            content=chunk_text_content,
            embedding=embedding,
            chunk_metadata={
                "document_filename": document.original_filename,
                "chunk_size": len(chunk_text_content),
            },
        )
        db.add(chunk)
        chunks_created += 1

    # Mark document as parsed
    document.is_parsed = True
    await db.flush()

    return {
        "document_id": document_id,
        "chunks_created": chunks_created,
        "total_characters": len(document.content_text),
    }


# ─── Semantic Search ─────────────────────────────────────────────────────

async def search_tender_chunks(
    db: AsyncSession,
    query: str,
    tender_id: Optional[str] = None,
    limit: int = 5,
    similarity_threshold: float = 0.3,
) -> list[dict]:
    """Search for relevant chunks using semantic similarity.

    Returns the top-k most relevant chunks with their similarity scores.
    """
    query_embedding = await get_embedding(query)

    # Build query for chunks
    stmt = select(TenderChunk)
    if tender_id:
        stmt = stmt.join(TenderDocument).where(TenderDocument.tender_id == tender_id)

    result = await db.execute(stmt)
    chunks = result.scalars().all()

    # Calculate similarities
    scored_chunks = []
    for chunk in chunks:
        if chunk.embedding:
            sim = cosine_similarity(query_embedding, chunk.embedding)
            if sim >= similarity_threshold:
                scored_chunks.append({
                    "chunk_id": chunk.id,
                    "content": chunk.content,
                    "similarity": round(sim, 4),
                    "metadata": chunk.chunk_metadata,
                    "document_id": chunk.tender_document_id,
                })

    # Sort by similarity descending
    scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
    return scored_chunks[:limit]


# ─── QA over Documents ───────────────────────────────────────────────────

async def generate_tender_qa(
    db: AsyncSession,
    tender_id: str,
    question: str,
) -> dict:
    """Answer a question about a tender using RAG over its documents.

    Returns the answer with source citations.
    """
    # Search for relevant chunks
    relevant_chunks = await search_tender_chunks(db, question, tender_id, limit=5)

    if not relevant_chunks:
        return {
            "question": question,
            "answer": "Aucun document pertinent trouvé pour répondre à cette question. Veuillez d'abord ingérer les documents du DAO.",
            "sources": [],
        }

    # Build context from relevant chunks
    context = "\n\n---\n\n".join(
        f"[Source: {c['metadata'].get('document_filename', 'Document')}, similarité: {c['similarity']}]"
        f"\n{c['content']}"
        for c in relevant_chunks
    )

    # Generate answer using LLM
    answer = await _call_llm(
        f"""Réponds à la question suivante en te basant UNIQUEMENT sur le contexte fourni.
Si la réponse ne se trouve pas dans le contexte, indique-le clairement.

CONTEXTE :
{context}

QUESTION : {question}

RÉPONSE (cite les sources utilisées) :"""
    )

    return {
        "question": question,
        "answer": answer,
        "sources": [
            {
                "chunk_id": c["chunk_id"],
                "document_id": c["document_id"],
                "similarity": c["similarity"],
                "excerpt": c["content"][:200] + "..." if len(c["content"]) > 200 else c["content"],
            }
            for c in relevant_chunks
        ],
    }


async def compare_daos(
    db: AsyncSession,
    tender_id_1: str,
    tender_id_2: str,
) -> dict:
    """Compare two DAOs (tender documents) and highlight similarities and differences."""
    # Get chunks for both tenders
    chunks_1 = await search_tender_chunks(db, "résumé complet exigences conditions", tender_id_1, limit=10, similarity_threshold=0.0)
    chunks_2 = await search_tender_chunks(db, "résumé complet exigences conditions", tender_id_2, limit=10, similarity_threshold=0.0)

    context_1 = "\n".join(c["content"] for c in chunks_1[:5])
    context_2 = "\n".join(c["content"] for c in chunks_2[:5])

    comparison = await _call_llm(
        f"""Compare les deux appels d'offres suivants et identifie les similitudes et différences.

APPEL D'OFFRES 1 :
{context_1[:3000]}

APPEL D'OFFRES 2 :
{context_2[:3000]}

ANALYSE COMPARATIVE :
1. Points communs
2. Différences clés
3. Opportunités croisées
4. Recommandation"""
    )

    return {
        "tender_id_1": tender_id_1,
        "tender_id_2": tender_id_2,
        "comparison": comparison,
    }


async def detect_missing_documents(
    db: AsyncSession,
    tender_id: str,
) -> dict:
    """Detect potentially missing documents based on the tender requirements."""
    from app.models.tender import Tender

    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    if not tender:
        return {"error": "Appel d'offres introuvable"}

    # Get document text
    chunks = await search_tender_chunks(db, "pièces documents requis dossier administratif", tender_id, limit=5, similarity_threshold=0.0)
    context = "\n".join(c["content"] for c in chunks[:5])

    analysis = await _call_llm(
        f"""Analyse l'appel d'offres suivant et identifie les documents potentiellement manquants dans le dossier de réponse.

TITRE : {tender.title}
DESCRIPTION : {tender.description or 'Non disponible'}

EXTRAITS DU DAO :
{context[:3000]}

LISTE DES DOCUMENTS REQUIS TELS QUE IDENTIFIÉS DANS LE DAO :
(Vérifie chaque document requis et identifie ceux qui sont susceptibles de manquer)

Pour chaque document, indique :
- Nom du document
- Statut : Probablement disponible / Potentiellement manquant / Absent
- Action corrective suggérée"""
    )

    return {
        "tender_id": tender_id,
        "missing_documents_analysis": analysis,
    }


# ─── LLM Helper ──────────────────────────────────────────────────────────

async def _call_llm(prompt: str) -> str:
    """Call the configured LLM provider with a prompt and return the response."""
    if not settings.LLM_API_KEY:
        return "[Mode développement — clé API LLM non configurée. Configurez LLM_API_KEY pour activer les réponses IA.]"

    try:
        import httpx
        base_url = settings.LLM_BASE_URL or "https://api.openai.com/v1"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
                json={
                    "model": settings.LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": "Tu es un assistant expert en appels d'offres en Guinée. Réponds en français de manière professionnelle et structurée."},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": settings.LLM_MAX_TOKENS,
                    "temperature": settings.LLM_TEMPERATURE,
                },
                timeout=60.0,
            )
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                return f"[Erreur LLM: {response.status_code}]"
    except Exception as e:
        return f"[Erreur de connexion LLM: {str(e)}]"
