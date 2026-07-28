"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { brandConfig } from "@/lib/brand";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email verification is off, the user is immediately created
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-md space-y-8 rounded-sm border border-neutral-200 bg-white p-8 shadow-sm text-center">
          <h2 className="font-serif text-2xl font-medium tracking-wider text-neutral-900">
            Account created
          </h2>
          <p className="text-sm text-neutral-500">
            You can now sign in.{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-900 underline hover:text-black"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-md space-y-8 rounded-sm border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-medium tracking-wider text-neutral-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Get started with your business website.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-neutral-500 mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#f4f4f4] border border-transparent text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition font-light"
                placeholder="Jane Smith"
              />
            </div>
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
                placeholder="jane@example.com"
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
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <div className="text-center text-sm">
          <p className="text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-900 underline hover:text-black transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
          }
