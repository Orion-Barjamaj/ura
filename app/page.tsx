import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <nav className={styles.nav} aria-label="Landing navigation">
          <strong>URA Health</strong>
          <Link href="/auth">Sign in</Link>
        </nav>

        <div className={styles.heroContent}>
          <p>Live patient monitoring</p>
          <h1>URA Health</h1>
          <span>
            Track heart rate and SpO2 updates in real time, keep doctors in the
            loop, and make patient check-ins feel calm and immediate.
          </span>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/auth">
              Get started
            </Link>
            <Link className={styles.secondaryAction} href="/patient">
              Patient view
            </Link>
          </div>
        </div>

        <div className={styles.livePanel} aria-label="Example live vitals">
          <div className={styles.panelHeader}>
            <span>Live update</span>
            <strong>Stable</strong>
          </div>
          <div className={styles.vitals}>
            <article>
              <span>Heart rate</span>
              <strong>78</strong>
              <p>bpm</p>
            </article>
            <article>
              <span>SpO2</span>
              <strong>98%</strong>
              <p>oxygen</p>
            </article>
          </div>
          <div className={styles.patientLine}>
            <Image src="/patient.png" alt="" width={42} height={42} aria-hidden="true" />
            <div>
              <strong>Patient dashboard</strong>
              <span>New readings appear automatically</span>
            </div>
          </div>
        </div>
      </section>

      <main className={styles.main}>
        <section className={styles.featureGrid} aria-label="App highlights">
          <article>
            <span>01</span>
            <h2>Patient vitals</h2>
            <p>Patients can see their latest measurements, trends, and history without refreshing the page.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Doctor overview</h2>
            <p>Doctors get a live queue of patients, urgent readings, and contact details in one focused dashboard.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Notes and follow-up</h2>
            <p>Doctor notes are delivered back to the patient view so care instructions stay easy to find.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
