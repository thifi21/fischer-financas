-- ============================================
-- MIGRATIONS PARA FISCHER FINANÇAS - FASE 6
-- CORREÇÕES DE COLUNAS E NOVA TABELA DE SIMULAÇÕES
-- ============================================

-- 1. Adicionar coluna 'descricao' em tabelas que faltavam para conciliação
ALTER TABLE combustivel ADD COLUMN IF NOT EXISTS descricao text;
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS descricao text;

-- 2. Criar tabela de Simulações de Investimento
CREATE TABLE IF NOT EXISTS simulacoes_investimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nome text NOT NULL,
  modo text NOT NULL,
  valor_inicial numeric DEFAULT 0,
  aporte_mensal numeric DEFAULT 0,
  taxa_mensal numeric DEFAULT 1,
  prazo_meses integer DEFAULT 60,
  meta_valor numeric DEFAULT 0,
  idade_atual integer,
  idade_aposentadoria integer,
  renda_desejada numeric,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS e criar policy
ALTER TABLE simulacoes_investimento ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'simulacoes_investimento' AND policyname = 'Users manage own simulations'
  ) THEN
    CREATE POLICY "Users manage own simulations" ON simulacoes_investimento
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
