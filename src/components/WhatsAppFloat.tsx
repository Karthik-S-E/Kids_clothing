import { whatsappChatUrl } from "../lib/whatsapp";
import { WhatsAppIcon } from "./SocialLinks";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappChatUrl()}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-[var(--z-floating)] flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[#687d75] text-white shadow-lg transition hover:scale-105 hover:bg-[#526b66] hover:shadow-xl whatsapp-glow"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}

