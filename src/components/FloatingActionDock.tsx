import { Bot, MessageCircle } from "lucide-react";
import { whatsappChatUrl } from "../lib/whatsapp";

interface FloatingActionDockProps {
  onAiClick?: () => void;
}

export function FloatingActionDock({ onAiClick }: FloatingActionDockProps) {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2.5 pointer-events-auto">
      {/* WhatsApp Floating Action */}
      <a
        href={whatsappChatUrl("Hi Kandamma! I would like help with an order.")}
        target="_blank"
        rel="noreferrer"
        className="flex h-11 w-11 sm:h-auto sm:w-auto items-center justify-center sm:px-4 sm:py-2.5 rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-[#20ba59]"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5 fill-current shrink-0" />
        <span className="hidden sm:inline ml-2 text-xs font-bold tracking-wide">
          WhatsApp
        </span>
      </a>

      {/* AI Assistant Floating Action */}
      <button
        type="button"
        onClick={onAiClick}
        className="flex h-11 w-11 sm:h-auto sm:w-auto items-center justify-center sm:px-4 sm:py-2.5 rounded-full bg-stone-900 text-white shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer border border-stone-700/80"
        aria-label="Ask AI Assistant"
      >
        <Bot className="h-5 w-5 text-emerald-400 shrink-0" />
        <span className="hidden sm:inline ml-2 text-xs font-bold tracking-wide">
          AI Assistant
        </span>
      </button>
    </div>
  );
}