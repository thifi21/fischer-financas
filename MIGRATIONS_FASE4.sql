-- ============================================
-- MIGRATIONS PARA FISCHER FINANÇAS - FASE 4
-- PLANEJAMENTO DE SONHOS E OBJETIVOS
-- ============================================

-- 1. Criar tabela de Sonhos (Objetivos de Longo Prazo)
-- ============================================
CREATE TABLE IF NOT EXISTS sonhos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  valor_alvo decimal(12, 2) NOT NULL CHECK (valor_alvo > 0),
  valor_atual decimal(12, 2) DEFAULT 0 CHECK (valor_atual >= 0),
  data_limite date,
  icone text DEFAULT '🎯',
  cor text DEFAULT 'blue',
  prioridade integer DEFAULT 2 CHECK (prioridade >= 1 AND prioridade <= 3), -- 1: Baixa, 2: Média, 3: Alta
  status text DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'pausado')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_sonhos_updated_at 
BEFORE UPDATE ON sonhos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE sonhos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios sonhos" 
ON sonhos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios sonhos" 
ON sonhos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios sonhos" 
ON sonhos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios sonhos" 
ON sonhos FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Adicionar índices para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sonhos_user_id ON sonhos(user_id);
CREATE INDEX IF NOT EXISTS idx_sonhos_status ON sonhos(status);

-- ============================================
-- QUERIES ÚTEIS
-- ============================================
-- SELECT * FROM sonhos WHERE user_id = auth.uid() ORDER BY prioridade DESC, created_at ASC;
