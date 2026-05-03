const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("sentinelops_token");
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string>) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.status === 401) {
      if (typeof window !== "undefined") { localStorage.removeItem("sentinelops_token"); window.location.href = "/login"; }
      throw new Error("Non autorisé");
    }
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Erreur serveur" }));
      throw new Error(error.detail || `Erreur ${res.status}`);
    }
    return res.json();
  }

  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user_id: string; company_id: string | null }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem("sentinelops_token", data.access_token);
    return data;
  }

  async getMe() {
    return this.request<User>("/auth/me");
  }

  async getDashboard() {
    return this.request<Dashboard>("/dashboard");
  }

  async getAgents() { return this.request<Agent[]>("/agents"); }
  async createAgent(data: AgentCreate) { return this.request<Agent>("/agents", { method: "POST", body: JSON.stringify(data) }); }
  async getAgent(id: string) { return this.request<Agent>(`/agents/${id}`); }

  async getSites() { return this.request<Site[]>("/sites"); }
  async createSite(data: SiteCreate) { return this.request<Site>("/sites", { method: "POST", body: JSON.stringify(data) }); }

  async getShifts(date?: string) { return this.request<Shift[]>(`/shifts${date ? `?shift_date=${date}` : ""}`); }
  async createShift(data: ShiftCreate) { return this.request<Shift>("/shifts", { method: "POST", body: JSON.stringify(data) }); }
  async generatePlanning(data: PlanningRequest) { return this.request<PlanningResponse>("/planning/generate", { method: "POST", body: JSON.stringify(data) }); }

  async getIncidents() { return this.request<Incident[]>("/incidents"); }
  async createIncident(data: IncidentCreate) { return this.request<Incident>("/incidents", { method: "POST", body: JSON.stringify(data) }); }

  async getCompliance() { return this.request<ComplianceOverview>("/compliance"); }
}

export interface User { id: string; email: string; full_name: string | null; role: string; company_id: string | null; }

export interface Dashboard {
  total_agents: number; agents_on_duty: number; total_sites: number;
  active_shifts_today: number; open_incidents: number; compliance_rate: number;
  upcoming_expirations: number; recent_incidents: Incident[];
}

export interface Agent {
  id: string; first_name: string; last_name: string; phone: string | null; email: string | null;
  status: string; cnaps_card_number: string | null; cnaps_card_expiry: string | null;
  cnaps_card_type: string | null; qualifications: string[] | null;
  max_weekly_hours: number; hourly_rate: number | null; created_at: string;
}
export interface AgentCreate { first_name: string; last_name: string; phone?: string; email?: string; cnaps_card_number?: string; cnaps_card_expiry?: string; cnaps_card_type?: string; qualifications?: string[]; max_weekly_hours?: number; hourly_rate?: number; }

export interface Site {
  id: string; name: string; address: string | null; city: string | null; site_type: string | null;
  risk_level: string; required_qualifications: string[] | null; min_agents_per_shift: number;
  client_name: string | null; is_active: boolean; created_at: string;
}
export interface SiteCreate { name: string; address?: string; city?: string; postal_code?: string; site_type?: string; risk_level?: string; required_qualifications?: string[]; min_agents_per_shift?: number; client_name?: string; }

export interface Shift {
  id: string; agent_id: string; site_id: string; shift_date: string;
  start_time: string; end_time: string; duration_hours: number | null;
  status: string; is_ai_generated: boolean; notes: string | null; created_at: string;
}
export interface ShiftCreate { agent_id: string; site_id: string; shift_date: string; start_time: string; end_time: string; notes?: string; }

export interface PlanningRequest { start_date: string; end_date: string; site_ids?: string[]; }
export interface PlanningResponse { shifts_created: number; conflicts: string[]; warnings: string[]; shifts: Shift[]; }

export interface Incident {
  id: string; agent_id: string | null; site_id: string | null; incident_type: string;
  severity: string; title: string; raw_report: string | null;
  ai_structured_report: Record<string, unknown> | null; status: string;
  reported_at: string; resolved_at: string | null;
}
export interface IncidentCreate { site_id?: string; shift_id?: string; incident_type: string; severity?: string; title: string; raw_report?: string; }

export interface CNAPSRecord {
  id: string; agent_id: string; record_type: string; description: string | null;
  due_date: string; completed_date: string | null; status: string;
}
export interface ComplianceOverview {
  total_agents: number; compliant_agents: number; expiring_soon_30d: number;
  expiring_soon_60d: number; overdue: number; records: CNAPSRecord[];
}

export const api = new ApiClient();
