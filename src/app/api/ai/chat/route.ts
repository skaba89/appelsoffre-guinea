import { NextRequest, NextResponse } from "next/server";
import { processRAGQuery, type ConversationMode } from "@/lib/rag-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, mode, context } = body as {
      message?: string;
      mode?: ConversationMode;
      context?: string;
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Le message est requis et ne peut pas être vide." },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes: ConversationMode[] = ["analysis", "drafting", "research", "strategy"];
    const safeMode: ConversationMode = validModes.includes(mode as ConversationMode)
      ? (mode as ConversationMode)
      : "analysis";

    // Process with RAG engine
    const ragResponse = processRAGQuery(message.trim(), safeMode, context);

    return NextResponse.json(ragResponse);
  } catch (error: unknown) {
    console.error("AI Chat RAG error:", error);
    const msg = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
