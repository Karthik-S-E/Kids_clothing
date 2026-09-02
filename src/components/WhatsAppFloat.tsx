import { whatsappChatUrl } from "../lib/whatsapp";
import { WhatsAppIcon } from "./SocialLinks";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappChatUrl()}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_0_32px_rgba(37,211,102,0.55)] transition hover:scale-110 whatsapp-glow"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}
