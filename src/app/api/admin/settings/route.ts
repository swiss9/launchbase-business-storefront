import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  const { data } = await supabaseAdmin.from("site_settings").select("*").single();
  return NextResponse.json(data || {});
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  const body = await request.json();
  const { error } = await supabaseAdmin.from("site_settings").upsert({ id: 1, ...body });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
    }
