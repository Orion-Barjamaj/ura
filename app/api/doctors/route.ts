import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "doctor");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const doctors = await Promise.all(
    (profiles ?? []).map(async (profile) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(profile.id);

      return {
        id: profile.id,
        name:
          data.user?.user_metadata?.display_name ??
          data.user?.email ??
          `Doctor ${profile.id.slice(0, 8)}`,
      };
    }),
  );

  return Response.json({ doctors });
}
