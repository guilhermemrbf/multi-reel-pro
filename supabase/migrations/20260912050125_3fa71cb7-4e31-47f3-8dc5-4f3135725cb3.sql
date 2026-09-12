DROP POLICY "sp_insert_own" ON public.scheduled_posts;
DROP POLICY "sp_update_own" ON public.scheduled_posts;

CREATE POLICY "sp_insert_own" ON public.scheduled_posts FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.media_assets m WHERE m.id = media_asset_id AND m.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.connected_accounts c WHERE c.id = connected_account_id AND c.user_id = auth.uid())
  AND (caption_template_id IS NULL OR EXISTS (SELECT 1 FROM public.caption_templates t WHERE t.id = caption_template_id AND t.user_id = auth.uid()))
  AND (hashtag_group_id IS NULL OR EXISTS (SELECT 1 FROM public.hashtag_groups h WHERE h.id = hashtag_group_id AND h.user_id = auth.uid()))
);

CREATE POLICY "sp_update_own" ON public.scheduled_posts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.media_assets m WHERE m.id = media_asset_id AND m.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.connected_accounts c WHERE c.id = connected_account_id AND c.user_id = auth.uid())
  AND (caption_template_id IS NULL OR EXISTS (SELECT 1 FROM public.caption_templates t WHERE t.id = caption_template_id AND t.user_id = auth.uid()))
  AND (hashtag_group_id IS NULL OR EXISTS (SELECT 1 FROM public.hashtag_groups h WHERE h.id = hashtag_group_id AND h.user_id = auth.uid()))
);

DROP FUNCTION IF EXISTS public.owns_row(TEXT, UUID);
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;