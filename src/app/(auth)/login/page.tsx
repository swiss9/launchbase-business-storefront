"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const redirectTo = searchParams.get("redirectTo") || "/";
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-md space-y-8 rounded-sm border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-medium tracking-wider text-neutral-900">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Welcome back to your admin panel.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f4f4f4] border border-transparent text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition font-light"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f4f4f4] border border-transparent text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition font-light"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-[11px] uppercase tracking-[0.15em] font-medium py-3.5 rounded-sm hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="text-center text-sm">
          <p className="text-neutral-500">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-neutral-900 underline hover:text-black transition"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center bg-[#fafafa]">
          <p className="text-sm text-neutral-400">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
