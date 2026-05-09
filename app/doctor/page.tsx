"use client";

import style from "./patient.module.css";
import { useUser } from "@/hooks/useUser";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Measurement = {
  id: number;
  bpm: number;
  spo2: number;
  created_at: string;
};

type DoctorPatient = {
  id: string;
  name: string;
  measurements: Measurement[];
  latest: Measurement | null;
};

export default function Patient() {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  const [patients, setPatients] = useState<DoctorPatient[]>([]);

  useEffect(() => {
    if (!loading && profile?.role === "patient") {
      router.replace("/patient");
    }
  }, [loading, profile?.role, router]);

  useEffect(() => {
    if (!profile?.id) return;

    fetch(`/api/doctor-patients?doctor_id=${profile.id}`)
      .then((response) => response.json())
      .then((data) => setPatients(data.patients ?? []))
      .catch(() => setPatients([]));
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="spinner" />
      </div>
    );
  }

  const doctorName = String(
    user?.user_metadata?.display_name ?? "Dr. Adrian William",
  );
  const doctorInitials =
    doctorName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AW";
  const urgentCount = patients.filter(
    (patient) =>
      patient.latest &&
      (patient.latest.bpm > 100 ||
        patient.latest.bpm < 50 ||
        patient.latest.spo2 < 94),
  ).length;
  const stableCount = patients.length - urgentCount;
  const stablePercent = patients.length
    ? Math.round((stableCount / patients.length) * 100)
    : 0;
  const nextPatient = patients[0];

  return (
    <div className={style.mainContainer}>
      <div className={style.container}>
        <div className={style.dashboard}>
          <header className={style.header}>
            <div className={style.headerActions}>
              <div className={style.avatar}>{doctorInitials}</div>
              <button className={style.alertButton} aria-label="Notifications">
                <span />
              </button>
            </div>
          </header>

          <section className={style.hero}>
            <p>Doctor dashboard</p>
            <h1>Today&apos;s overview</h1>
          </section>

          <section className={style.statsGrid}>
            <article className={style.statCard}>
              <span>{patients.length}</span>
              <strong>Patients</strong>
              <p>Selected you</p>
            </article>
            <article className={style.statCard}>
              <span>{urgentCount}</span>
              <strong>Urgent</strong>
              <p>Need review</p>
            </article>
            <article className={style.statCard}>
              <span>{stablePercent}%</span>
              <strong>Stable</strong>
              <p>Avg status</p>
            </article>
          </section>

          <section className={style.doctorCard}>
            <div>
              <p>Latest patient update</p>
              <h2>{nextPatient?.name ?? "No patients yet"}</h2>
              <span>
                {nextPatient?.latest
                  ? `${nextPatient.latest.bpm} bpm - ${nextPatient.latest.spo2}% SpO2`
                  : "Patients will appear here after selecting you"}
              </span>
            </div>
            <button className={style.callButton}>Start</button>
          </section>

          <section className={style.quickGrid}>
            <article>
              <p>Messages</p>
              <strong>8 unread</strong>
            </article>
            <article>
              <p>Reports</p>
              <strong>5 pending</strong>
            </article>
          </section>
        </div>
        <Navbar role="doctor" />
      </div>
    </div>
  );
}
