import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafafa]">
        <div className="text-center p-8 bg-white border rounded-sm shadow-sm max-w-md">
          <h2 className="text-xl font-serif font-semibold">Admin panel unavailable</h2>
          <p className="text-sm text-neutral-500 mt-2">
            Follow the <strong>SETUP.md</strong> file in your repository to connect Supabase.
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            After connecting, redeploy and sign up – the first user becomes the admin.
          </p>
        </div>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (supabaseAdmin) {
    const { data: adminRecord } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminRecord) {
      return (
        <div className="flex h-screen items-center justify-center bg-[#fafafa]">
          <div className="text-center p-8 bg-white border rounded-sm shadow-sm max-w-md">
            <h2 className="text-xl font-serif font-semibold">Access Denied</h2>
            <p className="text-sm text-neutral-500 mt-2">
              You do not have permission to access the admin panel.
            </p>
            <a
              href="/"
              className="inline-block mt-4 bg-black text-white text-sm uppercase tracking-wider px-6 py-2.5 rounded-sm hover:bg-neutral-800 transition"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans antialiased text-[#111]">
      <AdminHeader userEmail={user.email} />
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-10">{children}</main>
    </div>
  );
}
