# Architecture TenderFlow Guinea

## Vue d'ensemble

TenderFlow Guinea est une application SaaS multi-tenant construite sur une architecture modulaire et scalable. Le système est composé de 4 services principaux communicant via une base de données PostgreSQL, un cache Redis et un stockage objet MinIO.

## Services

### 1. API Backend (FastAPI)
- **Port** : 8000
- **Framework** : FastAPI + SQLAlchemy 2.x async + Pydantic v2
- **Rôle** : API REST pour toutes les opérations CRUD, authentification, scoring, RAG
- **Middleware** : CORS, Tenant isolation, Audit logging

### 2. Frontend Web (Next.js)
- **Port** : 3000
- **Framework** : Next.js 15 App Router + TypeScript + Tailwind CSS
- **Rôle** : Interface utilisateur B2B premium avec dark mode

### 3. Worker (Celery)
- **Rôle** : Tâches asynchrones (scoring, embeddings, génération de prompts, ingestion)
- **Broker** : Redis

### 4. Crawler (Playwright)
- **Rôle** : Collecte automatique des appels d'offres depuis les sources configurées
- **Technologies** : Playwright + BeautifulSoup + parsers PDF

## Base de données

### Extensions PostgreSQL
- `uuid-ossp` : Génération d'UUIDs
- `pgvector` : Recherche sémantique (embeddings vectoriels)

### Isolation Multi-tenant
Chaque table contient un champ `tenant_id`. Le middleware Tenant extrait le tenant du JWT et filtre automatiquement les requêtes.

### Entités principales (20+)
- tenants, users, memberships, audit_logs
- sources, source_runs
- tenders, tender_documents, tender_chunks, tender_scores
- categories, tags
- company_profiles, references, reusable_documents
- generated_prompts, generated_documents
- crm_accounts, crm_contacts, crm_opportunities, crm_interactions, crm_tasks, crm_notes
- alerts, subscriptions, billing_events

## Authentification et Sécurité

### JWT avec Refresh Tokens
- Access token : 60 minutes
- Refresh token : 30 jours
- Rotation automatique des refresh tokens

### RBAC
6 rôles avec permissions granulaires :
- `super_admin` : Accès global
- `tenant_admin` : Administration de l'organisation
- `analyst` : Analyse et qualification des AO
- `sales` : Gestion CRM commerciale
- `bid_manager` : Réponse aux appels d'offres
- `viewer` : Lecture seule

## Pipeline IA / RAG

1. **Upload** du document DAO → MinIO
2. **Ingestion** : Extraction texte (PyPDF2/pdfplumber)
3. **Chunking** : Découpage en segments (512 tokens, overlap 64)
4. **Embeddings** : Vectorisation via OpenAI/embeddings locaux
5. **Stockage** : Chunks + embeddings dans `tender_chunks` (pgvector)
6. **Query** : Recherche sémantique + LLM pour génération de réponses
7. **Citations** : Référencement des sources documentaires

## Moteur de Scoring

Le scoring est configurable avec 6 dimensions pondérées :

| Dimension | Poids par défaut | Description |
|-----------|-----------------|-------------|
| Pertinence | 30% | Match profil entreprise / AO |
| Urgence | 20% | Proximité de la date limite |
| Complexité | 10% | Difficulté de réponse estimée |
| Taille | 10% | Envergure du marché |
| Probabilité de gain | 20% | Estimation de succès |
| Risque documentaire | 10% | Complétude des pièces |

**Recommandation stratégique** :
- **GO** : priority >= 0.6, win_prob >= 0.5, doc_risk < 0.6
- **GO sous conditions** : priority >= 0.4, win_prob >= 0.3
- **NO GO** : autres cas

## Conformité

- Aucune donnée personnelle collectée
- Contacts professionnels publics uniquement avec traçabilité
- Validation des contacts (pending/verified/rejected)
- Audit logs sur toutes les actions sensibles
- Droit de suppression implémenté
