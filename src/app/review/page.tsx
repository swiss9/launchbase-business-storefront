"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product") || "";
  const productId = searchParams.get("product_id") || null;

  const storageKey = productId
    ? `launchbase_review_submitted_${productId}`
    : "launchbase_review_submitted";

  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [fetchingUser, setFetchingUser] = useState(true);

  useEffect(() => {
    const reviewed = localStorage.getItem(storageKey);
    if (reviewed === "true") {
      setAlreadySubmitted(true);
    }
  }, [storageKey]);

  // Try to fetch the current user and their profile name
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setFetchingUser(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user) {
        setIsLoggedIn(true);
        // Try to get full_name from profiles, fallback to user metadata
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            const displayName =
              profile?.full_name || user.user_metadata?.full_name || "";
            setUserName(displayName);
            setName(displayName);
            setFetchingUser(false);
          });
      } else {
        setIsLoggedIn(false);
        setFetchingUser(false);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadySubmitted) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || "Anonymous",
        rating,
        comment,
        product_id: productId,
      }),
    });

    if (res.ok) {
      localStorage.setItem(storageKey, "true");
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit review");
    }
    setLoading(false);
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-sm p-8 text-center">
          <h2 className="text-2xl font-serif font-semibold mb-4">Thank you!</h2>
          <p className="text-neutral-500 text-sm">
            You have already submitted a review for this product from this device.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-sm p-8 text-center">
          <h2 className="text-2xl font-serif font-semibold mb-4">
            Review submitted!
          </h2>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-block bg-black text-white text-sm uppercase tracking-wider px-6 py-2.5 rounded-sm hover:bg-neutral-800"
          >
            Back to site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] py-20 px-4">
      <div className="max-w-lg w-full bg-white border border-neutral-200 rounded-sm p-8">
        <h1 className="text-2xl font-serif font-semibold mb-6">Leave a Review</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {productParam && (
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                Product
              </label>
              <input
                type="text"
                value={productParam}
                disabled
                className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
              />
            </div>
          )}
          {/* If logged in, show name as read‑only; otherwise, show name input */}
          {isLoggedIn ? (
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                disabled
                className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm"
                placeholder="Jane Smith"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? "text-yellow-500" : "text-neutral-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Comment
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm"
              placeholder="Share your experience..."
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-sm uppercase tracking-wider py-3 rounded-sm hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <p className="text-sm text-neutral-400">Loading form…</p>
        </div>
      }
    >
      <ReviewForm />
    </Suspense>
  );
                                 }
