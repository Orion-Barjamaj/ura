"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Profile = {
  id: string;
  role: "doctor" | "patient";
  nfc_uid: string | null;
  nfc_registered_at: string | null;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, role, nfc_uid, nfc_registered_at")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Failed to load profile:", error.message);
        setProfile(null);
      } else {
        setProfile(profile);
      }

      setLoading(false);
    }

    load();
  }, [supabase]);

  return { user, profile, loading };
}