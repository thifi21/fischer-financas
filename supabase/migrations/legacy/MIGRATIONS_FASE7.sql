-- ============================================
-- MIGRATIONS PARA FISCHER FINANÇAS - FASE 7
-- PREFERÊNCIAS DO USUÁRIO + HISTÓRICO DE NOTIFICAÇÕES
-- ============================================

-- 1. Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS preferencias_usuario (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  hora_envio_lembretes integer DEFAULT 9,       -- hora Brasília (0-23)
  dias_antecedencia_lembrete integer DEFAULT 1, -- quantos dias antes notificar
  notificar_cartoes boolean DEFAULT true,
  notificar_fixas boolean DEFAULT true,
  notificar_metas boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE preferencias_usuario ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'preferencias_usuario' AND policyname = 'Users manage own prefs'
  ) THEN
    CREATE POLICY "Users manage own prefs" ON preferencias_usuario
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Tabela de histórico de notificações enviadas
CREATE TABLE IF NOT EXISTS historico_notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  canal text NOT NULL CHECK (canal IN ('telegram', 'whatsapp')),
  titulo text NOT NULL,
  mensagem text NOT NULL,
  status text NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado', 'falhou')),
  erro text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historico_notificacoes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'historico_notificacoes' AND policyname = 'Users view own history'
  ) THEN
    CREATE POLICY "Users view own history" ON historico_notificacoes
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Índice para busca por user_id + data (paginação eficiente)
CREATE INDEX IF NOT EXISTS idx_historico_notificacoes_user_created
  ON historico_notificacoes (user_id, created_at DESC);
