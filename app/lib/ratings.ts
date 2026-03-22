import type { SupabaseClient } from "@supabase/supabase-js";

export type DbRating = {
  id: number;
  created_at: string;
  rating_value: number;
};

export async function listRatings(client: SupabaseClient) {
  return client
    .from("ratings")
    .select("id, created_at, rating_value")
    .order("created_at", { ascending: false });
}

export async function insertRating(
  client: SupabaseClient,
  ratingValue: number,
) {
  return client
    .from("ratings")
    .insert({ rating_value: ratingValue })
    .select("id, created_at, rating_value")
    .single();
}
