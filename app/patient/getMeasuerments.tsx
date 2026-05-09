"use client";
import { useEffect, useState } from "react";
import style from "./measure.module.css";

type Measurement = {
  id: number;
  bpm: number;
  spo2: number;
  created_at: string;
};

const CHART_WIDTH = 320;
const CHART_HEIGHT = 120;
const CHART_PADDING = 12;

function StatCard({ label, value, status }: { label: string; value: string; status: "ok" | "warn" }) {
  return (
    <div className={`${style.statCard} ${status === "warn" ? style.statCardWarn : style.statCardOk}`}>
      <p className={style.statCardLabel}>{label}</p>
      <p className={style.statCardValue}>{value}</p>
    </div>
  );
}

function getPoint(index: number, total: number, value: number, min: number, max: number) {
  const chartWidth = CHART_WIDTH - CHART_PADDING * 2;
  const chartHeight = CHART_HEIGHT - CHART_PADDING * 2;
  const safeRange = max - min || 1;
  const x = total === 1 ? CHART_WIDTH / 2 : CHART_PADDING + (index / (total - 1)) * chartWidth;
  const y = CHART_PADDING + (1 - (value - min) / safeRange) * chartHeight;

  return { x, y };
}

function MeasurementCharts({ measurements }: { measurements: Measurement[] }) {
  const chartData = [...measurements].reverse().slice(-8);
  const bpmValues = chartData.map((m) => m.bpm);
  const oxygenValues = chartData.map((m) => m.spo2);
  const bpmMin = Math.min(...bpmValues) - 6;
  const bpmMax = Math.max(...bpmValues) + 6;
  const oxygenMin = Math.max(80, Math.min(...oxygenValues) - 3);
  const oxygenMax = Math.min(100, Math.max(...oxygenValues) + 2);
  const bpmPoints = chartData.map((m, index) => getPoint(index, chartData.length, m.bpm, bpmMin, bpmMax));
  const bpmPath = bpmPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const barGap = 8;
  const barWidth = Math.max(12, (CHART_WIDTH - CHART_PADDING * 2 - barGap * (chartData.length - 1)) / chartData.length);

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
          <svg className={style.chartSvg} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Heart rate line graph">
            <line x1="12" y1="108" x2="308" y2="108" className={style.chartAxis} />
            <path d={bpmPath} className={style.bpmLine} />
            {bpmPoints.map((point, index) => (
              <circle key={chartData[index].id} cx={point.x} cy={point.y} r="3.5" className={style.bpmPoint} />
            ))}
          </svg>
        </div>

        <div className={style.chartCard}>
          <div className={style.chartTitleRow}>
            <span>Blood Oxygen</span>
            <strong>{measurements[0].spo2}%</strong>
          </div>
          <svg className={style.chartSvg} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Blood oxygen bar graph">
            <line x1="12" y1="108" x2="308" y2="108" className={style.chartAxis} />
            {chartData.map((m, index) => {
              const point = getPoint(index, chartData.length, m.spo2, oxygenMin, oxygenMax);
              const x = chartData.length === 1 ? CHART_WIDTH / 2 - barWidth / 2 : CHART_PADDING + index * (barWidth + barGap);
              const height = CHART_HEIGHT - CHART_PADDING - point.y;

              return (
                <rect
                  key={m.id}
                  x={x}
                  y={point.y}
                  width={barWidth}
                  height={Math.max(4, height)}
                  rx="5"
                  className={style.oxygenBar}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </section>
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

