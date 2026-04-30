// ═══════════════════════════════════════════════════════════════════════════════
// TenderFlow Guinea — Email Template Engine
// Professional HTML email generation with French text and Guinea branding
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Email Data Interfaces ──────────────────────────────────────────────────────

export interface NewTenderEmailData {
  tenderTitle: string;
  tenderReference: string;
  sector: string;
  region: string;
  deadline: string;
  budget: string;
  score: number;
  authority: string;
  dashboardUrl: string;
}

export interface DeadlineReminderEmailData {
  tenderTitle: string;
  tenderReference: string;
  daysLeft: number;
  deadline: string;
  authority: string;
  budget: string;
  tenderUrl: string;
}

export interface WeeklyReportEmailData {
  weekRange: string;
  newTendersCount: number;
  expiringTendersCount: number;
  averageScore: number;
  topSectors: string[];
  topRegions: string[];
  recommendationsCount: number;
  dashboardUrl: string;
}

export interface WelcomeEmailData {
  userName: string;
  companyName: string;
  dashboardUrl: string;
}

export interface CompetitorAlertEmailData {
  competitorName: string;
  tenderTitle: string;
  tenderReference: string;
  threatLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
  tenderUrl: string;
}

export interface HighScoreEmailData {
  tenderTitle: string;
  tenderReference: string;
  score: number;
  recommendation: string;
  keyStrengths: string[];
  tenderUrl: string;
}

// ─── Template Types ─────────────────────────────────────────────────────────────

export type EmailTemplateType =
  | 'new_tender'
  | 'deadline_reminder'
  | 'weekly_report'
  | 'welcome'
  | 'competitor_alert'
  | 'high_score';

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateType, string> = {
  new_tender: "Nouvel appel d'offres",
  deadline_reminder: "Rappel d'échéance",
  weekly_report: "Rapport hebdomadaire",
  welcome: "Bienvenue",
  competitor_alert: "Alerte concurrent",
  high_score: "Score élevé",
};

export const EMAIL_TEMPLATE_DESCRIPTIONS: Record<EmailTemplateType, string> = {
  new_tender: "Notification d'un nouvel appel d'offres correspondant au profil",
  deadline_reminder: "Alerte sur une échéance approchante",
  weekly_report: "Résumé de l'activité hebdomadaire",
  welcome: "Bienvenue aux nouveaux utilisateurs",
  competitor_alert: "Notification d'activité concurrente",
  high_score: "Notification d'un appel d'offres à score élevé",
};

// ─── Common HTML Components ─────────────────────────────────────────────────────

function emailHeader(): string {
  return `
    <div style="background: linear-gradient(135deg, #1e40af, #059669); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
        TenderFlow <span style="font-weight: 400; opacity: 0.9;">Guinée</span>
      </h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
        Plateforme intelligente de veille des appels d'offres
      </p>
    </div>
  `;
}

function emailFooter(): string {
  const year = new Date().getFullYear();
  return `
    <div style="background: #f8fafc; padding: 24px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
        TenderFlow Guinée — Conakry, République de Guinée
      </p>
      <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
        <a href="#" style="color: #1e40af; text-decoration: underline;">Se désabonner</a>
        &nbsp;·&nbsp;
        <a href="#" style="color: #1e40af; text-decoration: underline;">Préférences de notification</a>
        &nbsp;·&nbsp;
        <a href="#" style="color: #1e40af; text-decoration: underline;">Conditions d'utilisation</a>
      </p>
      <p style="margin: 0; color: #94a3b8; font-size: 11px;">
        © ${year} TenderFlow Guinée. Tous droits réservés.
      </p>
    </div>
  `;
}

function emailButton(text: string, url: string): string {
  return `
    <a href="${url}" style="
      display: inline-block;
      background: linear-gradient(135deg, #1e40af, #059669);
      color: #ffffff;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      margin: 16px 0;
    ">${text}</a>
  `;
}

function scoreBadge(score: number): string {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626';
  const bgColor = score >= 80 ? '#ecfdf5' : score >= 60 ? '#fffbeb' : '#fef2f2';
  return `
    <span style="
      display: inline-block;
      background: ${bgColor};
      color: ${color};
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
    ">${score}/100</span>
  `;
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 140px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 0; color: #1e293b; font-size: 13px; font-weight: 500;">${value}</td>
    </tr>
  `;
}

function wrapBody(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TenderFlow Guinée</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;">
      <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        ${emailHeader()}
        <div style="padding: 32px 24px;">
          ${content}
        </div>
        ${emailFooter()}
      </div>
    </body>
    </html>
  `;
}

