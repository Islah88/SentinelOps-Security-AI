"""SentinelOps — Pydantic Schemas (API request/response models)."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# --------------------------------------------------------------------------- #
#  Auth
# --------------------------------------------------------------------------- #

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    company_id: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    company_id: Optional[str]

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
#  Security Agents
# --------------------------------------------------------------------------- #

class AgentCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    cnaps_card_number: Optional[str] = None
    cnaps_card_expiry: Optional[date] = None
    cnaps_card_type: Optional[str] = None
    qualifications: Optional[List[str]] = None
    preferred_zones: Optional[List[str]] = None
    max_weekly_hours: int = 48
    hourly_rate: Optional[float] = None

class AgentOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: Optional[str]
    email: Optional[str]
    status: str
    cnaps_card_number: Optional[str]
    cnaps_card_expiry: Optional[date]
    cnaps_card_type: Optional[str]
    qualifications: Optional[List[str]]
    max_weekly_hours: int
    hourly_rate: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
#  Sites
# --------------------------------------------------------------------------- #

class SiteCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    site_type: Optional[str] = None
    risk_level: str = "medium"
    required_qualifications: Optional[List[str]] = None
    min_agents_per_shift: int = 1
    client_name: Optional[str] = None

class SiteOut(BaseModel):
    id: str
    name: str
    address: Optional[str]
    city: Optional[str]
    site_type: Optional[str]
    risk_level: str
    required_qualifications: Optional[List[str]]
    min_agents_per_shift: int
    client_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
#  Shifts / Planning
# --------------------------------------------------------------------------- #

class ShiftCreate(BaseModel):
    agent_id: str
    site_id: str
    shift_date: date
    start_time: str  # "08:00"
    end_time: str  # "20:00"
    notes: Optional[str] = None

class ShiftOut(BaseModel):
    id: str
    agent_id: str
    site_id: str
    shift_date: date
    start_time: str
    end_time: str
    duration_hours: Optional[float]
    status: str
    is_ai_generated: bool
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ShiftDetailOut(ShiftOut):
    agent: Optional[AgentOut] = None
    site: Optional[SiteOut] = None

class PlanningGenerateRequest(BaseModel):
    start_date: date
    end_date: date
    site_ids: Optional[List[str]] = None  # None = all sites

class PlanningGenerateResponse(BaseModel):
    shifts_created: int
    conflicts: List[str]
    warnings: List[str]
    shifts: List[ShiftOut]


# --------------------------------------------------------------------------- #
#  Rounds
# --------------------------------------------------------------------------- #

class RoundCreate(BaseModel):
    shift_id: str
    report_text: Optional[str] = None

class RoundOut(BaseModel):
    id: str
    shift_id: str
    started_at: datetime
    completed_at: Optional[datetime]
    checkpoints_total: int
    checkpoints_validated: int
    status: str
    report_text: Optional[str]
    ai_summary: Optional[str]

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
#  Incidents
# --------------------------------------------------------------------------- #

class IncidentCreate(BaseModel):
    site_id: Optional[str] = None
    shift_id: Optional[str] = None
    incident_type: str
    severity: str = "medium"
    title: str
    raw_report: Optional[str] = None

class IncidentOut(BaseModel):
    id: str
    agent_id: Optional[str]
    site_id: Optional[str]
    incident_type: str
    severity: str
    title: str
    raw_report: Optional[str]
    ai_structured_report: Optional[dict]
    status: str
    reported_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
#  CNAPS Compliance
# --------------------------------------------------------------------------- #

class CNAPSRecordOut(BaseModel):
    id: str
    agent_id: str
    record_type: str
    description: Optional[str]
    due_date: date
    completed_date: Optional[date]
    status: str

    class Config:
        from_attributes = True

class ComplianceOverview(BaseModel):
    total_agents: int
    compliant_agents: int
    expiring_soon_30d: int
    expiring_soon_60d: int
    overdue: int
    records: List[CNAPSRecordOut]


# --------------------------------------------------------------------------- #
#  Dashboard
# --------------------------------------------------------------------------- #

class DashboardOut(BaseModel):
    total_agents: int
    agents_on_duty: int
    total_sites: int
    active_shifts_today: int
    open_incidents: int
    compliance_rate: float  # 0-100
    upcoming_expirations: int
    recent_incidents: List[IncidentOut]
