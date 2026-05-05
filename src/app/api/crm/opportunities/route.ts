import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const accountId = searchParams.get("account_id");
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "100";

    const params = new URLSearchParams();
    params.set("page", page);
    params.set("page_size", pageSize);
    if (stage) params.set("stage", stage);
    if (accountId) params.set("account_id", accountId);

    const response = await fetch(`${API_BASE}/api/v1/crm/opportunities?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`CRM Opportunities API error: ${response.status} - ${text}`);
      return NextResponse.json(
        { error: `API returned ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Backend returns PaginatedResponse
    if (data.items && Array.isArray(data.items)) {
      return NextResponse.json({
        opportunities: data.items,
        total: data.total,
        page: data.page,
        page_size: data.page_size,
        total_pages: data.total_pages,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("CRM Opportunities proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE}/api/v1/crm/opportunities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `API returned ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("CRM Opportunities POST error:", error);
    return NextResponse.json(
      { error: "Failed to create opportunity", details: error.message },
      { status: 500 }
    );
  }
}
