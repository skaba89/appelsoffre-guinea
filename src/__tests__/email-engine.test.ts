// ─── Tests: Email Template Engine ────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  generateEmail,
  SAMPLE_DATA,
  EMAIL_TEMPLATE_LABELS,
  EMAIL_TEMPLATE_DESCRIPTIONS,
  type EmailTemplateType,
} from "@/lib/email-engine";

// ─── Template Generation ─────────────────────────────────────────────────────────

describe("generateEmail — all templates", () => {
  const templateTypes: EmailTemplateType[] = [
    "new_tender",
    "deadline_reminder",
    "weekly_report",
    "welcome",
    "competitor_alert",
    "high_score",
  ];

  it("should generate valid HTML for all 6 templates", () => {
    for (const type of templateTypes) {
      const sample = SAMPLE_DATA[type];
      const html = generateEmail(type, sample.subject, sample.data);
      expect(html).toBeTruthy();
      expect(typeof html).toBe("string");
      expect(html.length).toBeGreaterThan(100);
    }
  });

  it("should include DOCTYPE html declaration", () => {
    for (const type of templateTypes) {
      const sample = SAMPLE_DATA[type];
      const html = generateEmail(type, sample.subject, sample.data);
      expect(html).toContain("<!DOCTYPE html>");
    }
  });

  it("should include lang='fr' attribute", () => {
    for (const type of templateTypes) {
      const sample = SAMPLE_DATA[type];
      const html = generateEmail(type, sample.subject, sample.data);
      expect(html).toContain('lang="fr"');
    }
  });

  it("should include TenderFlow Guinée branding in header", () => {
    for (const type of templateTypes) {
      const sample = SAMPLE_DATA[type];
      const html = generateEmail(type, sample.subject, sample.data);
      expect(html).toContain("TenderFlow");
    }
  });

  it("should include footer with copyright year", () => {
    const currentYear = new Date().getFullYear().toString();
    for (const type of templateTypes) {
      const sample = SAMPLE_DATA[type];
      const html = generateEmail(type, sample.subject, sample.data);
      expect(html).toContain(currentYear);
      expect(html).toContain("Tous droits réservés");
    }
  });

  it("should include unsubscribe link in footer", () => {
    for (const type of templateTypes) {
      const sample = SAMPLE_DATA[type];
      const html = generateEmail(type, sample.subject, sample.data);
      expect(html).toContain("Se désabonner");
    }
  });
});

// ─── new_tender template ────────────────────────────────────────────────────────

describe("new_tender template", () => {
  it("should include tender title", () => {
    const sample = SAMPLE_DATA.new_tender;
    const html = generateEmail("new_tender", sample.subject, sample.data);
    expect(html).toContain(sample.data.tenderTitle);
  });

  it("should include tender reference", () => {
    const sample = SAMPLE_DATA.new_tender;
    const html = generateEmail("new_tender", sample.subject, sample.data);
    expect(html).toContain(sample.data.tenderReference);
  });

  it("should include score badge", () => {
    const sample = SAMPLE_DATA.new_tender;
    const html = generateEmail("new_tender", sample.subject, sample.data);
    expect(html).toContain(`${sample.data.score}/100`);
  });
});

// ─── deadline_reminder template ──────────────────────────────────────────────────

describe("deadline_reminder template", () => {
  it("should show days remaining", () => {
    const sample = SAMPLE_DATA.deadline_reminder;
    const html = generateEmail("deadline_reminder", sample.subject, sample.data);
    expect(html).toContain(`${sample.data.daysLeft} jour`);
  });

  it("should include urgency indicator", () => {
    const sample = SAMPLE_DATA.deadline_reminder;
    const html = generateEmail("deadline_reminder", sample.subject, sample.data);
    // 3 days left should show amber/warning colors
    expect(html).toContain("#d97706"); // amber color for 3 days
  });
});

// ─── weekly_report template ──────────────────────────────────────────────────────

describe("weekly_report template", () => {
  it("should include new tenders count", () => {
    const sample = SAMPLE_DATA.weekly_report;
    const html = generateEmail("weekly_report", sample.subject, sample.data);
    expect(html).toContain(String(sample.data.newTendersCount));
  });

  it("should include sector badges", () => {
    const sample = SAMPLE_DATA.weekly_report;
    const html = generateEmail("weekly_report", sample.subject, sample.data);
    for (const sector of sample.data.topSectors) {
      expect(html).toContain(sector);
    }
  });
});

// ─── welcome template ───────────────────────────────────────────────────────────

describe("welcome template", () => {
  it("should include user name", () => {
    const sample = SAMPLE_DATA.welcome;
    const html = generateEmail("welcome", sample.subject, sample.data);
    expect(html).toContain(sample.data.userName);
  });

  it("should include company name", () => {
    const sample = SAMPLE_DATA.welcome;
    const html = generateEmail("welcome", sample.subject, sample.data);
    expect(html).toContain(sample.data.companyName);
  });
});

// ─── competitor_alert template ──────────────────────────────────────────────────

describe("competitor_alert template", () => {
  it("should include competitor name", () => {
    const sample = SAMPLE_DATA.competitor_alert;
    const html = generateEmail("competitor_alert", sample.subject, sample.data);
    expect(html).toContain(sample.data.competitorName);
  });

  it("should include strategic suggestions", () => {
    const sample = SAMPLE_DATA.competitor_alert;
    const html = generateEmail("competitor_alert", sample.subject, sample.data);
    for (const suggestion of sample.data.suggestions) {
      expect(html).toContain(suggestion);
    }
  });
});

// ─── high_score template ─────────────────────────────────────────────────────────

describe("high_score template", () => {
  it("should display score prominently", () => {
    const sample = SAMPLE_DATA.high_score;
    const html = generateEmail("high_score", sample.subject, sample.data);
    expect(html).toContain(`${sample.data.score}/100`);
  });

  it("should list key strengths", () => {
    const sample = SAMPLE_DATA.high_score;
    const html = generateEmail("high_score", sample.subject, sample.data);
    for (const strength of sample.data.keyStrengths) {
      expect(html).toContain(strength);
    }
  });
});

// ─── Template Labels & Descriptions ─────────────────────────────────────────────

describe("EMAIL_TEMPLATE_LABELS and DESCRIPTIONS", () => {
  it("should have labels for all 6 templates", () => {
    expect(Object.keys(EMAIL_TEMPLATE_LABELS).length).toBe(6);
  });

  it("should have descriptions for all 6 templates", () => {
    expect(Object.keys(EMAIL_TEMPLATE_DESCRIPTIONS).length).toBe(6);
  });

  it("should have matching keys between labels and descriptions", () => {
    const labelKeys = Object.keys(EMAIL_TEMPLATE_LABELS).sort();
    const descKeys = Object.keys(EMAIL_TEMPLATE_DESCRIPTIONS).sort();
    expect(labelKeys).toEqual(descKeys);
  });
});
