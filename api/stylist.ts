/**
 * Vercel serverless proxy for the Kandamma Kids AI stylist.
 *
 * The Gemini API key MUST stay server-side. Set it in the Vercel dashboard as
 * GEMINI_API_KEY (NOT VITE_GEMINI_API_KEY — anything VITE_-prefixed is inlined
 * into the public browser bundle).
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type Part = { text: string };
type Entry = { role: "user" | "model"; parts: Part[] };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: "The stylist is not configured yet. Please message us on WhatsApp." }, 503);
  }

  let body: { systemInstruction?: string; contents?: Entry[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const contents = Array.isArray(body.contents) ? body.contents : [];
  if (contents.length === 0) {
    return json({ error: "No message provided." }, 400);
  }

  // Cap history so a long chat can't blow up latency or cost.
  const trimmed = contents.slice(-12);

  try {
    const upstream = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: body.systemInstruction
          ? { parts: [{ text: body.systemInstruction }] }
          : undefined,
        contents: trimmed,
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Log the real upstream reason server-side, return something safe.
      console.error("Gemini upstream error", upstream.status, JSON.stringify(data));
      return json({ error: "The stylist is unavailable right now. Please try again." }, 502);
    }

    const text: string =
      data?.candidates?.[0]?.content?.parts?.map((p: Part) => p.text).join("") ?? "";

    if (!text.trim()) {
      return json({ error: "The stylist had nothing to add. Try rephrasing?" }, 502);
    }

    return json({ text });
  } catch (err) {
    console.error("Gemini proxy failure", err);
    return json({ error: "Could not reach the stylist. Please try again." }, 502);
  }
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = { runtime: "edge" };
