"use client";

import style from "./patient.module.css";
import { useUser } from "@/hooks/useUser";
import Navbar from "../components/navbar";
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

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PT"
  );
}

export default function Patient() {
  const { user, profile, loading } = useUser();

  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(
    null,
  );
  const [draftNote, setDraftNote] = useState("");
  const [isWritingNote, setIsWritingNote] = useState(false);
  const [noteStatus, setNoteStatus] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    fetch(`/api/doctor-patients?doctor_id=${profile.id}`)
      .then((response) => response.json())
      .then((data) => setPatients(data.patients ?? []))
      .catch(() => setPatients([]));
  }, [profile?.id]);

  if (loading) return <div>Loading...</div>;

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

          <section className={style.panel}>
            <div className={style.sectionHeader}>
              <div>
                <p>Queue</p>
                <h2>Patients watching</h2>
              </div>
              <span>{patients.length} total</span>
            </div>

            <div className={style.patientList}>
              {!patients.length && (
                <p className={style.emptyState}>No patients selected you yet.</p>
              )}
              {patients.map((patient) => {
                const abnormal =
                  patient.latest &&
                  (patient.latest.bpm > 100 ||
                    patient.latest.bpm < 50 ||
                    patient.latest.spo2 < 94);

                return (
                <button
                  className={`${style.patientRow} ${
                    selectedPatient?.id === patient.id ? style.activePatient : ""
                  }`}
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setDraftNote("");
                    setIsWritingNote(false);
                    setNoteStatus("");
                  }}
                  type="button"
                >
                  <div className={style.patientPhoto}>{getInitials(patient.name)}</div>
                  <div>
                    <h3>{patient.name}</h3>
                    <p>
                      {patient.latest
                        ? `${patient.latest.bpm} bpm - ${patient.latest.spo2}% SpO2`
                        : "No measurements yet"}
                    </p>
                  </div>
                  <div className={style.patientMeta}>
                    <strong>
                      {patient.latest
                        ? new Date(patient.latest.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--"}
                    </strong>
                    <span>{abnormal ? "Review" : "Stable"}</span>
                  </div>
                </button>
                );
              })}
            </div>
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
        {selectedPatient && (
          <div
            className={style.modalOverlay}
            onClick={() => setSelectedPatient(null)}
          >
            <section
              className={style.patientDashboard}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className={style.closeButton}
                onClick={() => setSelectedPatient(null)}
                type="button"
                aria-label="Close patient info"
              >
                Close
              </button>

              <div className={style.patientDashboardHeader}>
                <div className={style.patientPhoto}>
                  {getInitials(selectedPatient.name)}
                </div>
                <div>
                  <p>Selected patient</p>
                  <h2>{selectedPatient.name}</h2>
                  <span>
                    {selectedPatient.measurements.length} measurement updates
                  </span>
                </div>
              </div>

              <div className={style.vitalsGrid}>
                <article>
                  <p>Heart rate</p>
                  <strong>{selectedPatient.latest?.bpm ?? "--"}</strong>
                  <span>bpm</span>
                </article>
                <article>
                  <p>SpO2</p>
                  <strong>
                    {selectedPatient.latest ? `${selectedPatient.latest.spo2}%` : "--"}
                  </strong>
                  <span>oxygen</span>
                </article>
                <article>
                  <p>Latest</p>
                  <strong>
                    {selectedPatient.latest
                      ? new Date(selectedPatient.latest.created_at).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "--"}
                  </strong>
                  <span>update</span>
                </article>
              </div>

              <div className={style.historyList}>
                <p>Patient history</p>
                {selectedPatient.measurements.length ? (
                  selectedPatient.measurements.slice(0, 5).map((measurement) => (
                    <div key={measurement.id}>
                      <span>
                        {new Date(measurement.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <strong>
                        {measurement.bpm} bpm - {measurement.spo2}% SpO2
                      </strong>
                    </div>
                  ))
                ) : (
                  <span>No measurement history yet.</span>
                )}
              </div>

              <div className={style.noteCard}>
                <p>Doctor note</p>
                {isWritingNote ? (
                  <form
                    className={style.noteForm}
                    onSubmit={(event) => {
                      event.preventDefault();

                      if (!profile?.id) {
                        setNoteStatus("Doctor profile is not loaded.");
                        return;
                      }

                      if (!draftNote.trim()) {
                        setNoteStatus("Write a note before sending.");
                        return;
                      }

                      setSavingNote(true);
                      setNoteStatus("");

                      fetch("/api/patient-notes", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          patient_id: selectedPatient.id,
                          doctor_id: profile?.id,
                          note: draftNote.trim(),
                        }),
                      })
                        .then(async (response) => {
                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(data.error ?? "Could not send note");
                          }

                          setNoteStatus("Note sent to backend.");
                          setIsWritingNote(false);
                        })
                        .catch((error: Error) => {
                          setNoteStatus(error.message);
                        })
                        .finally(() => {
                          setSavingNote(false);
                        });
                    }}
                  >
                    <textarea
                      value={draftNote}
                      onChange={(event) => setDraftNote(event.target.value)}
                      aria-label="Note for patient"
                    />
                    <button type="submit" disabled={savingNote}>
                      {savingNote ? "Sending..." : "Send to backend"}
                    </button>
                  </form>
                ) : (
                  <>
                    <span>Send a note to this patient.</span>
                    <button
                      className={style.noteButton}
                      onClick={() => setIsWritingNote(true)}
                      type="button"
                    >
                      Add note for patient
                    </button>
                  </>
                )}
                {noteStatus && <strong>{noteStatus}</strong>}
              </div>
            </section>
          </div>
        )}
        <Navbar />
      </div>
    </div>
  );
}
