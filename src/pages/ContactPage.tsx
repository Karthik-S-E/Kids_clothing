import { social } from "../config";
import { whatsappChatUrl } from "../lib/whatsapp";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "../components/SocialLinks";
import { ScrollReveal } from "../components/ScrollReveal";

const tiles = [
  {
    name: "Instagram",
    href: social.instagram,
    hint: "@kandammakids",
    icon: <InstagramIcon />,
    glow: "from-fuchsia-500/40 to-amber-300/20",
  },
  {
    name: "Facebook",
    href: social.facebook,
    hint: "Kandamma Kids",
    icon: <FacebookIcon />,
    glow: "from-blue-500/40 to-teal-300/20",
  },
  {
    name: "WhatsApp",
    href: whatsappChatUrl(),
    hint: "Direct orders",
    icon: <WhatsAppIcon className="h-10 w-10" />,
    glow: "from-emerald-400/50 to-lime-300/20",
  },
];

export function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <ScrollReveal delay={0} duration={0.8}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent-primary)]">Studio</p>
          <h1 className="font-display text-5xl sm:text-7xl">Come closer.</h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--text-secondary)]">
            Message the atelier on WhatsApp for fittings, wholesale, and festive pre-orders. Follow the peacock trail on
            Instagram and Facebook.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2} duration={0.8}>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiles.map((t) => (
            <a
              key={t.name}
              href={t.href}
              target="_blank"
              rel="noreferrer"
              className={`glass group relative overflow-hidden rounded-xl p-8 transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${t.glow} opacity-70`} />
              <div className="relative">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl neon-icon glass">{t.icon}</div>
                <h2 className="font-display text-4xl">{t.name}</h2>
                <p className="mt-2 text-[var(--text-secondary)]">{t.hint}</p>
                <p className="mt-6 text-sm uppercase tracking-widest text-[var(--accent-primary)]">Open →</p>
              </div>
            </a>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.4} duration={0.8}>
        <div className="glass mt-12 grid gap-8 rounded-xl p-8 md:grid-cols-2">
          <div>
            <h3 className="font-display text-3xl">Atelier hours</h3>
            <p className="mt-3 text-[var(--text-secondary)]">Mon–Sat · 10:00 – 19:00 IST</p>
            <p className="mt-1 text-[var(--text-secondary)]">Sunday by appointment</p>
          </div>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") ?? "");
              const note = String(fd.get("note") ?? "");
              window.open(
                whatsappChatUrl(`Hi Kandamma Kids! I'm ${name}. ${note}`),
                "_blank",
              );
            }}
          >
            <input
              name="name"
              required
              placeholder="Your name"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
            <textarea
              name="note"
              required
              placeholder="How can we help?"
              rows={4}
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
            <button type="submit" className="rounded-full bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--color-gold)]">
              Send via WhatsApp
            </button>
          </form>
        </div>
      </ScrollReveal>
    </section>
  );
}
