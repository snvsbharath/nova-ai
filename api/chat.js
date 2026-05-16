export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Debug: log what env vars exist (remove after fixing)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log("API key present:", !!apiKey, "| Length:", apiKey?.length || 0, "| Starts with:", apiKey?.slice(0,10));

  if (!apiKey) {
    return res.status(500).json({ 
      error: "ANTHROPIC_API_KEY not found in environment. Please add it in Vercel → Settings → Environment Variables and redeploy." 
    });
  }

  if (!apiKey.startsWith("sk-ant-")) {
    return res.status(500).json({ 
      error: `API key format looks wrong. Got: ${apiKey.slice(0,15)}... — should start with sk-ant-` 
    });
  }

  const { model, messages, system, max_tokens } = req.body || {};
  if (!model || !messages) return res.status(400).json({ error: "Missing model or messages" });

  const payload = { model, max_tokens: max_tokens || 1500, messages, stream: false };
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
    console.log("Anthropic status:", upstream.status, "| Response type:", data.type);
    
    if (!upstream.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
      return res.status(upstream.status).json({ error: data.error?.message || JSON.stringify(data) });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(502).json({ error: "Upstream error: " + err.message });
  }
}
