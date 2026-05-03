# 🚨 SentinelOps — Gestion de Sécurité Privée par IA

<div align="center">

![SentinelOps](https://img.shields.io/badge/SentinelOps-Security%20AI-f59e0b?style=for-the-badge&logo=shield&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.13-3776ab?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285f4?style=flat-square&logo=google&logoColor=white)

**Plateforme SaaS de gestion complète pour les sociétés de sécurité privée :
planning optimisé par IA, suivi des cartes CNAPS, gestion des agents
et rapports d'incidents structurés automatiquement.**

</div>

---

## 🎬 Démo

![SentinelOps Dashboard](https://raw.githubusercontent.com/Islah88/Islah88.github.io/main/images/sentinelops-1-dashboard.png)
> 📸 *Dashboard interactif de gestion de la sécurité privée*

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| 📅 **Planning IA** | Génération automatique des vacations en respectant : repos légaux, cartes CNAPS, qualifications requises |
| 👥 **Gestion Agents** | Fiches complètes : statut CNAPS, qualifications (SSIAP, SST, cynophile), taux horaire |
| 🚨 **Incidents** | Signalement avec structuration IA du rapport brut → rapport professionnel |
| ✅ **Conformité CNAPS** | Dashboard de suivi : cartes valides, expirations proches, renouvellements en retard |
| 📊 **Tableau de Bord** | Vue synthétique : agents en service, vacations du jour, incidents ouverts, taux de conformité |

## 🏗️ Architecture

```
┌──────────────┐     API REST      ┌──────────────┐      SQL       ┌──────────┐
│   Frontend   │ ◄──── JSON ────► │   Backend    │ ◄──────────► │  SQLite  │
│  Next.js 16  │    Port 3002     │   FastAPI    │   Port 8002   │  WAL DB  │
│  React 19    │                  │   Python     │               │          │
│  Tailwind v4 │                  │   JWT Auth   │───► Gemini AI │          │
└──────────────┘                  └──────────────┘               └──────────┘
```

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy, Pydantic |
| **Base de données** | SQLite (WAL mode) |
| **IA** | Google Gemini API (planning, structuration incidents) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Design** | Glassmorphism dark theme (ambre/rouge), responsive mobile |

## 🚀 Installation

### Prérequis
- Python 3.11+
- Node.js 18+
- Clé API Google Gemini

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Remplir avec vos clés
python -m app.seed         # Données de démo (6 agents, 4 sites)
uvicorn app.main:app --port 8002
```

### Frontend
```bash
cd frontend
npm install
npm run dev -- --port 3002
```

### Accès
- **Frontend** : http://localhost:3002
- **API Docs** : http://localhost:8002/docs
- **Identifiants démo** : `admin@sentinelops.demo` / `demo2026`

## 📸 Screenshots

<details>
<summary>Voir les screenshots</summary>

### Dashboard
![SentinelOps Dashboard](https://raw.githubusercontent.com/Islah88/Islah88.github.io/main/images/sentinelops-1-dashboard.png)
Vue d'ensemble : 6 agents, jauge CNAPS 83.3%, incidents récents avec sévérité.

### Planning Semaine
![SentinelOps Planning](https://raw.githubusercontent.com/Islah88/Islah88.github.io/main/images/sentinelops-2-planning.png)
Calendrier avec blocs de vacation colorés par site, génération IA en un clic.

### Agents de Sécurité
![SentinelOps Agents](https://raw.githubusercontent.com/Islah88/Islah88.github.io/main/images/sentinelops-3-agents.png)
Cartes avec initiales, statut CNAPS dynamique (valide/expire bientôt/expirée), qualifications.

### Incidents
![SentinelOps Incidents](https://raw.githubusercontent.com/Islah88/Islah88.github.io/main/images/sentinelops-4-incidents.png)
Signalement avec structuration IA, rapport expandable avec détails structurés.

### Conformité CNAPS
![SentinelOps CNAPS](https://raw.githubusercontent.com/Islah88/Islah88.github.io/main/images/sentinelops-5-cnaps.png)

</details>

## 📝 Structure du projet

```
sentinelops/
├── backend/
│   ├── app/
│   │   ├── main.py          # Point d'entrée FastAPI
│   │   ├── config.py        # Configuration
│   │   ├── models.py        # Modèles SQLAlchemy
│   │   ├── auth.py          # Authentification JWT
│   │   ├── database.py      # Connexion DB
│   │   ├── seed.py          # 6 agents, 4 sites, incidents de démo
│   │   └── api/routes.py    # Routes API + logique IA
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/             # Pages Next.js (App Router)
│   │   ├── components/      # UI + Layout + Dashboard
│   │   └── lib/             # Client API, Auth Context
│   └── package.json
└── README.md
```

## 🔒 Sécurité

- Authentification JWT avec expiration
- Hachage bcrypt des mots de passe
- Variables d'environnement pour tous les secrets
- CORS configuré par whitelist d'origines
- Validation des cartes CNAPS côté serveur

## 🏢 Contexte métier

Ce projet répond à un besoin réel des sociétés de sécurité privée en France :
- **Réglementation CNAPS** : Tous les agents doivent posséder une carte professionnelle valide
- **Code du travail** : Temps de repos obligatoires entre deux vacations
- **Qualifications** : Certains sites exigent des certifications spécifiques (SSIAP, SST, cynophile)
- **Reporting** : Les incidents doivent être documentés de manière structurée

L'IA Gemini automatise la prise en compte de ces contraintes dans la planification et le reporting.

## 👤 Auteur

**Mhoma EL ISLAH** — *Développeur SaaS IA & Expert SecDevOps*
- 🎓 Bachelor Cybersécurité — ESAIP / Le Havre
- 🎓 Master 2 MIASHS
- 💡 Passionné par la création de plateformes intelligentes (Agentic IA) et la sécurisation des infrastructures cloud.
- 🔗 [Portfolio](https://islah88.github.io) | [LinkedIn](https://linkedin.com/in/el-islah-mhoma/) | [GitHub](https://github.com/Islah88)

## 📄 Licence

Ce projet est sous licence MIT — voir le fichier [LICENSE](LICENSE) pour plus de détails.
