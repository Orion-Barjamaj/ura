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

type PatientContact = {
  id: string;
  name: string;
  phone: string;
};

export default function Patient() {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [allPatients, setAllPatients] = useState<PatientContact[]>([]);
  const [patientSearch, setPatientSearch] = useState("");

  useEffect(() => {
    if (!loading && profile?.role === "patient") {
      router.replace("/patient");
    }
  }, [loading, profile?.role, router]);

  useEffect(() => {
    if (!profile?.id) return;

    let isActive = true;
    const doctorId = profile.id;

    async function loadPatients() {
      try {
        const response = await fetch(`/api/doctor-patients?doctor_id=${doctorId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (isActive) {
          setPatients(data.patients ?? []);
        }
      } catch {
        if (isActive) {
          setPatients([]);
        }
      }
    }

    loadPatients();
    const intervalId = window.setInterval(loadPatients, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [profile?.id]);

  useEffect(() => {
    let isActive = true;

    async function loadAllPatients() {
      try {
        const response = await fetch("/api/patients", {
          cache: "no-store",
        });
        const data = await response.json();

        if (isActive) {
          setAllPatients(data.patients ?? []);
        }
      } catch {
        if (isActive) {
          setAllPatients([]);
        }
      }
    }

    loadAllPatients();
    const intervalId = window.setInterval(loadAllPatients, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

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
  const normalizedPatientSearch = patientSearch.trim().toLowerCase();
  const filteredPatients = normalizedPatientSearch
    ? allPatients.filter((patient) =>
        `${patient.name} ${patient.phone}`
          .toLowerCase()
          .includes(normalizedPatientSearch),
      )
    : allPatients;

  return (
    <div className={style.mainContainer}>
      <div className={style.container}>
        <div className={style.dashboard}>
          <header className={style.header}>
            <div className={style.headerActions}>
              <div className={style.avatar}>{doctorInitials}</div>
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
            <button
              className={style.callButton}
              onClick={() => {
                if (nextPatient) {
                  window.location.href = `/doctor/queue?patient_id=${nextPatient.id}`;
                }
              }}
              type="button"
            >
              Start
            </button>
          </section>

          <section className={style.patientDirectory}>
            <div className={style.sectionHeader}>
              <div>
                <p>Patient directory</p>
                <h2>All patients</h2>
              </div>
              <span>{filteredPatients.length} shown</span>
            </div>

            <label className={style.patientSearch}>
              <span>Search</span>
              <input
                value={patientSearch}
                onChange={(event) => setPatientSearch(event.target.value)}
                placeholder="Name or phone"
                type="search"
              />
            </label>

            <div className={style.directoryList}>
              {!filteredPatients.length && (
                <p className={style.emptyState}>No patients found.</p>
              )}

              {filteredPatients.map((patient) => (
                <article className={style.directoryRow} key={patient.id}>
                  <div className={style.patientPhoto}>
                    {patient.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "PT"}
                  </div>
                  <div>
                    <h3>{patient.name}</h3>
                    <p>{patient.phone}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
        <Navbar role="doctor" />
      </div>
    </div>
  );
}
