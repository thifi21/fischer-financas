-- ============================================
-- 006 — Chat do Telegram por usuário
-- Permite que cada usuário receba os alertas no seu próprio chat.
-- Se NULL, o sistema usa a variável de ambiente TELEGRAM_CHAT_ID.
-- ============================================

ALTER TABLE preferencias_usuario
  ADD COLUMN IF NOT EXISTS telegram_chat_id text;
