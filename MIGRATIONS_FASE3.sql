-- ============================================================
-- MIGRATIONS FASE 3 — FISCHER FINANÇAS
-- Execute este arquivo no painel SQL do Supabase
-- ============================================================

-- ── 1. MODO FAMÍLIA / COMPARTILHADO ─────────────────────────

-- Grupos familiares
CREATE TABLE IF NOT EXISTS grupos_familia (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  dono_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo_convite text UNIQUE DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Membros dos grupos
CREATE TABLE IF NOT EXISTS membros_familia (
  grupo_id uuid NOT NULL REFERENCES grupos_familia(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_membro text,
  nome_membro text,
  papel text NOT NULL DEFAULT 'membro' CHECK (papel IN ('admin', 'membro')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (grupo_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_grupos_familia_dono ON grupos_familia(dono_id);
CREATE INDEX IF NOT EXISTS idx_membros_familia_user ON membros_familia(user_id);
CREATE INDEX IF NOT EXISTS idx_membros_familia_grupo ON membros_familia(grupo_id);

-- RLS: grupos_familia
ALTER TABLE grupos_familia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver grupos onde é membro ou dono"
  ON grupos_familia FOR SELECT
  USING (
    auth.uid() = dono_id
    OR auth.uid() IN (
      SELECT user_id FROM membros_familia WHERE grupo_id = id
    )
  );

CREATE POLICY "Criar seu próprio grupo"
  ON grupos_familia FOR INSERT
  WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Dono pode atualizar grupo"
  ON grupos_familia FOR UPDATE
  USING (auth.uid() = dono_id);

CREATE POLICY "Dono pode deletar grupo"
  ON grupos_familia FOR DELETE
  USING (auth.uid() = dono_id);

-- RLS: membros_familia
ALTER TABLE membros_familia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver membros do seu grupo"
  ON membros_familia FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT dono_id FROM grupos_familia WHERE id = grupo_id
    )
  );

CREATE POLICY "Entrar em grupos (insert próprio user_id)"
  ON membros_familia FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dono pode remover membros"
  ON membros_familia FOR DELETE
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT dono_id FROM grupos_familia WHERE id = grupo_id
    )
  );

-- Trigger updated_at em grupos_familia
CREATE TRIGGER update_grupos_familia_updated_at
  BEFORE UPDATE ON grupos_familia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 2. OPEN FINANCE (SIMULADOR OFX/CSV) ────────────────────

-- Registros de importações
CREATE TABLE IF NOT EXISTS importacoes_ofx (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banco text,
  arquivo_nome text,
  total_lancamentos integer DEFAULT 0,
  sincronizados integer DEFAULT 0,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'sincronizado', 'cancelado')),
  created_at timestamptz DEFAULT now()
);

-- Lançamentos importados via OFX/CSV
CREATE TABLE IF NOT EXISTS lancamentos_importados (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  importacao_id uuid REFERENCES importacoes_ofx(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_transacao date,
  descricao text NOT NULL,
  valor decimal(10, 2) NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('debito', 'credito')),
  categoria text DEFAULT 'outros',
  destino text DEFAULT 'nao_sincronizado' CHECK (destino IN ('nao_sincronizado', 'cartoes', 'contas_fixas', 'entradas', 'ignorado')),
  sincronizado boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_importacoes_ofx_user ON importacoes_ofx(user_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_importados_user ON lancamentos_importados(user_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_importados_importacao ON lancamentos_importados(importacao_id);

-- RLS: importacoes_ofx
ALTER TABLE importacoes_ofx ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem suas importações"
  ON importacoes_ofx FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam suas importações"
  ON importacoes_ofx FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam suas importações"
  ON importacoes_ofx FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam suas importações"
  ON importacoes_ofx FOR DELETE USING (auth.uid() = user_id);

-- RLS: lancamentos_importados
ALTER TABLE lancamentos_importados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seus lançamentos importados"
  ON lancamentos_importados FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam seus lançamentos importados"
  ON lancamentos_importados FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam seus lançamentos importados"
  ON lancamentos_importados FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam seus lançamentos importados"
  ON lancamentos_importados FOR DELETE USING (auth.uid() = user_id);


-- ── 3. VERIFICAÇÃO FINAL ─────────────────────────────────────

-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'grupos_familia',
    'membros_familia',
    'importacoes_ofx',
    'lancamentos_importados'
  )
ORDER BY table_name;
