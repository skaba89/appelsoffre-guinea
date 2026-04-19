import { NextResponse } from "next/server";

// ─── POST /api/generate ───────────────────────────────────────────────────────
// Génère des documents professionnels (lettres, mémoires, analyses)

interface GenerateRequest {
  type: "manifestation" | "comprehension" | "methodology" | "risk_analysis" | "go_nogo_note";
  tenderTitle: string;
  reference: string;
  authority: string;
  sector: string;
  region: string;
  budget: string;
  deadline: string;
  companyName?: string;
  companyAddress?: string;
}

function generateManifestation(data: GenerateRequest): string {
  const company = data.companyName ?? "[Nom de votre entreprise]";
  const address = data.companyAddress ?? "[Adresse de l'entreprise]";
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return `
${company}
${address}

Conakry, le ${date}

À l'attention de :
${data.authority}
Conakry, République de Guinée

Objet : Lettre de manifestation d'intérêt
Référence : ${data.reference}

Madame, Monsieur,

Nous avons l'honneur de vous adresser par la présente notre manifestation d'intérêt pour l'appel d'offres référencé ${data.reference} portant sur :

${data.tenderTitle}

Secteur : ${data.sector}
Région : ${data.region}
Budget estimé : ${data.budget}
Date limite : ${data.deadline}

Notre entreprise, ${company}, dispose d'une expérience avérée dans le secteur ${data.sector} en République de Guinée et en Afrique de l'Ouest. Nous avons mené avec succès plusieurs projets similaires et disposons des compétences techniques, financières et humaines nécessaires pour répondre à ce marché dans les meilleures conditions.

Nous nous tenons à votre entière disposition pour tout renseignement complémentaire et sommes prêts à vous rencontrer à votre convenance pour présenter nos références et notre approche méthodologique.

Dans l'attente de votre retour, nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

Pour ${company},

[Nom du Signataire]
[Titre/Fonction]
[Numéro de téléphone]
[Adresse email]
`.trim();
}

function generateComprehension(data: GenerateRequest): string {
  const company = data.companyName ?? "[Nom de votre entreprise]";
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return `
NOTE DE COMPRÉHENSION DU BESOIN
═══════════════════════════════════

Référence AO : ${data.reference}
Intitulé : ${data.tenderTitle}
Autorité : ${data.authority}
Date : ${date}

═══════════════════════════════════
1. CONTEXTE GÉNÉRAL
═══════════════════════════════════

L'appel d'offres ${data.reference} s'inscrit dans le cadre de la politique nationale de développement du secteur ${data.sector} en République de Guinée, particulièrement dans la région de ${data.region}.

Le marché porte sur ${data.tenderTitle.toLowerCase()} pour un budget estimé à ${data.budget}.

═══════════════════════════════════
2. ANALYSE DU BESOIN
═══════════════════════════════════

2.1 Besoins primaires identifiés :
    - Réalisation des travaux/prestations décrits dans le cahier des charges
    - Respect des normes guinéennes et internationales en vigueur
    - Livraison dans les délais impartis (échéance : ${data.deadline})

2.2 Besoins secondaires déduits :
    - Transfert de compétences vers les équipes locales
    - Intégration des entreprises sous-traitantes guinéennes
    - Respect des standards environnementaux et sociaux
    - Conformité avec le Code des Marchés Publics (2018)

═══════════════════════════════════
3. ENJEUX STRATÉGIQUES
═══════════════════════════════════

3.1 Pour l'autorité contractante (${data.authority}) :
    - Qualité et pérennité des infrastructures/services
    - Optimisation des coûts et respect du budget alloué
    - Transparence et conformité réglementaire

3.2 Pour le contexte guinéen :
    - Contribution au développement économique régional
    - Création d'emplois locaux qualifiés
    - Renforcement des capacités nationales

═══════════════════════════════════
4. APPROCHE PROPOSÉE PAR ${company.toUpperCase()}
═══════════════════════════════════

Notre approche repose sur :
    - Une méthodologie éprouvée sur des projets similaires en Afrique de l'Ouest
    - Une équipe mixte (internationale + locale) pour garantir efficacité et ancrage territorial
    - Un système de management qualité certifié conforme aux exigences
    - Un plan de transfert de compétences structuré et mesurable

═══════════════════════════════════
5. POINTS D'ATTENTION
═══════════════════════════════════

    - Vérifier les exigences de cautionnement et garanties bancaires
    - Anticiper les délais administratifs (NIF, RCS, attestations)
    - Confirmer les critères de qualification technique minimale
    - Évaluer les risques logistiques liés à la région ${data.region}

Généré par TenderFlow Guinea — ${date}
`.trim();
}

function generateGoNoGoNote(data: GenerateRequest): string {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return `
NOTE DE DÉCISION GO / NO GO
═══════════════════════════════════

Référence : ${data.reference}
Intitulé : ${data.tenderTitle}
Date d'analyse : ${date}

═══════════════════════════════════
1. SYNTHÈSE
═══════════════════════════════════

Secteur : ${data.sector}
Région : ${data.region}
Budget : ${data.budget}
Échéance : ${data.deadline}
Autorité : ${data.authority}

═══════════════════════════════════
2. CRITÈRES D'ÉVALUATION
═══════════════════════════════════

2.1 Alignement sectoriel : [À évaluer]
    - Expérience dans le secteur ${data.sector} : ___/10
    - Références similaires : ___/10

2.2 Capacité financière : [À évaluer]
    - Budget compatible avec nos ressources : OUI / NON
    - Garanties bancaires requises : ___ GNF
    - Besoin de consortium : OUI / NON

2.3 Faisabilité technique : [À évaluer]
    - Compétences disponibles en interne : ___/10
    - Besoin de partenaires externes : OUI / NON
    - Délai de préparation suffisant : OUI / NON

2.4 Concurrence : [À évaluer]
    - Nombre estimé de soumissionnaires : ___
    - Avantage concurrentiel identifié : OUI / NON

2.5 Risques : [À évaluer]
    - Risques réglementaires : FAIBLE / MOYEN / ÉLEVÉ
    - Risques financiers : FAIBLE / MOYEN / ÉLEVÉ
    - Risques opérationnels : FAIBLE / MOYEN / ÉLEVÉ

═══════════════════════════════════
3. DÉCISION
═══════════════════════════════════

☐ GO — Soumissionner
☐ GO SOUS CONDITIONS — Soumissionner si les conditions suivantes sont remplies :
    ___________________________________________
☐ NO GO — Ne pas soumissionner

Raison de la décision :
___________________________________________

Décision prise par : _________________
Date : _________________
Signature : _________________

Généré par TenderFlow Guinea — ${date}
`.trim();
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.type || !body.tenderTitle || !body.reference) {
      return NextResponse.json(
        { error: "Les champs type, tenderTitle et reference sont requis." },
        { status: 400 }
      );
    }

    let content: string;

    switch (body.type) {
      case "manifestation":
        content = generateManifestation(body);
        break;
      case "comprehension":
        content = generateComprehension(body);
        break;
      case "go_nogo_note":
        content = generateGoNoGoNote(body);
        break;
      case "methodology":
        content = generateComprehension(body); // Reuse comprehension as methodology base
        break;
      case "risk_analysis":
        content = generateGoNoGoNote(body); // Reuse GO/NO-GO as risk base
        break;
      default:
        return NextResponse.json(
          { error: `Type de document non supporté : ${body.type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      type: body.type,
      content,
      metadata: {
        reference: body.reference,
        generatedAt: new Date().toISOString(),
        generator: "TenderFlow Guinea",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la génération du document." },
      { status: 500 }
    );
  }
}
