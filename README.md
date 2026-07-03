# NJ One Marketplace — IGNA AI Onboarding Platform

A full-stack web platform for onboarding New Jersey municipalities onto state-approved AI agents. Municipalities register their sites, trigger automated web crawls to build a RAG knowledge base, and receive an embeddable chatbot widget. Platform administrators can monitor deployments, manage data connectors, review governance policies, and submit support tickets — all from a unified dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3, React Router DOM v6 |
| Backend | FastAPI, SQLAlchemy, SQLite, Pydantic v2, python-jose (JWT) |
| AI / RAG | Azure OpenAI GPT-4 (chat), sentence-transformers (embeddings, local), ChromaDB (vector store) |
| Crawler | BeautifulSoup4, httpx, lxml |
| Demo | Playwright (Firefox) |
| Widget | Vanilla JS embeddable chatbot (`chatbot/igna-chat-widget.js`) |

---

## Project Structure

```
igna-chat-platform/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app, middleware, startup
│   │   ├── config.py                 # Settings via pydantic-settings (.env)
│   │   ├── database.py               # SQLAlchemy engine + session
│   │   ├── dependencies.py           # Auth dependency injection
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── customer.py
│   │   │   ├── deployment_meta.py
│   │   │   ├── crawl_job.py
│   │   │   ├── site_config.py
│   │   │   └── api_key.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── crawl.py
│   │   │   ├── customer.py
│   │   │   └── script.py
│   │   ├── routers/
│   │   │   ├── auth.py               # Login, register, token
│   │   │   ├── onboarding.py         # Site registration, my-sites listing
│   │   │   ├── agents.py             # Agent catalog
│   │   │   ├── crawl.py              # Crawl trigger + status polling
│   │   │   ├── script.py             # Widget script generation
│   │   │   ├── chat.py               # RAG chat endpoint
│   │   │   └── demo.py               # Playwright demo automation
│   │   └── services/
│   │       ├── auth_service.py
│   │       ├── crawler_service.py
│   │       ├── embedding_service.py  # sentence-transformers (local)
│   │       ├── rag_service.py        # ChromaDB query + GPT-4 generation
│   │       ├── chroma_service.py
│   │       ├── script_generator.py
│   │       └── demo_service.py       # Playwright browser automation
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── OnboardingPage.tsx         # New site registration + crawl progress
│       │   ├── DownloadPage.tsx           # Deployment script + embedded widget preview
│       │   ├── AgentLibraryPage.tsx       # State-approved agent catalog
│       │   ├── AgentDetailPage.tsx        # Individual agent info + deploy button
│       │   ├── DeployWizardPage.tsx       # Multi-step deployment wizard
│       │   ├── DemoPage.tsx               # Live Playwright-driven chatbot demo
│       │   ├── DeploymentCenterPage.tsx   # Deployed sites + 6-step timeline
│       │   ├── ConnectorCenterPage.tsx    # Data connectors + configure modal
│       │   ├── MyRequestsPage.tsx         # Request tracking table + detail drawer
│       │   ├── PolicyLibraryPage.tsx      # NJ AI policy library + acknowledge flow
│       │   └── SupportPage.tsx            # Support ticket form + FAQ
│       ├── components/
│       │   └── AppLayout.tsx              # Sidebar + topbar layout shell
│       ├── api/
│       │   ├── client.ts                  # Axios instance (baseURL: /api)
│       │   ├── auth.ts
│       │   └── onboarding.ts
│       ├── contexts/
│       │   └── AuthContext.tsx            # JWT token + user state
│       ├── hooks/
│       │   └── useCrawlPoller.ts
│       ├── types/index.ts
│       └── App.tsx                        # Route definitions
└── chatbot/
    └── igna-chat-widget.js                # Embeddable widget (served at /widget/)
```

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/login` | Login | JWT-based authentication |
| `/dashboard` | Dashboard | Site overview, metrics, quick actions |
| `/onboarding` | Onboarding | Register a municipality site; triggers web crawl |
| `/download/:id` | Download | Deployment script + embeddable widget snippet |
| `/agents` | AI Agent Library | State-approved agents; IGNA Chat is live, others coming soon |
| `/agents/:id` | Agent Detail | Agent capabilities and deployment info |
| `/agents/:id/deploy` | Deploy Wizard | Multi-step guided deployment |
| `/demo/:id` | Demo | Playwright-driven live chatbot demonstration |
| `/deployment-center` | Deployment Center | Cards showing deployed sites with status timeline |
| `/connector-center` | Connector Center | 12 data connectors with health status and configure modal |
| `/my-requests` | My Requests | Filterable request table with slide-out detail drawer |
| `/policy-library` | Policy Library | 8 NJ AI governance policies with acknowledge workflow |
| `/support` | Support | Ticket submission form, FAQ accordion, contact info |

---

## Backend API

All routes are prefixed `/api` (proxied from frontend in development).

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/onboarding/sites` | List sites for the logged-in user |
| `POST` | `/api/onboarding/register` | Register a new site |
| `POST` | `/api/crawl/start` | Start web crawl for a site |
| `GET` | `/api/crawl/status/:id` | Poll crawl progress |
| `GET` | `/api/script/:id` | Get generated widget embed script |
| `POST` | `/api/chat` | RAG chat (ChromaDB + GPT-4) |
| `GET` | `/api/agents` | Agent catalog |
| `POST` | `/api/demo/start` | Start Playwright demo session |
| `GET` | `/health` | Health check — returns `{"status": "healthy"}` |
| `GET` | `/widget/igna-chat-widget.js` | Serve embeddable widget JS |

