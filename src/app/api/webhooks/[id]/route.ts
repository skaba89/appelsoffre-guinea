import { NextRequest, NextResponse } from "next/server";
import { deleteWebhook, getWebhook } from "@/lib/webhook-engine";

// ─── DELETE /api/webhooks/[id] ─────────────────────────────────────────────────
// Supprime un webhook enregistré

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check if webhook exists
  const webhook = getWebhook(id);
  if (!webhook) {
    return NextResponse.json(
      { error: "Webhook introuvable", code: 404 },
      { status: 404 }
    );
  }

  const result = deleteWebhook(id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Webhook supprimé avec succès",
  });
}
