import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { profile_id, bpm, spo2 } = await req.json();

  if (!profile_id || !bpm || !spo2) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("measurements")
    .insert({ profile_id, bpm, spo2 })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, measurement: data });
}