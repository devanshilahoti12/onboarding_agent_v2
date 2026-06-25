# IGNA Onboarding Agent

AI-powered embeddable chat widget platform. Crawls your website, builds a vector knowledge base, and generates a JavaScript snippet for your customers to drop into their site.

---

## Project Structure

```
igna-chat-platform/
├── chatbot/          # Shared widget files (same for every customer)
├── backend/          # FastAPI + Python
└── frontend/         # React + Vite
```

---

## 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
copy .env.example .env
# Edit .env and set your Azure OpenAI credentials + SECRET_KEY

# Start the backend
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/docs

---

## 2. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 3. First-time User Setup

Since there's no registration UI, use the API to create your first user:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@company.com", "password": "yourpassword", "full_name": "Your Name"}'
```

Or use the Swagger UI at http://localhost:8000/docs → POST /api/auth/register

---

## 4. Flow

1. Login at http://localhost:5173/login
2. Click **"Set Up"** on the IGNA Chat card
3. Fill in your details and website URL
4. Wait for the crawl to complete (progress shown live)
5. Download your `igna-chat.js` from the Download screen
6. Add `<script src="/igna-chat.js"></script>` to your website before `</body>`

---

## Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `SECRET_KEY` | Random string for JWT signing |
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI resource URL |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | Deployment name for text-embedding-ada-002 |
| `AZURE_OPENAI_CHAT_DEPLOYMENT` | Deployment name for GPT-4 |
| `BACKEND_URL` | Public URL of this backend (used in generated script) |
