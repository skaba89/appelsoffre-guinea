"""TenderFlow Guinea — Scoring Engine.

Configurable scoring system for tender evaluation across multiple dimensions.
"""
from datetime import datetime, timezone
from typing import Optional

from app.models.tender import Tender
from app.models.company import CompanyProfile


# Default scoring weights (configurable per tenant)
DEFAULT_WEIGHTS = {
    "relevance": 0.30,
    "urgency": 0.20,
    "complexity": 0.10,
    "size": 0.10,
    "win_prob": 0.20,
    "doc_risk": 0.10,
}


def calculate_relevance_score(tender: Tender, profile: Optional[CompanyProfile] = None) -> float:
    """Calculate how relevant the tender is to the company's profile.

    Considers sector match, specialization overlap, and geographic coverage.
    Returns a score between 0 and 1.
    """
    if profile is None:
        return 0.0

    score = 0.0
    max_score = 0.0

    # Sector match (weight: 40%)
    max_score += 40
    if profile.sectors and tender.sector:
        company_sectors = [s.lower() for s in (profile.sectors if isinstance(profile.sectors, list) else [])]
        if tender.sector.lower() in company_sectors:
            score += 40
        else:
            # Partial match on sector keywords
            for cs in company_sectors:
                if any(word in tender.sector.lower() for word in cs.split()):
                    score += 20
                    break

    # Specialization match (weight: 30%)
    max_score += 30
    if profile.specializations and tender.subsector:
        specs = [s.lower() for s in (profile.specializations if isinstance(profile.specializations, list) else [])]
        if any(tender.subsector.lower() in spec or spec in tender.subsector.lower() for spec in specs):
            score += 30
        elif any(any(word in tender.subsector.lower() for word in spec.split()) for spec in specs):
            score += 15

    # Geographic coverage (weight: 20%)
    max_score += 20
    if profile.regions and tender.region:
        regions = [r.lower() for r in (profile.regions if isinstance(profile.regions, list) else [])]
        if tender.region.lower() in regions or "national" in regions:
            score += 20
        elif any(word in tender.region.lower() for word in regions):
            score += 10

    # Activity match (weight: 10%)
    max_score += 10
    if profile.activities and tender.description:
        activities = [a.lower() for a in (profile.activities if isinstance(profile.activities, list) else [])]
        desc_lower = tender.description.lower()
        match_count = sum(1 for a in activities if a in desc_lower)
        if match_count > 0:
            score += min(10, match_count * 3)

    return round(score / max_score, 3) if max_score > 0 else 0.0


def calculate_urgency_score(tender: Tender) -> float:
    """Calculate urgency based on deadline proximity.

    Returns a score between 0 and 1, where 1 is most urgent.
    """
    if not tender.deadline_date:
        return 0.3  # No deadline = moderate urgency

    now = datetime.now(timezone.utc)
    deadline = tender.deadline_date
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    days_remaining = (deadline - now).total_seconds() / 86400

    if days_remaining < 0:
        return 1.0  # Already expired — maximum urgency (but likely should be filtered)
    elif days_remaining < 3:
        return 0.95
    elif days_remaining < 7:
        return 0.8
    elif days_remaining < 14:
        return 0.6
    elif days_remaining < 30:
        return 0.4
    elif days_remaining < 60:
        return 0.2
    else:
        return 0.1


def calculate_complexity_score(tender: Tender) -> float:
    """Estimate the complexity of responding to this tender.

    Considers document count, description length, lots, budget size.
    Returns a score between 0 and 1.
    """
    score = 0.0
    factors = 0

    # Description length as complexity proxy
    if tender.description:
        desc_len = len(tender.description)
        if desc_len > 5000:
            score += 0.8
        elif desc_len > 2000:
            score += 0.5
        elif desc_len > 500:
            score += 0.3
        else:
            score += 0.1
        factors += 1

    # Number of lots
    if tender.lots:
        lot_count = len(tender.lots) if isinstance(tender.lots, list) else 1
        if lot_count > 5:
            score += 0.9
        elif lot_count > 2:
            score += 0.5
        else:
            score += 0.2
        factors += 1

    # Budget size as complexity proxy
    if tender.budget_estimated:
        budget = float(tender.budget_estimated)
        if budget > 1_000_000_000:  # > 1 billion GNF
            score += 0.8
        elif budget > 100_000_000:
            score += 0.5
        elif budget > 10_000_000:
            score += 0.3
        else:
            score += 0.1
        factors += 1

    return round(score / max(factors, 1), 3)


