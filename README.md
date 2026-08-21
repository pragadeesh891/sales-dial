# Logashree Sales Dial & Call Center Platform

Modern, AI-powered Sales Dial & Call Center Management Platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

---

## ? Quick Start Guide (For You & Your Teammates)

Follow these simple steps after cloning the repository:

### 1. Prerequisites
- **Node.js**: Version 18+ (Node 20+ or 22+ recommended)
- **npm**: Included with Node.js

---

### 2. Install & Run

#### Option A (From the root folder):
```bash
npm run install:all
npm run dev
```

#### Option B (Directly inside `frontend/`):
```bash
cd frontend
npm install
npm run dev
```

Once started, open your browser to:
?? **[http://localhost:3000](http://localhost:3000)**

---

## ?? Login Credentials

The platform uses role-based authentication based on your email:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Manager / Admin** | `manager@company.com` *(or `admin@company.com`)* | Any password (e.g. `password` or `admin123`) | Manager KPIs, Team Overview, AI Chat Assistant, Queue Live |
| **Salesperson / Agent** | `agent@company.com` *(or `sales@company.com`)* | Any password (e.g. `password` or `agent123`) | Outbound Dialer, Live Call Room, Leads CRM, AI Follow-ups |

---

## ?? Key Features & Navigation

- **Outbound Dialer**: [`/dialer`](http://localhost:3000/dialer) - Quick keypad dialing and active lead dialer.
- **Call Room**: [`/call-room`](http://localhost:3000/call-room) - Live customer context, talking points, and call dispositions.
- **Leads CRM**: [`/leads`](http://localhost:3000/leads) - Lead management pipeline, status filters, and contact assignment.
- **AI Center**: [`/ai-center`](http://localhost:3000/ai-center) - Automated objection handling, call insights, and AI summaries.
- **Follow-up Generator**: [`/followup-generator`](http://localhost:3000/followup-generator) - AI-drafted email and follow-up templates.
- **Manager Hub**: [`/manager`](http://localhost:3000/manager) - Performance dashboard, team metrics, and conversion rates.
- **Manager AI Chat**: [`/manager-ai-chat`](http://localhost:3000/manager-ai-chat) - Conversational AI queries for manager insights.
- **Supervisor Floor**: [`/supervisor`](http://localhost:3000/supervisor) - Live agent monitoring with Whisper and Barge controls.
- **Calls History**: [`/calls`](http://localhost:3000/calls) - Complete call log history and recording player.
- **Leaderboard**: [`/leaderboard`](http://localhost:3000/leaderboard) - Sales rep rankings and badges.
- **Settings**: [`/settings`](http://localhost:3000/settings) - Profile and system preferences.

---

## ?? Environment Variables (Optional)

The frontend runs out of the box with built-in mock services. For custom configurations, create a `.env.local` inside `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
CALLCENTER_API_BASE_URL=http://localhost:8080
RESEND_API_KEY=
EMAIL_FROM=Sales Team <sales@example.com>
LEADS_DATA_FILE=.data/leads.json
```

