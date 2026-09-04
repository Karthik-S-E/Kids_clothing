import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  const { history, systemInstruction } = req.body as {
    history?: Array<{ role: string; parts: Array<{ text: string }> }>;
    systemInstruction?: string;
  };

  if (!history || !Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: "Missing or empty history." });
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const body: Record<string, unknown> = {
      contents: history,
    };

    if (systemInstruction) {
      body.system_instruction = { parts: [{ text: systemInstruction }] };
    }

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const msg = data?.error?.message || "Gemini API error";
      return res.status(upstream.status).json({ error: msg });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({ text });
  } catch (err) {
    console.error("Stylist proxy error:", err);
    return res.status(500).json({ error: "Failed to reach Gemini API." });
  }
}
