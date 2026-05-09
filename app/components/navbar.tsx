import style from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav className={style.container} aria-label="App navigation">
      <a href="/patient" className={style.link} aria-label="Dashboard">
        <span>D</span>
      </a>
      <a href="/patient/notes" className={style.link} aria-label="Doctor notes">
        <span>N</span>
      </a>
      <a href="/doctor" className={style.link} aria-label="Doctor dashboard">
        <span>Dr</span>
      </a>
    </nav>
  );
}
