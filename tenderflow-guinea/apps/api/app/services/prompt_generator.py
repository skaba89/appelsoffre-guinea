"""TenderFlow Guinea — Prompt Generation Service.

Generates specialized AI prompts for each stage of tender response preparation.
All prompts are contextualized based on tender data and company profile.
"""
from typing import Optional

from app.models.tender import Tender
from app.models.company import CompanyProfile
from app.models.crm import CRMContact


def generate_dao_analysis_prompt(tender: Tender) -> str:
    """Generate a prompt for analyzing a DAO (Dossier d'Appel d'Offres)."""
    return f"""Tu es un expert en analyse d'appels d'offres publics et privés en Guinée.

Analyse en détail le DAO suivant et produit un rapport structuré contenant :

1. **Résumé exécutif** : Synthèse de l'appel d'offres en 5-7 lignes
2. **Objet du marché** : Description précise des prestations/fournitures attendues
3. **Conditions de participation** :
   - Qualifications et certifications requises
   - Expériences similaires exigées
   - Capacités techniques minimales
   - Capacités financières requises
4. **Critères de sélection** :
   - Critères techniques et leurs pondérations
   - Critères financiers et leurs pondérations
   - Ordre de priorité des critères
5. **Pièces du dossier** : Liste exhaustive des documents à fournir
6. **Calendrier** :
   - Date limite de dépôt : {tender.deadline_date.strftime('%d/%m/%Y') if tender.deadline_date else 'Non spécifiée'}
   - Dates clés du processus
7. **Points d'attention** :
   - Exigences inhabituelles ou restrictives
   - Clauses à risque
   - Conditions suspensives
8. **Recommandation stratégique** : GO / GO sous conditions / NO GO avec justification

**Informations de l'appel d'offres :**
- Référence : {tender.reference}
- Titre : {tender.title}
- Organisation : {tender.organization or 'Non spécifiée'}
- Secteur : {tender.sector or 'Non spécifié'}
- Budget estimé : {tender.budget_estimated or 'Non spécifié'} {tender.currency}
- Localisation : {tender.location or 'Non spécifiée'}
- Type : {tender.tender_type}

Description complète :
{tender.description or 'Non disponible — se référer au document DAO joint'}
"""


def generate_technical_memo_prompt(tender: Tender, profile: Optional[CompanyProfile] = None) -> str:
    """Generate a prompt for writing a technical memo (mémoire technique)."""
    company_name = profile.company_name if profile else "[NOM DE L'ENTREPRISE]"
    sectors = ", ".join(profile.sectors) if profile and profile.sectors else "[SECTEURS]"

    return f"""Tu es un consultant senior spécialisé dans la rédaction de mémoires techniques pour les appels d'offres en Guinée.

Rédige une note méthodologique / mémoire technique pour l'appel d'offres suivant, en tant que {company_name}, entreprise spécialisée dans {sectors}.

Structure la réponse selon le plan suivant :

1. **Présentation de l'équipe** : Composition, qualifications et rôles
2. **Compréhension du besoin** : Reformulation et analyse des exigences
3. **Méthodologie proposée** : Approche détaillée, étapes, livrables
4. **Planning de réalisation** : Diagramme de Gantt avec jalons clés
5. **Moyens mobilisés** : Ressources humaines, matérielles et techniques
6. **Gestion des risques** : Identification, évaluation et mesures d'atténuation
7. **Assurance qualité** : Démarche qualité et contrôles prévus
8. **Références similaires** : Projets comparables réalisés
9. **Valeur ajoutée** : Différenciateurs et avantages concurrentiels

**Contexte de l'appel d'offres :**
- Référence : {tender.reference}
- Titre : {tender.title}
- Organisation : {tender.organization or 'Non spécifiée'}
- Budget estimé : {tender.budget_estimated or 'Non spécifié'} {tender.currency}
- Description : {tender.description or 'Non disponible'}

Adapte le ton professionnel, précis et convaincant. Utilise des données chiffrées quand c'est pertinent.
"""


