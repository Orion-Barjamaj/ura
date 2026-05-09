import style from "./navbar.module.css";

type NavbarRole = "patient" | "doctor";

export default function Navbar({ role }: { role: NavbarRole }) {
  const links =
    role === "patient"
      ? [
          { href: "/patient", label: "Dashboard", text: "D" },
          { href: "/patient/notes", label: "Doctor notes", text: "N" },
        ]
      : [
          { href: "/doctor", label: "Dashboard", text: "D" },
          { href: "/doctor#patients", label: "Patients", text: "P" },
        ];

  return (
    <nav className={style.container} aria-label="App navigation">
      {links.map((link) => (
        <a href={link.href} className={style.link} aria-label={link.label} key={link.href}>
          <span>{link.text}</span>
        </a>
      ))}
    </nav>
  );
}
