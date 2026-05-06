// ─── TenderFlow Guinea — Prisma Seed Script ────────────────────────────────────
// Seeds the database with comprehensive Guinea-specific demo data

import { PrismaClient } from "@prisma/client";
import {
  mockTenders,
  mockAccounts,
  mockContacts,
  mockOpportunities,
  mockAlerts,
  mockPrompts,
} from "../src/lib/mock-data";

const prisma = new PrismaClient();

// ─── Crawl Sources (18 Guinea-specific sources) ───────────────────────────────

const crawlSources = [
  // ── Government Sources (7) ──────────────────────────────────────────────────
  {
    name: "Direction Nationale des Marchés Publics",
    url: "https://dnmp.gouv.gn/appels-offres",
    type: "government",
    sector: "Multi-sector",
    region: "National",
    refreshInterval: 1800,
    status: "active",
    description: "Portail officiel des marchés publics de Guinée — DNMP",
    health: 95,
    successRate: 0.92,
  },
  {
    name: "Journal Officiel de la République de Guinée",
    url: "https://journal-officiel.gouv.gn",
    type: "government",
    sector: "Multi-sector",
    region: "National",
    refreshInterval: 86400,
    status: "active",
    description: "Publication officielle des avis d'appels d'offres et marchés",
    health: 88,
    successRate: 0.85,
  },
  {
    name: "Ministère des Travaux Publics",
    url: "https://mpw.gouv.gn/appels-offres",
    type: "government",
    sector: "BTP",
    region: "National",
    refreshInterval: 3600,
    status: "active",
    description: "Appels d'offres du Ministère des Travaux Publics et des Infrastructures",
    health: 82,
    successRate: 0.78,
  },
  {
    name: "Direction Nationale de l'Énergie",
    url: "https://dne.gouv.gn/ao",
    type: "government",
    sector: "Énergie",
    region: "National",
    refreshInterval: 3600,
    status: "active",
    description: "AO du secteur énergétique — projets solaires, hydroélectricité, réseaux",
    health: 90,
    successRate: 0.88,
  },
  {
    name: "AGUIPE — Agence Guinéenne de l'Informatique",
    url: "https://aguipe.gouv.gn/ao",
    type: "government",
    sector: "IT / Digital",
    region: "Conakry",
    refreshInterval: 3600,
    status: "active",
    description: "Marchés IT et cybersécurité de l'administration publique",
    health: 78,
    successRate: 0.72,
  },
  {
    name: "SOGUIPAMI — Société Guinéenne du Patrimoine Minier",
    url: "https://soguipami.gouv.gn/ao",
    type: "government",
    sector: "Mines",
    region: "National",
    refreshInterval: 7200,
    status: "active",
    description: "Appels d'offres du secteur minier et des titres miniers",
    health: 85,
    successRate: 0.80,
  },
  {
    name: "Ministère de la Santé et de l'Hygiène Publique",
    url: "https://ms.gouv.gn/ao",
    type: "government",
    sector: "Santé",
    region: "National",
    refreshInterval: 7200,
    status: "active",
    description: "AO équipements médicaux, réactifs, infrastructures sanitaires",
    health: 75,
    successRate: 0.70,
  },

  // ── Enterprise / Parapublic Sources (5) ──────────────────────────────────────
  {
    name: "Société des Eaux de Guinée (SEG)",
    url: "https://seg.gouv.gn/appels-offres",
    type: "enterprise",
    sector: "Eau / Assainissement",
    region: "Conakry",
    refreshInterval: 7200,
    status: "active",
    description: "Marchés de la Société des Eaux de Guinée — réseau, stations, canalisations",
    health: 70,
    successRate: 0.65,
  },
  {
    name: "Compagnie des Bauxites de Kindia (CBK)",
    url: "https://cbk.gouv.gn/ao",
    type: "enterprise",
    sector: "Mines",
    region: "Kindia",
    refreshInterval: 86400,
    status: "active",
    description: "Appels d'offres CBK — maintenance, équipements miniers, logistique",
    health: 65,
    successRate: 0.60,
  },
  {
    name: "Société Interprofessionnelle du Gaz de Guinée (SIGG)",
    url: "https://sigg.gouv.gn/ao",
    type: "enterprise",
    sector: "Industrie",
    region: "Conakry",
    refreshInterval: 86400,
    status: "active",
    description: "Marchés SIGG — GMAO, maintenance industrielle, infrastructure gaz",
    health: 72,
    successRate: 0.68,
  },
  {
    name: "Office National de Gestion Urbaine (ONGUI)",
    url: "https://ongui.gouv.gn/ao",
    type: "enterprise",
    sector: "Conseil",
    region: "Conakry",
    refreshInterval: 43200,
    status: "active",
    description: "AO ONGUI — conseil, restructuration, gestion urbaine",
    health: 80,
    successRate: 0.75,
  },
  {
    name: "Autorité de Régulation des Télécommunications (ARTP)",
    url: "https://artp.gouv.gn/ao",
    type: "enterprise",
    sector: "Télécom",
    region: "National",
    refreshInterval: 7200,
    status: "active",
    description: "Marchés télécoms — 4G rural, fibre optique, infrastructure réseau",
    health: 83,
    successRate: 0.77,
  },

  // ── International / Donor Sources (4) ────────────────────────────────────────
  {
    name: "Banque Mondiale — Projets Guinée",
    url: "https://projects.worldbank.org/pipeline?countrycode=GN",
    type: "international",
    sector: "Multi-sector",
    region: "National",
    refreshInterval: 43200,
    status: "active",
    description: "Projets financés par la Banque Mondiale en Guinée — BTP, éducation, santé",
    health: 96,
    successRate: 0.95,
  },
  {
    name: "Union Africaine — Marchés publics",
    url: "https://au.int/en/procurement",
    type: "international",
    sector: "Multi-sector",
    region: "National",
    refreshInterval: 86400,
    status: "active",
    description: "Appels d'offres de l'Union Africaine ouverts aux entreprises guinéennes",
    health: 90,
    successRate: 0.82,
  },
  {
    name: "BAD — Banque Africaine de Développement (Guinée)",
    url: "https://www.afdb.org/en/projects-operations/procurement",
    type: "international",
    sector: "Multi-sector",
    region: "National",
    refreshInterval: 43200,
    status: "active",
    description: "Projets BAD en Guinée — infrastructure, agriculture, énergie",
    health: 92,
    successRate: 0.88,
  },
  {
    name: "FIDA — Fonds International de Développement Agricole",
    url: "https://www.ifad.org/en/procurement",
    type: "international",
    sector: "Agriculture",
    region: "Nzérékoré",
    refreshInterval: 86400,
    status: "active",
    description: "Marchés FIDA — programmes agricoles en Guinée Forestière",
    health: 87,
    successRate: 0.80,
  },

  // ── Media / Aggregator Sources (2) ──────────────────────────────────────────
  {
    name: "Guinée Marchés — Agrégateur privé",
    url: "https://guineemarches.com/appels-offres",
    type: "media",
    sector: "Multi-sector",
    region: "National",
    refreshInterval: 1800,
    status: "active",
    description: "Agrégateur privé d'appels d'offres guinéens — veille multi-sources",
    health: 73,
    successRate: 0.68,
  },
  {
    name: "Afrique Entreprises — Portail régional",
    url: "https://afrique-entreprises.com/guinee/appels-offres",
    type: "media",
    sector: "Multi-sector",
    region: "National",
    refreshInterval: 3600,
    status: "paused",
    description: "Portail régional d'appels d'offres — section Guinée",
    health: 55,
    successRate: 0.45,
  },
];

