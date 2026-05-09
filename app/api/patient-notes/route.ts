import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient_id");

  if (!patientId) {
    return Response.json({ error: "Missing patient_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("notes")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ notes: data });
}

export async function POST(req: Request) {
  const { patient_id, doctor_id, note } = await req.json();

  if (!patient_id || !doctor_id || !note) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("notes")
    .insert({ patient_id, doctor_id, note })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, note: data });
}
