// ─── Nova AI — Secure API Proxy Server ───────────────────────────────────────
// Keeps your Anthropic API key safe on the server side.
// Never expose ANTHROPIC_API_KEY to the frontend!

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { createServer } from "http";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));

// CORS — restrict to your frontend origin in production
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile apps)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV === "development") {
      return cb(null, true);
    }
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute window
  max: 30,                     // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,                      // 5 per minute for heavy models
  message: { error: "Rate limit hit for heavy models. Try again in a minute." },
});

// ─── Allowed Models (whitelist) ───────────────────────────────────────────────
const ALLOWED_MODELS = new Set([
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-sonnet-4-20250514",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-20250514",
  "claude-haiku-3-5-20241022",
]);

const HEAVY_MODELS = new Set(["claude-opus-4-6", "claude-opus-4-20250514"]);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    name: "Nova AI Proxy",
    timestamp: new Date().toISOString(),
    keyConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
});

// ─── Main Proxy Route ─────────────────────────────────────────────────────────
app.post("/api/chat", (req, res, next) => {
  const model = req.body?.model || "";
  if (HEAVY_MODELS.has(model)) {
    return strictLimiter(req, res, next);
  }
  return limiter(req, res, next);
}, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on server." });
  }

  const { model, messages, system, max_tokens, stream } = req.body;

  // Validate model
  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: `Model '${model}' is not allowed.` });
  }

  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array." });
  }

  // Sanitize: max 100 messages, max 100k chars per message
  const sanitizedMessages = messages.slice(-100).map(m => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content || "").slice(0, 100000),
  }));

  const body = {
    model,
    max_tokens: Math.min(Number(max_tokens) || 1500, 4096),
    messages: sanitizedMessages,
    stream: stream !== false,
  };

  if (system) body.system = String(system).slice(0, 10000);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    // ── Streaming ──
    if (body.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      if (!upstream.ok) {
        const err = await upstream.text();
        res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
        return res.end();
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); break; }
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      };

      req.on("close", () => reader.cancel());
      await pump();

    } else {
      // ── Non-streaming ──
      const data = await upstream.json();
      if (!upstream.ok) {
        return res.status(upstream.status).json({ error: data.error?.message || "Upstream error" });
      }
      res.json(data);
    }

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Failed to reach Anthropic API." });
  }
});

// ─── Serve Frontend in Production ────────────────────────────────────────────
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "dist");

if (process.env.NODE_ENV === "production" && existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback — all non-API routes serve index.html
  app.get("*", (req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
  console.log("📦 Serving frontend from /dist");
} else {
  // ─── 404 (dev mode) ───────────────────────────────────────────────────────
  app.use((req, res) => res.status(404).json({ error: "Not found" }));
}

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`\n🚀 Nova AI Proxy running on http://localhost:${PORT}`);
  console.log(`   API key: ${process.env.ANTHROPIC_API_KEY ? "✓ configured" : "✗ MISSING — set ANTHROPIC_API_KEY"}`);
  console.log(`   Env: ${process.env.NODE_ENV || "development"}\n`);
});

export default app;
