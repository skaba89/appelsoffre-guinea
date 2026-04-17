"""TenderFlow Guinea — Seed Data Script.

Populates the database with realistic test data for development.
All data is fictional and for development purposes only.
"""
import asyncio
import sys
import os
import uuid
from datetime import datetime, timedelta, timezone
from random import choice, randint, uniform

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

from app.core.database import async_session_factory
from app.core.security import hash_password
from app.models.tenant import Tenant
from app.models.user import User, Membership
from app.models.source import Source
from app.models.tender import Tender
from app.models.category import Category
from app.models.company import CompanyProfile
from app.models.crm import CRMAccount, CRMContact, CRMOpportunity
from app.models.alert import AlertConfig
from app.models.billing import SubscriptionPlan


SECTORS = [
    "BTP", "IT / Digital", "Énergie", "Mines", "Agriculture",
    "Santé", "Éducation", "Conseil", "Fournitures", "Logistique",
    "Maintenance", "Sécurité", "Télécom", "Industrie", "Finance",
    "Eau / Assainissement",
]

REGIONS = [
    "Conakry", "Kindia", "Boké", "Labé", "Faranah",
    "Kankan", "Nzérékoré", "Mamou", "National",
]

ORGANIZATIONS = [
    "Ministère des Travaux Publics", "Direction Nationale de l'Eau",
    "Société des Bauxites de Guinée", "Ministère de la Santé",
    "Agence Guinéenne de l'Énergie", "Office National de l'Éducation",
    "Société Guinéenne de Télécommunications", "Port Autonome de Conakry",
    "Ministère de l'Agriculture", "Direction Générale des Marchés Publics",
    "Commune de Conakry", "Société Nationale d'Électricité",
    "Office Guinéen de la Sécurité Sociale", "Banque Centrale de Guinée",
    "Ministère des Mines et de la Géologie",
]

TENDER_TITLES = {
    "BTP": [
        "Construction d'un pont sur le fleuve Niger",
        "Réhabilitation de la route Conakry-Kindia",
        "Construction d'un centre hospitalier régional",
        "Aménagement du port de Kamsar",
        "Réfection du stade du 28 Septembre",
    ],
    "IT / Digital": [
        "Mise en place d'un système d'information intégré",
        "Fourniture et déploiement d'un réseau informatique",
        "Développement d'une plateforme e-gouvernement",
        "Acquisition d'équipements informatiques et réseaux",
        "Installation d'un datacenter souverain",
    ],
    "Énergie": [
        "Construction d'une centrale solaire de 50MW",
        "Extension du réseau électrique rural",
        "Fourniture de groupes électrogènes",
        "Électrification de 100 localités rurales",
        "Installation de panneaux solaires dans les écoles",
    ],
    "Mines": [
        "Étude d'impact environnemental du projet minier",
        "Fourniture d'équipements d'exploitation minière",
        "Construction d'infrastructures de transport minier",
        "Audit technique des installations de traitement",
        "Service de gardiennage et sécurité minière",
    ],
    "Santé": [
        "Fourniture de médicaments et dispositifs médicaux",
        "Construction d'un centre de santé communautaire",
        "Acquisition d'équipements d'imagerie médicale",
        "Formation du personnel de santé",
        "Mise en place d'un système de télémedecine",
    ],
    "Éducation": [
        "Construction d'écoles primaires dans 5 préfectures",
        "Fourniture de manuels scolaires et matériel didactique",
        "Équipement de laboratoires scientifiques",
        "Programme de formation des enseignants",
        "Installation de bibliothèques numériques",
    ],
    "Eau / Assainissement": [
        "Construction d'un réseau d'adduction d'eau potable",
        "Réhabilitation de la station de traitement d'eau",
        "Assainissement des eaux usées de Conakry",
        "Forage de 50 puits dans la Haute-Guinée",
        "Étude hydrogéologique du bassin du Niger",
    ],
}

TENDER_STATUSES = ["new", "qualifying", "qualified", "go", "no_go", "responding", "expired"]

TENDER_TYPES = ["public", "private", "restricted", "open"]

STRATEGIES = ["go", "go_conditional", "no_go"]


