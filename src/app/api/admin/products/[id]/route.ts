import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.formData();
  const method = body.get("_method");
  if (method === "DELETE") {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }
    const { error } = await supabase.from("products").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.redirect(new URL("/admin/products", request.url));
  }
  return NextResponse.json({ error: "Invalid method" }, { status: 400 });
}
