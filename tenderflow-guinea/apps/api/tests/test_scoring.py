"""TenderFlow Guinea — Scoring Engine Tests."""
import pytest
from datetime import datetime, timedelta, timezone

from app.services.scoring import (
    calculate_urgency_score,
    calculate_complexity_score,
    calculate_size_score,
    calculate_doc_risk_score,
    get_strategy_recommendation,
    calculate_all_scores,
    calculate_priority_score,
)


class MockTender:
    """Mock tender object for scoring tests."""

    def __init__(self, **kwargs):
        self.title = kwargs.get("title", "Test Tender")
        self.reference = kwargs.get("reference", "AO-2024-001")
        self.sector = kwargs.get("sector", "BTP")
        self.subsector = kwargs.get("subsector", None)
        self.description = kwargs.get("description", None)
        self.deadline_date = kwargs.get("deadline_date", None)
        self.budget_estimated = kwargs.get("budget_estimated", None)
        self.lots = kwargs.get("lots", None)
        self.region = kwargs.get("region", "Conakry")
        self.checklist_items = kwargs.get("checklist_items", None)


class MockProfile:
    """Mock company profile for scoring tests."""

    def __init__(self, **kwargs):
        self.sectors = kwargs.get("sectors", ["BTP", "IT / Digital"])
        self.specializations = kwargs.get("specializations", ["génie civil", "infrastructures"])
        self.regions = kwargs.get("regions", ["Conakry", "National"])
        self.activities = kwargs.get("activities", ["construction", "rénovation"])
        self.past_clients = kwargs.get("past_clients", ["Ministère des TP"])
        self.certifications = kwargs.get("certifications", ["ISO 9001", "ISO 14001"])
        self.team_size_range = kwargs.get("team_size_range", "50-200")
        self.technical_capabilities = kwargs.get("technical_capabilities", ["BTP", "ingénierie"])


class TestUrgencyScore:
    """Tests for the urgency scoring function."""

    def test_expired_tender_max_urgency(self):
        """Expired tenders should have maximum urgency."""
        tender = MockTender(deadline_date=datetime.now(timezone.utc) - timedelta(days=2))
        score = calculate_urgency_score(tender)
        assert score == 1.0

    def test_very_close_deadline(self):
        """Tenders with < 3 days left should have high urgency."""
        tender = MockTender(deadline_date=datetime.now(timezone.utc) + timedelta(days=1))
        score = calculate_urgency_score(tender)
        assert score >= 0.9

    def test_week_deadline(self):
        """Tenders with ~7 days left should have moderate-high urgency."""
        tender = MockTender(deadline_date=datetime.now(timezone.utc) + timedelta(days=7))
        score = calculate_urgency_score(tender)
        assert 0.5 <= score <= 0.85

    def test_far_deadline_low_urgency(self):
        """Tenders far in the future should have low urgency."""
        tender = MockTender(deadline_date=datetime.now(timezone.utc) + timedelta(days=90))
        score = calculate_urgency_score(tender)
        assert score <= 0.2

    def test_no_deadline_moderate_urgency(self):
        """Tenders without deadline should have moderate urgency."""
        tender = MockTender(deadline_date=None)
        score = calculate_urgency_score(tender)
        assert score == 0.3


class TestComplexityScore:
    """Tests for the complexity scoring function."""

    def test_long_description_high_complexity(self):
        """Long descriptions indicate higher complexity."""
        tender = MockTender(description="x" * 6000)
        score = calculate_complexity_score(tender)
        assert score >= 0.5

    def test_short_description_low_complexity(self):
        """Short descriptions indicate lower complexity."""
        tender = MockTender(description="x" * 100)
        score = calculate_complexity_score(tender)
        assert score <= 0.4

    def test_large_budget_high_complexity(self):
        """Large budgets indicate higher complexity."""
        tender = MockTender(budget_estimated=5_000_000_000)
        score = calculate_complexity_score(tender)
        assert score >= 0.5

    def test_multiple_lots_higher_complexity(self):
        """Multiple lots indicate higher complexity."""
        tender = MockTender(lots=["lot1", "lot2", "lot3", "lot4", "lot5", "lot6"])
        score = calculate_complexity_score(tender)
        assert score >= 0.5


class TestSizeScore:
    """Tests for the size scoring function."""

    def test_large_budget(self):
        """Large budgets should score high."""
        tender = MockTender(budget_estimated=10_000_000_000)
        score = calculate_size_score(tender)
        assert score == 1.0

    def test_medium_budget(self):
        """Medium budgets should score moderate."""
        tender = MockTender(budget_estimated=500_000_000)
        score = calculate_size_score(tender)
        assert 0.5 <= score <= 0.7

    def test_small_budget(self):
        """Small budgets should score low."""
        tender = MockTender(budget_estimated=5_000_000)
        score = calculate_size_score(tender)
        assert score <= 0.2

    def test_no_budget_moderate(self):
        """Missing budget should default to moderate size."""
        tender = MockTender(budget_estimated=None)
        score = calculate_size_score(tender)
        assert score == 0.3


class TestStrategyRecommendation:
    """Tests for the strategy recommendation logic."""

    def test_go_recommendation(self):
        """High priority, good win prob, low risk = GO."""
        strategy = get_strategy_recommendation(
            priority_score=0.7,
            win_prob=0.6,
            doc_risk=0.3,
        )
        assert strategy == "go"

    def test_conditional_go(self):
        """Decent potential but some concerns = GO sous conditions."""
        strategy = get_strategy_recommendation(
            priority_score=0.45,
            win_prob=0.35,
            doc_risk=0.4,
        )
        assert strategy == "go_conditional"

    def test_no_go(self):
        """Low potential or high risk = NO GO."""
        strategy = get_strategy_recommendation(
            priority_score=0.2,
            win_prob=0.1,
            doc_risk=0.8,
        )
        assert strategy == "no_go"


class TestCalculateAllScores:
    """Tests for the comprehensive scoring function."""

    def test_returns_all_dimensions(self):
        """calculate_all_scores should return all score dimensions."""
        tender = MockTender(
            deadline_date=datetime.now(timezone.utc) + timedelta(days=30),
            budget_estimated=500_000_000,
        )
        profile = MockProfile()

        result = calculate_all_scores(tender, profile)

        assert "relevance" in result
        assert "urgency" in result
        assert "complexity" in result
        assert "size" in result
        assert "win_prob" in result
        assert "doc_risk" in result
        assert "priority" in result
        assert "strategy_recommendation" in result

    def test_scores_are_between_0_and_1(self):
        """All scores should be between 0 and 1."""
        tender = MockTender(
            deadline_date=datetime.now(timezone.utc) + timedelta(days=15),
            budget_estimated=200_000_000,
        )
        profile = MockProfile()

        result = calculate_all_scores(tender, profile)

        for key, value in result.items():
            if key != "strategy_recommendation":
                assert 0.0 <= value <= 1.0, f"{key} = {value} is not in [0, 1]"

    def test_strategy_is_valid(self):
        """Strategy recommendation should be one of the valid values."""
        tender = MockTender()
        profile = MockProfile()

        result = calculate_all_scores(tender, profile)

        assert result["strategy_recommendation"] in ("go", "go_conditional", "no_go")

    def test_without_profile(self):
        """Scoring without a profile should still work with lower scores."""
        tender = MockTender(
            deadline_date=datetime.now(timezone.utc) + timedelta(days=30),
            budget_estimated=100_000_000,
        )

        result = calculate_all_scores(tender, profile=None)

        assert result["relevance"] == 0.0
        assert result["win_prob"] == 0.1  # Default without profile
