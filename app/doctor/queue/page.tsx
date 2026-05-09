"use client";

import Navbar from "@/app/components/navbar";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import style from "../patient.module.css";

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

export default function DoctorQueue() {
  const { profile, loading } = useUser();
  const router = useRouter();
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(
    null,
  );
  const [draftNote, setDraftNote] = useState("");
  const [isWritingNote, setIsWritingNote] = useState(false);
  const [noteStatus, setNoteStatus] = useState("");
  const [savingNote, setSavingNote] = useState(false);

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
        const nextPatients = data.patients ?? [];
        const patientId = new URLSearchParams(window.location.search).get(
          "patient_id",
        );

        if (isActive) {
          setPatients(nextPatients);
          setSelectedPatient((currentPatient) => {
            if (patientId) {
              return (
                nextPatients.find(
                  (patient: DoctorPatient) => patient.id === patientId,
                ) ?? null
              );
            }

            if (!currentPatient) return null;
            return (
              nextPatients.find(
                (patient: DoctorPatient) => patient.id === currentPatient.id,
              ) ?? currentPatient
            );
          });
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

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className={style.mainContainer}>
      <div className={style.container}>
        <div className={style.dashboard}>
          <section className={style.hero}>
            <p>Doctor queue</p>
            <h1>Patients</h1>
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
                      selectedPatient?.id === patient.id
                        ? style.activePatient
                        : ""
                    } ${abnormal ? style.urgentPatient : ""}`}
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setDraftNote("");
                      setIsWritingNote(false);
                      setNoteStatus("");
                    }}
                    type="button"
                  >
                    <div className={style.patientPhoto}>
                      {getInitials(patient.name)}
                    </div>
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
                          ? new Date(
                              patient.latest.created_at,
                            ).toLocaleTimeString([], {
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
                    {selectedPatient.latest
                      ? `${selectedPatient.latest.spo2}%`
                      : "--"}
                  </strong>
                  <span>oxygen</span>
                </article>
                <article>
                  <p>Latest</p>
                  <strong>
                    {selectedPatient.latest
                      ? new Date(
                          selectedPatient.latest.created_at,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
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
                          doctor_id: profile.id,
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
                          setDraftNote("");
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

        <Navbar role="doctor" />
      </div>
    </div>
  );
}
