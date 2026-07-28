"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Search, X, Home } from "lucide-react";

export function ProductList({
  chat,
  ratingStats,
  initialProducts,
  initialTotalPages,
}: {
  chat: any;
  ratingStats: Record<string, { average: number; count: number }>;
  initialProducts: any[];
  initialTotalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const isFirstRender = useRef(true);

  const fetchProducts = useCallback(async () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setLoading(true);
    const res = await fetch(
      `/api/products?page=${currentPage}&search=${encodeURIComponent(searchQuery)}`
    );
    const data = await res.json();
    if (data.products) {
      setProducts(data.products);
      setTotalPages(data.totalPages || 0);
    }
    setLoading(false);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (inputValue.trim()) {
      params.set("search", inputValue.trim());
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: true });
  };

  // Clears only the text input – does NOT change the search results
  const handleClearText = () => {
    setInputValue("");
  };

  // Resets everything and goes back to the full product list
  const handleResetToHome = () => {
    setInputValue("");
    router.push("/", { scroll: true });
  };

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (searchQuery) params.set("search", searchQuery);
    return `/?${params.toString()}`;
  };

  return (
    <main id="products" className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-5 mb-10 gap-4">
        <div>
          <span className="text-[10px] md:text-xs tracking-widest text-neutral-400 uppercase font-medium">
            Collection
          </span>
          <h2 className="font-serif text-xl md:text-2xl font-medium tracking-wide mt-1">
            Our Products
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Home button – reset to full catalogue */}
          <button
            onClick={handleResetToHome}
            className="text-neutral-400 hover:text-black transition p-2"
            title="Back to main page"
          >
            <Home className="w-4 h-4" />
          </button>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-48 bg-[#f4f4f4] border border-neutral-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-neutral-300 transition font-light"
            />
            <button
              type="submit"
              className="bg-black text-white text-xs uppercase tracking-wider px-4 py-2 rounded-sm hover:bg-neutral-800 transition"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Clear text button – only visible when input is not empty */}
          {inputValue && (
            <button
              onClick={handleClearText}
              className="text-neutral-400 hover:text-black transition p-2"
              title="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading bar (subtle) */}
      {loading && (
        <div className="w-full h-0.5 bg-neutral-200 mb-6 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-black w-1/3 animate-loading-bar" />
        </div>
      )}

      {products.length > 0 ? (
        <>
          <div className="reveal-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                chat={chat}
                ratingStats={ratingStats}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={buildPageUrl(page)}
                  scroll={true}
                  className={`inline-flex items-center justify-center w-8 h-8 text-xs font-medium rounded-sm transition ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-neutral-400 text-sm">
          {searchQuery
            ? `No products match "${searchQuery}"`
            : "No products available."}
        </div>
      )}
    </main>
  );
    }
