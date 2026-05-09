"use client";

import Navbar from "@/app/components/navbar";
import { useUser } from "@/hooks/useUser";
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
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    fetch(`/api/patient-notes?patient_id=${profile.id}`)
      .then((response) => response.json())
      .then((data) => setNotes(data.notes ?? []))
      .finally(() => setNotesLoading(false));
  }, [profile?.id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={style.mainContainer}>
      <div className={style.container}>
        <div className={style.dashboard}>
          <section className={style.hero}>
            <p>Doctor notes</p>
            <h1>Messages</h1>
          </section>

          <section className={style.notesPanel}>
            {notesLoading && <p>Loading notes...</p>}

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
        <Navbar />
      </div>
    </div>
  );
}
