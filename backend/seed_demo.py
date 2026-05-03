"""SentinelOps — Demo Data Seeder."""

from datetime import date, timedelta
from app.database import SessionLocal, init_db
from app.models import (Company, User, SecurityAgent, Site, Shift, Round,
                         CNAPSRecord, Incident, utc_now)
from app.core import hash_password


def seed():
    init_db()
    db = SessionLocal()

    if db.query(User).first():
        print("⏭️  Database already seeded. Skipping.")
        db.close()
        return

    print("🌱 Seeding SentinelOps demo data...")
    today = date.today()

    # --- Company ---
    company = Company(
        name="Vigilis Sécurité SARL",
        siren="987654321",
        cnaps_authorization="AUT-075-2025-01-23-20200012345",
        agent_count=18,
        plan_type="starter",
    )
    db.add(company)
    db.flush()

    # --- Manager User ---
    user = User(
        email="admin@sentinelops.demo",
        hashed_password=hash_password("demo2026"),
        full_name="Karim Benali",
        role="manager",
        company_id=company.id,
    )
    db.add(user)
    db.flush()

    # --- Security Agents ---
    agents_data = [
        {"first_name": "Mamadou", "last_name": "Diallo", "phone": "0612345678",
         "cnaps_card_number": "CAR-075-2023-01-01-00001234", "cnaps_card_expiry": today + timedelta(days=400),
         "cnaps_card_type": "surveillance", "qualifications": ["SSIAP1", "SST"],
         "preferred_zones": ["zone_nord"], "hourly_rate": 12.50, "status": "available"},
        {"first_name": "Sophie", "last_name": "Martin", "phone": "0623456789",
         "cnaps_card_number": "CAR-075-2022-06-15-00005678", "cnaps_card_expiry": today + timedelta(days=25),
         "cnaps_card_type": "surveillance", "qualifications": ["SSIAP1", "SST", "palpation"],
         "preferred_zones": ["zone_sud"], "hourly_rate": 13.00, "status": "on_duty"},
        {"first_name": "Jean-Pierre", "last_name": "Dubois", "phone": "0634567890",
         "cnaps_card_number": "CAR-075-2021-03-20-00009012", "cnaps_card_expiry": today - timedelta(days=10),
         "cnaps_card_type": "surveillance", "qualifications": ["SST"],
         "preferred_zones": ["zone_nord", "zone_est"], "hourly_rate": 11.80, "status": "inactive"},
        {"first_name": "Fatima", "last_name": "Ouazani", "phone": "0645678901",
         "cnaps_card_number": "CAR-075-2024-01-10-00003456", "cnaps_card_expiry": today + timedelta(days=600),
         "cnaps_card_type": "surveillance", "qualifications": ["SSIAP1", "SSIAP2", "SST", "cynophile"],
         "preferred_zones": ["zone_sud", "zone_ouest"], "hourly_rate": 15.00, "status": "available"},
        {"first_name": "Lucas", "last_name": "Petit", "phone": "0656789012",
         "cnaps_card_number": "CAR-075-2023-09-01-00007890", "cnaps_card_expiry": today + timedelta(days=200),
         "cnaps_card_type": "surveillance", "qualifications": ["SSIAP1", "SST"],
         "preferred_zones": ["zone_est"], "hourly_rate": 12.00, "status": "available"},
        {"first_name": "Aminata", "last_name": "Koné", "phone": "0667890123",
         "cnaps_card_number": "CAR-075-2024-05-20-00002345", "cnaps_card_expiry": today + timedelta(days=55),
         "cnaps_card_type": "surveillance", "qualifications": ["SST", "palpation"],
         "preferred_zones": ["zone_nord"], "hourly_rate": 12.50, "status": "on_duty"},
    ]

    agents = []
    for a in agents_data:
        agent = SecurityAgent(company_id=company.id, **a)
        db.add(agent)
        agents.append(agent)
    db.flush()

    # --- Sites ---
    sites_data = [
        {"name": "Entrepôt Logistique Nord", "address": "12 Rue des Entrepôts", "city": "Saint-Denis",
         "postal_code": "93200", "site_type": "warehouse", "risk_level": "high",
         "required_qualifications": ["SSIAP1"], "min_agents_per_shift": 2, "client_name": "LogiNord SAS"},
        {"name": "Centre Commercial Les Halles", "address": "1 Place des Halles", "city": "Paris",
         "postal_code": "75001", "site_type": "retail", "risk_level": "medium",
         "required_qualifications": ["SSIAP1", "palpation"], "min_agents_per_shift": 3, "client_name": "Unibail-Rodamco"},
        {"name": "Siège Social TechCorp", "address": "45 Avenue de la Défense", "city": "Courbevoie",
         "postal_code": "92400", "site_type": "office", "risk_level": "low",
         "required_qualifications": [], "min_agents_per_shift": 1, "client_name": "TechCorp France"},
        {"name": "Résidence Parc des Princes", "address": "8 Boulevard d'Auteuil", "city": "Paris",
         "postal_code": "75016", "site_type": "residential", "risk_level": "medium",
         "required_qualifications": ["cynophile"], "min_agents_per_shift": 1, "client_name": "Syndic Gestimmo"},
    ]

    sites = []
    for s in sites_data:
        site = Site(company_id=company.id, **s)
        db.add(site)
        sites.append(site)
    db.flush()

    # --- Shifts (today + tomorrow) ---
    shifts_data = [
        {"agent": agents[0], "site": sites[0], "date": today, "start": "08:00", "end": "20:00", "status": "completed"},
        {"agent": agents[1], "site": sites[1], "date": today, "start": "09:00", "end": "21:00", "status": "in_progress"},
        {"agent": agents[3], "site": sites[0], "date": today, "start": "20:00", "end": "08:00", "status": "planned"},
        {"agent": agents[4], "site": sites[2], "date": today, "start": "07:00", "end": "19:00", "status": "completed"},
        {"agent": agents[5], "site": sites[1], "date": today, "start": "09:00", "end": "21:00", "status": "in_progress"},
        {"agent": agents[0], "site": sites[3], "date": today + timedelta(days=1), "start": "20:00", "end": "08:00", "status": "planned"},
        {"agent": agents[3], "site": sites[1], "date": today + timedelta(days=1), "start": "09:00", "end": "21:00", "status": "planned"},
    ]

    for s in shifts_data:
        start_h, start_m = map(int, s["start"].split(":"))
        end_h, end_m = map(int, s["end"].split(":"))
        duration = (end_h * 60 + end_m - start_h * 60 - start_m) / 60
        if duration < 0:
            duration += 24
        shift = Shift(
            agent_id=s["agent"].id, site_id=s["site"].id,
            shift_date=s["date"], start_time=s["start"], end_time=s["end"],
            duration_hours=round(duration, 2), status=s["status"],
        )
        db.add(shift)
    db.flush()

    # --- CNAPS Records ---
    cnaps_records = [
        CNAPSRecord(agent_id=agents[1].id, record_type="card_renewal", description="Renouvellement carte pro",
                     due_date=today + timedelta(days=25), status="upcoming"),
        CNAPSRecord(agent_id=agents[2].id, record_type="card_renewal", description="Carte expirée",
                     due_date=today - timedelta(days=10), status="overdue"),
        CNAPSRecord(agent_id=agents[5].id, record_type="mac_training", description="Recyclage MAC APS",
                     due_date=today + timedelta(days=55), status="upcoming"),
        CNAPSRecord(agent_id=agents[0].id, record_type="sst_renewal", description="Recyclage SST",
                     due_date=today + timedelta(days=120), status="pending"),
    ]
    db.add_all(cnaps_records)

    # --- Incidents ---
    incidents = [
        Incident(
            agent_id=agents[0].id, site_id=sites[0].id, incident_type="suspicious",
            severity="medium", title="Véhicule suspect stationné zone chargement",
            raw_report="Un véhicule utilitaire blanc sans plaque visible stationné depuis 2h devant le quai 3. Pas de conducteur visible. J'ai noté l'heure et pris des photos.",
            ai_structured_report={
                "incident_type": "suspicious", "severity": "medium",
                "summary": "Véhicule utilitaire blanc sans plaque stationné 2h devant quai 3, sans conducteur visible.",
                "actions_taken": ["Photos prises", "Heure notée"], "requires_police": False,
            },
            status="investigating",
        ),
        Incident(
            agent_id=agents[1].id, site_id=sites[1].id, incident_type="theft",
            severity="high", title="Vol à l'étalage — suspect interpellé",
            raw_report="Interpellation d'un individu qui tentait de sortir avec des articles non payés. Police appelée. Individu retenu dans le local de sûreté en attendant les forces de l'ordre.",
            ai_structured_report={
                "incident_type": "theft", "severity": "high",
                "summary": "Vol à l'étalage. Suspect interpellé et retenu dans le local de sûreté. Police appelée.",
                "actions_taken": ["Interpellation", "Appel police", "Rétention en local sûreté"],
                "requires_police": True, "requires_client_notification": True,
            },
            status="open", police_notified=True,
        ),
    ]
    db.add_all(incidents)

    db.commit()
    print("✅ SentinelOps demo data seeded successfully!")
    print(f"   📧 Login: admin@sentinelops.demo / demo2026")
    print(f"   👮 {len(agents)} agents | 📍 {len(sites)} sites | ⚠️ {len(incidents)} incidents")
    db.close()


if __name__ == "__main__":
    seed()
