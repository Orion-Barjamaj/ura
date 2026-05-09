import Image from "next/image";
import style from "./navbar.module.css";

type NavbarRole = "patient" | "doctor";
type NavbarLink = {
  href: string;
  label: string;
  text: string;
  icon?: string;
};

export default function Navbar({ role }: { role: NavbarRole }) {
  const links: NavbarLink[] =
    role === "patient"
      ? [
          { href: "/patient", label: "Dashboard", text: "D", icon: "/user.png" },
          { href: "/patient/notes", label: "Doctor notes", text: "N", icon: "/wirte.png" },
        ]
      : [
          { href: "/doctor", label: "Dashboard", text: "D", icon: "/user.png" },
          { href: "/doctor/queue", label: "Patients", text: "P", icon: "/patient.png"  },
        ];

  return (
    <nav className={style.container} aria-label="App navigation">
      {links.map((link) => (
        <a href={link.href} className={style.link} aria-label={link.label} key={link.href}>
          {link.icon ? (
            <Image
              src={link.icon}
              alt=""
              width={26}
              height={26}
              className={style.icon}
              aria-hidden="true"
            />
          ) : (
            <span>{link.text}</span>
          )}
        </a>
      ))}
    </nav>
  );
}