def generate_financial_offer_prompt(tender: Tender) -> str:
    """Generate a prompt for preparing a financial offer."""
    return f"""Tu es un expert en chiffrage et rédaction d'offres financières pour les marchés publics en Guinée.

Prépare une structure d'offre financière pour l'appel d'offres suivant :

**Informations :**
- Référence : {tender.reference}
- Titre : {tender.title}
- Organisation : {tender.organization or 'Non spécifiée'}
- Budget estimé : {tender.budget_estimated or 'Non spécifié'} {tender.currency}
- Lots : {tender.lots or 'Non détaillé'}

Produis :

1. **Structure de prix** : Tableau de décomposition des prix par poste/lot
2. **Hypothèses de chiffrage** : Base de calcul, taux, coefficients
3. **Bordereau des prix unitaires** : Modèle de BPDU
4. **Détail quantitatif et estimatif** : DQE modèle
5. **Note de synthèse financière** : Récapitulatif et marges
6. **Variantes éventuelles** : Options et alternatives chiffrées

Respecte les règles des marchés publics guinéens (Code des Marchés Publics).
Les prix sont en {tender.currency} (Franc Guinéen) HT et TTC.
"""


def generate_company_presentation_prompt(profile: Optional[CompanyProfile] = None) -> str:
    """Generate a prompt for writing a company presentation document."""
    company_name = profile.company_name if profile else "[NOM DE L'ENTREPRISE]"
    activities = ", ".join(profile.activities) if profile and profile.activities else "[ACTIVITÉS]"
    sectors = ", ".join(profile.sectors) if profile and profile.sectors else "[SECTEURS]"
    team_size = profile.team_size_range if profile else "[EFFECTIF]"

    return f"""Tu es un expert en communication corporate B2B.

Rédige une présentation institutionnelle pour {company_name} à destination des acheteurs publics et privés en Guinée.

La présentation doit inclure :

1. **Page de garde** : Nom, logo, slogan, coordonnées
2. **Qui sommes-nous** : Historique, mission, vision
3. **Nos métiers** : {activities}
4. **Nos secteurs d'expertise** : {sectors}
5. **Notre équipe** : {team_size} collaborateurs, organigramme clé
6. **Nos références** : Projets phares avec clients, montants, années
7. **Nos certifications** : Normes, agréments, habilitations
8. **Nos atouts** : Différenciateurs concurrentiels
9. **Nos partenaires** : Alliance et synergies
10. **Nos engagements** : RSE, qualité, délais

Le ton doit être professionnel, crédible et adapté au contexte guinéen.
Format : prêt à être intégré dans un document DOCX de réponse.
"""


def generate_project_planning_prompt(tender: Tender) -> str:
    """Generate a prompt for creating a project planning/schedule."""
    return f"""Tu es un chef de projet senior expert en planification de projets en Guinée.

Élabore un planning de projet détaillé pour l'appel d'offres suivant :

- Référence : {tender.reference}
- Titre : {tender.title}
- Description : {tender.description or 'Non disponible'}
- Budget : {tender.budget_estimated or 'Non spécifié'} {tender.currency}

Produis :

1. **Diagramme de Gantt** : Phases, tâches, durées, dépendances
2. **Jalons clés** : Livrables et dates de revue
3. **Allocation ressources** : Par tâche et par phase
4. **Chemin critique** : Identification et gestion
5. **Risques planning** : Retards potentiels et plans de contingence
6. **KPI de suivi** : Indicateurs d'avancement
7. **Points de coordination** : Revues et comités

Format en tableau structuré, adaptable en diagramme de Gantt.
"""


