import { social } from "../config";
import { whatsappChatUrl } from "../lib/whatsapp";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "../components/SocialLinks";

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
      <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Studio</p>
      <h1 className="font-display text-5xl sm:text-7xl">Come closer.</h1>
      <p className="mt-4 max-w-xl text-lg text-[var(--muted)]">
        Message the atelier on WhatsApp for fittings, wholesale, and festive pre-orders. Follow the peacock trail on
        Instagram and Facebook.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiles.map((t) => (
          <a
            key={t.name}
            href={t.href}
            target="_blank"
            rel="noreferrer"
            className={`glass group relative overflow-hidden rounded-[2rem] p-8 transition hover:-translate-y-1`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${t.glow} opacity-70`} />
            <div className="relative">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl neon-icon glass">{t.icon}</div>
              <h2 className="font-display text-4xl">{t.name}</h2>
              <p className="mt-2 text-[var(--muted)]">{t.hint}</p>
              <p className="mt-6 text-sm uppercase tracking-widest text-gold">Open →</p>
            </div>
          </a>
        ))}
      </div>

      <div className="glass mt-12 grid gap-8 rounded-[2rem] p-8 md:grid-cols-2">
        <div>
          <h3 className="font-display text-3xl">Atelier hours</h3>
          <p className="mt-3 text-[var(--muted)]">Mon–Sat · 10:00 – 19:00 IST</p>
          <p className="mt-1 text-[var(--muted)]">Sunday by appointment</p>
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
            className="w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 outline-none"
          />
          <textarea
            name="note"
            required
            placeholder="How can we help?"
            rows={4}
            className="w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 outline-none"
          />
          <button type="submit" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-ink">
            Send via WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}
