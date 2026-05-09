"use client";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import style from "./measure.module.css";

type Measurement = {
  id: number;
  bpm: number;
  spo2: number;
  created_at: string;
};

function StatCard({ label, value, status }: { label: string; value: string; status: "ok" | "warn" }) {
  return (
    <div className={`${style.statCard} ${status === "warn" ? style.statCardWarn : style.statCardOk}`}>
      <p className={style.statCardLabel}>{label}</p>
      <p className={style.statCardValue}>{value}</p>
    </div>
  );
}

function MeasurementCharts({ measurements }: { measurements: Measurement[] }) {
  const chartData = [...measurements]
    .reverse()
    .slice(-8)
    .map((measurement) => ({
      time: new Date(measurement.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bpm: measurement.bpm,
      spo2: measurement.spo2,
    }));

  return (
    <section className={style.chartSection}>
      <div className={style.chartHeader}>
        <div>
          <h2>Vitals Trend</h2>
          <p>Last {chartData.length} readings</p>
        </div>
      </div>

      <div className={style.chartGrid}>
        <div className={style.chartCard}>
          <div className={style.chartTitleRow}>
            <span>BPM</span>
            <strong>{measurements[0].bpm}</strong>
          </div>
          <div className={style.chartCanvas}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#8490a3", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8490a3", fontSize: 10 }} domain={["dataMin - 8", "dataMax + 8"]} />
                <Tooltip contentStyle={{ border: "0", borderRadius: 10, boxShadow: "0 12px 28px rgba(38, 61, 98, 0.12)" }} />
                <Line type="monotone" dataKey="bpm" stroke="#5C85D9" strokeWidth={3} dot={{ r: 3, fill: "#ffffff", stroke: "#5C85D9", strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={style.chartCard}>
          <div className={style.chartTitleRow}>
            <span>Blood Oxygen</span>
            <strong>{measurements[0].spo2}%</strong>
          </div>
          <div className={style.chartCanvas}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#8490a3", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8490a3", fontSize: 10 }} domain={[80, 100]} />
                <Tooltip contentStyle={{ border: "0", borderRadius: 10, boxShadow: "0 12px 28px rgba(38, 61, 98, 0.12)" }} />
                <Bar dataKey="spo2" fill="#4CB883" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Measurements({ profileId }: { profileId: string }) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadMeasurements() {
      try {
        const response = await fetch(`/api/measurement/${profileId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (isActive) {
          setMeasurements(data.measurements ?? []);
        }
      } catch {
        if (isActive) {
          setMeasurements([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadMeasurements();
    const intervalId = window.setInterval(loadMeasurements, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [profileId]);

  if (loading) return <div className="spinner" />;
  if (!measurements.length) return <p className={style.emptyState}>No measurements yet.</p>;

  const latest = measurements[0];

  return (
    <div className={style.measurements}>
      {/* Latest reading */}
      <div className={style.statCardContainer}>
        <StatCard label="Heart Rate" value={`${latest.bpm} bpm`} status={latest.bpm > 100 || latest.bpm < 50 ? "warn" : "ok"} />
        <StatCard label="SpO2" value={`${latest.spo2}%`} status={latest.spo2 < 94 ? "warn" : "ok"} />
      </div>

      <MeasurementCharts measurements={measurements} />

      {/* History table */}
      <section className={style.historyCard}>
        <div className={style.historyHeader}>
          <h2>History</h2>
          <span>{measurements.length} readings</span>
        </div>

        <table className={style.historyTable}>
          <thead>
            <tr>
              <th>Time</th>
              <th>BPM</th>
              <th>SpO2</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m) => {
              const abnormal = m.bpm > 100 || m.bpm < 50 || m.spo2 < 94;
              return (
                <tr key={m.id}>
                  <td>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td>{m.bpm}</td>
                  <td>{m.spo2}%</td>
                  <td>
                    <span className={`${style.statusBadge} ${abnormal ? style.statusWarning : style.statusNormal}`}>
                      {abnormal ? "Abnormal" : "Normal"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

