# ✦ Nova AI

> World-class AI chat app — 8 specialized agents, 6 models, memory system, custom agent builder, secure API proxy.

---

## 🚀 Quick Start (Local)

### 1. Install
```bash
tar -xzf nova-ai-deploy.tar.gz
cd nova-ai
npm install
```

### 2. Add Your API Key
```bash
cp .env.example .env
# Edit .env → set ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Get your key at: https://console.anthropic.com

### 3. Run Everything
```bash
npm run dev:all
```
- Frontend → http://localhost:5173
- Backend proxy → http://localhost:3001
- Health check → http://localhost:3001/health

---

## 🌐 Deploy to Production

### Option A — Render.com (Recommended · Free · One service)
1. Push to GitHub
2. render.com → New → Web Service → connect repo
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start:prod`
5. Add env var: `ANTHROPIC_API_KEY=sk-ant-...`
6. ✅ Live!

### Option B — Netlify + Railway (split frontend/backend)
**Railway (backend):**
1. railway.app → New → GitHub repo
2. Add `ANTHROPIC_API_KEY` env var
3. Copy your Railway URL

**Netlify (frontend):**
1. netlify.com → drag dist/ folder
2. Add env var `VITE_API_URL=https://your-app.railway.app`
3. Rebuild: `npm run build` then re-drag dist/

### Option C — VPS / DigitalOcean
```bash
npm install && npm run build
cp .env.example .env  # fill in key + ALLOWED_ORIGINS=https://yourdomain.com
npm install -g pm2
pm2 start server.js --name nova-ai
pm2 save && pm2 startup
```

---

## 📁 Structure
```
nova-ai/
├── src/App.jsx       ← Full React frontend
├── server.js         ← Secure Express proxy
├── .env.example      ← Config template
├── vite.config.js    ← Dev proxy setup
└── package.json      ← Scripts
```

## 🔒 Security Features
- API key server-side only — never in browser
- Rate limiting: 30 req/min · 5/min for Opus models
- Model whitelist · CORS origin lock · message sanitization

Built with React + Vite + Express + Claude
