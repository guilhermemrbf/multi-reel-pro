import { supabase } from "@/integrations/supabase/client";
import type { HashtagGroup } from "@/types/growkit";

export type HashtagGroupInput = {
  nome: string;
  nicho: string | null;
  hashtags: string[];
};

export async function listHashtagGroups(): Promise<HashtagGroup[]> {
  const { data, error } = await supabase
    .from("hashtag_groups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createHashtagGroup(input: HashtagGroupInput): Promise<HashtagGroup> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Sessão expirada. Entre novamente.");
  const { data, error } = await supabase
    .from("hashtag_groups")
    .insert({ ...input, user_id: userData.user.id })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateHashtagGroup(id: string, input: HashtagGroupInput): Promise<HashtagGroup> {
  const { data, error } = await supabase
    .from("hashtag_groups")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHashtagGroup(id: string): Promise<void> {
  const { error } = await supabase.from("hashtag_groups").delete().eq("id", id);
  if (error) throw error;
}
