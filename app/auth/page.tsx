import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import Auth from "./auth";

export default async function SignUp() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user);
  return <Auth />;
}
