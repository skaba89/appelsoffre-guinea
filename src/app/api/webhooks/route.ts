import { NextRequest, NextResponse } from "next/server";
import {
  registerWebhook,
  listWebhooks,
  type WebhookEvent,
} from "@/lib/webhook-engine";

// ─── GET /api/webhooks ─────────────────────────────────────────────────────────
// Liste les webhooks enregistrés pour l'utilisateur courant

export async function GET() {
  const webhooks = listWebhooks();

  return NextResponse.json({
    webhooks,
    total: webhooks.length,
  });
}

// ─── POST /api/webhooks ────────────────────────────────────────────────────────
// Enregistre un nouveau webhook

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, events, description } = body as {
      url?: string;
      events?: WebhookEvent[];
      description?: string;
    };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "L'URL du webhook est requise" },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Au moins un événement doit être sélectionné" },
        { status: 400 }
      );
    }

    const result = registerWebhook(url, events, description || "");

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.webhook, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 }
    );
  }
}
