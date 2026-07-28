"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, ExternalLink } from "lucide-react";

export function AdminHeader({ userEmail }: { userEmail?: string }) {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6 max-w-7xl">
        {/* Brand – now shows Admin instead of the store name */}
        <Link
          href="/admin"
          className="font-serif text-lg md:text-xl font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase text-neutral-900"
        >
          Admin
        </Link>

        <div className="flex items-center gap-4 md:gap-6 text-neutral-500 text-[11px] uppercase font-medium tracking-widest">
          <a
            href="/"
            target="_blank"
            className="hover:text-black transition-colors flex items-center gap-1.5"
          >
            <span>View Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-neutral-200 hidden md:inline">|</span>
          <button
            onClick={handleSignOut}
            className="hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
