import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/growkit";

export async function getMyProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  // Safety net if the signup trigger has not run yet.
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: userData.user.id, full_name: null })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return created;
}

export async function updateMyProfile(input: {
  full_name: string | null;
  avatar_url: string | null;
}): Promise<Profile> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Sessão expirada. Entre novamente.");
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userData.user.id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
