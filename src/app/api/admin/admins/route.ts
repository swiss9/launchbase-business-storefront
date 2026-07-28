import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch admins (no join – reliable)
  const { data: admins, error } = await supabaseAdmin
    .from("admin_users")
    .select("user_id, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const isFirstAdmin = admins && admins.length > 0
    ? admins[0].user_id === user.id
    : true;

  return NextResponse.json({
    admins: admins || [],
    currentUserId: user.id,
    isFirstAdmin,
  });
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: admins } = await supabaseAdmin
    .from("admin_users")
    .select("user_id, created_at")
    .order("created_at", { ascending: true });

  const isFirstAdmin = admins && admins.length > 0
    ? admins[0].user_id === user.id
    : true;

  if (!isFirstAdmin) {
    return NextResponse.json({ error: "Only the first admin can promote others" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

  if (userError) {
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }

  const targetUser = users?.find((u: any) => u.email === email);

  if (!targetUser) {
    return NextResponse.json({ error: "User with that email not found. Have they signed up?" }, { status: 404 });
  }

  const { error: insertError } = await supabaseAdmin
    .from("admin_users")
    .upsert({ user_id: targetUser.id }, { onConflict: "user_id" });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
    }
