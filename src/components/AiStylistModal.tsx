import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, ExternalLink, Bot } from "lucide-react";
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
      text: "Hi! How can I help you choose the right outfit today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const products = useProductStore((s) => s.products);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

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
            `[ID: ${p.id}] ${p.name} | ${p.gender} | Age: ${p.ageRange} | Sizes: ${(p.sizes || []).join(", ")} | Price: ${formatINR(p.price)}`
        )
        .join("\n");

      const systemInstruction = `You are a real, friendly stylist at Kandamma Kids boutique helping a customer in a live chat.

Store Catalog:
${productCatalog || "No live products currently."}

CONVERSATION INSTRUCTIONS:
- Talk like a warm, real person having a quick chat, NOT an AI or a bot.
- Do NOT say formal repetitive greetings like "Hello! Are you looking for festive ethnic wear for Ugadi or a special occasion?".
- Answer directly in 1 to 2 very short, natural sentences (under 30 words total).
- If the customer asks for a recommendation or gives details (boy/girl, age, occasion), recommend 1 or 2 matching items from the catalog using format {{ID:product-id}}.
- If you need details, ask just ONE simple question (e.g. "Is it for a boy or girl?" or "How old is your child?").`;

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

      const rawReply = data?.text || "Let me know what you are looking for, or reach out to us directly on WhatsApp!";
      const idMatches = [...rawReply.matchAll(/\{\{ID:(.*?)\}\}/g)].map((m) => m[1].trim());
      const cleanText = rawReply.replace(/\{\{ID:.*?\}\}/g, "").trim();

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
      const message =
        err instanceof Error ? err.message : "Connection failed. Please check your network or message us on WhatsApp.";
      setMessages((prev) => [...prev, { role: "model", text: message }]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:pr-8 p-3 bg-black/60 backdrop-blur-xs">
      <div className="flex h-[560px] w-full max-w-[400px] flex-col rounded-2xl border border-stone-300 bg-white text-stone-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-stone-900">Kandamma Assistant</h3>
              <p className="text-[11px] text-stone-500">Live styling & size help</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-800 transition cursor-pointer"
            aria-label="Close Assistant"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8f5]">
          {messages.map((m, idx) => (
            <div key={idx} className="space-y-2">
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.role === "user"
                    ? "ml-auto bg-stone-900 text-white font-medium"
                    : "mr-auto bg-white border border-stone-200 text-stone-800"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
              </div>

              {m.recommendedIds && (
                <div className="mr-auto w-full max-w-[92%] space-y-2 pt-1">
                  {m.recommendedIds.map((pId) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod) return null;
                    return (
                      <div
                        key={prod.id}
                        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-2.5 shadow-xs"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-stone-900">{prod.name}</p>
                          <p className="text-xs font-bold text-amber-800">
                            {formatINR(prod.price)}
                            <span className="ml-2 font-normal text-stone-500">{prod.ageRange}</span>
                          </p>
                        </div>
                        <Link
                          to={`/shop/${prod.id}`}
                          onClick={onClose}
                          className="flex items-center gap-1 rounded-md bg-stone-900 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-stone-800"
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
            <div className="mr-auto flex items-center gap-2 rounded-2xl bg-white border border-stone-200 px-3.5 py-2 text-xs text-stone-500">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-600" />
              <span>Checking collection...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-stone-200 bg-white p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything (e.g. dress for 4 yr old)..."
            className="flex-1 rounded-full border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-800 transition"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white disabled:opacity-40 transition hover:bg-stone-800 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}