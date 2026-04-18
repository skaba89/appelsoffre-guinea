"""TenderFlow Guinea — Matching Engine.

Matches tenders against company profiles to find the best opportunities.
"""
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tender import Tender
from app.models.company import CompanyProfile
from app.services.scoring import calculate_all_scores, calculate_priority_score


async def match_tender_to_profile(
    tender: Tender,
    profile: Optional[CompanyProfile] = None,
) -> dict:
    """Match a single tender against a company profile and return detailed scores.

    Returns a dict with all scoring dimensions plus a compatibility assessment.
    """
    if profile is None:
        return {
            "tender_id": tender.id,
            "matched": False,
            "reason": "Aucun profil entreprise configuré",
            "scores": calculate_all_scores(tender, None),
            "compatibility_score": 0.0,
        }

    scores = calculate_all_scores(tender, profile)

    # Build matching details
    match_details = {
        "sector_match": False,
        "specialization_match": False,
        "geographic_match": False,
        "capability_match": False,
    }

    # Check sector match
    if profile.sectors and tender.sector:
        company_sectors = [s.lower() for s in (profile.sectors if isinstance(profile.sectors, list) else [])]
        match_details["sector_match"] = tender.sector.lower() in company_sectors

    # Check specialization match
    if profile.specializations and tender.subsector:
        specs = [s.lower() for s in (profile.specializations if isinstance(profile.specializations, list) else [])]
        match_details["specialization_match"] = any(
            tender.subsector.lower() in spec or spec in tender.subsector.lower()
            for spec in specs
        )

    # Check geographic match
    if profile.regions and tender.region:
        regions = [r.lower() for r in (profile.regions if isinstance(profile.regions, list) else [])]
        match_details["geographic_match"] = (
            tender.region.lower() in regions or "national" in regions
        )

    # Check capability match
    if profile.technical_capabilities and tender.description:
        caps = [c.lower() for c in (profile.technical_capabilities if isinstance(profile.technical_capabilities, list) else [])]
        desc_lower = tender.description.lower()
        match_details["capability_match"] = any(cap in desc_lower for cap in caps)

    # Overall compatibility is a weighted combination
    match_count = sum(1 for v in match_details.values() if v)
    total_checks = len(match_details)
    compatibility_score = round(match_count / total_checks, 3) if total_checks > 0 else 0.0

    return {
        "tender_id": tender.id,
        "matched": compatibility_score >= 0.25,
        "compatibility_score": compatibility_score,
        "match_details": match_details,
        "scores": scores,
        "recommendation": scores["strategy_recommendation"],
    }


async def get_matching_tenders(
    db: AsyncSession,
    profile: CompanyProfile,
    limit: int = 20,
    min_score: float = 0.3,
) -> list[dict]:
    """Find tenders that best match a company profile.

    Returns a list of tender match results sorted by compatibility score.
    """
    # Get active tenders for the tenant
    result = await db.execute(
        select(Tender)
        .where(
            Tender.tenant_id == profile.tenant_id,
            Tender.is_active == True,
        )
        .order_by(Tender.created_at.desc())
        .limit(200)  # Pre-filter to top 200 recent tenders
    )
    tenders = result.scalars().all()

    matches = []
    for tender in tenders:
        match_result = await match_tender_to_profile(tender, profile)
        if match_result["compatibility_score"] >= min_score:
            matches.append({
                **match_result,
                "title": tender.title,
                "reference": tender.reference,
                "deadline_date": tender.deadline_date.isoformat() if tender.deadline_date else None,
                "sector": tender.sector,
                "budget_estimated": float(tender.budget_estimated) if tender.budget_estimated else None,
            })

    # Sort by compatibility score descending
    matches.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return matches[:limit]
