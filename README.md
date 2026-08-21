# Logashree Sales Dial & Call Center Platform

Modern, AI-powered Sales Dial & Call Center Management Platform built with Next.js 16 (React 19) and high-performance Go microservice backend.

---

## ? Quick Start: 3 Ways to Run

---

### Option 1: ?? 1-Command Docker Run (Frontend + Backend + Database)
Runs **everything** (Next.js Frontend, Go API Backend, PostgreSQL, Redis, RabbitMQ, and MinIO) in isolated Docker containers:

```bash
docker compose up --build
```

- **Frontend App**: ?? [http://localhost:3000](http://localhost:3000)
- **Go API Backend**: ?? [http://localhost:8080](http://localhost:8080)
- **MinIO Storage Console**: ?? [http://localhost:9001](http://localhost:9001)

---

### Option 2: ? Frontend Standalone (Zero Configuration Needed)
Runs the Next.js web application with the built-in CRM database, live dialer, AI tools, and audio playback:

```bash
# 1. Install dependencies
npm run install:all

# 2. Start the dev server
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000)

---

### Option 3: ??? Native Full-Stack (Go + Docker Services + Next.js)

#### 1. Start Support Infrastructure:
```bash
npm run infra:up
```

#### 2. Copy Environment Config:
```bash
# Windows PowerShell:
Copy-Item backend/.env.example backend/.env

# Linux / macOS:
cp backend/.env.example backend/.env
```

#### 3. Start Go Backend:
```bash
npm run dev:backend
```

#### 4. Start Next.js Frontend (in a new terminal):
```bash
npm run dev:frontend
```

---

## ?? Login Credentials

The platform includes pre-configured demo and admin accounts:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Manager / Admin** | `manager@company.com` *(or `admin@test.local`)* | `password` *(or `Admin1234!`)* | Manager KPIs, Team Overview, AI Chat Assistant, Live Queue Monitor |
| **Salesperson / Agent** | `agent@company.com` *(or `agent@test.local`)* | `password` *(or `Admin1234!`)* | Outbound Dialer, Live Call Room, Leads CRM, AI Follow-up Generator |

---

## ?? Application Modules & Routes

| Module | URL | Description |
| :--- | :--- | :--- |
| **Dialer** | [`/dialer`](http://localhost:3000/dialer) | Outbound dialing keypad & active customer queue |
| **Call Room** | [`/call-room`](http://localhost:3000/call-room) | Active call workspace with real-time scripts & dispositions |
| **Leads CRM** | [`/leads`](http://localhost:3000/leads) | Lead pipeline, status filters, and contact assignments |
| **AI Center** | [`/ai-center`](http://localhost:3000/ai-center) | Automated objection handling & AI call summaries |
| **Follow-up Generator** | [`/followup-generator`](http://localhost:3000/followup-generator) | AI email & message draft engine |
| **Manager Hub** | [`/manager`](http://localhost:3000/manager) | Sales team overview, KPI tracking & metrics |
| **Manager AI Chat** | [`/manager-ai-chat`](http://localhost:3000/manager-ai-chat) | AI assistant for team performance queries |
| **Supervisor Floor** | [`/supervisor`](http://localhost:3000/supervisor) | Live queue monitor, agent status, whisper/barge |
| **Calls History** | [`/calls`](http://localhost:3000/calls) | Call audio playback, duration tracking & dispositions |
| **Leaderboard** | [`/leaderboard`](http://localhost:3000/leaderboard) | Agent sales rankings & achievement badges |
| **Reports** | [`/reports`](http://localhost:3000/reports) | Daily analytics, conversion rates & export options |
| **Settings** | [`/settings`](http://localhost:3000/settings) | Account, system preferences & integrations |

---

## ?? Network Sharing (Access from another phone/laptop)

1. Find your machine IP address (`192.168.0.4` or run `ipconfig`).
2. Have your teammate open: `http://192.168.0.4:3000`

