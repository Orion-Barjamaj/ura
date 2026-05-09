"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import style from "./auth.module.css";
import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";

type Mode = "signup" | "signin";
type Role = "patient" | "doctor";

const inter = Inter({ subsets: ["latin"] });

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
    <div className={`${style.container} ${inter.className}`}>
      <main className={style.shell}>
        <section className={style.imagePanel} aria-label="Healthcare preview">
          <div className={style.imageContent}>
            <h2>Healthcare in your pocket</h2>
            <p>Find doctors, track care, and book faster</p>
          </div>
        </section>

        <section className={style.authPanel}>
          <form action="" className={style.form} onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <div className={style.roleGroup} aria-label="Choose role">
                  <label className={style.roleOption}>
                    <input
                      type="radio"
                      name="role"
                      value={"patient"}
                      checked={role === "patient"}
                      onChange={(e) => setRole(e.target.value as Role)}
                    />
                    Pacient
                  </label>
                  <label className={style.roleOption}>
                    <input
                      type="radio"
                      name="role"
                      value={"doctor"}
                      checked={role === "doctor"}
                      onChange={(e) => setRole(e.target.value as Role)}
                    />
                    Doktor
                  </label>
                </div>

                <div className={style.inputContainer}>
                  <label htmlFor="name" className={style.label}>
                    Full name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={style.input}
                    placeholder="Full name"
                    required
                    onChange={(e) => setDisplayName(e.target.value)}
                    value={displayName}
                  />
                </div>

                <div className={style.inputContainer}>
                  <label htmlFor="tel" className={style.label}>
                    Phone number
                  </label>
                  <input
                    type="text"
                    id="tel"
                    name="tel"
                    className={style.input}
                    placeholder="Phone number"
                    required
                    onChange={(e) => setPhone(e.target.value)}
                    value={phone}
                  />
                </div>
              </>
            )}

            <div className={style.inputContainer}>
              <label htmlFor="email" className={style.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={style.input}
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            <div className={style.inputContainer}>
              <label htmlFor="password" className={style.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={style.input}
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>

            {mode === "signup" && (
              <label className={style.terms}>
                <input type="checkbox" required />
                <span>
                  I agree with the <strong>Terms &amp; Condition</strong>
                </span>
              </label>
            )}

            {status && <p className={style.status}>{status}</p>}

            <button className={style.submitButton} type="submit">
              {mode === "signup" ? "Continue" : "Login"}
            </button>

            <p className={style.switchText}>
              {mode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button type="button" onClick={toggleMode}>
                {mode === "signup" ? "Login" : "Sign up"}
              </button>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
