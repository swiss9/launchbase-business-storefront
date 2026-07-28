import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    return NextResponse.json({ error: "Only the first admin can demote others" }, { status: 403 });
  }

  if (params.id === user.id) {
    return NextResponse.json({ error: "You cannot demote yourself" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("admin_users")
    .delete()
    .eq("user_id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
