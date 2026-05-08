"use client";
import { useEffect, useState } from "react";

type Measurement = {
  id: number;
  bpm: number;
  spo2: number;
  created_at: string;
};

function StatCard({ label, value, status }: { label: string; value: string; status: "ok" | "warn" }) {
  return (
    <div style={{
      flex: 1,
      padding: "1rem",
      borderRadius: "var(--border-radius-lg)",
      border: `0.5px solid var(--color-border-tertiary)`,
      background: status === "warn" ? "var(--color-background-warning)" : "var(--color-background-success)"
    }}>
      <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontSize: "22px", fontWeight: 500, margin: 0,
        color: status === "warn" ? "var(--color-text-warning)" : "var(--color-text-success)"
      }}>{value}</p>
    </div>
  );
}

export default function Measurements({ profileId }: { profileId: string }) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/measurement/${profileId}`)
      .then((r) => r.json())
      .then((d) => {
        setMeasurements(d.measurements ?? []);
        setLoading(false);
      });
  }, [profileId]);

  if (loading) return <p>Loading...</p>;
  if (!measurements.length) return <p>No measurements yet.</p>;

  const latest = measurements[0];

  return (
    <div>
      {/* Latest reading */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem" }}>
        <StatCard label="Heart Rate" value={`${latest.bpm} bpm`} status={latest.bpm > 100 || latest.bpm < 50 ? "warn" : "ok"} />
        <StatCard label="SpO2" value={`${latest.spo2}%`} status={latest.spo2 < 94 ? "warn" : "ok"} />
      </div>

      {/* History table */}
      <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "var(--color-text-secondary)", textAlign: "left" }}>
            <th style={{ padding: "8px 0", fontWeight: 500 }}>Time</th>
            <th style={{ padding: "8px 0", fontWeight: 500 }}>BPM</th>
            <th style={{ padding: "8px 0", fontWeight: 500 }}>SpO2</th>
            <th style={{ padding: "8px 0", fontWeight: 500 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m) => {
            const abnormal = m.bpm > 100 || m.bpm < 50 || m.spo2 < 94;
            return (
              <tr key={m.id} style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                <td style={{ padding: "8px 0", color: "var(--color-text-secondary)" }}>
                  {new Date(m.created_at).toLocaleTimeString()}
                </td>
                <td style={{ padding: "8px 0" }}>{m.bpm}</td>
                <td style={{ padding: "8px 0" }}>{m.spo2}%</td>
                <td style={{ padding: "8px 0" }}>
                  <span style={{
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: abnormal ? "var(--color-background-warning)" : "var(--color-background-success)",
                    color: abnormal ? "var(--color-text-warning)" : "var(--color-text-success)"
                  }}>
                    {abnormal ? "Abnormal" : "Normal"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

