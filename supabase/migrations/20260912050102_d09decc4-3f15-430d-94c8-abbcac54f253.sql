CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ig_user_id TEXT,
  username TEXT,
  facebook_page_id TEXT,
  account_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (account_status IN ('active','token_expiring','token_expired','error','disconnected','pending')),
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX connected_accounts_user_id_idx ON public.connected_accounts(user_id);
CREATE INDEX connected_accounts_status_idx ON public.connected_accounts(user_id, account_status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connected_accounts TO authenticated;
GRANT ALL ON public.connected_accounts TO service_role;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ca_select_own" ON public.connected_accounts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ca_insert_own" ON public.connected_accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ca_update_own" ON public.connected_accounts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "ca_delete_own" ON public.connected_accounts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER connected_accounts_updated_at BEFORE UPDATE ON public.connected_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  duration_seconds NUMERIC,
  thumbnail_url TEXT,
  original_filename TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX media_assets_user_created_idx ON public.media_assets(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ma_select_own" ON public.media_assets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ma_insert_own" ON public.media_assets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ma_update_own" ON public.media_assets FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "ma_delete_own" ON public.media_assets FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER media_assets_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.caption_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nicho TEXT,
  nome TEXT NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX caption_templates_user_idx ON public.caption_templates(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caption_templates TO authenticated;
GRANT ALL ON public.caption_templates TO service_role;
ALTER TABLE public.caption_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ct_select_own" ON public.caption_templates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ct_insert_own" ON public.caption_templates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ct_update_own" ON public.caption_templates FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "ct_delete_own" ON public.caption_templates FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER caption_templates_updated_at BEFORE UPDATE ON public.caption_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hashtag_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nicho TEXT,
  nome TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX hashtag_groups_user_idx ON public.hashtag_groups(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hashtag_groups TO authenticated;
GRANT ALL ON public.hashtag_groups TO service_role;
ALTER TABLE public.hashtag_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hg_select_own" ON public.hashtag_groups FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "hg_insert_own" ON public.hashtag_groups FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "hg_update_own" ON public.hashtag_groups FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "hg_delete_own" ON public.hashtag_groups FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER hashtag_groups_updated_at BEFORE UPDATE ON public.hashtag_groups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_row(_table TEXT, _id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE ok BOOLEAN;
BEGIN
  IF _id IS NULL THEN RETURN TRUE; END IF;
  IF _table NOT IN ('media_assets','connected_accounts','caption_templates','hashtag_groups') THEN
    RETURN FALSE;
  END IF;
  EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I WHERE id = $1 AND user_id = $2)', _table)
    INTO ok USING _id, auth.uid();
  RETURN COALESCE(ok, FALSE);
END; $$;

CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  connected_account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  caption_template_id UUID REFERENCES public.caption_templates(id) ON DELETE SET NULL,
  hashtag_group_id UUID REFERENCES public.hashtag_groups(id) ON DELETE SET NULL,
  caption_override TEXT,
  hashtags_override TEXT[],
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','publishing','published','error','cancelled')),
  ig_container_id TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX scheduled_posts_user_idx ON public.scheduled_posts(user_id);
CREATE INDEX scheduled_posts_scheduled_for_idx ON public.scheduled_posts(scheduled_for);
CREATE INDEX scheduled_posts_status_idx ON public.scheduled_posts(status);
CREATE INDEX scheduled_posts_account_idx ON public.scheduled_posts(connected_account_id);
CREATE INDEX scheduled_posts_queue_idx ON public.scheduled_posts(status, scheduled_for);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_posts TO authenticated;
GRANT ALL ON public.scheduled_posts TO service_role;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sp_select_own" ON public.scheduled_posts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "sp_insert_own" ON public.scheduled_posts FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND public.owns_row('media_assets', media_asset_id)
  AND public.owns_row('connected_accounts', connected_account_id)
  AND public.owns_row('caption_templates', caption_template_id)
  AND public.owns_row('hashtag_groups', hashtag_group_id)
);
CREATE POLICY "sp_update_own" ON public.scheduled_posts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (
  user_id = auth.uid()
  AND public.owns_row('media_assets', media_asset_id)
  AND public.owns_row('connected_accounts', connected_account_id)
  AND public.owns_row('caption_templates', caption_template_id)
  AND public.owns_row('hashtag_groups', hashtag_group_id)
);
CREATE POLICY "sp_delete_own" ON public.scheduled_posts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER scheduled_posts_updated_at BEFORE UPDATE ON public.scheduled_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.publish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_post_id UUID NOT NULL REFERENCES public.scheduled_posts(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  status TEXT NOT NULL,
  response_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX publish_logs_user_idx ON public.publish_logs(user_id, created_at DESC);
CREATE INDEX publish_logs_post_idx ON public.publish_logs(scheduled_post_id);
GRANT SELECT ON public.publish_logs TO authenticated;
GRANT ALL ON public.publish_logs TO service_role;
ALTER TABLE public.publish_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pl_select_own" ON public.publish_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.account_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX arl_account_window_idx ON public.account_rate_limits(connected_account_id, published_at DESC);
CREATE INDEX arl_user_idx ON public.account_rate_limits(user_id);
GRANT SELECT ON public.account_rate_limits TO authenticated;
GRANT ALL ON public.account_rate_limits TO service_role;
ALTER TABLE public.account_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "arl_select_own" ON public.account_rate_limits FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "media_assets_read_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_assets_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_assets_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_assets_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media-assets' AND (storage.foldername(name))[1] = auth.uid()::text);