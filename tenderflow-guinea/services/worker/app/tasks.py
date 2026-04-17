"""TenderFlow Guinea — Worker Service (Celery).

Processes background tasks: document ingestion, scoring, alerts, digest emails.
"""
import os
import sys

# Add shared path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "apps", "api"))

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "tenderflow_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.tasks.crawl_source": {"queue": "crawling"},
        "app.tasks.ingest_document": {"queue": "ingestion"},
        "app.tasks.calculate_scores": {"queue": "scoring"},
        "app.tasks.send_alerts": {"queue": "alerts"},
        "app.tasks.generate_digest": {"queue": "digest"},
    },
)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def crawl_source(self, source_id: str):
    """Crawl a source and ingest new tenders."""
    # This would:
    # 1. Load source config from DB
    # 2. Run the appropriate crawler
    # 3. Deduplicate against existing tenders
    # 4. Create new tender records
    # 5. Update source_run status
    print(f"[Worker] Crawling source {source_id}")


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def ingest_document(self, document_id: str):
    """Ingest a document into the RAG pipeline."""
    # This would:
    # 1. Load document from DB/storage
    # 2. Extract text if needed
    # 3. Chunk the text
    # 4. Generate embeddings
    # 5. Store chunks with embeddings
    print(f"[Worker] Ingesting document {document_id}")


@celery_app.task(bind=True)
def calculate_scores(self, tender_id: str):
    """Calculate scoring dimensions for a tender."""
    print(f"[Worker] Calculating scores for tender {tender_id}")


@celery_app.task(bind=True)
def send_alerts(self, tenant_id: str):
    """Send pending alerts for a tenant."""
    print(f"[Worker] Sending alerts for tenant {tenant_id}")


@celery_app.task(bind=True)
def generate_digest(self, tenant_id: str, digest_type: str = "daily"):
    """Generate and send a digest email for a tenant."""
    print(f"[Worker] Generating {digest_type} digest for tenant {tenant_id}")


@celery_app.task(bind=True)
def scheduled_crawl(self):
    """Periodic task: crawl all active sources that are due."""
    print("[Worker] Running scheduled crawl for all due sources")


# Periodic task schedule
celery_app.conf.beat_schedule = {
    "scheduled-crawl-every-hour": {
        "task": "app.tasks.scheduled_crawl",
        "schedule": 3600.0,  # Every hour
    },
    "daily-digest": {
        "task": "app.tasks.generate_digest",
        "schedule": 86400.0,  # Every 24 hours
        "args": ("daily",),
    },
}

if __name__ == "__main__":
    celery_app.start()