// ─── Template Generators ────────────────────────────────────────────────────────

function generateNewTenderEmail(subject: string, data: NewTenderEmailData): string {
  const urgencyLabel = data.score >= 80 ? '🔥 Opportunité prioritaire' : data.score >= 60 ? '⚠️ À considérer' : '📋 Nouvel appel d\'offres';

  return wrapBody(`
    <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">${urgencyLabel}</p>
    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 700;">${subject}</h2>

    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px;">${data.tenderTitle}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Référence', data.tenderReference)}
        ${infoRow('Secteur', data.sector)}
        ${infoRow('Région', data.region)}
        ${infoRow('Date limite', data.deadline)}
        ${infoRow('Budget', data.budget)}
        ${infoRow('Autorité', data.authority)}
        ${infoRow('Score IA', '')}
      </table>
      <div style="margin-top: 8px;">${scoreBadge(data.score)}</div>
    </div>

    <div style="text-align: center;">
      ${emailButton('Voir sur le tableau de bord', data.dashboardUrl)}
    </div>

    <p style="margin: 16px 0 0; color: #64748b; font-size: 12px; text-align: center;">
      Cet appel d'offres a été détecté automatiquement par le moteur de veille TenderFlow.
    </p>
  `);
}

function generateDeadlineReminderEmail(subject: string, data: DeadlineReminderEmailData): string {
  const urgencyColor = data.daysLeft <= 1 ? '#dc2626' : data.daysLeft <= 3 ? '#d97706' : '#1e40af';
  const urgencyBg = data.daysLeft <= 1 ? '#fef2f2' : data.daysLeft <= 3 ? '#fffbeb' : '#eff6ff';
  const urgencyText = data.daysLeft <= 0
    ? "⚠️ Date limite aujourd'hui !"
    : data.daysLeft === 1
      ? "⚠️ Plus qu'1 jour !"
      : `⏰ Plus que ${data.daysLeft} jours`;

  return wrapBody(`
    <div style="background: ${urgencyBg}; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${urgencyColor};">${urgencyText}</p>
    </div>

    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 700;">${subject}</h2>

    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px;">${data.tenderTitle}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Référence', data.tenderReference)}
        ${infoRow('Date limite', data.deadline)}
        ${infoRow('Jours restants', `<span style="color: ${urgencyColor}; font-weight: 700;">${data.daysLeft} jour${data.daysLeft !== 1 ? 's' : ''}</span>`)}
        ${infoRow('Autorité', data.authority)}
        ${infoRow('Budget', data.budget)}
      </table>
    </div>

    <div style="text-align: center;">
      ${emailButton('Consulter l\'appel d\'offres', data.tenderUrl)}
    </div>

    <p style="margin: 16px 0 0; color: #64748b; font-size: 12px; text-align: center;">
      Préparez votre réponse à temps pour maximiser vos chances de succès.
    </p>
  `);
}

function generateWeeklyReportEmail(subject: string, data: WeeklyReportEmailData): string {
  const sectorsHtml = data.topSectors.map(s => `<span style="display: inline-block; background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin: 2px 4px 2px 0;">${s}</span>`).join('');
  const regionsHtml = data.topRegions.map(r => `<span style="display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin: 2px 4px 2px 0;">${r}</span>`).join('');

  return wrapBody(`
    <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Résumé hebdomadaire</p>
    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 700;">${subject}</h2>
    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">Semaine du ${data.weekRange}</p>

    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
      <div style="flex: 1; background: #eff6ff; border-radius: 8px; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 28px; font-weight: 700; color: #1e40af;">${data.newTendersCount}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Nouveaux AO</p>
      </div>
      <div style="flex: 1; background: #fef2f2; border-radius: 8px; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 28px; font-weight: 700; color: #dc2626;">${data.expiringTendersCount}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Expirent bientôt</p>
      </div>
      <div style="flex: 1; background: #ecfdf5; border-radius: 8px; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 28px; font-weight: 700; color: #059669;">${data.averageScore}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Score moyen</p>
      </div>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 8px; color: #1e293b; font-size: 14px;">📊 Secteurs les plus actifs</h4>
      <div>${sectorsHtml}</div>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 8px; color: #1e293b; font-size: 14px;">📍 Régions les plus actives</h4>
      <div>${regionsHtml}</div>
    </div>

    <div style="background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 13px; color: #1e293b;">
        💡 <strong>${data.recommendationsCount}</strong> recommandations IA sont disponibles pour cette semaine.
      </p>
    </div>

    <div style="text-align: center;">
      ${emailButton('Voir le tableau de bord', data.dashboardUrl)}
    </div>
  `);
}