def calculate_size_score(tender: Tender) -> float:
    """Estimate the size/scale of the tender opportunity.

    Based on budget and number of lots.
    Returns a score between 0 and 1.
    """
    if not tender.budget_estimated:
        return 0.3  # Default moderate size

    budget = float(tender.budget_estimated)
    # GNF thresholds
    if budget > 5_000_000_000:
        return 1.0
    elif budget > 1_000_000_000:
        return 0.8
    elif budget > 500_000_000:
        return 0.6
    elif budget > 100_000_000:
        return 0.4
    elif budget > 10_000_000:
        return 0.2
    else:
        return 0.1


def calculate_win_probability(tender: Tender, profile: Optional[CompanyProfile] = None) -> float:
    """Estimate the probability of winning this tender.

    Based on profile match, past experience, and competitive factors.
    Returns a score between 0 and 1.
    """
    if profile is None:
        return 0.1

    score = 0.0

    # Sector experience (30%)
    if profile.sectors and tender.sector:
        company_sectors = [s.lower() for s in (profile.sectors if isinstance(profile.sectors, list) else [])]
        if tender.sector.lower() in company_sectors:
            score += 0.3

    # Past references in similar domain (30%)
    if profile.past_clients:
        score += 0.15
    if profile.certifications:
        certs = profile.certifications if isinstance(profile.certifications, list) else []
        if len(certs) > 3:
            score += 0.15
        elif len(certs) > 0:
            score += 0.08

    # Team size match (20%)
    if profile.team_size_range and tender.budget_estimated:
        score += 0.1

    # Technical capabilities (20%)
    if profile.technical_capabilities:
        tech_caps = profile.technical_capabilities if isinstance(profile.technical_capabilities, list) else []
        if len(tech_caps) > 5:
            score += 0.2
        elif len(tech_caps) > 0:
            score += 0.1

    return round(min(score, 1.0), 3)


def calculate_doc_risk_score(tender: Tender) -> float:
    """Assess the risk level related to documentation requirements.

    Higher score = higher risk (more documents needed, tighter deadlines).
    Returns a score between 0 and 1.
    """
    risk = 0.0

    # Check if checklist exists
    if tender.checklist_items:
        checklist = tender.checklist_items
        if isinstance(checklist, list):
            missing = sum(1 for item in checklist if not item.get("completed", False))
            total = len(checklist)
            if total > 0:
                risk = missing / total
        elif isinstance(checklist, dict):
            missing = sum(1 for v in checklist.values() if not v)
            total = len(checklist)
            if total > 0:
                risk = missing / total
    else:
        risk = 0.5  # No checklist = moderate risk

    return round(min(risk, 1.0), 3)


def calculate_priority_score(tender: Tender, profile: Optional[CompanyProfile] = None) -> float:
    """Calculate overall priority score combining all dimensions.

    Uses configurable weights to produce a weighted composite score.
    """
    weights = DEFAULT_WEIGHTS.copy()

    scores = {
        "relevance": calculate_relevance_score(tender, profile),
        "urgency": calculate_urgency_score(tender),
        "complexity": calculate_complexity_score(tender),
        "size": calculate_size_score(tender),
        "win_prob": calculate_win_probability(tender, profile),
        "doc_risk": calculate_doc_risk_score(tender),
    }

    weighted_sum = sum(scores[k] * weights[k] for k in weights)
    total_weight = sum(weights.values())

    return round(weighted_sum / total_weight, 3) if total_weight > 0 else 0.0


def get_strategy_recommendation(
    priority_score: float,
    win_prob: float,
    doc_risk: float,
) -> str:
    """Determine the strategic recommendation for this tender.

    Returns: "go", "go_conditional", or "no_go"
    """
    # Strong GO: high priority, good win probability, manageable risk
    if priority_score >= 0.6 and win_prob >= 0.5 and doc_risk < 0.6:
        return "go"

    # Conditional GO: decent potential but some concerns
    if priority_score >= 0.4 and win_prob >= 0.3:
        return "go_conditional"

    # NO GO: low potential or too risky
    return "no_go"


def calculate_all_scores(tender: Tender, profile: Optional[CompanyProfile] = None) -> dict:
    """Calculate all scoring dimensions and return a comprehensive result."""
    relevance = calculate_relevance_score(tender, profile)
    urgency = calculate_urgency_score(tender)
    complexity = calculate_complexity_score(tender)
    size = calculate_size_score(tender)
    win_prob = calculate_win_probability(tender, profile)
    doc_risk = calculate_doc_risk_score(tender)
    priority = calculate_priority_score(tender, profile)
    strategy = get_strategy_recommendation(priority, win_prob, doc_risk)

    return {
        "relevance": relevance,
        "urgency": urgency,
        "complexity": complexity,
        "size": size,
        "win_prob": win_prob,
        "doc_risk": doc_risk,
        "priority": priority,
        "strategy_recommendation": strategy,
    }
