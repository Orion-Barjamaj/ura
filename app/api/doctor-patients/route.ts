import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctor_id");

  if (!doctorId) {
    return Response.json({ error: "Missing doctor_id" }, { status: 400 });
  }

  const { data: selections, error: selectionError } = await supabaseAdmin
    .from("patient_doctors")
    .select("patient_id, created_at")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });

  if (selectionError) {
    return Response.json({ error: selectionError.message }, { status: 500 });
  }

  const patientIds = (selections ?? []).map((selection) => selection.patient_id);

  if (!patientIds.length) {
    return Response.json({ patients: [] });
  }

  const { data: measurements, error: measurementError } = await supabaseAdmin
    .from("measurements")
    .select("*")
    .in("profile_id", patientIds)
    .order("created_at", { ascending: false });

  if (measurementError) {
    return Response.json({ error: measurementError.message }, { status: 500 });
  }

  const patients = await Promise.all(
    patientIds.map(async (patientId) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(patientId);
      const history = (measurements ?? [])
        .filter((measurement) => measurement.profile_id === patientId)
        .slice(0, 20);

      return {
        id: patientId,
        name:
          data.user?.user_metadata?.display_name ??
          data.user?.email ??
          `Patient ${patientId.slice(0, 8)}`,
        measurements: history,
        latest: history[0] ?? null,
      };
    }),
  );

  return Response.json({ patients });
}
