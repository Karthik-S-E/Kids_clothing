import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/productStore";
import { formatINR } from "../lib/formatINR";

type Message = {
  role: "user" | "model";
  text: string;
  recommendedIds?: string[];
};

type HistoryEntry = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

export function AiStylistModal() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<HistoryEntry[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Namaste! I'm your Kandamma Kids stylist. Tell me the child's age, gender, or festival you're shopping for!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const products = useProductStore((s) => s.products);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    const updatedHistory: HistoryEntry[] = [
      ...conversationHistory,
      { role: "user", parts: [{ text: userMsg }] },
    ];

    try {
      const productCatalog = products
        .map(
          (p) =>
            `[ID: ${p.id}] ${p.name} | ${p.gender} | Age: ${p.ageRange} | Sizes: ${(p.sizes || []).join(", ")} | Price: ${formatINR(p.price)} | Status: ${p.stockStatus ?? true ? "In Stock" : "Out of Stock"}`
        )
        .join("\n");

      const systemInstruction = `You are an expert children's ethnic stylist for "Kandamma Kids".
Current Inventory:
${productCatalog || "No live products currently."}

STRICT RESPONSE RULES:
1. NEVER repeat greetings ("Hello", "Welcome to Kandamma Kids") after the very first interaction. Jump straight into recommendations or clarifying questions.
2. DO NOT use raw markdown formatting asterisks like "**Product**" or bullet list stars "*". Speak in natural, polished sentences.
3. Whenever you suggest a product from the inventory, include its exact ID inside double curly brackets, e.g.: {{ID:kk-peacock-kurta}}. The UI will automatically render interactive product cards for them.
4. Only ever recommend IDs that appear in the inventory above. If nothing suits, say so and suggest messaging on WhatsApp.
5. If an outfit is out of stock, clearly mention it.
6. Keep answers concise, helpful, and under 3-4 sentences.`;

      // The API key lives server-side in /api/stylist. A relative URL keeps this
      // working on any host without hardcoding a domain.
      const res = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction, contents: updatedHistory }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "The stylist is unavailable right now.");

      const rawReply: string = data?.text || "";
      if (!rawReply.trim()) throw new Error("The stylist had nothing to add. Try rephrasing?");

      const idMatches = [...rawReply.matchAll(/\{\{ID:(.*?)\}\}/g)]
        .map((m) => m[1].trim())
        // Guard against the model inventing IDs that aren't in the catalogue.
        .filter((id) => products.some((p) => p.id === id));
      const cleanText = rawReply.replace(/\{\{ID:.*?\}\}/g, "").replace(/\s{2,}/g, " ").trim();

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: cleanText,
          recommendedIds: idMatches.length > 0 ? idMatches : undefined,
        },
      ]);

      setConversationHistory([
        ...updatedHistory,
        { role: "model", parts: [{ text: rawReply }] },
      ]);
    } catch (err) {
      console.error("Stylist error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text:
            err instanceof Error
              ? err.message
              : "Connection failed. Please check your network.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-40 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white shadow-[0_0_24px_rgba(20,184,166,0.5)] transition hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="AI Stylist"
      >
        <Sparkles className="h-6 w-6 text-amber-200 animate-pulse" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[160] flex h-[560px] w-[360px] flex-col rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elev)] shadow-2xl backdrop-blur-2xl overflow-hidden sm:w-[420px]">
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-black/25 px-5 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h3 className="font-display text-xl font-semibold">Kandamma AI Stylist</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-[var(--muted)] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className="space-y-2">
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "ml-auto bg-gold text-ink font-medium"
                      : "mr-auto bg-black/35 border border-[var(--line)] text-[var(--text)]"
                  }`}
                >
                  <p className="whitespace-pre-line text-xs sm:text-[13px]">{m.text}</p>
                </div>

                {m.recommendedIds && (
                  <div className="mr-auto w-full max-w-[92%] space-y-2 pt-1">
                    {m.recommendedIds.map((pId) => {
                      const prod = products.find((p) => p.id === pId);
                      if (!prod) return null;
                      return (
                        <div
                          key={prod.id}
                          className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-black/40 p-2.5 backdrop-blur transition-colors hover:border-gold"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">{prod.name}</p>
                            <p className="text-[11px] text-gold font-bold">
                              {formatINR(prod.price)}
                              <span className="ml-2 font-normal text-[var(--muted)]">
                                {prod.ageRange}
                              </span>
                            </p>
                          </div>
                          <Link
                            to={`/shop/${prod.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink hover:bg-yellow-400 transition-colors"
                          >
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl bg-black/20 px-3.5 py-2.5 text-xs text-[var(--muted)]">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-gold" />
                <span>Finding the best fits...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[var(--line)] bg-black/15 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask for outfits (e.g. Silk frock for 3 year girl)..."
              className="flex-1 rounded-full border border-[var(--line)] bg-transparent px-4 py-2.5 text-xs outline-none focus:border-gold transition-colors"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink disabled:opacity-40 transition hover:bg-yellow-400 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}