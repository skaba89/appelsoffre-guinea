"""TenderFlow Guinea — Seed script for demo data.

Creates a default tenant, admin user, CRM accounts/contacts/opportunities,
sample tenders, and a free subscription — all tailored to the Guinean market.
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy import select

from app.core.database import engine, AsyncSessionLocal, Base, init_db
from app.core.security import hash_password
from app.models import *


async def seed():
    # Init DB (create tables)
    await init_db()

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Tenant).where(Tenant.slug == "guinea-demo"))
        if result.scalar_one_or_none():
            print("Already seeded, skipping...")
            return

        # ── Tenant ──────────────────────────────────────────────
        tenant = Tenant(
            id=str(uuid4()),
            name="TenderFlow Guinea Demo",
            slug="guinea-demo",
            plan="free",
            settings={},
        )
        session.add(tenant)
        await session.flush()

        # ── User ────────────────────────────────────────────────
        user = User(
            id=str(uuid4()),
            email="admin@tenderflow-gn.com",
            hashed_password=hash_password("admin123"),
            full_name="Admin TenderFlow",
            is_superuser=True,
        )
        session.add(user)
        await session.flush()

        # ── Membership ──────────────────────────────────────────
        membership = Membership(
            id=str(uuid4()),
            user_id=user.id,
            tenant_id=tenant.id,
            role="tenant_admin",
            accepted_at=datetime.now(timezone.utc),
            is_active=True,
        )
        session.add(membership)
        await session.flush()

        # ── Subscription ────────────────────────────────────────
        subscription = Subscription(
            id=str(uuid4()),
            tenant_id=tenant.id,
            plan="free",
            status="active",
            current_period_start=datetime.now(timezone.utc),
            quotas={},
        )
        session.add(subscription)
        await session.flush()

        # ── CRM Accounts ────────────────────────────────────────
        crm_accounts_data = [
            {
                "name": "ARMP (Autorité de Régulation des Marchés Publics)",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Régulation",
                "city": "Conakry",
                "website": "https://armp-guinee.org",
                "source_url": "https://armp-guinee.org",
                "source_label": "ARMP Guinée",
            },
            {
                "name": "ANAF (Agence Nationale des Achats Financiers)",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Achats publics",
                "city": "Conakry",
                "source_url": "https://anaf.gov.gn",
                "source_label": "ANAF Guinée",
            },
            {
                "name": "DNDMP (Direction Nationale des Marchés Publics)",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Marchés publics",
                "city": "Conakry",
                "source_url": "https://dndmp.gov.gn",
                "source_label": "DNDMP Guinée",
            },
            {
                "name": "Ministère des Mines et de la Géologie",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Mines",
                "city": "Conakry",
                "source_label": "Site officiel du gouvernement guinéen",
            },
            {
                "name": "Ministère de l'Énergie et de l'Hydraulique",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Énergie",
                "city": "Conakry",
                "source_label": "Site officiel du gouvernement guinéen",
            },
            {
                "name": "Ministère des Travaux Publics",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "BTP",
                "city": "Conakry",
                "source_label": "Site officiel du gouvernement guinéen",
            },
            {
                "name": "Ministère de la Santé",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Santé",
                "city": "Conakry",
                "source_label": "Site officiel du gouvernement guinéen",
            },
            {
                "name": "Ministère de l'Éducation Nationale",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Éducation",
                "city": "Conakry",
                "source_label": "Site officiel du gouvernement guinéen",
            },
            {
                "name": "EDG (Électricité de Guinée)",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Énergie",
                "city": "Conakry",
                "source_label": "EDG Guinée",
            },
            {
                "name": "SOGUIPAH (Société Guinéenne du Patrimoine)",
                "type": "company",
                "sector": "Patrimoine",
                "city": "Conakry",
                "source_label": "SOGUIPAH",
            },
            {
                "name": "GUINEA TELECOM",
                "type": "company",
                "sector": "Télécom",
                "city": "Conakry",
                "source_label": "Guinea Telecom",
            },
            {
                "name": "ORANGE GUINÉE",
                "type": "partner",
                "sector": "Télécom",
                "city": "Conakry",
                "website": "https://orange-guinee.com",
                "source_url": "https://orange-guinee.com",
                "source_label": "Orange Guinée",
            },
            {
                "name": "MTN GUINÉE",
                "type": "partner",
                "sector": "Télécom",
                "city": "Conakry",
                "source_label": "MTN Guinée",
            },
            {
                "name": "CELLCOM GUINÉE",
                "type": "partner",
                "sector": "Télécom",
                "city": "Conakry",
                "source_label": "Cellcom Guinée",
            },
            {
                "name": "RUSAL FRIGUIA",
                "type": "company",
                "sector": "Mines",
                "city": "Kindia",
                "source_label": "Rusal Friguia",
            },
            {
                "name": "ALCOA",
                "type": "competitor",
                "sector": "Mines",
                "city": "Boké",
                "source_label": "Alcoa Guinea",
            },
            {
                "name": "CBG (Compagnie des Bauxites de Guinée)",
                "type": "company",
                "sector": "Mines",
                "city": "Boké",
                "source_label": "CBG",
            },
            {
                "name": "Banque Centrale de la République de Guinée",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Finance",
                "city": "Conakry",
                "source_label": "BCRG",
            },
            {
                "name": "Ville de Conakry",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Administration",
                "city": "Conakry",
                "source_label": "Mairie de Conakry",
            },
            {
                "name": "Université Gamal Abdel Nasser de Conakry",
                "type": "buyer",
                "is_public_buyer": True,
                "sector": "Éducation",
                "city": "Conakry",
                "source_label": "UGANC",
            },
        ]

        crm_accounts = {}
        for acc_data in crm_accounts_data:
            acc = CRMAccount(
                id=str(uuid4()),
                tenant_id=tenant.id,
                country="GN",
                **acc_data,
            )
            session.add(acc)
            crm_accounts[acc_data["name"]] = acc

        await session.flush()

        # ── CRM Contacts ────────────────────────────────────────
        crm_contacts_data = [
            {
                "first_name": "Directeur",
                "last_name": "Général ARMP",
                "job_title": "Directeur Général",
                "organization_name": "ARMP (Autorité de Régulation des Marchés Publics)",
                "account": "ARMP (Autorité de Régulation des Marchés Publics)",
                "source_label": "ARMP Guinée - Annuaire officiel",
            },
            {
                "first_name": "Chef",
                "last_name": "de Service ANAF",
                "job_title": "Chef de Service",
                "organization_name": "ANAF (Agence Nationale des Achats Financiers)",
                "account": "ANAF (Agence Nationale des Achats Financiers)",
                "source_label": "ANAF Guinée - Annuaire officiel",
            },
            {
                "first_name": "Directeur",
                "last_name": "DNDMP",
                "job_title": "Directeur",
                "organization_name": "DNDMP (Direction Nationale des Marchés Publics)",
                "account": "DNDMP (Direction Nationale des Marchés Publics)",
                "source_label": "DNDMP Guinée - Annuaire officiel",
            },
            {
                "first_name": "Chef",
                "last_name": "Division Marchés - Ministère des Mines",
                "job_title": "Chef de Division",
                "organization_name": "Ministère des Mines et de la Géologie",
                "account": "Ministère des Mines et de la Géologie",
                "source_label": "Gouvernement guinéen - Annuaire officiel",
            },
            {
                "first_name": "Directeur",
                "last_name": "Achats - EDG",
                "job_title": "Directeur Achats",
                "organization_name": "EDG (Électricité de Guinée)",
                "account": "EDG (Électricité de Guinée)",
                "source_label": "EDG Guinée - Annuaire officiel",
            },
            {
                "first_name": "Responsable",
                "last_name": "Achats - Orange Guinée",
                "job_title": "Responsable Achats",
                "organization_name": "ORANGE GUINÉE",
                "account": "ORANGE GUINÉE",
                "source_label": "Orange Guinée - Annuaire officiel",
            },
            {
                "first_name": "Directeur",
                "last_name": "Général - CBG",
                "job_title": "Directeur Général",
                "organization_name": "CBG (Compagnie des Bauxites de Guinée)",
                "account": "CBG (Compagnie des Bauxites de Guinée)",
                "source_label": "CBG - Annuaire officiel",
            },
        ]

        for contact_data in crm_contacts_data:
            account_name = contact_data.pop("account")
            account_obj = crm_accounts.get(account_name)
            contact = CRMContact(
                id=str(uuid4()),
                tenant_id=tenant.id,
                account_id=account_obj.id if account_obj else None,
                **contact_data,
            )
            session.add(contact)

        await session.flush()

        # ── CRM Opportunities ───────────────────────────────────
        crm_opportunities_data = [
            {
                "name": "Construction route Nationale 1 - Conakry à Kindia",
                "stage": "qualification",
                "amount": 15000000000,
                "account": "Ministère des Travaux Publics",
            },
            {
                "name": "Électrification rurale Boké",
                "stage": "prospecting",
                "amount": 5000000000,
                "account": "EDG (Électricité de Guinée)",
            },
            {
                "name": "Fourniture matériel informatique Ministère Santé",
                "stage": "proposal",
                "amount": 800000000,
                "account": "Ministère de la Santé",
            },
            {
                "name": "Réhabilitation réseau d'eau Conakry",
                "stage": "negotiation",
                "amount": 12000000000,
                "account": "Ministère de l'Énergie et de l'Hydraulique",
            },
            {
                "name": "Audit financier Banque Centrale",
                "stage": "won",
                "amount": 3000000000,
                "account": "Banque Centrale de la République de Guinée",
            },
            {
                "name": "Extension réseau 4G Orange Guinée",
                "stage": "prospecting",
                "amount": 7000000000,
                "account": "ORANGE GUINÉE",
            },
            {
                "name": "Étude impact environnemental CBG",
                "stage": "qualification",
                "amount": 2000000000,
                "account": "CBG (Compagnie des Bauxites de Guinée)",
            },
            {
                "name": "Construction centre de santé Nzérékoré",
                "stage": "proposal",
                "amount": 1500000000,
                "account": "Ministère de la Santé",
            },
            {
                "name": "Fourniture équipements scolaires",
                "stage": "lost",
                "amount": 500000000,
                "account": "Ministère de l'Éducation Nationale",
            },
        ]

        for opp_data in crm_opportunities_data:
            account_name = opp_data.pop("account")
            account_obj = crm_accounts.get(account_name)
            opp = CRMOpportunity(
                id=str(uuid4()),
                tenant_id=tenant.id,
                account_id=account_obj.id if account_obj else None,
                currency="GNF",
                assigned_to=user.id,
                **opp_data,
            )
            session.add(opp)

        await session.flush()

        # ── Sample Tenders ──────────────────────────────────────
        tenders_data = [
            {
                "reference": "AO/ARMP/2026/001",
                "title": "Construction Route Nationale 1",
                "organization": "ARMP (Autorité de Régulation des Marchés Publics)",
                "sector": "BTP",
                "budget_estimated": 15000000000,
                "status": "new",
                "region": "Conakry",
            },
            {
                "reference": "AO/DNDMP/2026/015",
                "title": "Électrification Rurale Boké",
                "organization": "DNDMP (Direction Nationale des Marchés Publics)",
                "sector": "Énergie",
                "budget_estimated": 5000000000,
                "status": "qualifying",
                "region": "Boké",
            },
            {
                "reference": "AO/ANAF/2026/008",
                "title": "Fourniture Matériel Informatique",
                "organization": "ANAF (Agence Nationale des Achats Financiers)",
                "sector": "IT/Digital",
                "budget_estimated": 800000000,
                "status": "qualified",
                "region": "Conakry",
            },
            {
                "reference": "AO/MPT/2026/003",
                "title": "Réhabilitation Réseau d'Eau",
                "organization": "Ministère des Travaux Publics",
                "sector": "Eau/Assainissement",
                "budget_estimated": 12000000000,
                "status": "go/no_go",
                "region": "Conakry",
            },
            {
                "reference": "AO/MINES/2026/022",
                "title": "Étude Impact Environnemental",
                "organization": "Ministère des Mines et de la Géologie",
                "sector": "Mines",
                "budget_estimated": 2000000000,
                "status": "responding",
                "region": "Boké",
            },
            {
                "reference": "AO/SANTE/2026/041",
                "title": "Construction Centre Santé",
                "organization": "Ministère de la Santé",
                "sector": "Santé",
                "budget_estimated": 1500000000,
                "status": "new",
                "region": "Nzérékoré",
            },
            {
                "reference": "AO/EDG/2026/007",
                "title": "Extension Réseau Électrique",
                "organization": "EDG (Électricité de Guinée)",
                "sector": "Énergie",
                "budget_estimated": 7500000000,
                "status": "qualifying",
                "region": "Conakry",
            },
            {
                "reference": "AO/CBG/2026/012",
                "title": "Transport Bauxite",
                "organization": "CBG (Compagnie des Bauxites de Guinée)",
                "sector": "Mines",
                "budget_estimated": 25000000000,
                "status": "qualified",
                "region": "Boké",
            },
            {
                "reference": "AO/EDUC/2026/009",
                "title": "Fourniture Équipements Scolaires",
                "organization": "Ministère de l'Éducation Nationale",
                "sector": "Éducation",
                "budget_estimated": 500000000,
                "status": "expired",
                "region": "Conakry",
            },
        ]

        for tender_data in tenders_data:
            tender = Tender(
                id=str(uuid4()),
                tenant_id=tenant.id,
                currency="GNF",
                tender_type="public",
                **tender_data,
            )
            session.add(tender)

        await session.commit()

    print("✅ Seed completed!")


if __name__ == "__main__":
    asyncio.run(seed())
