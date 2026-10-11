-- ============================================
-- MIGRATIONS PARA FISCHER FINANÇAS - FASE 1
-- ============================================

-- 1. Adicionar coluna 'conferido' na tabela lancamentos_cartao
-- ============================================
ALTER TABLE lancamentos_cartao 
ADD COLUMN IF NOT EXISTS conferido boolean DEFAULT false;

-- Criar índice para melhor performance nas consultas por status de conferido
CREATE INDEX IF NOT EXISTS idx_lancamentos_cartao_conferido 
ON lancamentos_cartao(conferido);


-- 2. Criar tabela de Metas
-- ============================================
CREATE TABLE IF NOT EXISTS metas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria text NOT NULL CHECK (categoria IN ('cartoes', 'fixas', 'combustivel', 'total')),
  valor_limite decimal(10, 2) NOT NULL CHECK (valor_limite >= 0),
  mes integer NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano integer NOT NULL CHECK (ano >= 2000),
  notificar_em integer DEFAULT 80 CHECK (notificar_em >= 0 AND notificar_em <= 100),
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraint: uma meta ativa por categoria/mês/ano/usuário
  UNIQUE(user_id, categoria, mes, ano, ativo)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_metas_user_id ON metas(user_id);
CREATE INDEX IF NOT EXISTS idx_metas_mes_ano ON metas(mes, ano);
CREATE INDEX IF NOT EXISTS idx_metas_ativo ON metas(ativo);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_metas_updated_at 
BEFORE UPDATE ON metas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (Row Level Security)
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias metas" 
ON metas FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias metas" 
ON metas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas" 
ON metas FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias metas" 
ON metas FOR DELETE 
USING (auth.uid() = user_id);


-- 3. Adicionar índices para otimização de performance
-- ============================================

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_cartoes_user_mes_ano 
ON cartoes(user_id, mes, ano);

CREATE INDEX IF NOT EXISTS idx_contas_fixas_user_mes_ano 
ON contas_fixas(user_id, mes, ano);

CREATE INDEX IF NOT EXISTS idx_lancamentos_cartao_user_mes_ano 
ON lancamentos_cartao(user_id, mes, ano);

CREATE INDEX IF NOT EXISTS idx_combustivel_user_mes_ano 
ON combustivel(user_id, mes, ano);

CREATE INDEX IF NOT EXISTS idx_entradas_user_mes_ano 
ON entradas(user_id, mes, ano);

-- Índices para ordenação por data
CREATE INDEX IF NOT EXISTS idx_lancamentos_cartao_data_compra 
ON lancamentos_cartao(data_compra DESC);

CREATE INDEX IF NOT EXISTS idx_combustivel_data_abastecimento 
ON combustivel(data_abastecimento DESC);


-- 4. View para facilitar relatórios (opcional)
-- ============================================
CREATE OR REPLACE VIEW vw_resumo_mensal AS
SELECT 
  user_id,
  mes,
  ano,
  SUM(CASE WHEN tipo = 'cartao' THEN valor ELSE 0 END) as total_cartoes,
  SUM(CASE WHEN tipo = 'fixa' THEN valor ELSE 0 END) as total_fixas,
  SUM(CASE WHEN tipo = 'combustivel' THEN valor ELSE 0 END) as total_combustivel,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
  SUM(CASE WHEN tipo != 'entrada' THEN valor ELSE 0 END) as total_saidas,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo
FROM (
  SELECT user_id, mes, ano, valor, 'cartao' as tipo FROM cartoes
  UNION ALL
  SELECT user_id, mes, ano, valor, 'fixa' as tipo FROM contas_fixas
  UNION ALL
  SELECT user_id, mes, ano, valor, 'combustivel' as tipo FROM combustivel
  UNION ALL
  SELECT user_id, mes, ano, valor, 'entrada' as tipo FROM entradas
) dados
GROUP BY user_id, mes, ano;


-- ============================================
-- QUERIES ÚTEIS PARA VERIFICAÇÃO
-- ============================================

-- Verificar se a coluna conferido foi adicionada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'lancamentos_cartao' AND column_name = 'conferido';

-- Verificar se a tabela metas foi criada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'metas';

-- Contar metas por usuário
SELECT user_id, COUNT(*) as total_metas 
FROM metas 
GROUP BY user_id;

-- Ver todos os índices criados
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('metas', 'cartoes', 'contas_fixas', 'lancamentos_cartao', 'combustivel', 'entradas')
ORDER BY tablename, indexname;