def generate_document_list_prompt(tender: Tender) -> str:
    """Generate a prompt for listing all required documents."""
    return f"""Tu es un expert en conformité documentaire des marchés publics en Guinée.

Établis la liste exhaustive des documents à fournir pour l'appel d'offres suivant :

- Référence : {tender.reference}
- Titre : {tender.title}
- Type : {tender.tender_type}
- Organisation : {tender.organization or 'Non spécifiée'}

Produis :

1. **Pièces administratives** : Registre de commerce, NIF, attestation CNSS, etc.
2. **Pièces juridiques** : Statuts, pouvoir de signature, déclarations
3. **Pièces techniques** : Certificats, agréments, attestations de capacité
4. **Pièces financières** : Bilans, cautions, attestations bancaires
5. **Pièces de référence** : Attestations de bonne exécution, certificats de satisfaction
6. **Déclarations** : Sur l'honneur, non-faillite, situation fiscale

Pour chaque document, indique :
- Nom du document
- Statut : Obligatoire / Recommandé / Optionnel
- Validité requise (si applicable)
- Observations ou points d'attention

Classe les documents par ordre de priorité et signale les documents manquants potentiels.
"""


def generate_oral_defense_prompt(tender: Tender) -> str:
    """Generate a prompt for preparing an oral defense/presentation."""
    return f"""Tu es un coach spécialisé dans la préparation de soutenances orales pour les appels d'offres.

Prépare un guide de soutenance pour l'appel d'offres suivant :

- Référence : {tender.reference}
- Titre : {tender.title}
- Organisation : {tender.organization or 'Non spécifiée'}
- Budget : {tender.budget_estimated or 'Non spécifié'} {tender.currency}

Produis :

1. **Structure de la présentation** (15-20 minutes) :
   - Slide 1 : Introduction et accroche
   - Slides 2-3 : Compréhension du besoin
   - Slides 4-6 : Méthodologie et approche
   - Slides 7-8 : Équipe et références
   - Slide 9 : Planning synthétique
   - Slide 10 : Conclusion et engagement

2. **Arguments clés** : 3-5 points forts à mettre en avant
3. **Questions probables** : 10 questions attendues avec réponses suggérées
4. **Gestes et posture** : Conseils de communication non-verbale
5. **Gestion du temps** : Timing par section
6. **Kit de crise** : Réponses aux objections possibles
"""


def generate_partner_search_prompt(tender: Tender, profile: Optional[CompanyProfile] = None) -> str:
    """Generate a prompt for identifying potential partners."""
    company_name = profile.company_name if profile else "[ENTREPRISE]"
    capabilities = ", ".join(profile.technical_capabilities) if profile and profile.technical_capabilities else "[CAPACITÉS]"

    return f"""Tu es un consultant en partenariats stratégiques B2B en Afrique de l'Ouest.

Identifie les types de partenaires pertinents pour répondre à cet appel d'offres :

- Référence : {tender.reference}
- Titre : {tender.title}
- Secteur : {tender.sector or 'Non spécifié'}
- Budget : {tender.budget_estimated or 'Non spécifié'} {tender.currency}
- Localisation : {tender.location or 'Guinée'}

Notre entreprise : {company_name}
Nos capacités : {capabilities}

Analyse et propose :

1. **Besoins en complémentarité** : Ce qui nous manque pour cet AO
2. **Types de partenaires recherchés** :
   - Partenaires techniques
   - Partenaires financiers
   - Sous-traitants spécialisés
   - Co-traitants
3. **Profil idéal du partenaire** : Critères de sélection
4. **Répartition des rôles** : Mandatement, co-traitance, sous-traitance
5. **Approche de partenariat** : Modèle de lettre d'approche
6. **Points de vigilance** : Clauses de partenariat à négocier
"""


