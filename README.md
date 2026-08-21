# Logashree Sales Dial & Call Center Platform

Modern, AI-powered Sales Dial & Call Center Management Platform with Next.js 16 (React 19) frontend and high-performance Go microservice backend.

---

## ?? How to Run

You have two ways to run the project depending on your requirements:

---

### Option 1: Frontend App (Quickest — Zero Setup)
Runs the complete web application with built-in CRM database, live call dialer, AI tools, manager dashboard, and audio recordings.

```bash
# 1. Install dependencies
npm run install:all

# 2. Start the application
npm run dev
```

Open your browser at:
?? **[http://localhost:3000](http://localhost:3000)**

---

### Option 2: Full-Stack Mode (Go Backend + Docker + Next.js)
Runs the native Go API backend alongside PostgreSQL, Redis, RabbitMQ, and MinIO storage.

#### Step 1: Start Backend Services (Docker)
```bash
npm run infra:up
```
*(Starts Postgres at `:5432`, Redis at `:6379`, RabbitMQ at `:5672`/`:15672`, MinIO at `:9000`/`:9001`)*

#### Step 2: Setup Backend Environment
```bash
# Windows PowerShell:
Copy-Item backend/.env.example backend/.env

# Linux / macOS / Git Bash:
cp backend/.env.example backend/.env
```

#### Step 3: Start Go API Backend & Worker
```bash
npm run dev:backend
```
*(The Go backend automatically connects to Postgres, runs all 9 SQL migrations, connects to Redis/RabbitMQ/MinIO, and starts listening on `http://localhost:8080`)*

#### Step 4: Start Frontend
In a new terminal:
```bash
npm run dev:frontend
```

---

## ?? Login Credentials

The platform includes pre-configured accounts:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Manager / Admin** | `manager@company.com` *(or `admin@test.local`)* | `password` *(or `Admin1234!`)* | Manager KPIs, Team Overview, AI Chat Assistant, Live Queue Monitor |
| **Salesperson / Agent** | `agent@company.com` *(or `agent@test.local`)* | `password` *(or `Admin1234!`)* | Outbound Dialer, Live Call Room, Leads CRM, AI Follow-up Generator |

---

## ?? Application Modules & Routes

- **Outbound Dialer**: [`/dialer`](http://localhost:3000/dialer) - Keypad, quick customer calling, call status.
- **Call Room**: [`/call-room`](http://localhost:3000/call-room) - Live active call screen with live notes & script.
- **Leads CRM**: [`/leads`](http://localhost:3000/leads) - Lead pipeline, contact cards, lead assignment.
- **AI Intelligence Center**: [`/ai-center`](http://localhost:3000/ai-center) - Objection handler & call summary engine.
- **Follow-up Generator**: [`/followup-generator`](http://localhost:3000/followup-generator) - AI-generated email drafts.
- **Manager Hub**: [`/manager`](http://localhost:3000/manager) - Real-time metrics, conversion analytics, agent performance.
- **Manager AI Chat**: [`/manager-ai-chat`](http://localhost:3000/manager-ai-chat) - Conversational AI queries for manager insights.
- **Supervisor Floor**: [`/supervisor`](http://localhost:3000/supervisor) - Live agent monitoring with Whisper & Barge.
- **Calls History**: [`/calls`](http://localhost:3000/calls) - Call audio playback, dispositions & notes.
- **Leaderboard**: [`/leaderboard`](http://localhost:3000/leaderboard) - Rep rankings and achievement tracking.
- **Reports**: [`/reports`](http://localhost:3000/reports) - Daily and weekly call conversion summaries.
- **Settings**: [`/settings`](http://localhost:3000/settings) - Profile and system configurations.

---

## ?? Sharing Access with Teammates (LAN / Network)

To let teammates or friends on the same Wi-Fi access your running app:
1. Find your IP address (`192.168.0.4` or run `ipconfig`).
2. Have your friend open: `http://192.168.0.4:3000`

