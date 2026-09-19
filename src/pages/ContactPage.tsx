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
    glow: "from-fuchsia-500/20 to-amber-300/20",
  },
  {
    name: "Facebook",
    href: social.facebook,
    hint: "Kandamma Kids",
    icon: <FacebookIcon />,
    glow: "from-blue-500/20 to-teal-300/20",
  },
  {
    name: "WhatsApp",
    href: whatsappChatUrl(),
    hint: "Direct orders & chat",
    icon: <WhatsAppIcon className="h-10 w-10" />,
    glow: "from-emerald-400/25 to-lime-300/20",
  },
];

export function ContactPage() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-12">
      <div className="relative z-10">
        <ScrollReveal delay={0} duration={0.8}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#dc2626]">
              Direct Contact
            </p>
            <h1 className="font-display text-4xl sm:text-6xl mt-1 text-[#1d1d1b]">
              Get in Touch with Us
            </h1>
            <p className="mt-3 max-w-xl text-base text-stone-700 font-medium">
              Want to order clothes, check sizes, or ask about delivery? Message us directly on WhatsApp or connect on social media.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} duration={0.8}>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {tiles.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white/85 p-8 backdrop-blur-md shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${t.glow} opacity-60`} />
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xs">
                    {t.icon}
                  </div>
                  <h2 className="font-display text-3xl font-bold text-[#1d1d1b]">{t.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-stone-600">{t.hint}</p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#dc2626]">
                    Open Link →
                  </p>
                </div>
              </a>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4} duration={0.8}>
          <div className="mt-10 grid gap-8 rounded-2xl border border-stone-200/90 bg-white/90 p-8 backdrop-blur-md shadow-sm md:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl font-bold text-[#1d1d1b]">Store Timing</h3>
              <p className="mt-3 text-sm font-semibold text-stone-700">Monday to Saturday: 10:00 AM – 7:00 PM</p>
              <p className="mt-1 text-sm text-stone-600">Sunday: WhatsApp orders open</p>
              <p className="mt-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                Delivering all across India
              </p>
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = String(fd.get("name") ?? "");
                const note = String(fd.get("note") ?? "");
                window.open(
                  whatsappChatUrl(`Namaskara Kandamma Kids, my name is ${name}. ${note}`),
                  "_blank"
                );
              }}
            >
              <input
                name="name"
                required
                placeholder="Your full name"
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors"
              />
              <textarea
                name="note"
                required
                placeholder="Tell us what you need (e.g. size help, delivery questions, bulk orders)..."
                rows={4}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#25D366] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#20ba59] transition-all shadow-sm cursor-pointer"
              >
                Send Message on WhatsApp
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}