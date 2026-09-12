import { supabase } from "@/integrations/supabase/client";
import type { CaptionTemplate } from "@/types/growkit";

export type CaptionTemplateInput = {
  nome: string;
  texto: string;
  nicho: string | null;
};

export async function listCaptionTemplates(): Promise<CaptionTemplate[]> {
  const { data, error } = await supabase
    .from("caption_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCaptionTemplate(input: CaptionTemplateInput): Promise<CaptionTemplate> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Sessão expirada. Entre novamente.");
  const { data, error } = await supabase
    .from("caption_templates")
    .insert({ ...input, user_id: userData.user.id })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCaptionTemplate(
  id: string,
  input: CaptionTemplateInput,
): Promise<CaptionTemplate> {
  const { data, error } = await supabase
    .from("caption_templates")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCaptionTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("caption_templates").delete().eq("id", id);
  if (error) throw error;
}
