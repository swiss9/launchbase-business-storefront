"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";

interface Props {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export function AdminProductCard({ product, onEdit, onDelete }: Props) {
  // Build image list from the `images` array (fallback to primary image, else empty)
  const rawImages = Array.isArray(product?.images) ? product.images : [];
  const cleanImages = rawImages.filter((u: any) => typeof u === "string" && u.trim().length > 0);
  const allImages: string[] = cleanImages.length > 0
    ? cleanImages
    : product?.image
    ? [product.image]
    : [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  return (
    <div className="bg-white border border-neutral-100 p-3 rounded-sm flex flex-col justify-between group">
      <div>
        <div className="relative aspect-square w-full bg-[#f4f4f4] flex items-center justify-center text-neutral-300 overflow-hidden rounded-sm">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="object-cover w-full h-full"
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
            <Plus className="w-10 h-10 stroke-[0.75]" />
          )}
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex justify-between items-baseline gap-2">
            <h4 className="font-serif text-[13px] font-medium tracking-wider text-neutral-900 line-clamp-1">
              {product.name}
            </h4>
            <span className="text-[12px] font-medium text-neutral-600">${product.price}</span>
          </div>
          <p className="text-[10px] tracking-wide text-neutral-400 font-light uppercase">
            {product.description}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] tracking-wider uppercase">
        <button onClick={() => onEdit(product)} className="text-neutral-400 hover:text-black transition-colors font-medium">
          Edit
        </button>
        <button onClick={() => onDelete(product.id)} className="text-neutral-400 hover:text-red-600 transition-colors font-medium">
          Delete
        </button>
      </div>
    </div>
  );
    }
