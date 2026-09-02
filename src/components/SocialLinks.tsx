import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { social } from "../config";
import { whatsappChatUrl } from "../lib/whatsapp";

const item =
  "flex h-12 w-12 items-center justify-center rounded-2xl neon-icon glass text-[var(--text)] transition hover:scale-110";

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.05 4.91A9.87 9.87 0 0 0 12.04 2C6.54 2 2.06 6.48 2.06 12c0 1.76.46 3.48 1.34 5L2 22l5.17-1.36A9.93 9.93 0 0 0 12.04 22c5.5 0 9.98-4.48 9.98-10 0-2.67-1.04-5.18-2.97-7.09ZM12.04 20.15c-1.52 0-3.01-.4-4.32-1.16l-.31-.18-3.07.8.82-2.99-.2-.32a8.14 8.14 0 0 1-1.25-4.3c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.12 8.12 0 0 1 2.39 5.77c0 4.5-3.66 8.15-8 8.15Zm4.47-6.11c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function SocialLinks({ size = "md" }: { size?: "md" | "lg" }) {
  const wrap = size === "lg" ? "h-16 w-16 rounded-3xl" : "";
  return (
    <div className="flex items-center gap-3">
      <a className={`${item} ${wrap}`} href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
        <InstagramIcon />
      </a>
      <a className={`${item} ${wrap}`} href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
        <FacebookIcon />
      </a>
      <a className={`${item} ${wrap} !bg-[#25D366] text-white`} href={whatsappChatUrl()} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <WhatsAppIcon />
      </a>
    </div>
  );
}

export function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm tracking-wide ${isActive ? "text-gold" : "text-[var(--muted)] hover:text-[var(--text)]"}`
      }
    >
      {children}
    </NavLink>
  );
}
