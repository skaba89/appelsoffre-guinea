import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockAlerts } from "@/lib/mock-data";

// ─── GET /api/notifications ────────────────────────────────────────────────────
// Liste les notifications de l'utilisateur courant

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const unread = searchParams.get("unread") === "true";
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  let notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    tenderId: string | null;
    createdAt: string;
  }> = [];
  let totalCount = 0;
  let unreadCount = 0;
  let fromDb = false;

  try {
    // Build Prisma where clause
    const where: Record<string, unknown> = {};
    if (unread) where.isRead = false;
    if (type) where.type = type;

    const [dbNotifications, dbTotal, dbUnreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.notification.count(),
      db.notification.count({ where: { isRead: false } }),
    ]);

    if (dbTotal > 0) {
      notifications = dbNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        tenderId: n.tenderId,
        createdAt: n.createdAt.toISOString(),
      }));
      totalCount = dbTotal;
      unreadCount = dbUnreadCount;
      fromDb = true;
    }
  } catch (error) {
    console.error("[Notifications] Erreur base de données:", error);
  }

  // Fallback to mock data
  if (!fromDb) {
    let filtered = [...mockAlerts];

    // Filter by unread
    if (unread) {
      filtered = filtered.filter((n) => !n.is_read);
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter((n) => n.type === type);
    }

    // Apply limit
    filtered = filtered.slice(0, limit);

    notifications = filtered.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.is_read,
      tenderId: n.tender_id,
      createdAt: n.created_at,
    }));

    totalCount = mockAlerts.length;
    unreadCount = mockAlerts.filter((n) => !n.is_read).length;
  }

  return NextResponse.json({
    notifications,
    total: totalCount,
    unreadCount,
  });
}
