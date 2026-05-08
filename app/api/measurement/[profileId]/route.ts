import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;
    console.log("profileId:", profileId); // check this prints

    const { data, error } = await supabaseAdmin
      .from("measurements")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20);

    console.log("data:", data, "error:", error); // check what comes back

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ measurements: data });
  } catch (err) {
    console.log("CAUGHT:", err); // catches anything unexpected
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}