"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  MessageCircle,
  X,
  Sparkles,
  Wallet,
  Glasses,
  Watch,
  Copy,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const iconLibrary: Record<string, any> = {
  sparkles: Sparkles,
  wallet: Wallet,
  glasses: Glasses,
  watch: Watch,
};

interface Props {
  product: any;
  chat: {
    whatsapp?: string;
    telegram?: string;
    discord?: string;
    viber?: string;
  };
  preferredChat?: string;
  ratingStats?: Record<string, { average: number; count: number }>;
}

export function ProductCard({ product, chat, preferredChat, ratingStats }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const IconComponent = iconLibrary[product.icon] || Sparkles;

  // Bullet‑proof image list: clean the images array, fallback to single image, default to empty
  const rawImages = Array.isArray(product?.images) ? product.images : [];
  const cleanImages = rawImages.filter((u: any) => typeof u === "string" && u.trim().length > 0);
  const allImages: string[] = cleanImages.length > 0
    ? cleanImages
    : product?.image
    ? [product.image]
    : [];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const inquiryMessage = `Hi, I'm interested in: ${product.name} ($${product.price}) – is it available?`;

  const buildChatLinks = () => {
    const message = encodeURIComponent(inquiryMessage);
    const links: { label: string; url: string; canPrefill: boolean }[] = [];
    if (chat.whatsapp) {
      links.push({
        label: "WhatsApp",
        url: `https://wa.me/${chat.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`,
        canPrefill: true,
      });
    }
    if (chat.telegram) {
      const username = chat.telegram.replace("@", "");
      links.push({
        label: "Telegram",
        url: `https://t.me/${username}?text=${message}`,
        canPrefill: true,
      });
    }
    if (chat.discord) {
      links.push({ label: "Discord", url: chat.discord, canPrefill: false });
    }
    if (chat.viber) {
      const cleanNumber = chat.viber.replace(/[^0-9]/g, "");
      links.push({ label: "Viber", url: `viber://chat?number=${cleanNumber}`, canPrefill: false });
    }
    if (preferredChat) {
      links.sort((a, b) => {
        if (a.label.toLowerCase() === preferredChat.toLowerCase()) return -1;
        if (b.label.toLowerCase() === preferredChat.toLowerCase()) return 1;
        return 0;
      });
    }
    return links;
  };

  const chatLinks = buildChatLinks();

  const handleBookNow = () => {
    if (chatLinks.length > 0) setModalOpen(true);
  };

  const handleCopyInquiry = () => {
    navigator.clipboard.writeText(inquiryMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = ratingStats?.[product.id];
  const averageRating = stats ? Math.round(stats.average * 10) / 10 : 0;
  const reviewCount = stats?.count || 0;

  return (
    <>
      <div className="group relative grid grid-rows-[auto_1fr_auto] bg-white border border-neutral-100 p-3 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-sm">
        {/* Image container with arrows + dots */}
        <div className="relative aspect-square w-full bg-[#f4f4f4] overflow-hidden rounded-sm">
          {allImages.length > 0 ? (
            <>
              <Image
                src={allImages[currentImageIndex]}
                alt={product.name}
                fill
                className="object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow hover:bg-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow hover:bg-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {allImages.map((_, idx) => (
                      <span
                        key={idx}
                        className={`block w-2 h-2 rounded-full ${
                          idx === currentImageIndex ? "bg-black" : "bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400 transform transition-transform duration-[1.5s] ease-out group-hover:scale-110">
              <IconComponent className="w-10 h-10 md:w-12 md:h-12 stroke-[0.75]" />
            </div>
          )}
          {product.badge && (
            <div className="absolute top-3 left-3 bg-black text-white px-2 py-0.5 text-[9px] uppercase tracking-widest font-medium z-10">
              {product.badge}
            </div>
          )}
        </div>

        {/* Text & rating */}
        <div className="mt-4 md:mt-5 space-y-1 self-start">
          <div className="flex justify-between items-baseline gap-2">
            <h3 className="font-serif text-sm md:text-[14px] font-medium tracking-wider text-neutral-900 line-clamp-1">
              {product.name}
            </h3>
            <span className="text-xs md:text-[13px] font-medium text-neutral-600 font-sans">
              ${product.price}
            </span>
          </div>
          <p className="text-[10px] md:text-[11px] tracking-wide text-neutral-400 font-light uppercase">
            {product.description}
          </p>

          {reviewCount > 0 ? (
            <Link
              href={`/product/${product.id}/reviews`}
              className="inline-flex items-center gap-1 mt-1 text-[10px] md:text-[11px] text-neutral-500 hover:text-black transition"
            >
              <span className="flex items-center text-yellow-500">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(averageRating)
                        ? "fill-current stroke-none"
                        : "stroke-[1.5] fill-none text-neutral-300"
                    }`}
                  />
                ))}
              </span>
              <span className="text-neutral-500 font-medium ml-1">
                {averageRating.toFixed(1)} ({reviewCount})
              </span>
            </Link>
          ) : (
            <Link
              href={`/product/${product.id}/reviews`}
              className="inline-block mt-1 text-[10px] md:text-[11px] text-neutral-400 hover:text-black transition font-medium"
            >
              Be the first to review
            </Link>
          )}
        </div>

        {/* Order via Chat button */}
        <div className="mt-5 md:mt-6 pt-3 border-t border-neutral-100">
          <button
            onClick={handleBookNow}
            disabled={chatLinks.length === 0}
            className="block w-full bg-black text-white text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-medium py-3 md:py-3.5 hover:bg-neutral-800 transition-colors duration-300 text-center rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Order via Chat
          </button>
        </div>
      </div>

      {/* Chat modal (unchanged) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-sm border border-neutral-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-medium tracking-wider uppercase">Contact Us</h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              Choose your preferred chat app to ask about this product:
            </p>
            <div className="space-y-2">
              {chatLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-[#f4f4f4] px-4 py-3 rounded-sm text-xs uppercase tracking-wider font-medium hover:bg-neutral-200 transition"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {link.label}
                    {!link.canPrefill && (
                      <span className="text-[9px] text-neutral-400 font-normal normal-case">(no auto‑fill)</span>
                    )}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
            <div className="pt-2 border-t border-neutral-100">
              <button
                onClick={handleCopyInquiry}
                className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-neutral-500 hover:text-black transition font-medium"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy inquiry message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
        }
