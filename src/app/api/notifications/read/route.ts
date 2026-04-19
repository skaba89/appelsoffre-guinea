import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/notifications/read ──────────────────────────────────────────────
// Marque des notifications comme lues

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, markAll } = body as {
      ids?: string[];
      markAll?: boolean;
    };

    if (markAll) {
      return NextResponse.json({
        success: true,
        markedCount: 5, // Mock: all unread
      });
    }

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "Fournissez un tableau d'IDs ou markAll: true" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      markedCount: ids.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 }
    );
  }
}
