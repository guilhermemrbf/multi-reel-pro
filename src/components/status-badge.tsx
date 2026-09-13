import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_STATUS_LABELS,
  POST_STATUS_LABELS,
  type AccountStatus,
  type PostStatus,
} from "@/types/growkit";

const TONE = {
  neutral: "border-border bg-secondary text-secondary-foreground",
  success: "border-transparent bg-success/15 text-success",
  warning: "border-transparent bg-warning/15 text-warning",
  danger: "border-transparent bg-destructive/15 text-destructive",
  info: "border-transparent bg-info/15 text-info",
} as const;

const ACCOUNT_TONE: Record<AccountStatus, keyof typeof TONE> = {
  active: "success",
  token_expiring: "warning",
  token_expired: "danger",
  error: "danger",
  disconnected: "neutral",
  pending: "neutral",
};

const POST_TONE: Record<PostStatus, keyof typeof TONE> = {
  pending: "info",
  publishing: "warning",
  published: "success",
  error: "danger",
  cancelled: "neutral",
};

export function AccountStatusBadge({ status }: { status: string }) {
  const key = (status as AccountStatus) in ACCOUNT_STATUS_LABELS ? (status as AccountStatus) : "pending";
  return (
    <Badge variant="outline" className={cn("font-normal", TONE[ACCOUNT_TONE[key]])}>
      {ACCOUNT_STATUS_LABELS[key]}
    </Badge>
  );
}

export function PostStatusBadge({ status }: { status: string }) {
  const key = (status as PostStatus) in POST_STATUS_LABELS ? (status as PostStatus) : "pending";
  return (
    <Badge variant="outline" className={cn("font-normal", TONE[POST_TONE[key]])}>
      {POST_STATUS_LABELS[key]}
    </Badge>
  );
}
