# RoadDNA: AI-Powered Crowdsourced Road Health Monitoring System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Express.js](https://img.shields.io/badge/Express-5.2-lightgrey?logo=express)](https://expressjs.com/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)](https://flutter.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?logo=postgresql)](https://postgis.net/)

> **RoadDNA** turns everyday smartphone motion sensors into a distributed, crowdsourced road condition intelligence network. By fusing continuous accelerometer and gyroscope telemetry with GPS, machine learning classification, and PostGIS geospatial clustering, RoadDNA eliminates manual road surveys and transforms reactive municipal road repairs into proactive, data-driven maintenance.

---

## 📑 Table of Contents

1. [Project Overview & Problem Statement](#-project-overview--problem-statement)
2. [End-to-End System Flow](#-end-to-end-system-flow)
3. [Architecture & Component Stack](#-architecture--component-stack)
4. [Deep Dive: Core Modules & Algorithms](#-deep-dive-core-modules--algorithms)
   - [1. Mobile Telemetry & Spike Detection](#1-mobile-telemetry--spike-detection)
   - [2. AI Road Anomaly Classifier](#2-ai-road-anomaly-classifier)
   - [3. Geospatial Clustering & Multi-Device Consensus](#3-geospatial-clustering--multi-device-consensus)
   - [4. Severity Scoring Engine](#4-severity-scoring-engine)
   - [5. Work Order Lifecycle & Closed-Loop Resolution](#5-work-order-lifecycle--closed-loop-resolution)
5. [Repository Structure](#-repository-structure)
6. [API Contract & Endpoints](#-api-contract--endpoints)
7. [Database Schema (PostgreSQL + PostGIS)](#-database-schema-postgresql--postgis)
8. [Getting Started: Local Development Setup](#-getting-started-local-development-setup)
   - [Prerequisites](#prerequisites)
   - [Step 1: Database Setup (PostGIS)](#step-1-database-setup-postgis)
   - [Step 2: AI Microservice](#step-2-ai-microservice)
   - [Step 3: Backend API Service](#step-3-backend-api-service)
   - [Step 4: Municipal Web Dashboard](#step-4-municipal-web-dashboard)
   - [Step 5: Flutter Mobile Application](#step-5-flutter-mobile-application)
   - [Step 6: Zero-DB Mock API Mode](#step-6-zero-db-mock-api-mode)
9. [Demo Walkthrough](#-demo-walkthrough)
10. [Ownership & Contribution Matrix](#-ownership--contribution-matrix)

---

## 🎯 Project Overview & Problem Statement

### The Problem
Traditional municipal road maintenance is **reactive, slow, and expensive**:
- Municipalities rely heavily on manual road inspections or citizen complaints filed after damage has already occurred.
- Potholes and road degradation cause vehicle damage, traffic congestion, and severe road accidents.
- Inspections fail to scale across sprawling road networks, leaving small defects unaddressed until they become major structural hazards.

### The RoadDNA Solution
RoadDNA converts passenger vehicles into passive sensor probes:
1. **Passive Telemetry**: Smartphones mounted in moving vehicles continuously sample accelerometer ($a_x, a_y, a_z$), gyroscope ($g_x, g_y, g_z$), vehicle speed, and GPS location.
2. **Edge Filtering & Offline Resilience**: Local spike detection buffers events in offline storage and synchronizes batches when connectivity is available.
3. **AI Anomaly Classification**: Fast microservice heuristics distinguish genuine potholes from false positives such as speed breakers and hard brakes.
4. **Geospatial Clustering & Consensus**: PostGIS groups multi-device telemetry reports geographically to eliminate duplicates, confirm authenticity through crowd consensus, and score road hazard severity.
5. **Municipal Operations Hub**: City engineers access an interactive live heatmap, drill down into cluster event timelines, dispatch prioritized work orders, and review citizen reports with photo proof.
6. **Closed Loop**: Resolving a work order automatically updates the cluster status to `fixed`, ensuring transparent municipal accountability.

---

## 🔄 End-to-End System Flow

```mermaid
flowchart TD
    subgraph MobileApp["📱 Mobile App (Flutter)"]
        Sensors["Smartphone Sensors (IMU + GPS)"] --> Filter{"Spike Filter (|a_z| > 15 m/s²)"}
        Filter -- "Exceeds Threshold" --> OfflineQueue["Offline SQLite/Queue"]
        Filter -- "Normal Vibration" --> Drop["Discard"]
        OfflineQueue -- "Network Available" --> BatchPost["POST /api/v1/sensor-events"]
        CitizenCam["Citizen Camera & Notes"] --> CitizenReport["POST /api/v1/citizen-reports"]
    end

    subgraph BackendAPI["⚙️ Backend Service (Express + TypeScript)"]
        BatchPost --> Ingest["Ingestion Pipeline"]
        CitizenReport --> LinkCluster["25m Spatial Link (ST_DWithin)"]
        Ingest --> UpsertDevice["Register/Touch Device"]
        Ingest --> InsertEvents["Insert into sensor_events (PostGIS)"]
        InsertEvents --> CallAI["Async POST /classify"]
        CallAI --> StoreClassified["Insert into classified_events"]
    end

    subgraph AIService["🧠 AI Service (FastAPI + Python)"]
        CallAI --> FeatureExtraction["Motion Vector Analysis"]
        FeatureExtraction --> Model["PotholeClassifier (v1.0 Heuristics)"]
        Model --> ReturnResults["Label + Confidence Score"]
        ReturnResults --> StoreClassified
    end

    subgraph PostGISDB["🗄️ Database (PostgreSQL + PostGIS)"]
        InsertEvents -.-> Tables[("sensor_events\nclassified_events\npothole_clusters\ncitizen_reports\nwork_orders")]
        StoreClassified -.-> Tables
        LinkCluster -.-> Tables
    end

    subgraph WebDashboard["💻 Municipal Dashboard (Next.js 16)"]
        Tables --> LiveHeatmap["Interactive Heatmap (/map)"]
        Tables --> ClusterExplorer["Cluster Explorer (/clusters)"]
        Tables --> WorkOrders["Work Orders Kanban (/work-orders)"]
        Tables --> PhotoReports["Citizen Reports (/reports)"]
        WorkOrders -- "Mark Completed" --> AutoFix["Update cluster status -> 'fixed'"]
        AutoFix --> Tables
    end
```

---

## 🏗️ Architecture & Component Stack

| Layer | Technologies | Responsibilities |
|---|---|---|
| **Mobile App** | Flutter 3.x, Dart, `sensors_plus`, `geolocator`, `shared_preferences` | Passive IMU telemetry monitoring, edge spike detection, offline queue & flush, manual citizen photo report capture. |
| **Backend API** | Node.js, Express 5, TypeScript, `pg` pool, Helmet, CORS, Zod, Pino | Ingestion endpoints, PostGIS spatial queries, JWT authentication, AI service proxying, work order state engine. |
| **AI Microservice** | Python 3.10+, FastAPI, Uvicorn, Pydantic, Scikit-learn / XGBoost patterns | Microsecond batch inference, motion signature classification (pothole, speed breaker, hard brake, normal), Haversine calculations. |
| **Database** | PostgreSQL 14+, PostGIS spatial extensions | Spatial indexing (R-Tree / GiST), geometry & geography storage, bounding-box queries, spatial joins (`ST_DWithin`, `ST_MakeEnvelope`). |
| **Frontend Web** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Leaflet / React-Leaflet, React Query, Lucide Icons | Municipal engineer portal, live BBox heatmap, cluster drill-down with telemetry traces, Kanban work orders, citizen photo inspection. |

---

## 🔬 Deep Dive: Core Modules & Algorithms

### 1. Mobile Telemetry & Spike Detection
To conserve mobile battery and network bandwidth:
- The app samples 3-axis acceleration and rotation rate.
- Local acceleration magnitude is computed as:
  $$|a| = \sqrt{a_x^2 + a_y^2 + a_z^2}$$
- Telemetry is only packaged and dispatched when vertical motion spikes exceed the baseline gravity threshold:
  $$|a_z| \ge 15.0 \text{ m/s}^2 \quad \text{or} \quad |a| \ge 18.0 \text{ m/s}^2$$
- If offline, spikes are saved in a durable local buffer and automatically synced upon network restoration.

### 2. AI Road Anomaly Classifier
Located in `ai-service/src/ml/model.py`, the classifier processes batches of sensor events using motion signatures:

| Predicted Label | Physical Signature / Condition | Typical Confidence |
|---|---|---|
| **`pothole`** | Sharp vertical Z-axis spike ($|a_z| \ge 14.0$ or $|a| \ge 18.0$) with angular disturbance | $0.70 - 0.98$ (scaled by spike intensity) |
| **`speed_breaker`** | Moderate, smooth vertical oscillation ($8.0 \le |a_z| < 14.0$) with low longitudinal deceleration ($a_x > -4.0$) | $\approx 0.88$ |
| **`hard_brake`** | Strong longitudinal deceleration ($a_x \le -4.5$) with low vertical disturbance ($|a_z| < 12.0$) | $\approx 0.92$ |
| **`normal`** | Steady road vibration without extreme spikes on any axis | $\approx 0.95$ |

> **Soft-Fail Guarantee**: The backend calls the AI service with an 8-second timeout. If the AI service is unreachable, ingestion succeeds normally and classification is skipped gracefully without dropping data.

### 3. Geospatial Clustering & Multi-Device Consensus
Single-device reports can be accidental bumps or smartphone drops. Genuine road damage is validated through spatial clustering:
- Events within spatial proximity (e.g., 20–25 meters) are aggregated into a single `pothole_cluster`.
- The system tracks:
  - `report_count`: Total telemetry spikes recorded.
  - `distinct_devices`: Number of unique smartphones reporting the anomaly.
- **Consensus Lifecycle**:
  - `unconfirmed`: Reported by 1 device.
  - `confirmed`: Reported by $\ge 2$ distinct devices.
  - `queued`: Work order assigned for repair.
  - `in_progress`: Repair crew dispatched.
  - `fixed`: Repair completed and verified.

### 4. Severity Scoring Engine
Cluster severity is computed on a **0 to 100 scale** using the multi-factor formula in `ai-service/src/ml/clustering.py`:

$$\text{Severity} = \min\Big(100.0, \; (\text{report\_count} \times 0.4) + (\text{distinct\_devices} \times 0.4) + (\text{avg\_accel\_magnitude} \times 0.2)\Big)$$

Dashboard color bands:
- 🟢 **Low Risk (< 40)**: Minor surface unevenness.
- 🟡 **Moderate Risk (40 – 69)**: Developing pothole or repeated bumps.
- 🔴 **Severe Risk ($\ge$ 70)**: High impact hazard requiring immediate dispatch.

### 5. Work Order Lifecycle & Closed-Loop Resolution
1. **Creation**: A municipal engineer creates a work order from a cluster (`POST /api/v1/work-orders`). The cluster status automatically transitions to `queued`.
2. **Dispatch**: Field workers update the status to `in_progress`.
3. **Completion**: When the repair is marked `completed` (`PATCH /api/v1/work-orders/:id`), a database transaction automatically sets the associated cluster status to `fixed` and records `completed_at = now()`.

---

## 📁 Repository Structure

```
RoadDNA/
├── README.md                      # Primary project documentation (this file)
├── package.json                   # Root workspace scripts (mock-api, frontend)
├── sample-data/
│   └── sample_sensor_events.csv   # 800-row real-world telemetry dataset for testing
├── docs/
│   ├── api-contract.md            # Detailed REST API specification and payload schemas
│   └── DEMO_WALKTHROUGH.md        # Step-by-step evaluation guide
├── scripts/
│   └── mock-api/
│       └── server.mjs             # Zero-dependency local mock API server (Port 5000)
├── ai-service/                    # Python FastAPI microservice
│   ├── requirements.txt           # fastapi, uvicorn, pydantic, numpy, scikit-learn
│   └── src/
│       ├── api/                   # Main FastAPI app & routing (/health, /classify)
│       └── ml/                    # Classifier heuristics & Haversine clustering
├── backend/                       # Node.js / Express / TypeScript API server
│   ├── package.json
│   ├── server.ts                  # Server entrypoint with DB connection verification
│   ├── src/
│   │   ├── app.ts                 # Express factory with CORS, Helmet, Pino logging
│   │   ├── config/                # Environment variables & PostgreSQL pool setup
│   │   ├── database/              # Schema migration & seed scripts
│   │   ├── modules/               # Domain modules: auth, sensor-events, clusters,
│   │   │                          #   work-orders, citizen-reports
│   │   └── services/              # Resilient AI microservice HTTP client
│   └── scripts/
│       └── compute_cluster_area.js # PostGIS cluster bounding-box & area calculation
├── frontend/                      # Municipality Next.js 16 Web Dashboard
│   ├── package.json
│   ├── src/
│   │   ├── app/                   # App Router: /login, /map, /clusters, /work-orders, /reports
│   │   ├── components/            # UI components and Leaflet interactive Heatmap
│   │   ├── context/               # AuthContext (JWT management & session state)
│   │   ├── lib/                   # Axios API client, interceptors, React Query setup
│   │   └── types/                 # TypeScript interfaces aligned with API contract
│   └── .env.example
└── mobile/                        # Flutter Android/iOS Citizen App
    ├── pubspec.yaml
    └── lib/
        ├── main.dart              # Flutter application entrypoint
        ├── models/                # Telemetry payloads & citizen report models
        ├── screens/               # Trip monitor, citizen photo report, settings, history
        └── services/              # Sensor stream monitor, offline queue, API client
```

---

## 🌐 API Contract & Endpoints

Base URL: `http://localhost:5000/api/v1`  
All list endpoints return standard envelope:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticates municipal admin; returns JWT & refresh token. |
| `GET` | `/auth/me` | Bearer | Returns the logged-in engineer profile. |
| `POST` | `/sensor-events` | Public | Ingests a batch of mobile sensor telemetry events. |
| `GET` | `/sensor-events` | Bearer | Queries recorded telemetry with time & device filters. |
| `GET` | `/clusters` | Public | Fetches clusters with optional `bbox`, `status`, and `severity_min`. |
| `GET` | `/clusters/:id` | Public | Returns cluster metadata along with linked sensor events. |
| `PATCH` | `/clusters/:id` | Bearer | Updates cluster status manually (`unconfirmed`, `confirmed`, `queued`, `fixed`). |
| `GET` | `/work-orders` | Bearer | Lists maintenance work orders with status & assignee filters. |
| `POST` | `/work-orders` | Bearer | Creates a work order for a cluster; sets cluster to `queued`. |
| `PATCH` | `/work-orders/:id` | Bearer | Updates repair status (`in_progress`, `completed`). |
| `POST` | `/citizen-reports` | Public | Submits a citizen photo report; automatically links nearest cluster within 25m. |
| `GET` | `/citizen-reports` | Bearer | Queries submitted citizen reports. |
| `POST` | `:8000/classify` | Internal | AI Microservice batch classification endpoint. |
| `GET` | `:8000/health` | Public | AI Microservice health check & active model version. |

---

## 🗄️ Database Schema (PostgreSQL + PostGIS)

```
                    ┌──────────────────────────┐
                    │         devices          │
                    ├──────────────────────────┤
                    │ device_id (PK)           │
                    │ created_at, last_seen_at │
                    └─────────────┬────────────┘
                                  │ 1:N
                    ┌─────────────▼────────────┐
                    │      sensor_events       │
                    ├──────────────────────────┤
                    │ event_id (PK, UUID)      │
                    │ device_id (FK)           │
                    │ recorded_at              │
                    │ location (GEOGRAPHY Pt)  │◄──┐
                    │ speed_kmh, accel_x,y,z   │   │
                    │ accel_magnitude, gyro_xyz│   │ M:N via
                    └─────────────┬────────────┘   │ cluster_events
                                  │ 1:1            │
                    ┌─────────────▼────────────┐   │
                    │    classified_events     │   │
                    ├──────────────────────────┤   │
                    │ event_id (PK, FK)        │   │
                    │ predicted_label          │   │
                    │ confidence               │   │
                    │ model_version            │   │
                    └──────────────────────────┘   │
                                                   │
  ┌────────────────────────────────────────────────┘
  │
┌─┴────────────────────────┐       1:N       ┌──────────────────────────┐
│     pothole_clusters     ├────────────────►│       work_orders        │
├──────────────────────────┤                 ├──────────────────────────┤
│ cluster_id (PK, UUID)    │                 │ work_order_id (PK, UUID) │
│ center_location (GEOG Pt)│                 │ cluster_id (FK)          │
│ report_count             │                 │ assigned_to (FK -> admin)│
│ distinct_devices         │                 │ priority_rank (INT)      │
│ severity_score (0 - 100) │                 │ status (open/completed)  │
│ status                   │                 │ created_at, completed_at │
│ first/last_reported_at   │                 └──────────────────────────┘
└─▲────────────────────────┘
  │ 0..1:N (spatial 25m)
┌─┴────────────────────────┐
│     citizen_reports      │
├──────────────────────────┤
│ report_id (PK, UUID)     │
│ device_id, photo_url     │
│ location (GEOGRAPHY Pt)  │
│ description              │
│ linked_cluster_id (FK)   │
└──────────────────────────┘
```

---

## 🚀 Getting Started: Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **PostgreSQL**: v14+ with **PostGIS** extension installed
- **Flutter SDK**: v3.x (optional, for mobile app development)
- **Git**

---

### Step 1: Database Setup (PostGIS)

1. Connect to PostgreSQL and create the database with PostGIS enabled:
   ```sql
   CREATE DATABASE roaddna_dev;
   \c roaddna_dev;
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. Configure environment variables in `backend/.env` (copy from `.env.example`):
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roaddna_dev
   JWT_SECRET=super-secret-jwt-key-for-development
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=super-secret-refresh-key
   JWT_REFRESH_EXPIRES_IN=7d
   ADMIN_EMAIL=admin@roaddna.gov
   ADMIN_PASSWORD=AdminPassword123!
   ADMIN_FULL_NAME=Lead City Engineer
   AI_SERVICE_URL=http://localhost:8000
   ```

3. Run migrations and database seeders:
   ```bash
   cd backend
   npm install
   npm run db:migrate        # Applies database tables
   npm run db:seed:admin     # Seeds default municipal engineer account
   npm run db:seed           # Seeds sample devices, sensor events, and labels
   ```

---

### Step 2: AI Microservice

Runs the Python FastAPI classification server on port **8000**:

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server with live reload
uvicorn src.api.main:app --reload --port 8000
```
Verify at: `http://localhost:8000/health`

---

### Step 3: Backend API Service

Runs the Express + TypeScript API server on port **5000**:

```bash
cd backend
npm run dev
```
Verify at: `http://localhost:5000/health`

---

### Step 4: Municipal Web Dashboard

Runs the Next.js 16 municipality management console on port **3000**:

```bash
cd frontend
npm install

# Verify frontend/.env.local contains:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
# NEXT_PUBLIC_USE_MOCKS=false

npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Default Login Email**: `admin@roaddna.gov`
- **Default Password**: `AdminPassword123!`

---

### Step 5: Flutter Mobile Application

Runs the citizen sensing & incident reporting mobile application:

```bash
cd mobile
flutter pub get

# Ensure cleartext HTTP is allowed for local debugging (10.0.2.2 for Android emulator)
flutter run
```

> **Emulator Network Note**:
> - Android Emulator connecting to host machine: `http://10.0.2.2:5000/api/v1`
> - Physical device on the same Wi-Fi: `http://<YOUR_LOCAL_IP>:5000/api/v1`
> - Configurable anytime in the app settings gear icon on the home screen.

---

### Step 6: Zero-DB Mock API Mode

If you want to run the municipal dashboard immediately without setting up PostgreSQL or Python:

```bash
# In the project root, start the mock API server:
npm run mock-api
```
In `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_MOCKS=false
```
Then start the frontend:
```bash
npm run frontend:dev
```
The dashboard will run against the standalone lightweight mock server matching all backend schemas.

---

## 🕹️ Demo Walkthrough

1. **Log In**: Visit `http://localhost:3000/login` with `admin@roaddna.gov` / `AdminPassword123!`.
2. **Interactive Heatmap (`/map`)**:
   - Pan and zoom across the city.
   - Observe how the dashboard dynamically requests clusters matching the map's viewport bounding box (`bbox`).
   - Click any cluster marker to view report count, distinct devices, and severity score.
3. **Cluster Explorer (`/clusters`)**:
   - Filter by status (`unconfirmed`, `confirmed`, `queued`, `fixed`).
   - Click a cluster row to open the detail view (`/clusters/:id`).
   - Review individual telemetry spike timestamps, accelerometer readings, and AI predictions.
   - Click **Create work order** directly from the detail view.
4. **Work Orders Board (`/work-orders`)**:
   - Manage repair tickets through the Kanban lifecycle: `open` $\rightarrow$ `assigned` $\rightarrow$ `in_progress` $\rightarrow$ `completed`.
   - Marking a work order as `completed` updates the cluster status to `fixed` in the database.
5. **Citizen Reports (`/reports`)**:
   - Inspect manual reports submitted by citizens.
   - Review damage photos and verify the auto-linked cluster badge (resolved via the 25m spatial radius query).

---

## 👥 Ownership & Contribution Matrix

| Domain | Lead | Components |
|---|---|---|
| **Frontend & Mobile** | **Udit** | Next.js Municipality Dashboard, Leaflet Heatmap, Flutter Sensor Monitor, Offline Queue, Citizen Reporting UI |
| **Backend & AI Service** | **Shankar** | Express.js API, PostgreSQL + PostGIS Spatial Engine, FastAPI AI Classifier, Data Ingestion Pipeline |
| **Specifications & Testing** | **Shared** | API Contract (`docs/api-contract.md`), Demonstration Walkthrough, Sample Telemetry Data |

---

<p align="center">
  <b>RoadDNA</b> — Building safer, smarter roads through crowdsourced intelligence.
</p>
