import { createClient } from "@/lib/supabase/server";
import { brandConfig as staticBrand } from "@/lib/brand";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Star } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductReviewsPage({
  params,
}: {
  params: { id: string };
}) {
  let product: any = null;
  let reviews: any[] = [];
  let brand: any = { ...staticBrand };

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    if (supabase) {
      const [productRes, reviewsRes, settingsRes] = await Promise.all([
        supabase.from("products").select("*").eq("id", params.id).single(),
        supabase
          .from("reviews")
          .select("id, rating, comment, author, created_at")
          .eq("product_id", params.id)
          .eq("approved", true)
          .order("created_at", { ascending: false }),
        supabase.from("site_settings").select("*").single(),
      ]);

      if (productRes.data) product = productRes.data;
      if (reviewsRes.data) reviews = reviewsRes.data;
      if (settingsRes.data) {
        brand = { ...brand, ...settingsRes.data };
      }
    }
  }

  if (!product) notFound();

  const name = brand.name || staticBrand.name;
  const nav = brand.nav || [];

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans antialiased text-[#111]">
      <Header nav={nav} name={name} />

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
        <div className="border-b border-neutral-200 pb-5 mb-10">
          <span className="text-[10px] md:text-xs tracking-widest text-neutral-400 uppercase font-medium">
            Product Reviews
          </span>
          <h1 className="font-serif text-xl md:text-3xl font-medium tracking-wide mt-1">
            {product.name}
          </h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-xl">
            See what others are saying about this product.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 text-sm">
            No reviews yet for this product.
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {reviews.map((review: any) => (
              <div
                key={review.id}
                className="bg-white border border-neutral-100 p-5 rounded-sm flex flex-col gap-2 hover:border-neutral-200 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-900">
                    {review.author || "Anonymous"}
                  </span>
                  <div className="flex text-yellow-500 gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? "fill-current stroke-none"
                            : "stroke-[1.5] fill-none"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-400 ml-auto">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[12px] text-neutral-600 font-light leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href={`/review?product=${encodeURIComponent(product.name)}&product_id=${params.id}`}
            className="inline-block bg-black text-white text-[11px] uppercase tracking-[0.15em] font-medium px-6 py-3.5 rounded-sm hover:bg-neutral-800 transition"
          >
            Write a Review
          </Link>
        </div>
      </main>
    </div>
  );
        }
