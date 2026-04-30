# TenderFlow Guinea

> Plateforme SaaS intelligente de veille, qualification, traitement et exploitation des appels d'offres publics et privés en Guinée

## Aperçu

TenderFlow Guinea est une application SaaS multi-tenant qui permet aux entreprises guinéennes de :

- **Collecter** automatiquement les appels d'offres depuis des sources publiques et légalement accessibles
- **Qualifier** les opportunités grâce à un moteur de scoring configurable (priorité, compatibilité, faisabilité, probabilité de gain)
- **Matcher** les opportunités avec le profil de l'entreprise
- **Générer** des prompts IA spécialisés pour traiter chaque appel d'offres
- **Gérer** un CRM intégré relié aux organisations émettrices et contacts professionnels publics
- **Produire** des documents de réponse assistés par IA (mémoire technique, checklists, matrices de conformité)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js 15    │────▶│   FastAPI        │────▶│  PostgreSQL 16  │
│   Frontend      │     │   Backend API    │     │  + pgvector     │
│   (TypeScript)  │◀────│   (Python 3.12)  │◀────│                 │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼────┐ ┌────▼────┐ ┌─────▼────┐
              │  Redis   │ │  MinIO  │ │  Celery  │
              │  (Cache) │ │  (S3)   │ │ Workers  │
              └──────────┘ └─────────┘ └─────┬────┘
                                             │
                                       ┌─────▼────┐
                                       │ Crawler  │
                                       │(Playwright│
                                       │+ BS4)    │
                                       └──────────┘
```

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, Zustand |
| Backend | FastAPI, SQLAlchemy 2.x (async), Pydantic v2, Alembic |
| Base de données | PostgreSQL 16 + pgvector |
| Cache | Redis 7 |
| Stockage | MinIO (S3-compatible) |
| Workers | Celery + Redis |
| Crawling | Playwright + BeautifulSoup |
| IA | Pipeline RAG, embeddings vectoriels, LLM multi-provider |
| Auth | JWT avec refresh tokens, RBAC multi-tenant |
| Infra | Docker Compose, Nginx |

## Structure du Projet

```
tenderflow-guinea/
├── apps/
│   ├── api/                    # Backend FastAPI
│   │   ├── app/
│   │   │   ├── api/v1/         # Endpoints REST
│   │   │   ├── core/           # Config, DB, sécurité
│   │   │   ├── middleware/     # Tenant isolation, audit
│   │   │   ├── models/         # Modèles SQLAlchemy
│   │   │   ├── schemas/        # Schémas Pydantic
│   │   │   └── services/       # Logique métier
│   │   ├── alembic/            # Migrations DB
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/            # Pages (App Router)
│       │   ├── components/     # Composants réutilisables
│       │   ├── lib/            # API client, utils
│       │   └── stores/         # Zustand stores
│       ├── package.json
│       └── Dockerfile
├── services/
│   ├── crawler/                # Service de crawling
│   └── worker/                 # Workers Celery
├── infrastructure/
│   ├── docker/
│   └── nginx/                  # Reverse proxy
├── scripts/                    # Scripts utilitaires
├── docs/                       # Documentation
├── docker-compose.yml
└── .env.example
```

## Démarrage Rapide

### Prérequis

- Docker & Docker Compose
- Node.js 20+ (pour le développement local du frontend)
- Python 3.12+ (pour le développement local du backend)

### Installation avec Docker Compose

```bash
# 1. Cloner le dépôt
git clone https://github.com/your-org/tenderflow-guinea.git
cd tenderflow-guinea

# 2. Copier et configurer l'environnement
cp .env.example .env
# Éditez .env avec vos clés API LLM et autres paramètres

# 3. Lancer tous les services
docker compose up -d

# 4. Exécuter les migrations
docker compose exec api alembic upgrade head

# 5. (Optionnel) Charger les données de test
docker compose exec api python scripts/seed_data.py

# 6. Accéder à l'application
# Frontend : http://localhost:3000
# API docs : http://localhost:8000/docs
# MinIO console : http://localhost:9001
```

### Développement Local

```bash
# Backend
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd apps/web
npm install
npm run dev

# Worker Celery
cd services/worker
pip install -r requirements.txt
celery -A app.tasks worker --loglevel=info

