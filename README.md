# CivicMap AI — AI-Powered Smart Civic Issue Mapping and Resolution System

**CivicMap AI** is an enterprise-grade smart-city web application designed for citizens and municipal authorities to report, map, classify, and resolve urban civic issues (potholes, overflowing garbage, broken streetlights, water pipeline ruptures, drainage blocks, and road damage) with Artificial Intelligence (AI) and Geographic Information Systems (GIS).

---

## 🌟 Core System Highlights

1. **Interactive GIS Civic Map**:
   - Built with **Leaflet.js** and high-resolution **OpenStreetMap** cartography.
   - Distinct, color-coded and status-aware markers for each civic category (Pothole, Garbage, Streetlight, Drainage, Water Supply, Road Hazard).
   - Real-time radius-based hotspot clustering showing dense failure zones.
   - Live location searching, category and priority filters, and rich inspection popups.

2. **AI-Powered Auto-Triage & Duplicate Shield**:
   - **Gemini AI Integration** (`gemini-3.8-flash`) via the modern `@google/genai` SDK on the server-side.
   - Automatic category classification and priority ranking (**Critical**, **High**, **Medium**, **Low**).
   - Generates transparent, human-readable triage explanations for municipal auditors.
   - **Geospatial & Text Similarity Duplicate Detection**: Scans existing complaints within a 300-meter radius using the **Haversine formula** and token similarity (Dice coefficient) to prevent duplicate dispatch tickets.
   - Resilient, deterministic rule-based NLP fallback when API keys are unconfigured or throttled.

3. **Closed-Loop Resolution & Before/After Verification**:
   - 5-stage official lifecycle tracking: `Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`.
   - Before-and-after photo comparison mode for verified audit integrity.
   - Immutable chronological audit trail recording administrative updates, timestamps, and department officers.

4. **Dedicated Role Dashboards**:
   - **Citizen Dashboard**: Personal issue history, resolution milestones, and community upvotes.
   - **Administrator Command Center**: Real-time KPI counters, category distribution metrics, department SLA tracking, master complaint registry with inline status advancement, and a dedicated duplicate resolution queue.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Leaflet.js, Canvas Confetti.
- **Full-Stack Server & Dev Environment**: Node.js Express server mounting Vite middlewares in development on port 3000.
- **Python Flask + MongoDB Backend (Included)**: Complete Python REST API implementation in `backend/app.py`, `backend/models.py`, and `backend/ai_engine.py` for standalone deployment with PyMongo.
- **AI Intelligence**: Google GenAI SDK (`@google/genai`), server-side Gemini 3.8 Flash, and custom geospatial NLP algorithms.

---

## 🚀 Getting Started

### Method 1: Running the Live Full-Stack Application (Default)

The applet is pre-configured and runs automatically in the AI Studio environment:

```bash
# 1. Install dependencies (if running locally from git clone)
npm install

# 2. Run the full-stack dev server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

### Method 2: Running with Python Flask & MongoDB

The project includes a production-ready Python Flask backend with PyMongo support located in the `backend/` directory.

#### Prerequisites
- Python 3.10+
- MongoDB instance running locally on `localhost:27017` or MongoDB Atlas URI

#### Setup Instructions:

```bash
# 1. Navigate to project root and create a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Configure Environment Variables
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key:
# MONGO_URI="mongodb://localhost:27017/civicmap_db"
# GEMINI_API_KEY="your-gemini-key"

# 4. Start the Flask Backend
python backend/app.py
```

The Flask server will start on `http://localhost:5000` and will initialize the MongoDB `2dsphere` geospatial indexes on the `complaints` collection.

---

## 📋 Pre-Configured Test Personas

Use the **Switch Role** or **1-Click Login** button in the top navigation bar to test both personas instantly:

| Persona | Name | Email | Role | Access Level |
|---|---|---|---|---|
| **Citizen** | Alex Morgan | `alex.morgan@email.com` | `citizen` | Report issues, track tickets, view personal dashboard |
| **Administrator** | Director Sandra Collins | `admin@civicmap.org` | `admin` | Full Command Center, status updates, duplicate merging, SLA dispatch |

---

## 🔌 REST API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/complaints` | Retrieve complaints with category, status, priority, and text search filters |
| `GET` | `/api/complaints/:id` | Fetch single complaint details with audit timeline and photo documentation |
| `POST` | `/api/complaints` | Submit new civic report with coordinates, photo, and automated AI analysis |
| `PATCH`| `/api/complaints/:id/status` | Advance lifecycle status, assign department officer, and attach resolution notes |
| `POST` | `/api/complaints/:id/upvote` | Citizen endorsement / upvote counter |
| `POST` | `/api/complaints/:id/duplicate` | Mark as duplicate of another ticket or dismiss duplicate advisory |
| `POST` | `/api/ai/analyze` | Run Gemini or rule-based classification, priority triage, and proximity scan |
| `GET` | `/api/stats` | Real-time aggregate statistics, category distribution, and hotspot zones |
| `POST` | `/api/seed/reset` | Reset database to pristine sample dataset for live testing |

---

## 📁 Repository Structure

```
civicmap-ai/
├── backend/
│   ├── app.py             # Flask application with REST API endpoints & PyMongo
│   ├── models.py          # MongoDB document formatting and geospatial schemas
│   └── ai_engine.py       # Python NLP classifier & Haversine proximity matcher
├── data/
│   └── civic_db.json      # Persistent local database store for full-stack server
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Responsive nav with role switcher
│   │   ├── HomeHero.tsx           # Hero section, workflow steps, before/after slider
│   │   ├── CivicMap.tsx           # Interactive Leaflet map with filters and popups
│   │   ├── ReportIssueForm.tsx    # Complaint submission with GPS pin-drop & photo validation
│   │   ├── TrackComplaint.tsx     # 5-step lifecycle tracker & admin status progression
│   │   ├── CitizenDashboard.tsx   # Citizen portal with impact score and filterable reports
│   │   ├── AdminDashboard.tsx     # Municipal command center with duplicate review and KPIs
│   │   └── AuthModal.tsx          # Citizen and admin login with 1-click test personas
│   ├── types/
│   │   └── index.ts               # Complete TypeScript data contracts
│   ├── utils/
│   │   └── geo.ts                 # Haversine distance and reverse-geocoding helpers
│   ├── App.tsx                    # Main application router and state manager
│   ├── index.css                  # Tailwind styles and Leaflet marker animations
│   └── main.tsx                   # React root mount
├── index.html                     # HTML5 entry with Leaflet styles & Google fonts
├── metadata.json                  # Application metadata and capabilities
├── package.json                   # Dependencies and scripts (dev: tsx server.ts)
├── requirements.txt               # Python Flask & PyMongo dependencies
├── server.ts                      # Full-stack Express server with Gemini AI and REST APIs
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler configuration
```
