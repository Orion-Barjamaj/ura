"use client";

import style from "./patient.module.css";
import { useUser } from "@/hooks/useUser";
import Navbar from "../components/navbar";
import Measurements from "./getMeasuerments";
import { useEffect, useState } from "react";

type Doctor = {
  id: string;
  name: string;
};

export default function Patient() {
  const { user, profile, loading } = useUser();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorStatus, setDoctorStatus] = useState("");

  useEffect(() => {
    fetch("/api/doctors")
      .then((response) => response.json())
      .then((data) => setDoctors(data.doctors ?? []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    fetch(`/api/patient-doctor?patient_id=${profile.id}`)
      .then((response) => response.json())
      .then((data) => setSelectedDoctorId(data.doctor_id ?? ""))
      .catch(() => setSelectedDoctorId(""));
  }, [profile?.id]);

  if (loading) return <div>Loading...</div>;

  const patientName = String(
    user?.user_metadata?.display_name ?? "Drake White",
  );
  const patientInitials =
    patientName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DW";

  return (
    <div className={style.mainContainer}>
      <div className={style.container}>
        <div className={style.dashboard}>
          <header className={style.header}>
            <div className={style.headerActions}>
              <div className={style.avatar}>{patientInitials}</div>
              <button className={style.alertButton} aria-label="Notifications">
              </button>
            </div>
          </header>

          <section className={style.hero}>
            <p>Patient Management</p>
            <h1>Dashboard</h1>
          </section>

          <section className={style.doctorSelectCard}>
            <div>
              <p>Your doctor</p>
              <h2>Choose who gets your updates</h2>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();

                if (!profile?.id || !selectedDoctorId) {
                  setDoctorStatus("Select a doctor first.");
                  return;
                }

                setDoctorStatus("Saving...");

                fetch("/api/patient-doctor", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    patient_id: profile.id,
                    doctor_id: selectedDoctorId,
                  }),
                })
                  .then(async (response) => {
                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.error ?? "Could not save doctor");
                    }

                    setDoctorStatus("Doctor selected. They will see your changes.");
                  })
                  .catch((error: Error) => {
                    setDoctorStatus(error.message);
                  });
              }}
            >
              <select
                value={selectedDoctorId}
                onChange={(event) => {
                  setSelectedDoctorId(event.target.value);
                  setDoctorStatus("");
                }}
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option value={doctor.id} key={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
              <button type="submit">Save doctor</button>
            </form>
            {doctorStatus && <span>{doctorStatus}</span>}
          </section>
          
          <Measurements profileId={profile!.id}/>
        </div>
        <Navbar />
      </div>
    </div>
  );
}
