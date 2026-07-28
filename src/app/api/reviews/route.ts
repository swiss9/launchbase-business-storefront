import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  const body = await request.json();
  const { name, rating, comment, product_id } = body;

  if (!name || !rating || !comment) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: null,
    rating,
    comment,
    author: name,
    approved: false,
    product_id: product_id || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
