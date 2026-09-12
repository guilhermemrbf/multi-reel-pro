import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type ConnectedAccount = Tables["connected_accounts"]["Row"];
export type MediaAsset = Tables["media_assets"]["Row"];
export type CaptionTemplate = Tables["caption_templates"]["Row"];
export type HashtagGroup = Tables["hashtag_groups"]["Row"];
export type ScheduledPost = Tables["scheduled_posts"]["Row"];
export type PublishLog = Tables["publish_logs"]["Row"];

export type AccountStatus =
  | "active"
  | "token_expiring"
  | "token_expired"
  | "error"
  | "disconnected"
  | "pending";

export type PostStatus = "pending" | "publishing" | "published" | "error" | "cancelled";

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  pending: "Pendente",
  publishing: "Publicando",
  published: "Publicado",
  error: "Erro",
  cancelled: "Cancelado",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Ativa",
  token_expiring: "Acesso expirando",
  token_expired: "Acesso expirado",
  error: "Com erro",
  disconnected: "Desconectada",
  pending: "Aguardando conexão",
};

export const ACCOUNT_ATTENTION_STATUSES: AccountStatus[] = [
  "token_expiring",
  "token_expired",
  "error",
  "disconnected",
];

/** A scheduled post joined with the related media asset and account. */
export type ScheduledPostDetailed = ScheduledPost & {
  media_assets: Pick<MediaAsset, "id" | "original_filename" | "thumbnail_url" | "storage_path"> | null;
  connected_accounts: Pick<ConnectedAccount, "id" | "username" | "account_status"> | null;
  caption_templates: Pick<CaptionTemplate, "id" | "nome" | "texto"> | null;
  hashtag_groups: Pick<HashtagGroup, "id" | "nome" | "hashtags"> | null;
};
