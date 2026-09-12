import { supabase } from "@/integrations/supabase/client";
import { addMinutes } from "@/lib/format";
import type { PostStatus, ScheduledPostDetailed } from "@/types/growkit";

const DETAIL_SELECT = `*,
  media_assets ( id, original_filename, thumbnail_url, storage_path ),
  connected_accounts ( id, username, account_status ),
  caption_templates ( id, nome, texto ),
  hashtag_groups ( id, nome, hashtags )`;

export type ScheduleDraft = {
  mediaAssetId: string;
  accountIds: string[];
  captionTemplateId: string | null;
  hashtagGroupId: string | null;
  captionOverride: string | null;
  hashtagsOverride: string[] | null;
  /** ISO timestamp of the first publication. */
  startAt: string;
  /** When > 0, each following account is spaced by this many minutes. */
  spacingMinutes: number;
};

export type ScheduledPostFilters = {
  accountId?: string;
  status?: PostStatus | "all";
  from?: string;
  to?: string;
};

export async function createScheduledPosts(draft: ScheduleDraft): Promise<number> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Sessão expirada. Entre novamente.");
  if (draft.accountIds.length === 0) throw new Error("Selecione ao menos uma conta.");

  // One independent row per account — never one row for many accounts.
  const rows = draft.accountIds.map((accountId, index) => ({
    user_id: userData.user!.id,
    media_asset_id: draft.mediaAssetId,
    connected_account_id: accountId,
    caption_template_id: draft.captionTemplateId,
    hashtag_group_id: draft.hashtagGroupId,
    caption_override: draft.captionOverride,
    hashtags_override: draft.hashtagsOverride,
    scheduled_for:
      draft.spacingMinutes > 0 ? addMinutes(draft.startAt, index * draft.spacingMinutes) : draft.startAt,
    status: "pending" as const,
  }));

  const { error, count } = await supabase
    .from("scheduled_posts")
    .insert(rows, { count: "exact" });
  if (error) throw error;
  return count ?? rows.length;
}

export async function listScheduledPosts(
  filters: ScheduledPostFilters = {},
  limit = 100,
): Promise<ScheduledPostDetailed[]> {
  let query = supabase
    .from("scheduled_posts")
    .select(DETAIL_SELECT)
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (filters.accountId) query = query.eq("connected_account_id", filters.accountId);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.from) query = query.gte("scheduled_for", filters.from);
  if (filters.to) query = query.lte("scheduled_for", filters.to);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ScheduledPostDetailed[];
}

export async function listUpcomingPosts(limit = 5): Promise<ScheduledPostDetailed[]> {
  const { data, error } = await supabase
    .from("scheduled_posts")
    .select(DETAIL_SELECT)
    .eq("status", "pending")
    .gte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ScheduledPostDetailed[];
}

export async function listRecentActivity(limit = 6): Promise<ScheduledPostDetailed[]> {
  const { data, error } = await supabase
    .from("scheduled_posts")
    .select(DETAIL_SELECT)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ScheduledPostDetailed[];
}

export async function cancelScheduledPost(id: string): Promise<void> {
  const { error } = await supabase
    .from("scheduled_posts")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw error;
}

export async function deleteScheduledPost(id: string): Promise<void> {
  const { error } = await supabase.from("scheduled_posts").delete().eq("id", id);
  if (error) throw error;
}

export type DashboardStats = {
  accounts: number;
  media: number;
  scheduled: number;
  published: number;
  errors: number;
};

async function countRows(table: "connected_accounts" | "media_assets"): Promise<number> {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function countPosts(status: PostStatus): Promise<number> {
  const { count, error } = await supabase
    .from("scheduled_posts")
    .select("id", { count: "exact", head: true })
    .eq("status", status);
  if (error) throw error;
  return count ?? 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [accounts, media, scheduled, published, errors] = await Promise.all([
    countRows("connected_accounts"),
    countRows("media_assets"),
    countPosts("pending"),
    countPosts("published"),
    countPosts("error"),
  ]);
  return { accounts, media, scheduled, published, errors };
}
