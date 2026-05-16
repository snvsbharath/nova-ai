export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  // Parse body manually if needed
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }

  const { model, messages, system, max_tokens } = body || {};

  if (!model || !messages) {
    return res.status(400).json({ error: "Missing model or messages" });
  }

  const payload = {
    model,
    max_tokens: max_tokens || 1500,
    messages,
    stream: false,
  };
  if (system) payload.system = system;

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(502).json({ error: err.message || "Failed to reach Anthropic API" });
  }
}
