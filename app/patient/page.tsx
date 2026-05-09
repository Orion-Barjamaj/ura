"use client";

import style from "./patient.module.css";
import { useUser } from "@/hooks/useUser";
import Navbar from "../components/navbar";
import Measurements from "./getMeasuerments";

export default function Patient() {
  const { user, profile, loading } = useUser();

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
          
          <Measurements profileId={profile!.id}/>
        </div>
        <Navbar />
      </div>
    </div>
  );
}
