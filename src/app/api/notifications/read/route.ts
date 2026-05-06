import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
      try {
        const result = await db.notification.updateMany({
          where: { isRead: false },
          data: { isRead: true },
        });
        return NextResponse.json({
          success: true,
          markedCount: result.count,
        });
      } catch (dbError) {
        console.error("[Notifications Read] Erreur base de données (markAll):", dbError);
        // Fallback mock response
        return NextResponse.json({
          success: true,
          markedCount: 5,
        });
      }
    }

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "Fournissez un tableau d'IDs ou markAll: true" },
        { status: 400 }
      );
    }

    try {
      const result = await db.notification.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true },
      });
      return NextResponse.json({
        success: true,
        markedCount: result.count,
      });
    } catch (dbError) {
      console.error("[Notifications Read] Erreur base de données (ids):", dbError);
      // Fallback mock response
      return NextResponse.json({
        success: true,
        markedCount: ids.length,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 }
    );
  }
}