function generateWelcomeEmail(subject: string, data: WelcomeEmailData): string {
  return wrapBody(`
    <div style="text-align: center; margin-bottom: 24px;">
      <p style="font-size: 48px; margin: 0;">👋</p>
    </div>

    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 700; text-align: center;">
      Bienvenue, ${data.userName} !
    </h2>
    <p style="margin: 0 0 24px; color: #64748b; font-size: 14px; text-align: center;">
      Votre espace TenderFlow pour <strong>${data.companyName}</strong> est prêt.
    </p>

    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 12px; color: #1e293b; font-size: 14px;">🚀 Pour commencer :</h4>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 2;">
        <li>Complétez le profil de votre entreprise pour améliorer le matching IA</li>
        <li>Explorez les appels d'offres actifs en Guinée</li>
        <li>Configurez vos alertes par secteur et région</li>
        <li>Utilisez l'assistant IA pour analyser les opportunités</li>
      </ul>
    </div>

    <div style="background: linear-gradient(135deg, #eff6ff, #ecfdf5); border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #64748b;">Votre plateforme de veille</p>
      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">TenderFlow Guinée</p>
      <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">18 sources · 8 régions · Scoring IA avancé</p>
    </div>

    <div style="text-align: center;">
      ${emailButton('Accéder au tableau de bord', data.dashboardUrl)}
    </div>
  `);
}

function generateCompetitorAlertEmail(subject: string, data: CompetitorAlertEmailData): string {
  const threatConfig = {
    low: { color: '#059669', bg: '#ecfdf5', label: 'Faible', icon: '🟢' },
    medium: { color: '#d97706', bg: '#fffbeb', label: 'Moyen', icon: '🟡' },
    high: { color: '#dc2626', bg: '#fef2f2', label: 'Élevé', icon: '🔴' },
  };
  const threat = threatConfig[data.threatLevel];
  const suggestionsHtml = data.suggestions.map(s =>
    `<li style="margin-bottom: 6px; color: #475569; font-size: 13px;">${s}</li>`
  ).join('');

  return wrapBody(`
    <div style="background: ${threat.bg}; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${threat.color};">
        ${threat.icon} Niveau de menace : ${threat.label}
      </p>
    </div>

    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 700;">${subject}</h2>

    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px;">Activité concurrente détectée</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Concurrent', data.competitorName)}
        ${infoRow('Appel d\'offres', data.tenderTitle)}
        ${infoRow('Référence', data.tenderReference)}
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px; color: #1e293b; font-size: 14px;">💡 Recommandations stratégiques</h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${suggestionsHtml}
      </ul>
    </div>

    <div style="text-align: center;">
      ${emailButton('Voir l\'appel d\'offres', data.tenderUrl)}
    </div>
  `);
}

function generateHighScoreEmail(subject: string, data: HighScoreEmailData): string {
  const strengthsHtml = data.keyStrengths.map(s =>
    `<li style="margin-bottom: 6px; color: #475569; font-size: 13px;">✅ ${s}</li>`
  ).join('');

  return wrapBody(`
    <div style="background: linear-gradient(135deg, #ecfdf5, #eff6ff); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 14px; color: #64748b;">Score de compatibilité</p>
      <p style="margin: 4px 0 0; font-size: 40px; font-weight: 700; color: #059669;">${data.score}/100</p>
      <p style="margin: 4px 0 0; font-size: 13px; color: #1e293b; font-weight: 600;">${data.recommendation}</p>
    </div>

    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 700;">${subject}</h2>

    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px;">${data.tenderTitle}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Référence', data.tenderReference)}
        ${infoRow('Score', '')}
      </table>
      <div style="margin-top: 8px;">${scoreBadge(data.score)}</div>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px; color: #1e293b; font-size: 14px;">🏆 Points forts identifiés</h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${strengthsHtml}
      </ul>
    </div>

    <div style="text-align: center;">
      ${emailButton('Consulter l\'appel d\'offres', data.tenderUrl)}
    </div>
  `);
}

// ─── Main Generate Function ─────────────────────────────────────────────────────

