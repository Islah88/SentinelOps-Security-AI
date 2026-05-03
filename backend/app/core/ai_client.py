"""SentinelOps — AI Client (Gemini LLM wrapper for security operations)."""

import json
from datetime import date
from google import genai
from google.genai import types

from app.config import get_settings

settings = get_settings()

_client = None


def get_ai_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def ai_generate_planning(
    agents: list[dict],
    sites: list[dict],
    start_date: str,
    end_date: str,
    existing_shifts: list[dict] = None,
) -> dict:
    """
    Generate an optimized security planning using AI.
    Respects legal constraints, qualifications, and preferences.
    """
    client = get_ai_client()

    prompt = f"""Tu es un expert en planification de sécurité privée en France.
Génère un planning optimisé pour la période du {start_date} au {end_date}.

CONTRAINTES LÉGALES OBLIGATOIRES :
- Maximum 48h/semaine par agent (Code du travail)
- Repos minimum de 11h entre deux shifts
- Repos hebdomadaire de 24h consécutives minimum
- Un agent ne peut travailler plus de 6 jours consécutifs

AGENTS DISPONIBLES :
{json.dumps(agents, ensure_ascii=False, indent=2)}

SITES À COUVRIR :
{json.dumps(sites, ensure_ascii=False, indent=2)}

SHIFTS EXISTANTS (à ne pas dupliquer) :
{json.dumps(existing_shifts or [], ensure_ascii=False, indent=2)}

RÈGLES D'AFFECTATION :
1. Respecter les qualifications requises par site
2. Respecter les zones préférées des agents
3. Répartir équitablement les heures
4. Minimiser les trajets (affecter par zone géographique)
5. Assurer le nombre minimum d'agents par shift sur chaque site

Réponds UNIQUEMENT en JSON :
{{
  "shifts": [
    {{
      "agent_id": "...",
      "site_id": "...",
      "shift_date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM"
    }}
  ],
  "conflicts": ["Description des conflits détectés"],
  "warnings": ["Avertissements non-bloquants"],
  "coverage_rate": 95.0,
  "summary": "Résumé du planning"
}}"""

    response = client.models.generate_content(
        model=settings.AI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2,
        ),
    )

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw": response.text}


async def ai_structure_incident(raw_report: str, context: dict = None) -> dict:
    """
    Structure a raw incident report (text or voice transcript) into a formal report.
    """
    client = get_ai_client()

    prompt = f"""Tu es un officier de sécurité expérimenté. Structure le rapport d'incident brut 
ci-dessous en un rapport formel.

RAPPORT BRUT DE L'AGENT :
"{raw_report}"

CONTEXTE :
{json.dumps(context or {}, ensure_ascii=False)}

Produis un rapport structuré en JSON :
{{
  "incident_type": "intrusion|theft|fire|medical|vandalism|suspicious|other",
  "severity": "low|medium|high|critical",
  "title": "Titre court et descriptif",
  "summary": "Résumé factuel en 2-3 phrases",
  "timeline": ["HH:MM - Événement 1", "HH:MM - Événement 2"],
  "persons_involved": ["Description des personnes impliquées"],
  "actions_taken": ["Action 1", "Action 2"],
  "evidence": ["Preuves collectées"],
  "recommendations": ["Recommandation 1"],
  "requires_police": false,
  "requires_client_notification": false
}}"""

    response = client.models.generate_content(
        model=settings.AI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw": response.text}


async def ai_check_compliance(agents: list[dict]) -> dict:
    """
    Analyze CNAPS compliance status for all agents and generate alerts.
    """
    client = get_ai_client()

    today = date.today().isoformat()
    prompt = f"""Tu es un expert en réglementation de la sécurité privée (CNAPS, Code de la sécurité intérieure).
Date d'aujourd'hui : {today}

Analyse la conformité des agents suivants :
{json.dumps(agents, ensure_ascii=False, indent=2)}

Pour chaque agent, vérifie :
1. Carte professionnelle CNAPS valide (non expirée)
2. Recyclages obligatoires (MAC APS tous les 5 ans, SST tous les 2 ans)
3. Qualifications spéciales (SSIAP : recyclage annuel)

Réponds en JSON :
{{
  "compliant_count": 0,
  "non_compliant_count": 0,
  "alerts": [
    {{
      "agent_id": "...",
      "agent_name": "...",
      "alert_type": "card_expiry|training_due|missing_qualification",
      "severity": "low|medium|high|critical",
      "message": "Description en français",
      "due_date": "YYYY-MM-DD",
      "days_remaining": 0
    }}
  ],
  "summary": "Résumé global"
}}"""

    response = client.models.generate_content(
        model=settings.AI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw": response.text}
