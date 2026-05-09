import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient_id");

  if (!patientId) {
    return Response.json({ error: "Missing patient_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("patient_doctors")
    .select("doctor_id")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ doctor_id: data?.doctor_id ?? null });
}

export async function POST(req: Request) {
  const { patient_id, doctor_id } = await req.json();

  if (!patient_id || !doctor_id) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("patient_doctors")
    .upsert({ patient_id, doctor_id }, { onConflict: "patient_id" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, selection: data });
}
