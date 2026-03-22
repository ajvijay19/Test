import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { insertRating, listRatings } from "@/app/lib/ratings";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await listRatings(supabase);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ratings: data ?? [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw =
    typeof body === "object" &&
    body !== null &&
    "rating_value" in body &&
    typeof (body as { rating_value: unknown }).rating_value === "number"
      ? (body as { rating_value: number }).rating_value
      : null;

  if (
    raw === null ||
    !Number.isInteger(raw) ||
    raw < 1 ||
    raw > 10
  ) {
    return NextResponse.json(
      { error: "rating_value must be an integer from 1 to 10" },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await insertRating(supabase, raw);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ rating: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
