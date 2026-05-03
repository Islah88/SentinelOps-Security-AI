"""SentinelOps — Core API Routes."""

from typing import List
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (User, Company, SecurityAgent, Site, Shift, Round,
                         CNAPSRecord, Incident, utc_now)
from app.schemas import (
    AgentCreate, AgentOut, SiteCreate, SiteOut,
    ShiftCreate, ShiftOut, ShiftDetailOut,
    PlanningGenerateRequest, PlanningGenerateResponse,
    RoundCreate, RoundOut, IncidentCreate, IncidentOut,
    CNAPSRecordOut, ComplianceOverview, DashboardOut,
)
from app.core import get_current_user
from app.core.ai_client import ai_generate_planning, ai_structure_incident, ai_check_compliance

router = APIRouter(tags=["SentinelOps Core"])


# --- Security Agents CRUD ---
@router.get("/agents", response_model=List[AgentOut])
def list_agents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SecurityAgent).filter(SecurityAgent.company_id == current_user.company_id).all()

@router.post("/agents", response_model=AgentOut, status_code=201)
def create_agent(payload: AgentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agent = SecurityAgent(company_id=current_user.company_id, **payload.model_dump())
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@router.get("/agents/{agent_id}", response_model=AgentOut)
def get_agent(agent_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agent = db.query(SecurityAgent).filter(SecurityAgent.id == agent_id, SecurityAgent.company_id == current_user.company_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


# --- Sites CRUD ---
@router.get("/sites", response_model=List[SiteOut])
def list_sites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Site).filter(Site.company_id == current_user.company_id).all()

@router.post("/sites", response_model=SiteOut, status_code=201)
def create_site(payload: SiteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    site = Site(company_id=current_user.company_id, **payload.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


# --- Planning ---
@router.get("/shifts", response_model=List[ShiftOut])
def list_shifts(shift_date: date = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Shift).join(SecurityAgent).filter(SecurityAgent.company_id == current_user.company_id)
    if shift_date:
        q = q.filter(Shift.shift_date == shift_date)
    return q.order_by(Shift.shift_date, Shift.start_time).all()

@router.post("/shifts", response_model=ShiftOut, status_code=201)
def create_shift(payload: ShiftCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate duration
    start_parts = payload.start_time.split(":")
    end_parts = payload.end_time.split(":")
    duration = (int(end_parts[0]) * 60 + int(end_parts[1]) - int(start_parts[0]) * 60 - int(start_parts[1])) / 60
    if duration < 0:
        duration += 24  # overnight shift

    shift = Shift(
        agent_id=payload.agent_id, site_id=payload.site_id,
        shift_date=payload.shift_date, start_time=payload.start_time,
        end_time=payload.end_time, duration_hours=round(duration, 2),
        notes=payload.notes,
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift

@router.post("/planning/generate", response_model=PlanningGenerateResponse)
async def generate_planning(payload: PlanningGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI-powered planning generation."""
    company_id = current_user.company_id
    agents = db.query(SecurityAgent).filter(SecurityAgent.company_id == company_id, SecurityAgent.status != "inactive").all()
    sites_q = db.query(Site).filter(Site.company_id == company_id, Site.is_active == True)
    if payload.site_ids:
        sites_q = sites_q.filter(Site.id.in_(payload.site_ids))
    sites = sites_q.all()

    existing = db.query(Shift).join(SecurityAgent).filter(
        SecurityAgent.company_id == company_id,
        Shift.shift_date >= payload.start_date,
        Shift.shift_date <= payload.end_date,
    ).all()

    agents_data = [{"id": a.id, "name": f"{a.first_name} {a.last_name}", "qualifications": a.qualifications or [],
                     "preferred_zones": a.preferred_zones or [], "max_weekly_hours": a.max_weekly_hours} for a in agents]
    sites_data = [{"id": s.id, "name": s.name, "required_qualifications": s.required_qualifications or [],
                    "min_agents_per_shift": s.min_agents_per_shift, "risk_level": s.risk_level} for s in sites]
    existing_data = [{"agent_id": s.agent_id, "site_id": s.site_id, "shift_date": s.shift_date.isoformat(),
                       "start_time": s.start_time, "end_time": s.end_time} for s in existing]

    ai_result = await ai_generate_planning(agents_data, sites_data, payload.start_date.isoformat(), payload.end_date.isoformat(), existing_data)

    if "error" in ai_result:
        raise HTTPException(status_code=500, detail="AI planning generation failed")

    created_shifts = []
    for s in ai_result.get("shifts", []):
        start_parts = s["start_time"].split(":")
        end_parts = s["end_time"].split(":")
        duration = (int(end_parts[0]) * 60 + int(end_parts[1]) - int(start_parts[0]) * 60 - int(start_parts[1])) / 60
        if duration < 0:
            duration += 24

        shift = Shift(
            agent_id=s["agent_id"], site_id=s["site_id"],
            shift_date=date.fromisoformat(s["shift_date"]),
            start_time=s["start_time"], end_time=s["end_time"],
            duration_hours=round(duration, 2), is_ai_generated=True,
        )
        db.add(shift)
        created_shifts.append(shift)

    db.commit()
    for sh in created_shifts:
        db.refresh(sh)

    return PlanningGenerateResponse(
        shifts_created=len(created_shifts),
        conflicts=ai_result.get("conflicts", []),
        warnings=ai_result.get("warnings", []),
        shifts=created_shifts,
    )


# --- Rounds ---
@router.post("/rounds", response_model=RoundOut, status_code=201)
async def create_round(payload: RoundCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rnd = Round(shift_id=payload.shift_id, report_text=payload.report_text)
    db.add(rnd)
    db.commit()
    db.refresh(rnd)
    return rnd

@router.patch("/rounds/{round_id}/complete", response_model=RoundOut)
async def complete_round(round_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rnd = db.query(Round).filter(Round.id == round_id).first()
    if not rnd:
        raise HTTPException(status_code=404, detail="Round not found")
    rnd.status = "completed"
    rnd.completed_at = utc_now()
    db.commit()
    db.refresh(rnd)
    return rnd


# --- Incidents ---
@router.post("/incidents", response_model=IncidentOut, status_code=201)
async def report_incident(payload: IncidentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    incident = Incident(**payload.model_dump())
    # AI structure if raw report provided
    if payload.raw_report:
        ai_report = await ai_structure_incident(payload.raw_report, {"site_id": payload.site_id})
        incident.ai_structured_report = ai_report
        if "severity" in ai_report:
            incident.severity = ai_report["severity"]
        if "title" in ai_report and not payload.title:
            incident.title = ai_report["title"]
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.get("/incidents", response_model=List[IncidentOut])
def list_incidents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Incident).join(Site).filter(Site.company_id == current_user.company_id).order_by(Incident.reported_at.desc()).all()


# --- Compliance ---
@router.get("/compliance", response_model=ComplianceOverview)
async def get_compliance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agents = db.query(SecurityAgent).filter(SecurityAgent.company_id == current_user.company_id).all()
    today = date.today()
    compliant = sum(1 for a in agents if a.cnaps_card_expiry and a.cnaps_card_expiry > today)
    exp_30 = sum(1 for a in agents if a.cnaps_card_expiry and today < a.cnaps_card_expiry <= today + timedelta(days=30))
    exp_60 = sum(1 for a in agents if a.cnaps_card_expiry and today + timedelta(days=30) < a.cnaps_card_expiry <= today + timedelta(days=60))
    overdue = sum(1 for a in agents if a.cnaps_card_expiry and a.cnaps_card_expiry <= today)
    records = db.query(CNAPSRecord).filter(CNAPSRecord.agent_id.in_([a.id for a in agents])).all()

    return ComplianceOverview(
        total_agents=len(agents), compliant_agents=compliant,
        expiring_soon_30d=exp_30, expiring_soon_60d=exp_60,
        overdue=overdue, records=records,
    )


# --- Dashboard ---
@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company_id = current_user.company_id
    today = date.today()
    agents = db.query(SecurityAgent).filter(SecurityAgent.company_id == company_id).all()
    on_duty = sum(1 for a in agents if a.status == "on_duty")
    sites = db.query(Site).filter(Site.company_id == company_id, Site.is_active == True).count()
    today_shifts = db.query(Shift).join(SecurityAgent).filter(SecurityAgent.company_id == company_id, Shift.shift_date == today).count()
    open_incidents = db.query(Incident).join(Site).filter(Site.company_id == company_id, Incident.status.in_(["open", "investigating"])).count()
    compliant = sum(1 for a in agents if a.cnaps_card_expiry and a.cnaps_card_expiry > today)
    compliance_rate = (compliant / len(agents) * 100) if agents else 100.0
    upcoming_exp = sum(1 for a in agents if a.cnaps_card_expiry and today < a.cnaps_card_expiry <= today + timedelta(days=60))
    recent_inc = db.query(Incident).join(Site).filter(Site.company_id == company_id).order_by(Incident.reported_at.desc()).limit(5).all()

    return DashboardOut(
        total_agents=len(agents), agents_on_duty=on_duty, total_sites=sites,
        active_shifts_today=today_shifts, open_incidents=open_incidents,
        compliance_rate=round(compliance_rate, 1), upcoming_expirations=upcoming_exp,
        recent_incidents=recent_inc,
    )
