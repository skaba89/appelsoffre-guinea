import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("company_id") || searchParams.get("account_id");
    const search = searchParams.get("search");
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "100";

    // Build query params for backend
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("page_size", pageSize);
    if (accountId) params.set("account_id", accountId);
    if (search) params.set("search", search);

    const response = await fetch(`${API_BASE}/api/v1/crm/contacts?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`CRM Contacts API error: ${response.status} - ${text}`);
      return NextResponse.json(
        { error: `API returned ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Backend returns PaginatedResponse: { items, total, page, page_size, total_pages }
    if (data.items && Array.isArray(data.items)) {
      const normalized = data.items.map(normalizeContact);
      return NextResponse.json({
        contacts: normalized,
        total: data.total,
        page: data.page,
        page_size: data.page_size,
        total_pages: data.total_pages,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("CRM Contacts proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Convert frontend field names to backend field names
    const backendBody: any = { ...body };
    if (body.email) {
      backendBody.professional_email = body.email;
      delete backendBody.email;
    }
    if (body.phone) {
      backendBody.professional_phone = body.phone;
      delete backendBody.phone;
    }
    if (body.position) {
      backendBody.job_title = body.position;
      delete backendBody.position;
    }

    const response = await fetch(`${API_BASE}/api/v1/crm/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendBody),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `API returned ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(normalizeContact(data));
  } catch (error: any) {
    console.error("CRM Contacts POST error:", error);
    return NextResponse.json(
      { error: "Failed to create contact", details: error.message },
      { status: 500 }
    );
  }
}

/** Normalize backend CRMContact fields to match frontend expectations */
function normalizeContact(contact: any): any {
  return {
    id: contact.id,
    first_name: contact.first_name,
    last_name: contact.last_name,
    name: [contact.first_name, contact.last_name].filter(Boolean).join(" ") || null,
    email: contact.professional_email || contact.email || null,
    phone: contact.professional_phone || contact.phone || null,
    position: contact.job_title || contact.position || null,
    job_title: contact.job_title || null,
    responsibility: contact.responsibility || null,
    organization_name: contact.organization_name || null,
    company_name: contact.organization_name || null,
    account_id: contact.account_id || null,
    company: contact.account_id ? { id: contact.account_id, name: contact.organization_name } : null,
    institutional_page: contact.institutional_page || null,
    linkedin_public: contact.linkedin_public || null,
    source_url: contact.source_url || null,
    source_label: contact.source_label || null,
    validation_status: contact.validation_status || "pending",
    is_active: contact.is_active !== false,
    created_at: contact.created_at,
    updated_at: contact.updated_at,
  };
}
