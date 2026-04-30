import { NextRequest, NextResponse } from "next/server";
import { mockAlerts } from "@/lib/mock-data";

// ─── GET /api/notifications ────────────────────────────────────────────────────
// Liste les notifications de l'utilisateur courant

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const unread = searchParams.get("unread") === "true";
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  let notifications = [...mockAlerts];

  // Filter by unread
  if (unread) {
    notifications = notifications.filter((n) => !n.is_read);
  }

  // Filter by type
  if (type) {
    notifications = notifications.filter((n) => n.type === type);
  }

  // Apply limit
  notifications = notifications.slice(0, limit);

  const unreadCount = mockAlerts.filter((n) => !n.is_read).length;

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.is_read,
      tenderId: n.tender_id,
      createdAt: n.created_at,
    })),
    total: mockAlerts.length,
    unreadCount,
  });
}
