import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "patient");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const patients = await Promise.all(
    (profiles ?? []).map(async (profile) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      const metadata = data.user?.user_metadata ?? {};

      return {
        id: profile.id,
        name:
          metadata.display_name ??
          data.user?.email ??
          `Patient ${profile.id.slice(0, 8)}`,
        phone: metadata.phone ?? "No phone number",
      };
    }),
  );

  patients.sort((a, b) => a.name.localeCompare(b.name));

  return Response.json({ patients });
}
