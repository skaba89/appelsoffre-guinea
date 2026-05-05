import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "100";

    if (id) {
      // Fetch single account
      const response = await fetch(`${API_BASE}/api/v1/crm/accounts/${id}`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`CRM Account API error: ${response.status} - ${text}`);
        return NextResponse.json(
          { error: `API returned ${response.status}`, details: text },
          { status: response.status }
        );
      }

      const data = await response.json();
      // Normalize field names for frontend compatibility
      const normalized = normalizeAccount(data);
      return NextResponse.json(normalized);
    }

    // Fetch all accounts - build query params
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("page_size", pageSize);
    if (search) params.set("search", search);
    if (type) params.set("type", type);

    const response = await fetch(`${API_BASE}/api/v1/crm/accounts?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`CRM Accounts API error: ${response.status} - ${text}`);
      return NextResponse.json(
        { error: `API returned ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Backend returns PaginatedResponse: { items, total, page, page_size, total_pages }
    // Frontend expects either an array or { companies: [...] }
    if (data.items && Array.isArray(data.items)) {
      const normalized = data.items.map(normalizeAccount);
      return NextResponse.json({
        companies: normalized,
        total: data.total,
        page: data.page,
        page_size: data.page_size,
        total_pages: data.total_pages,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("CRM Accounts proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE}/api/v1/crm/accounts`, {
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
    return NextResponse.json(normalizeAccount(data));
  } catch (error: any) {
    console.error("CRM Accounts POST error:", error);
    return NextResponse.json(
      { error: "Failed to create account", details: error.message },
      { status: 500 }
    );
  }
}

/** Normalize backend CRMAccount fields to match frontend expectations */
function normalizeAccount(acc: any): any {
  return {
    id: acc.id,
    name: acc.name,
    type: acc.type,
    industry: acc.industry || acc.sector || null,
    sector: acc.sector || null,
    website: acc.website || null,
    description: acc.description || null,
    address: acc.address || null,
    city: acc.city || null,
    country: acc.country || "GN",
    is_public_buyer: acc.is_public_buyer || false,
    source_url: acc.source_url || null,
    source_label: acc.source_label || null,
    is_active: acc.is_active !== false,
    created_at: acc.created_at,
    updated_at: acc.updated_at,
  };
}
