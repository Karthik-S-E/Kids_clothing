import { Bot, MessageCircle } from "lucide-react";
import { whatsappChatUrl } from "../lib/whatsapp";

interface FloatingActionDockProps {
  onAiClick?: () => void;
}

export function FloatingActionDock({ onAiClick }: FloatingActionDockProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* WhatsApp Action Button */}
      <a
        href={whatsappChatUrl("Hi Kandamma! I would like help with an order.")}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-xl transition hover:scale-105 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5 fill-current" />
        <span className="text-xs font-bold tracking-wide">WhatsApp</span>
      </a>

      {/* AI Assistant Button */}
      <button
        type="button"
        onClick={onAiClick}
        className="flex items-center gap-2.5 rounded-full bg-stone-900 px-5 py-3 text-white shadow-xl transition hover:scale-105 active:scale-95 cursor-pointer border border-stone-700"
        aria-label="Ask AI Assistant"
      >
        <Bot className="h-5 w-5 text-emerald-400" />
        <span className="text-xs font-bold tracking-wide">AI Assistant</span>
      </button>
    </div>
  );
}