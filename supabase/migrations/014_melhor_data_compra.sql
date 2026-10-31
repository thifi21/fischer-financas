-- Melhor data de compra de cada cartão de crédito (texto editável)
ALTER TABLE public.cartoes
  ADD COLUMN IF NOT EXISTS melhor_data_compra TEXT;
