"""SentinelOps — SQLAlchemy Models for Private Security Operations."""

import uuid
from datetime import datetime, timezone, date

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Float, ForeignKey,
    Integer, String, Text, JSON, Time,
)
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# --------------------------------------------------------------------------- #
#  Company & Users
# --------------------------------------------------------------------------- #

class Company(Base):
    """A private security company using SentinelOps."""

    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    siren = Column(String(20), nullable=True)
    cnaps_authorization = Column(String(100), nullable=True)  # CNAPS company auth number
    agent_count = Column(Integer, default=0)
    plan_type = Column(String(50), default="free")  # free|starter|pro
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    security_agents = relationship("SecurityAgent", back_populates="company", cascade="all, delete-orphan")
    sites = relationship("Site", back_populates="company", cascade="all, delete-orphan")


class User(Base):
    """A manager/admin user of the platform."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="manager")  # manager|admin|dispatcher
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    company = relationship("Company", back_populates="users")


# --------------------------------------------------------------------------- #
#  Security Agents (field personnel)
# --------------------------------------------------------------------------- #

class SecurityAgent(Base):
    """A security guard / field agent."""

    __tablename__ = "security_agents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    status = Column(String(30), default="available")  # available|on_duty|off_duty|training|inactive
    
    # CNAPS compliance
    cnaps_card_number = Column(String(100), nullable=True)
    cnaps_card_expiry = Column(Date, nullable=True)
    cnaps_card_type = Column(String(50), nullable=True)  # surveillance|protection|transport_fonds
    
    # Skills & qualifications
    qualifications = Column(JSON, nullable=True)  # ["SSIAP1", "SST", "cynophile", "palpation"]
    preferred_zones = Column(JSON, nullable=True)  # ["zone_nord", "zone_sud"]
    max_weekly_hours = Column(Integer, default=48)  # Legal max
    hourly_rate = Column(Float, nullable=True)

    created_at = Column(DateTime, default=utc_now)

    # Relationships
    company = relationship("Company", back_populates="security_agents")
    shifts = relationship("Shift", back_populates="agent", cascade="all, delete-orphan")
    cnaps_records = relationship("CNAPSRecord", back_populates="agent", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="agent")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


# --------------------------------------------------------------------------- #
#  Sites (client locations to guard)
# --------------------------------------------------------------------------- #

class Site(Base):
    """A client site that requires security coverage."""

    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)  # e.g. "Entrepôt Logistique Nord"
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(10), nullable=True)
    site_type = Column(String(50), nullable=True)  # warehouse|office|retail|event|residential|industrial
    risk_level = Column(String(20), default="medium")  # low|medium|high
    required_qualifications = Column(JSON, nullable=True)  # ["SSIAP1", "cynophile"]
    min_agents_per_shift = Column(Integer, default=1)
    client_name = Column(String(255), nullable=True)  # End-client name
    contract_start = Column(Date, nullable=True)
    contract_end = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    company = relationship("Company", back_populates="sites")
    shifts = relationship("Shift", back_populates="site", cascade="all, delete-orphan")


# --------------------------------------------------------------------------- #
#  Shifts (planned work slots)
# --------------------------------------------------------------------------- #

class Shift(Base):
    """A planned work shift assigning an agent to a site."""

    __tablename__ = "shifts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(36), ForeignKey("security_agents.id"), nullable=False)
    site_id = Column(String(36), ForeignKey("sites.id"), nullable=False)
    shift_date = Column(Date, nullable=False)
    start_time = Column(String(5), nullable=False)  # "08:00"
    end_time = Column(String(5), nullable=False)  # "20:00"
    duration_hours = Column(Float, nullable=True)
    status = Column(String(30), default="planned")  # planned|confirmed|in_progress|completed|cancelled|no_show
    is_ai_generated = Column(Boolean, default=False)  # Was this generated by AI planner?
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    agent = relationship("SecurityAgent", back_populates="shifts")
    site = relationship("Site", back_populates="shifts")
    rounds = relationship("Round", back_populates="shift", cascade="all, delete-orphan")


# --------------------------------------------------------------------------- #
#  Rounds (patrols during a shift)
# --------------------------------------------------------------------------- #

class Round(Base):
    """A patrol/round completed during a shift."""

    __tablename__ = "rounds"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shift_id = Column(String(36), ForeignKey("shifts.id"), nullable=False)
    started_at = Column(DateTime, nullable=False, default=utc_now)
    completed_at = Column(DateTime, nullable=True)
    checkpoints_total = Column(Integer, default=0)
    checkpoints_validated = Column(Integer, default=0)
    status = Column(String(30), default="in_progress")  # in_progress|completed|interrupted
    report_text = Column(Text, nullable=True)  # Agent's written or voice-transcribed report
    ai_summary = Column(Text, nullable=True)  # AI-generated structured summary
    gps_data = Column(JSON, nullable=True)  # [{lat, lng, timestamp}]

    # Relationships
    shift = relationship("Shift", back_populates="rounds")


# --------------------------------------------------------------------------- #
#  CNAPS Compliance Records
# --------------------------------------------------------------------------- #

class CNAPSRecord(Base):
    """CNAPS card & training compliance tracking."""

    __tablename__ = "cnaps_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(36), ForeignKey("security_agents.id"), nullable=False)
    record_type = Column(String(50), nullable=False)  # card_renewal|mac_training|ssiap_renewal|sst_renewal
    description = Column(String(255), nullable=True)
    due_date = Column(Date, nullable=False)
    completed_date = Column(Date, nullable=True)
    status = Column(String(30), default="pending")  # pending|completed|overdue|upcoming
    alert_sent_30d = Column(Boolean, default=False)
    alert_sent_60d = Column(Boolean, default=False)
    alert_sent_90d = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    agent = relationship("SecurityAgent", back_populates="cnaps_records")


# --------------------------------------------------------------------------- #
#  Incidents
# --------------------------------------------------------------------------- #

class Incident(Base):
    """A security incident reported by an agent."""

    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(36), ForeignKey("security_agents.id"), nullable=True)
    site_id = Column(String(36), ForeignKey("sites.id"), nullable=True)
    shift_id = Column(String(36), ForeignKey("shifts.id"), nullable=True)
    incident_type = Column(String(50), nullable=False)  # intrusion|theft|fire|medical|vandalism|suspicious|other
    severity = Column(String(20), default="medium")  # low|medium|high|critical
    title = Column(String(255), nullable=False)
    raw_report = Column(Text, nullable=True)  # Agent's raw report (voice/text)
    ai_structured_report = Column(JSON, nullable=True)  # AI-structured report
    actions_taken = Column(Text, nullable=True)
    police_notified = Column(Boolean, default=False)
    client_notified = Column(Boolean, default=False)
    status = Column(String(30), default="open")  # open|investigating|resolved|closed
    reported_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    agent = relationship("SecurityAgent", back_populates="incidents")
    site = relationship("Site")