async def seed():
    print("🌱 Seeding TenderFlow Guinea database...")

    async with async_session_factory() as session:
        # ─── Create tenant ────────────────────────────────────
        tenant_id = str(uuid.uuid4())
        tenant = Tenant(
            id=tenant_id,
            name="Guinée Tech Solutions",
            slug="guinee-tech",
            settings={
                "country": "GN",
                "default_currency": "GNF",
                "language": "fr",
                "sectors": ["IT / Digital", "Énergie", "Conseil", "BTP"],
            },
        )
        session.add(tenant)
        await session.flush()

        # ─── Create admin user ─────────────────────────────────
        user_id = str(uuid.uuid4())
        admin = User(
            id=user_id,
            email="admin@tenderflow-gn.com",
            full_name="Amara Diallo",
            hashed_password=hash_password("changeme123"),
            is_active=True,
            is_superuser=False,
        )
        session.add(admin)
        await session.flush()

        membership = Membership(
            user_id=user_id,
            tenant_id=tenant_id,
            role="tenant_admin",
            is_active=True,
        )
        session.add(membership)

        # ─── Create additional users ───────────────────────────
        users_data = [
            ("analyst@tenderflow-gn.com", "Fatou Bâ", "analyst"),
            ("sales@tenderflow-gn.com", "Ibrahima Sow", "sales"),
            ("bid@tenderflow-gn.com", "Mariam Touré", "bid_manager"),
            ("viewer@tenderflow-gn.com", "Mamadou Condé", "viewer"),
        ]
        for email, name, role in users_data:
            uid = str(uuid.uuid4())
            u = User(
                id=uid,
                email=email,
                full_name=name,
                hashed_password=hash_password("changeme123"),
                is_active=True,
            )
            session.add(u)
            await session.flush()
            m = Membership(user_id=uid, tenant_id=tenant_id, role=role, is_active=True)
            session.add(m)

        # ─── Create categories ─────────────────────────────────
        for i, sector in enumerate(SECTORS):
            cat = Category(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name=sector,
                slug=sector.lower().replace(" / ", "-").replace(" ", "-"),
                parent_id=None,
                level=0,
            )
            session.add(cat)

        # ─── Create sources ────────────────────────────────────
        sources_data = [
            ("Direction Générale des Marchés Publics", "https://marches-publics.gn", "html"),
            ("Journal Officiel de Guinée", "https://journal-officiel.gn", "html"),
            ("Portail National des AO", "https://appels-offres.gn", "html"),
            ("Ministère des Finances", "https://finances.gn/marches", "html"),
            ("ANAFIC", "https://anafic.gn", "html"),
        ]
        for name, url, stype in sources_data:
            source = Source(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name=name,
                source_type=stype,
                url=url,
                is_active=True,
                frequency="daily",
                config={"selector": ".tender-list", "pagination": True},
            )
            session.add(source)

        # ─── Create tenders ────────────────────────────────────
        tenders = []
        for i in range(40):
            sector = choice(SECTORS)
            titles = TENDER_TITLES.get(sector, ["Appel d'offres général"])
            title = choice(titles)
            org = choice(ORGANIZATIONS)
            region = choice(REGIONS)
            status = choice(TENDER_STATUSES)
            tender_type = choice(TENDER_TYPES)
            strategy = choice(STRATEGIES) if status in ("qualified", "go", "no_go", "responding") else None

            pub_date = datetime.now(timezone.utc) - timedelta(days=randint(1, 60))
            deadline = datetime.now(timezone.utc) + timedelta(days=randint(-5, 90))
            budget = randint(10, 5000) * 1_000_000  # 10M - 5B GNF

            t = Tender(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                reference=f"AO-{datetime.now().year}-{randint(1000, 9999)}",
                title=title,
                tender_type=tender_type,
                organization=org,
                sector=sector,
                subsector=None,
                description=f"Appel d'offres pour {title.lower()}. L'organisation {org} recherche des prestataires qualifiés pour la réalisation de ce projet d'envergure en {region}. Les candidatures doivent être déposées avant la date limite. Le dossier d'appel d'offres est disponible sur le site de l'organisation émettrice.",
                region=region,
                publication_date=pub_date,
                deadline_date=deadline,
                budget_estimated=float(budget),
                currency="GNF",
                is_public=tender_type in ("public", "open"),
                status=status,
                priority_score=round(uniform(0.1, 0.95), 3),
                compatibility_score=round(uniform(0.1, 0.9), 3),
                feasibility_score=round(uniform(0.1, 0.85), 3),
                win_probability=round(uniform(0.05, 0.7), 3),
                strategy_recommendation=strategy,
                is_active=True,
            )
            tenders.append(t)
            session.add(t)

        await session.flush()

        # ─── Create company profile ────────────────────────────
        profile = CompanyProfile(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            company_name="Guinée Tech Solutions",
            description="Entreprise spécialisée dans les solutions technologiques, le conseil en systèmes d'information et l'ingénierie logicielle en Guinée. Plus de 10 ans d'expérience dans les projets IT publics et privés.",
            activities=["Développement logiciel", "Intégration systèmes", "Conseil IT", "Infrastructures réseau"],
            sectors=["IT / Digital", "Énergie", "Conseil", "BTP"],
            specializations=["e-gouvernement", "systèmes d'information", "réseaux telecom", "cybersécurité"],
            countries=["GN"],
            regions=["Conakry", "Kindia", "National"],
            team_size_range="10-50",
            certifications=["ISO 9001", "ISO 27001", "PMI"],
            technical_capabilities=["Java", "Python", "React", "Cloud", "DevOps", "Réseaux"],
            past_clients=["Ministère des Finances", "SOTELGUI", "Banque Centrale"],
        )
        session.add(profile)

        # ─── Create CRM data ──────────────────────────────────
        # Accounts
        for org in ORGANIZATIONS[:10]:
            account = CRMAccount(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name=org,
                type="buyer" if "Ministère" in org or "Direction" in org or "Office" in org else "company",
                sector=choice(SECTORS),
                website=f"https://{org.lower().replace(' ', '-').replace('é', 'e')[:20]}.gn",
                country="GN",
                is_public_buyer="Ministère" in org or "Direction" in org,
                source_url=f"https://marches-publics.gn/org/{org.lower()[:10]}",
                source_label="DGPMP",
            )
            session.add(account)

        await session.flush()

        # Contacts (professional only)
        first_names = ["Amara", "Fatou", "Ibrahima", "Mariam", "Mamadou", "Aissatou", "Ousmane", "Kadiatou", "Alpha", "Djenabou"]
        last_names = ["Diallo", "Bâ", "Sow", "Touré", "Condé", "Camara", "Doubiya", "Bangoura", "Sylla", "Keita"]
        roles = ["Directeur Général", "Chef de Service Marchés", "Responsable Achat", "Secrétaire Général", "Directeur Technique"]

        for i in range(15):
            fn = choice(first_names)
            ln = choice(last_names)
            contact = CRMContact(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                first_name=fn,
                last_name=ln,
                job_title=choice(roles),
                professional_email=f"{fn.lower()}.{ln.lower()}@org-gn.com",
                professional_phone=f"+224 6{randint(20, 99)} {randint(10, 99)} {randint(10, 99)} {randint(10, 99)}",
                organization_name=choice(ORGANIZATIONS),
                source_url=f"https://marches-publics.gn/contacts/{fn.lower()}-{ln.lower()}",
                source_label="DGPMP - Annuaire public",
                validation_status=choice(["pending", "verified", "verified", "verified"]),
                date_collected=datetime.now(timezone.utc) - timedelta(days=randint(1, 90)),
            )
            session.add(contact)

        # Opportunities
        stages = ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"]
        for i in range(10):
            opp = CRMOpportunity(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name=f"Opportunité {choice(TENDER_TITLES.get(choice(SECTORS), ['AO']))[:40]}",
                stage=choice(stages),
                amount=float(randint(50, 2000) * 1_000_000),
                currency="GNF",
                probability=round(uniform(0.1, 0.9), 2),
            )
            session.add(opp)

        # ─── Create alert configs ─────────────────────────────
        alert_configs = [
            AlertConfig(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name="Nouveaux AO IT",
                config={"sector": "IT / Digital", "min_score": 0.5},
                channels=["in_app", "email"],
                is_active=True,
            ),
            AlertConfig(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name="Échéances proches",
                config={"deadline_within_days": 7},
                channels=["in_app"],
                is_active=True,
            ),
            AlertConfig(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name="AO forte compatibilité",
                config={"min_compatibility_score": 0.7},
                channels=["in_app", "email"],
                is_active=True,
            ),
        ]
        for ac in alert_configs:
            session.add(ac)

        # ─── Commit ────────────────────────────────────────────
        await session.commit()

    print("✅ Seed data loaded successfully!")
    print()
    print("Demo credentials:")
    print("  Email:    admin@tenderflow-gn.com")
    print("  Password: changeme123")
    print()
    print(f"Created: 1 tenant, 5 users, 5 sources, 40 tenders,")
    print(f"         10 CRM accounts, 15 contacts, 10 opportunities, 3 alert configs")


if __name__ == "__main__":
    asyncio.run(seed())
