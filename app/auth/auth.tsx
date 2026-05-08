"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import style from "./auth.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "signup" | "signin";
type Role = "patient" | "doctor";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const [status, setStatus] = useState("");
  const supabase = getSupabaseBrowserClient();

  const router = useRouter();

  useEffect(() => {
    console.log(role);
  }, [role]);

  function toggleMode() {
    setMode((currentMode) =>
      currentMode === "signup" ? "signin" : "signup"
    );
    setStatus("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");

    if (mode === "signup") {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        phone: phone,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      console.log(data);

      const user = data.user;

      if (!user) {
        setStatus("No user returned");
        return;
      }

      const profile = {
        id: user.id,
        role,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([profile]);

      if (profileError) {
        console.log(profileError);
        setStatus(profileError.message);
        return;
      }

      if (role === "patient") router.push("/patient");
      else router.push("/doctor");
    } else {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      console.log(data);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        setStatus(profileError.message);
        return;
      }

      if (profile?.role === "patient") router.push("/patient");
      else router.push("/doctor");
    }
  }

  return (
    <div className={style.container}>
      <form action="" className={style.form} onSubmit={handleSubmit}>
        {mode === "signup" && (
          <>
            <div className={style.inputContainer}>
              <label htmlFor="name" className={style.label}>
                Roli:
              </label>
              <div className={style.radioContainer}>
                <input
                  type="radio"
                  id="patient"
                  name="role"
                  value={"patient"}
                  className={style.input}
                  checked={role === "patient"}
                  onChange={(e) => setRole(e.target.value as Role)}
                />
                <label htmlFor="patient">Pacient</label>
              </div>
              <div className={style.radioContainer}>
                <input
                  type="radio"
                  id="doctor"
                  name="role"
                  value={"doctor"}
                  className={style.input}
                  checked={role === "doctor"}
                  onChange={(e) => setRole(e.target.value as Role)}
                />
                <label htmlFor="doctor">Doktor</label>
              </div>
            </div>
            <div className={style.inputContainer}>
              <label htmlFor="name" className={style.label}>
                Emri i plote:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={style.input}
                required
                onChange={(e) => setDisplayName(e.target.value)}
                value={displayName}
              />
            </div>
            <div className={style.inputContainer}>
              <label htmlFor="tel" className={style.label}>
                Numri i telefonit:
              </label>
              <input
                type="text"
                id="tel"
                name="tel"
                className={style.input}
                required
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
              />
            </div>
          </>
        )}
        <div className={style.inputContainer}>
          <label htmlFor="email" className={style.label}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={style.input}
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className={style.inputContainer}>
          <label htmlFor="password" className={style.label}>
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={style.input}
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        {status && <p>{status}</p>}
        <button type="submit">
          {mode === "signup" ? "Krijo Llogari" : "Hyr"}
        </button>
        <button type="button" onClick={toggleMode}>
          {mode === "signup" ? "Ke llogari? Hyr" : "Ska llogari? Regjistrohu"}
        </button>
      </form>
    </div>
  );
}
