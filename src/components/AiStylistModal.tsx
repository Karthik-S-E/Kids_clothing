import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, ExternalLink, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/productStore";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";

type Message = {
  role: "user" | "model";
  text: string;
  recommendedIds?: string[];
};

type HistoryEntry = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

interface AiStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiStylistModal({ isOpen, onClose }: AiStylistModalProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<HistoryEntry[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hello! Welcome to Kandamma Kids. How may I help you today? Tell me what you're looking for, or mention your child's age and gender!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const products = useProductStore((s) => s.products);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Client-side fallback matcher if AI forgets to include {{ID:...}}
  function matchProductsByKeywords(query: string) {
    const q = query.toLowerCase();
    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const age = (p.ageRange || "").toLowerCase();
      const gender = (p.gender || "").toLowerCase();

      // Check age patterns like "3", "3y", "2-4", "4-8"
      const ageMatch = q.match(/\b([1-8])\b/) || q.match(/\b([1-8])-([1-8])\b/);
      let matchesAge = false;
      if (ageMatch) {
        matchesAge = age.includes(ageMatch[0]);
      }

      const matchesGender =
        (q.includes("girl") && gender.includes("girl")) ||
        (q.includes("boy") && gender.includes("boy"));

      const matchesTerm =
        (q.includes("gown") && name.includes("gown")) ||
        (q.includes("lehenga") && name.includes("lehenga")) ||
        (q.includes("kurta") && name.includes("kurta"));

      return matchesAge || matchesGender || matchesTerm || name.includes(q) || desc.includes(q);
    });
  }

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
            `ID: ${p.id} | Name: ${p.name} | Gender: ${p.gender} | Age: ${p.ageRange} | Price: ${formatINR(p.price)} | Details: ${p.description || ""}`
        )
        .join("\n");

      const systemInstruction = `You are the friendly, helpful shopping assistant for Kandamma Kids ethnic clothing.

Current Inventory Database:
${productCatalog || "No live products currently."}

HOW TO RESPOND:
1. Greet politely and warmly like an expert store assistant.
2. When the user mentions an age (e.g. "2-4", "3 year old", "5Y"), gender (boy/girl), or outfit style (lehenga, gown, kurta):
   - Immediately search the inventory above.
   - Recommend 1 to 3 relevant products.
   - ALWAYS write each product's exact ID in double curly brackets like {{ID:product_id}} right in your response.
   - Explain briefly why each piece is great for that age or event.
3. If they just say an age like "2-4" or "3", look for all outfits fitting that age bracket in the inventory and suggest them immediately.
4. Keep the total response warm, natural, and within 2 to 3 sentences. Never output dry computer log text like "Requirement: Parsed age".`;

      const res = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: updatedHistory,
          systemInstruction,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "API error");

      const rawReply = data?.text || "Here are some outfits you might love!";
      let idMatches = [...rawReply.matchAll(/\{\{ID:(.*?)\}\}/g)].map((m) => m[1].trim());
      const cleanText = rawReply.replace(/\{\{ID:.*?\}\}/g, "").trim();

      // If AI didn't return explicit ID brackets, run local keyword match so cards still appear
      if (idMatches.length === 0) {
        const fallbacks = matchProductsByKeywords(userMsg);
        if (fallbacks.length > 0) {
          idMatches = fallbacks.slice(0, 3).map((p) => p.id);
        }
      }

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
    } catch (err: unknown) {
      console.error("Gemini Stylist Error:", err);
      // Even if network fails, fallback to local search
      const localMatches = matchProductsByKeywords(userMsg).slice(0, 3);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: localMatches.length > 0
            ? "Here are the best matching outfits from our collection for your request:"
            : "I had trouble connecting. You can also chat with us directly on WhatsApp!",
          recommendedIds: localMatches.length > 0 ? localMatches.map((p) => p.id) : undefined,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:pr-6 p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="flex h-[580px] w-full max-w-[420px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-primary)] text-stone-900 font-bold">
              ✨
            </div>
            <div>
              <h3 className="font-semibold text-sm">Kandamma Assistant</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Personal Kids Shopping Guide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            aria-label="Close Assistant"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-black/20">
          {messages.map((m, idx) => (
            <div key={idx} className="space-y-2">
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "ml-auto bg-[var(--accent-primary)] text-stone-900 font-medium"
                    : "mr-auto bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
              </div>

              {/* Recommended Product Cards Carousel/List */}
              {m.recommendedIds && (
                <div className="mr-auto w-full max-w-[95%] space-y-2 pt-1">
                  {m.recommendedIds.map((pId) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod) return null;

                    const whatsAppBuyLink = whatsappOrderUrl({
                      productName: prod.name,
                      size: prod.sizes?.[0] ?? "Standard",
                      price: prod.price,
                    });

                    return (
                      <div
                        key={prod.id}
                        className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-sm transition hover:border-[var(--accent-primary)]/60"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-16 w-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{prod.name}</p>
                          <p className="text-xs font-bold text-[var(--accent-primary)]">
                            {formatINR(prod.price)}
                            <span className="ml-2 font-normal text-[var(--text-secondary)] text-[10px]">
                              Age: {prod.ageRange}
                            </span>
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Link
                              to={`/shop/${prod.id}`}
                              onClick={onClose}
                              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold uppercase hover:bg-white/10 transition"
                            >
                              Details <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                            <a
                              href={whatsAppBuyLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-2.5 py-1 text-[10px] font-bold uppercase text-white hover:bg-[#20ba59] transition"
                            >
                              <MessageCircle className="h-2.5 w-2.5 fill-current" /> Order
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mr-auto flex items-center gap-2 rounded-2xl bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--text-secondary)] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-[var(--accent-primary)]" />
              <span>Looking up matching outfits...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-3 flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="e.g. 3 year old girl lehenga or kurta..."
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-primary)] text-stone-900 disabled:opacity-40 transition hover:brightness-110 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}