API docs available at: `http://localhost:8000/docs`

---

## Local Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Azure OpenAI resource (GPT-4 deployment) — only needed for chat; embeddings run locally

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Install Playwright browser
playwright install firefox
playwright install-deps firefox

# Set up environment variables
copy .env.example .env
# Edit .env — fill in SECRET_KEY and Azure OpenAI credentials

# Start the server
python -m app.main
# Runs at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
# /api/* requests proxy to http://localhost:8000
```

### Create first user

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "yourpassword", "full_name": "Your Name"}'
```

Or use Swagger UI at `http://localhost:8000/docs`.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Description |
|---|---|
| `SECRET_KEY` | Random secret for JWT signing — **change in production** |
| `DATABASE_URL` | SQLite path (default: `sqlite:///./igna_chat.db`) |
| `CHROMA_PERSIST_DIR` | ChromaDB storage path (default: `./chroma_data`) |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_OPENAI_API_VERSION` | API version (default: `2024-02-01`) |
| `AZURE_OPENAI_CHAT_DEPLOYMENT` | GPT-4 deployment name (default: `gpt-4`) |
| `BACKEND_URL` | Public backend URL — set to your server IP/domain for deployment |

> Embeddings are generated locally using `sentence-transformers` — no Azure key required for that.

---

## Production Deployment (VM / GPU Server)

### 1. Build the frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### 2. Configure Nginx

```nginx
server {
    listen 80;

    location / {
        root /path/to/frontend/dist;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
    }

    location /widget/ {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

### 3. Run backend as a systemd service

```ini
[Unit]
Description=IGNA AI Backend
After=network.target

[Service]
WorkingDirectory=/path/to/backend
ExecStart=/path/to/backend/venv/bin/python -m app.main
Restart=always

[Install]
WantedBy=multi-user.target
```

### 4. GPU (CUDA) — install torch before requirements

```bash
pip install torch --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

`sentence-transformers` auto-detects and uses the GPU when CUDA is available.

### 5. Required `.env` changes for production

```
SECRET_KEY=<long-random-string>
BACKEND_URL=http://<your-server-ip-or-domain>
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=<your-key>
```

---

## Notes

- **IGNA Chat is the only live agent** — all other agents in the Agent Library display a "Coming Soon" badge with disabled buttons.
- **Deployment Center / My Requests** only show sites that completed the full Deploy Wizard flow (filtered via an inner join with `DeploymentMeta`).
- **Widget serving** — on startup, `igna-chat-widget.js` is copied from `chatbot/` into `backend/app/static/widget/` and served at `/widget/igna-chat-widget.js`.
- **Playwright demo** — requires `playwright install firefox` on the server. On a VM without a display, the demo service must run in headless mode.
- **Firewall** — open ports 80 (HTTP) and 443 (HTTPS). Keep port 8000 internal only.