export function generateEmail(
  templateType: EmailTemplateType,
  subject: string,
  data: NewTenderEmailData | DeadlineReminderEmailData | WeeklyReportEmailData | WelcomeEmailData | CompetitorAlertEmailData | HighScoreEmailData
): string {
  switch (templateType) {
    case 'new_tender':
      return generateNewTenderEmail(subject, data as NewTenderEmailData);
    case 'deadline_reminder':
      return generateDeadlineReminderEmail(subject, data as DeadlineReminderEmailData);
    case 'weekly_report':
      return generateWeeklyReportEmail(subject, data as WeeklyReportEmailData);
    case 'welcome':
      return generateWelcomeEmail(subject, data as WelcomeEmailData);
    case 'competitor_alert':
      return generateCompetitorAlertEmail(subject, data as CompetitorAlertEmailData);
    case 'high_score':
      return generateHighScoreEmail(subject, data as HighScoreEmailData);
    default:
      throw new Error(`Template inconnu : ${templateType}`);
  }
}

// ─── Sample Data Generators ─────────────────────────────────────────────────────

export const SAMPLE_DATA: Record<EmailTemplateType, { subject: string; data: NewTenderEmailData | DeadlineReminderEmailData | WeeklyReportEmailData | WelcomeEmailData | CompetitorAlertEmailData | HighScoreEmailData }> = {
  new_tender: {
    subject: "Nouvel appel d'offres détecté : Construction pont Kouroussa",
    data: {
      tenderTitle: "Construction d'un pont sur le fleuve Niger à Kouroussa",
      tenderReference: "AO/MTP/2026/0142",
      sector: "BTP",
      region: "Kankan",
      deadline: "15 juin 2026",
      budget: "15 — 25 Mrd GNF",
      score: 92,
      authority: "Ministère des Travaux Publics",
      dashboardUrl: "https://tenderflow.gn/dashboard",
    },
  },
  deadline_reminder: {
    subject: "Rappel : Échéance dans 3 jours — AO/MTP/2026/0142",
    data: {
      tenderTitle: "Construction d'un pont sur le fleuve Niger à Kouroussa",
      tenderReference: "AO/MTP/2026/0142",
      daysLeft: 3,
      deadline: "15 juin 2026",
      authority: "Ministère des Travaux Publics",
      budget: "15 — 25 Mrd GNF",
      tenderUrl: "https://tenderflow.gn/tenders/t-001",
    },
  },
  weekly_report: {
    subject: "Rapport hebdomadaire — Semaine 16",
    data: {
      weekRange: "14 avril — 20 avril 2026",
      newTendersCount: 12,
      expiringTendersCount: 4,
      averageScore: 78,
      topSectors: ["BTP", "IT / Digital", "Énergie", "Mines"],
      topRegions: ["Conakry", "Kankan", "Nzérékoré"],
      recommendationsCount: 7,
      dashboardUrl: "https://tenderflow.gn/dashboard",
    },
  },
  welcome: {
    subject: "Bienvenue sur TenderFlow Guinée !",
    data: {
      userName: "Mamadou Diallo",
      companyName: "DSG Guinée SARL",
      dashboardUrl: "https://tenderflow.gn/dashboard",
    },
  },
  competitor_alert: {
    subject: "Alerte concurrent : China Road and Bridge Corporation",
    data: {
      competitorName: "China Road and Bridge Corporation",
      tenderTitle: "Construction de la route Boké-Kamsar — 85km bitumé",
      tenderReference: "AO/MTP/2026/0201",
      threatLevel: "high",
      suggestions: [
        "Mettre en avant votre expérience locale et vos partenariats guinéens",
        "Proposer un transfert de compétences et une formation des équipes locales",
        "Souligner votre capacité à respecter les délais avec une logistique locale éprouvée",
        "Considérer un partenariat avec un bureau d'études guinéen",
      ],
      tenderUrl: "https://tenderflow.gn/tenders/t-007",
    },
  },
  high_score: {
    subject: "Opportunité à score élevé : SIG Ressources Minières",
    data: {
      tenderTitle: "Système d'information intégré pour la gestion des ressources minières",
      tenderReference: "AO/SOGUIPAMI/2026/0023",
      score: 95,
      recommendation: "GO — Opportunité stratégique prioritaire",
      keyStrengths: [
        "Alignement sectoriel parfait avec vos compétences IT",
        "Compatibilité de 90% avec votre profil entreprise",
        "Faisabilité technique élevée (88/100)",
        "Expérience démontrée dans le secteur minier guinéen",
      ],
      tenderUrl: "https://tenderflow.gn/tenders/t-003",
    },
  },
};