# Crawler
cd services/crawler
pip install -r requirements.txt
playwright install chromium
python -m app.main
```

## Modules Fonctionnels

### Phase 1 — MVP

| Module | Description | Statut |
|--------|-------------|--------|
| Auth & Multi-tenant | Inscription, connexion, organisations, RBAC | ✅ |
| Sources & Crawlers | Back-office des sources, CRUD, logs de crawl | ✅ |
| Ingestion AO | Collecte et structuration des appels d'offres | ✅ |
| Taxonomie & Scoring | Catégorisation et moteur de scoring configurable | ✅ |
| Profil Entreprise | Configuration du profil pour le matching | ✅ |
| IA Prompts | Génération automatique de prompts par opportunité | ✅ |
| CRM Minimal | Comptes, contacts professionnels, opportunités | ✅ |
| Dashboards | KPIs, répartition sectorielle, pipeline | ✅ |
| Alertes | Notifications in-app et email | ✅ |

### Phase 2 — Enhancement

| Module | Description | Statut |
|--------|-------------|--------|
| RAG complet | Pipeline complet d'ingestion documentaire | ✅ |
| Génération documentaire | Mémoire technique, checklists, matrices | 🔄 |
| Recherche sémantique | Recherche vectorielle sur les DAO | ✅ |
| Pipeline CRM avancé | Kanban, timeline, rappels | ✅ |
| Exports DOCX/PDF | Génération de documents de réponse | 🔄 |

### Phase 3 — Scale

| Module | Description | Statut |
|--------|-------------|--------|
| Billing & Abonnements | Plans Free/Pro/Business/Enterprise | ✅ |
| Multi-source avancé | RSS, email ingestion, API partenaires | 🔄 |
| Analytics avancées | Tendances, benchmarks, prédictions | 📋 |

## Modèle de Données

### Entités Principales

- **tenants** — Organisations clientes (multi-tenant)
- **users** — Utilisateurs avec memberships et rôles
- **sources** — Configuration des sources de crawl
- **tenders** — Appels d'offres avec 25+ champs structurés
- **tender_documents** — Documents attachés (DAO, PDF)
- **tender_chunks** — Chunks textuels avec embeddings pgvector
- **tender_scores** — Scores multi-dimensionnels
- **company_profiles** — Profils entreprise pour le matching
- **crm_accounts** — Organisations (acheteurs, partenaires, concurrents)
- **crm_contacts** — Contacts professionnels publics uniquement
- **crm_opportunities** — Opportunités commerciales
- **generated_prompts** — Prompts IA versionnés
- **alerts** — Configuration et dispatch d'alertes

## Conformité et Garde-fous

TenderFlow Guinea intègre des garde-fous stricts pour la conformité :

- **Aucune donnée personnelle** : Seules les coordonnées professionnelles publiques sont collectées et affichées
- **Traçabilité des sources** : Chaque contact et donnée est lié à sa source publique (URL, label, date de collecte)
- **Validation des contacts** : Statut de validation (pending/verified/rejected) pour chaque contact CRM
- **Audit logs** : Journalisation de toutes les actions sensibles
- **Isolation tenant** : Chaque organisation a ses données strictement isolées
- **RBAC fin** : 6 rôles avec permissions granulaires (super_admin, tenant_admin, analyst, sales, bid_manager, viewer)
- **Suppression** : Fonctionnalités de suppression et droit à l'oubli

## API

L'API REST est documentée avec OpenAPI/Swagger :

- **Swagger UI** : `http://localhost:8000/docs`
- **ReDoc** : `http://localhost:8000/redoc`

### Endpoints Principaux

```
POST   /api/v1/auth/login          # Connexion
POST   /api/v1/auth/register       # Inscription
POST   /api/v1/auth/refresh        # Refresh token
GET    /api/v1/auth/me             # Profil utilisateur

GET    /api/v1/tenders             # Liste des AO (filtres, pagination)
POST   /api/v1/tenders             # Créer un AO
GET    /api/v1/tenders/{id}        # Détail d'un AO
POST   /api/v1/tenders/{id}/score  # Calculer les scores
POST   /api/v1/tenders/{id}/match  # Matcher avec le profil

GET    /api/v1/sources             # Liste des sources
POST   /api/v1/sources             # Créer une source
POST   /api/v1/sources/{id}/trigger # Déclencher un crawl

GET    /api/v1/crm/accounts        # Comptes CRM
GET    /api/v1/crm/contacts        # Contacts professionnels
GET    /api/v1/crm/opportunities   # Opportunités CRM

POST   /api/v1/prompts/generate/{tender_id} # Générer des prompts

GET    /api/v1/company/profile     # Profil entreprise
GET    /api/v1/alerts              # Alertes
GET    /api/v1/admin/stats         # Stats admin
```

## Scripts

```bash
# Initialiser la base de données
python scripts/init_db.py

# Charger les données de test
python scripts/seed_data.py

# Lancer l'environnement de développement
bash scripts/dev.sh
```

## Tests

```bash
# Tests backend
cd apps/api
pytest tests/ -v

# Tests frontend
cd apps/web
npm test
```

## Licence

Propriétaire — Tous droits réservés.