def generate_competition_benchmark_prompt(tender: Tender) -> str:
    """Generate a prompt for benchmarking competition."""
    return f"""Tu es un analyste stratégique spécialisé dans l'intelligence concurrentielle des marchés publics en Guinée.

Réalise une analyse concurrentielle pour l'appel d'offres suivant :

- Référence : {tender.reference}
- Titre : {tender.title}
- Secteur : {tender.sector or 'Non spécifié'}
- Budget : {tender.budget_estimated or 'Non spécifié'} {tender.currency}
- Organisation : {tender.organization or 'Non spécifiée'}

Produis :

1. **Paysage concurrentiel** : Types de concurrents probables sur ce segment
2. **Avantages concurrentiels typiques** : Ce que les concurrents mettent en avant
3. **Nos différentiateurs possibles** : Comment se démarquer
4. **Stratégie de positionnement** : Angle d'attaque recommandé
5. **Points faibles probables des concurrents** : Opportunités à exploiter
6. **Fourchette de prix attendue** : Estimation des prix concurrentiels
7. **Recommandation tactique** : Comment optimiser notre offre

Base l'analyse sur les tendances du marché guinéen dans le secteur {tender.sector or 'concerné'}.
"""


def generate_professional_email_prompt(tender: Tender, contact: Optional[CRMContact] = None) -> str:
    """Generate a prompt for writing a professional approach email."""
    contact_name = f"{contact.first_name} {contact.last_name}" if contact else "[CONTACT]"
    contact_org = contact.organization_name if contact else "[ORGANISATION]"
    contact_role = contact.job_title if contact else "[FONCTION]"

    return f"""Tu es un expert en communication professionnelle B2B.

Rédige un email d'approche professionnelle pour l'appel d'offres suivant :

**Destinataire :**
- Nom : {contact_name}
- Fonction : {contact_role}
- Organisation : {contact_org}

**Appel d'offres :**
- Référence : {tender.reference}
- Titre : {tender.title}
- Organisation : {tender.organization or 'Non spécifiée'}

L'email doit :
1. Être court, professionnel et personnalisé
2. Montrer une connaissance du projet
3. Proposer un échange ou une rencontre
4. Inclure un appel à l'action clair
5. Respecter les normes de communication institutionnelle en Guinée

IMPORTANT : Cet email est destiné à une adresse professionnelle institutionnelle uniquement.
Il ne doit contenir aucune mention de données personnelles.

Fournis 2 variantes : une formelle et une plus directe.
"""


# Map prompt types to their generator functions
PROMPT_GENERATORS = {
    "dao_analysis": generate_dao_analysis_prompt,
    "technical_memo": generate_technical_memo_prompt,
    "financial_offer": generate_financial_offer_prompt,
    "company_presentation": generate_company_presentation_prompt,
    "project_planning": generate_project_planning_prompt,
    "document_list": generate_document_list_prompt,
    "oral_defense": generate_oral_defense_prompt,
    "partner_search": generate_partner_search_prompt,
    "competition_benchmark": generate_competition_benchmark_prompt,
    "professional_email": generate_professional_email_prompt,
}


def get_prompt_for_tender(
    prompt_type: str,
    tender: Tender,
    profile: Optional[CompanyProfile] = None,
    contact: Optional[CRMContact] = None,
) -> str:
    """Get the generated prompt for a given type, tender, profile and optional contact."""
    generator = PROMPT_GENERATORS.get(prompt_type)
    if generator is None:
        raise ValueError(f"Type de prompt inconnu : {prompt_type}")

    # Some generators accept profile, some accept contact
    if prompt_type == "professional_email":
        return generator(tender, contact)
    elif prompt_type in ("technical_memo", "company_presentation", "partner_search"):
        return generator(tender if prompt_type != "company_presentation" else None, profile) if prompt_type != "company_presentation" else generator(profile)
    else:
        return generator(tender)


def generate_all_prompts_for_tender(
    tender: Tender,
    profile: Optional[CompanyProfile] = None,
) -> dict[str, str]:
    """Generate all prompt types for a given tender."""
    results = {}
    for prompt_type, generator in PROMPT_GENERATORS.items():
        try:
            if prompt_type in ("technical_memo", "partner_search"):
                results[prompt_type] = generator(tender, profile)
            elif prompt_type == "company_presentation":
                results[prompt_type] = generator(profile)
            elif prompt_type == "professional_email":
                results[prompt_type] = generator(tender)  # No contact in batch mode
            else:
                results[prompt_type] = generator(tender)
        except Exception:
            results[prompt_type] = ""
    return results
