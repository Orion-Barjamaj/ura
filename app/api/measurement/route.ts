// app/api/measurement/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { profile_id, bpm, spo2 } = await req.json();

  if (!profile_id || !bpm || !spo2) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1. Call FastAPI ANN
  let risk_level = "normal";
  let anomaly_score = 0;

  try {
    const prediction = await fetch(`${process.env.NEXT_PUBLIC_ML_ENDPOINT}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bpm, spo2 })
    }).then(r => r.json());

    risk_level    = prediction.risk_level;
    anomaly_score = prediction.score;
  } catch (err) {
    console.error("FastAPI unreachable, saving without prediction:", err);
  }

  // 2. Save measurement + risk to Supabase
  const { error } = await supabaseAdmin
    .from("measurements")
    .insert({ profile_id, bpm, spo2, risk_level, anomaly_score });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // 3. If anomaly, create alert for doctor
  if (risk_level !== "normal") {
    await supabaseAdmin.from("alerts").insert({
      profile_id,
      risk_level,
      bpm,
      spo2
    });
  }

  return Response.json({ ok: true, risk_level });
}