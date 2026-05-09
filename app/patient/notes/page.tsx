"use client";

import Navbar from "@/app/components/navbar";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import style from "../patient.module.css";

type DoctorNote = {
  id: string;
  doctor_name: string;
  note: string;
  created_at: string;
};

export default function PatientNotes() {
  const { profile, loading } = useUser();
  const router = useRouter();
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    if (!loading && profile?.role === "doctor") {
      router.replace("/doctor");
    }
  }, [loading, profile?.role, router]);

  useEffect(() => {
    if (!profile?.id) return;

    let isActive = true;
    const patientId = profile.id;

    async function loadNotes() {
      try {
        const response = await fetch(`/api/patient-notes?patient_id=${patientId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (isActive) {
          setNotes(data.notes ?? []);
        }
      } catch {
        if (isActive) {
          setNotes([]);
        }
      } finally {
        if (isActive) {
          setNotesLoading(false);
        }
      }
    }

    loadNotes();
    const intervalId = window.setInterval(loadNotes, 5000);

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
            <p>Doctor notes</p>
            <h1>Messages</h1>
          </section>

          <section className={style.notesPanel}>
            {notesLoading && (
              <div className="loadingScreen">
                <div className="spinner" />
              </div>
            )}

            {!notesLoading && !notes.length && (
              <p>No doctor notes have been sent yet.</p>
            )}

            {notes.map((note) => (
              <article className={style.noteItem} key={note.id}>
                <div>
                  <p>{note.doctor_name}</p>
                  <span>
                    {new Date(note.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <strong>{note.note}</strong>
              </article>
            ))}
          </section>
        </div>
        <Navbar role="patient" />
      </div>
    </div>
  );
}
