"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { brandConfig } from "@/lib/brand";

export function Header({ nav, name: dynamicName }: { nav: any[]; name?: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // Check if the user is an admin
        supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", currentUser.id)
          .maybeSingle()
          .then(({ data: adminRow }) => {
            setIsAdmin(!!adminRow);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", currentUser.id)
          .maybeSingle()
          .then(({ data: adminRow }) => {
            setIsAdmin(!!adminRow);
          });
      } else {
        setIsAdmin(false);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayName = dynamicName || brandConfig.name;
  const nameLength = displayName.length;
  const fontSizeClass =
    nameLength > 18
      ? "text-xs md:text-sm"
      : nameLength > 12
      ? "text-sm md:text-lg"
      : "text-lg md:text-xl";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6 max-w-7xl">
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] uppercase font-medium tracking-[0.2em] text-neutral-500">
          {(nav || []).map((item: any) => (
            <a
              key={item.label}
              href={item.href}
              className={`hover:text-black transition-colors ${
                item.active ? "text-black border-b border-black pb-1" : ""
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/"
          className={`font-serif font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase text-center ${fontSizeClass}`}
        >
          {displayName}
        </Link>

        <div className="flex items-center gap-4 md:gap-6 text-neutral-800">
          {loading ? null : user ? (
            <>
              {/* Profile circle – only a link if user is admin */}
              {isAdmin ? (
                <Link
                  href="/admin"
                  title={user.email}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-medium uppercase"
                >
                  {user.email?.[0] ?? "?"}
                </Link>
              ) : (
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-medium uppercase">
                  {user.email?.[0] ?? "?"}
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="text-[10px] md:text-[11px] uppercase tracking-wider text-neutral-500 hover:text-black transition font-medium"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[11px] uppercase tracking-wider text-neutral-500 hover:text-black transition font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-[11px] uppercase tracking-wider bg-black text-white px-4 py-2.5 rounded-sm hover:bg-neutral-800 transition font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