// ─── Webhooks (3) ──────────────────────────────────────────────────────────────

const webhooks = [
  {
    url: "https://hooks.slack.com/services/T0X/B0X/xxxxxxxx",
    events: '["new_tender","deadline"]',
    description: "Notifications Slack — équipe veille AO",
    secret: "whsec_slack_tfx_001",
    isActive: true,
  },
  {
    url: "https://api.telegram.org/bot123456:ABC/sendMessage",
    events: '["new_tender","score","match"]',
    description: "Alertes Telegram — direction commerciale",
    secret: "whsec_tg_tfx_002",
    isActive: true,
  },
  {
    url: "https://erp.tenderflow-gn.com/api/webhooks/tender-update",
    events: '["tender_update","won","lost"]',
    description: "Sync ERP interne — mise à jour statut AO",
    secret: "whsec_erp_tfx_003",
    isActive: false,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Split "First Last" name into { firstName, lastName } */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }
  return { firstName: fullName, lastName: "" };
}

// ─── Main Seed Function ────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 TenderFlow Guinea — Seed Script\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── 1. Clear existing data (respect foreign key order) ──────────────────────
  console.log("🧹 Clearing existing data...");

  const deleteOrder = [
    prisma.generatedPrompt.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.opportunity.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.document.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.account.deleteMany(),
    prisma.tender.deleteMany(),
    prisma.webhook.deleteMany(),
    prisma.crawlSource.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.user.deleteMany(),
  ];

  await prisma.$transaction(deleteOrder);
  console.log("   ✓ All tables cleared\n");

  // ── 2. Create demo User ────────────────────────────────────────────────────
  console.log("👤 Creating demo user...");

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@tenderflow-gn.com",
      name: "Amadou Diallo",
      passwordHash:
        "$2b$10$dummy.hash.for.seed.purposes.only.not.for.production",
      phone: "+224 620 00 00 00",
      organization: "TenderFlow Guinea",
      role: "tenant_admin",
      timezone: "Africa/Conakry",
      language: "fr",
      isActive: true,
      lastLoginAt: new Date("2026-04-15T08:00:00Z"),
    },
  });
  console.log(`   ✓ User: ${demoUser.email} (${demoUser.role})\n`);

  // ── 3. Seed Tenders ────────────────────────────────────────────────────────
  console.log("📋 Seeding tenders...");

  const tenderIdMap = new Map<string, string>(); // mock id → real DB id

  for (const t of mockTenders) {
    const tender = await prisma.tender.create({
      data: {
        reference: t.reference,
        title: t.title,
        description: t.description,
        sector: t.sector,
        region: t.region,
        status: t.status,
        tenderType: t.tender_type,
        deadlineDate: new Date(t.deadline_date),
        budgetMin: t.budget_min,
        budgetMax: t.budget_max,
        publishingAuthority: t.publishing_authority,
        sourceUrl: t.source_url,
        priorityScore: t.priority_score,
        compatibilityScore: t.compatibility_score,
        feasibilityScore: t.feasibility_score,
        winProbabilityScore: t.win_probability_score,
        strategyRecommendation: t.strategy_recommendation,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
      },
    });
    tenderIdMap.set(t.id, tender.id);
  }
  console.log(`   ✓ ${mockTenders.length} tenders created\n`);

  // ── 4. Seed Accounts ───────────────────────────────────────────────────────
  console.log("🏢 Seeding accounts...");

  const accountIdMap = new Map<string, string>(); // mock id → real DB id
  const accountNameToId = new Map<string, string>(); // account name → real DB id

  for (const a of mockAccounts) {
    const account = await prisma.account.create({
      data: {
        name: a.name,
        type: "prospect",
        industry: a.sector,
        sector: a.sector,
        website: a.website,
        city: a.region,
        country: "GN",
        isPublicBuyer: true,
        sourceUrl: a.website,
        sourceLabel: a.name,
        isActive: true,
        createdAt: new Date(a.created_at),
      },
    });
    accountIdMap.set(a.id, account.id);
    accountNameToId.set(a.name, account.id);
  }
  console.log(`   ✓ ${mockAccounts.length} accounts created\n`);

  // ── 5. Seed Contacts ───────────────────────────────────────────────────────
  console.log("👥 Seeding contacts...");

  const contactIdMap = new Map<string, string>(); // mock id → real DB id

  for (const c of mockContacts) {
    const { firstName, lastName } = splitName(c.full_name);
    const linkedAccountId = accountNameToId.get(c.company) || null;

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        professionalEmail: c.professional_email,
        professionalPhone: c.professional_phone,
        jobTitle: c.role,
        organizationName: c.company,
        validationStatus: c.validation_status,
        isActive: true,
        accountId: linkedAccountId,
        sourceLabel: "Import CRM",
        createdAt: new Date(c.created_at),
      },
    });
    contactIdMap.set(c.id, contact.id);
  }
  console.log(`   ✓ ${mockContacts.length} contacts created\n`);

  // ── 6. Seed Opportunities ──────────────────────────────────────────────────
  console.log("💼 Seeding opportunities...");

  for (const o of mockOpportunities) {
    const realAccountId = accountIdMap.get(o.account_id);
    const realContactId = contactIdMap.get(o.contact_id);
    const realTenderId = o.tender_id ? tenderIdMap.get(o.tender_id) : null;

    if (!realAccountId) {
      console.warn(`   ⚠ Skipping opportunity ${o.id}: account ${o.account_id} not found`);
      continue;
    }

    await prisma.opportunity.create({
      data: {
        title: o.title,
        stage: o.stage,
        amount: o.amount,
        probability: o.probability,
        expectedCloseDate: new Date(o.expected_close_date),
        accountId: realAccountId,
        contactId: realContactId || null,
        tenderId: realTenderId || null,
        createdAt: new Date(o.created_at),
      },
    });
  }
  console.log(`   ✓ ${mockOpportunities.length} opportunities created\n`);

  // ── 7. Seed Notifications ──────────────────────────────────────────────────
  console.log("🔔 Seeding notifications...");

  let notificationCount = 0;
  for (const al of mockAlerts) {
    const realTenderId = al.tender_id ? tenderIdMap.get(al.tender_id) : null;

    // Determine priority based on type
    let priority: string;
    switch (al.type) {
      case "deadline":
        priority = "high";
        break;
      case "new_tender":
        priority = "medium";
        break;
      case "score":
      case "match":
        priority = "medium";
        break;
      case "system":
        priority = "low";
        break;
      default:
        priority = "medium";
    }

    await prisma.notification.create({
      data: {
        type: al.type,
        title: al.title,
        message: al.message,
        isRead: al.is_read,
        priority,
        userId: demoUser.id,
        tenderId: realTenderId || null,
        createdAt: new Date(al.created_at),
      },
    });
    notificationCount++;
  }
  console.log(`   ✓ ${notificationCount} notifications created\n`);

  // ── 8. Seed Generated Prompts ──────────────────────────────────────────────
  console.log("🤖 Seeding generated prompts...");

  let promptCount = 0;
  for (const p of mockPrompts) {
    const realTenderId = tenderIdMap.get(p.tender_id);

    if (!realTenderId) {
      console.warn(`   ⚠ Skipping prompt ${p.id}: tender ${p.tender_id} not found`);
      continue;
    }

    await prisma.generatedPrompt.create({
      data: {
        tenderId: realTenderId,
        tenderRef: p.tender_ref,
        promptType: p.prompt_type,
        content: p.content,
        createdAt: new Date(p.created_at),
      },
    });
    promptCount++;
  }
  console.log(`   ✓ ${promptCount} generated prompts created\n`);

  // ── 9. Seed Crawl Sources ──────────────────────────────────────────────────
  console.log("🌐 Seeding crawl sources...");

  for (const cs of crawlSources) {
    await prisma.crawlSource.create({
      data: {
        name: cs.name,
        url: cs.url,
        type: cs.type,
        sector: cs.sector,
        region: cs.region,
        refreshInterval: cs.refreshInterval,
        status: cs.status,
        description: cs.description,
        health: cs.health,
        successRate: cs.successRate,
        lastCrawledAt:
          cs.status === "active"
            ? new Date(Date.now() - cs.refreshInterval * 1000)
            : null,
      },
    });
  }
  console.log(`   ✓ ${crawlSources.length} crawl sources created\n`);

  // ── 10. Seed Webhooks ──────────────────────────────────────────────────────
  console.log("🔗 Seeding webhooks...");

  for (const wh of webhooks) {
    await prisma.webhook.create({
      data: {
        url: wh.url,
        events: wh.events,
        description: wh.description,
        secret: wh.secret,
        isActive: wh.isActive,
      },
    });
  }
  console.log(`   ✓ ${webhooks.length} webhooks created\n`);

  // ── 11. Seed Subscription ──────────────────────────────────────────────────
  console.log("💳 Seeding subscription...");

  await prisma.subscription.create({
    data: {
      plan: "pro",
      status: "active",
      currentPeriodStart: new Date("2026-01-01T00:00:00Z"),
      currentPeriodEnd: new Date("2026-12-31T23:59:59Z"),
    },
  });
  console.log("   ✓ 1 subscription created (pro plan)\n");

  // ── 12. Summary ────────────────────────────────────────────────────────────
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 SEED SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const counts = {
    users: await prisma.user.count(),
    tenders: await prisma.tender.count(),
    accounts: await prisma.account.count(),
    contacts: await prisma.contact.count(),
    opportunities: await prisma.opportunity.count(),
    notifications: await prisma.notification.count(),
    generatedPrompts: await prisma.generatedPrompt.count(),
    crawlSources: await prisma.crawlSource.count(),
    webhooks: await prisma.webhook.count(),
    subscriptions: await prisma.subscription.count(),
  };

  console.log(`   Users            : ${counts.users}`);
  console.log(`   Tenders          : ${counts.tenders}`);
  console.log(`   Accounts         : ${counts.accounts}`);
  console.log(`   Contacts         : ${counts.contacts}`);
  console.log(`   Opportunities    : ${counts.opportunities}`);
  console.log(`   Notifications    : ${counts.notifications}`);
  console.log(`   Generated Prompts: ${counts.generatedPrompts}`);
  console.log(`   Crawl Sources    : ${counts.crawlSources}`);
  console.log(`   Webhooks         : ${counts.webhooks}`);
  console.log(`   Subscriptions    : ${counts.subscriptions}`);
  console.log();
  console.log(
    `   Total records    : ${Object.values(counts).reduce((a, b) => a + b, 0)}`
  );
  console.log();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Seed completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// ── Execute ────────────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
