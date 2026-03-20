-- Habilitar RLS (Row Level Security)
-- Execute este arquivo no SQL Editor do Supabase

-- Tabela de entradas (salários/receitas)
CREATE TABLE IF NOT EXISTS entradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL DEFAULT 2026,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  categoria TEXT DEFAULT 'salario',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cartões de crédito (totais por mês)
CREATE TABLE IF NOT EXISTS cartoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL DEFAULT 2026,
  nome TEXT NOT NULL,
  vencimento TEXT,
  valor NUMERIC(10,2) DEFAULT 0,
  pago BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de lançamentos de cartão (itens detalhados)
CREATE TABLE IF NOT EXISTS lancamentos_cartao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cartao_id UUID REFERENCES cartoes(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL DEFAULT 2026,
  data_compra DATE,
  local TEXT NOT NULL,
  parcela TEXT,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de contas fixas
CREATE TABLE IF NOT EXISTS contas_fixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL DEFAULT 2026,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_vencimento DATE,
  valor NUMERIC(10,2) DEFAULT 0,
  pago BOOLEAN DEFAULT FALSE,
  parcela TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de combustível
CREATE TABLE IF NOT EXISTS combustivel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL DEFAULT 2026,
  data_abastecimento DATE,
  litros NUMERIC(8,3),
  valor NUMERIC(8,2) NOT NULL,
  km INTEGER,
  preco_litro NUMERIC(6,3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_cartao ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE combustivel ENABLE ROW LEVEL SECURITY;

-- Policies: cada usuário só acessa seus próprios dados
CREATE POLICY "entradas_own" ON entradas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cartoes_own" ON cartoes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lancamentos_own" ON lancamentos_cartao FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contas_fixas_own" ON contas_fixas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "combustivel_own" ON combustivel FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entradas BEFORE UPDATE ON entradas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cartoes BEFORE UPDATE ON cartoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contas_fixas BEFORE UPDATE ON contas_fixas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
