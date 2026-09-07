import { whatsappChatUrl } from "../lib/whatsapp";
import { WhatsAppIcon } from "./SocialLinks";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappChatUrl()}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-[var(--z-floating)] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl whatsapp-glow"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}

