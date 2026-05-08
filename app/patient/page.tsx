"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import Measurements from "./getMeasuerments";

export default function Patient() {
  const { user, profile, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  console.log(profile);

  return (
    <div>
      <h1>{user?.user_metadata?.display_name ?? "Patient"}</h1>
      <Measurements profileId={profile!.id} />
    </div>
  );
}