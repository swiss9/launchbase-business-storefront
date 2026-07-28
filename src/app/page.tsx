import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
  Headphones,
  PhoneCall,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { brandConfig as staticBrand } from "@/lib/brand";
import { Header } from "@/components/Header";
import { ProductList } from "@/components/ProductList";

export const revalidate = 60;
const ITEMS_PER_PAGE = 5;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const searchQuery = searchParams.search?.trim() || "";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);

  let brand: any = { ...staticBrand };
  let ratingStats: Record<string, { average: number; count: number }> = {};
  let initialProducts: any[] = [];
  let initialTotalPages = 0;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();

    if (supabase) {
      try {
        // Fetch settings, ratings, and initial products in parallel
        const [settingsRes, ratingsRes, productsRes] = await Promise.all([
          supabase.from("site_settings").select("*").single(),
          supabase
            .from("reviews")
            .select("product_id, rating")
            .eq("approved", true),
          supabase
            .from("products")
            .select("*", { count: "exact" })
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .range(0, ITEMS_PER_PAGE - 1),   // first page only
        ]);

        if (settingsRes.data) {
          const s = settingsRes.data;
          brand = {
            ...brand,
            name: s.name ?? brand.name,
            tagline: s.tagline ?? brand.tagline,
            colors: s.colors ?? brand.colors,
            fonts: s.fonts ?? brand.fonts,
            hero: s.hero ?? brand.hero,
            about: s.about ?? brand.about,
            contact: s.contact ?? brand.contact,
            footer: s.footer ?? brand.footer,
            nav: s.nav ?? brand.nav,
            chat: s.chat ?? brand.chat,
          };
        }

        if (ratingsRes.data) {
          const sums: Record<string, number> = {};
          const counts: Record<string, number> = {};
          for (const r of ratingsRes.data) {
            if (!r.product_id) continue;
            sums[r.product_id] = (sums[r.product_id] || 0) + r.rating;
            counts[r.product_id] = (counts[r.product_id] || 0) + 1;
          }
          for (const productId of Object.keys(sums)) {
            ratingStats[productId] = {
              average: sums[productId] / counts[productId],
              count: counts[productId],
            };
          }
        }

        if (productsRes.data) {
          initialProducts = productsRes.data;
          const totalCount = productsRes.count || 0;
          initialTotalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        }
      } catch (e) {
        console.log("Supabase not fully configured, using demo data.");
      }
    }
  }

  const name = brand.name || staticBrand.name;
  const nav = brand.nav || [];
  const hero = brand.hero || {};
  const about = brand.about || {};
  const contact = brand.contact || {};
  const footer = brand.footer || {};
  const chat = brand.chat || {};

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans antialiased text-[#111]">
      <Header nav={nav} name={name} />

      {hero && (
        <section className="relative overflow-hidden bg-gradient-to-br from-neutral-100 to-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6 pt-20 pb-20 md:pt-32 md:pb-32 text-center relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-wide leading-tight">
              {(hero as any).title || staticBrand.hero.title}
            </h1>
            {(hero as any).subtitle && (
              <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-sm md:text-base text-neutral-600">
                {(hero as any).subtitle}
              </p>
            )}
            {(hero as any).cta && (
              <div className="mt-8 md:mt-10">
                <Link
                  href={(hero as any).ctaLink || "#products"}
                  className="inline-block rounded-sm bg-black px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm uppercase tracking-[0.15em] font-medium text-white hover:bg-neutral-800 transition-colors"
                >
                  {(hero as any).cta}
                </Link>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 -z-0 h-48 md:h-72 w-48 md:w-72 rounded-full bg-neutral-200 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -z-0 h-48 md:h-72 w-48 md:w-72 rounded-full bg-neutral-300 blur-3xl opacity-30" />
        </section>
      )}

      {/* Products – initial data handed over, client handles the rest */}
      <ProductList
        chat={chat}
        ratingStats={ratingStats}
        initialProducts={initialProducts}
        initialTotalPages={initialTotalPages}
      />

      {about && (about as any).content && (
        <section id="about" className="py-12 md:py-20 bg-white border-t border-neutral-100">
          <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col lg:flex-row gap-8 md:gap-12 items-center">
            <div className="lg:w-1/2">
              {(about as any).image ? (
                <Image
                  src={(about as any).image}
                  alt="About"
                  width={600}
                  height={400}
                  className="rounded-sm shadow-lg"
                />
              ) : (
                <div className="h-48 md:h-64 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-sm flex items-center justify-center text-neutral-500 text-sm md:text-base">
                  [About Image]
                </div>
              )}
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-2xl md:text-3xl font-serif font-medium">
                {(about as any).title}
              </h2>
              <p className="mt-4 md:mt-6 text-sm md:text-base text-neutral-600 leading-relaxed">
                {(about as any).content}
              </p>
            </div>
          </div>
        </section>
      )}

      {contact &&
        ((contact as any).email ||
          (contact as any).phone ||
          (contact as any).address) && (
          <section className="py-12 md:py-20 bg-white border-t border-neutral-100">
            <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-medium">
                Contact Us
              </h2>
              <div className="mt-8 md:mt-10 flex flex-col md:flex-row justify-center gap-6 md:gap-12 text-sm md:text-base">
                {(contact as any).email && (
                  <a
                    href={`mailto:${(contact as any).email}`}
                    className="flex items-center justify-center gap-2 text-neutral-600 hover:text-black transition-colors"
                  >
                    <Mail className="w-4 h-4" /> {(contact as any).email}
                  </a>
                )}
                {(contact as any).phone && (
                  <a
                    href={`tel:${(contact as any).phone}`}
                    className="flex items-center justify-center gap-2 text-neutral-600 hover:text-black transition-colors"
                  >
                    <Phone className="w-4 h-4" /> {(contact as any).phone}
                  </a>
                )}
                {(contact as any).address && (
                  <div className="flex items-center justify-center gap-2 text-neutral-600">
                    <MapPin className="w-4 h-4" /> {(contact as any).address}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      <footer className="py-8 md:py-12 bg-black text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 md:px-6 text-center text-xs md:text-sm">
          {footer && (footer as any).copyright && (
            <p>{(footer as any).copyright}</p>
          )}
          {footer?.socials && Object.keys(footer.socials).length > 0 && (
            <div className="mt-4 flex justify-center gap-6 flex-wrap">
              {Object.entries(footer.socials).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {platform === "instagram" ? (
                      <Instagram className="w-4 h-4" />
                    ) : platform === "facebook" ? (
                      <Facebook className="w-4 h-4" />
                    ) : platform === "x" ? (
                      <span className="text-xs font-bold">𝕏</span>
                    ) : platform === "youtube" ? (
                      <span className="text-xs">▶</span>
                    ) : platform === "whatsapp_channel" ? (
                      <MessageCircle className="w-4 h-4" />
                    ) : platform === "telegram_channel" ? (
                      <Send className="w-4 h-4" />
                    ) : platform === "discord_channel" ? (
                      <Headphones className="w-4 h-4" />
                    ) : platform === "viber_channel" ? (
                      <PhoneCall className="w-4 h-4" />
                    ) : (
                      <span className="text-xs uppercase">{platform}</span>
                    )}
                  </a>
                ) : null
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
              }
