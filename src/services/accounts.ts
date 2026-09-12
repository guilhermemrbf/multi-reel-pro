import { supabase } from "@/integrations/supabase/client";
import type { ConnectedAccount } from "@/types/growkit";

export async function listConnectedAccounts(): Promise<ConnectedAccount[]> {
  const { data, error } = await supabase
    .from("connected_accounts")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function deleteConnectedAccount(id: string): Promise<void> {
  const { error } = await supabase.from("connected_accounts").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Meta / Instagram integration seam (Phase 2).
 *
 * No OAuth flow, tokens or Meta API calls exist in Phase 1 — on purpose.
 * When the real integration lands, the authorization redirect and the token
 * exchange must live entirely on the server side (server functions), never in
 * this browser module.
 */
export const instagramIntegration = {
  isAvailable: false as const,
  startConnection(): never {
    throw new Error("A conexão com o Instagram será liberada na próxima fase do GrowKit.");
  },
};
