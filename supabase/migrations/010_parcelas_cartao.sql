-- Identifica as parcelas de uma compra e mantém o total da fatura sincronizado.
BEGIN;
ALTER TABLE public.lancamentos_cartao ADD COLUMN IF NOT EXISTS compra_id uuid;
CREATE INDEX IF NOT EXISTS lancamentos_cartao_compra_usuario
  ON public.lancamentos_cartao(user_id, compra_id) WHERE compra_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS lancamentos_cartao_compra_parcela_unica
  ON public.lancamentos_cartao(user_id, compra_id, parcela)
  WHERE compra_id IS NOT NULL AND parcela IS NOT NULL;

CREATE OR REPLACE FUNCTION public.validar_cartao_do_lancamento()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.cartoes c WHERE c.id = NEW.cartao_id
      AND c.user_id = NEW.user_id AND c.mes = NEW.mes AND c.ano = NEW.ano
  ) THEN RAISE EXCEPTION 'Cartão não pertence ao usuário e período do lançamento'; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS validar_cartao_do_lancamento ON public.lancamentos_cartao;
CREATE TRIGGER validar_cartao_do_lancamento BEFORE INSERT OR UPDATE OF cartao_id, user_id, mes, ano
  ON public.lancamentos_cartao FOR EACH ROW
  EXECUTE FUNCTION public.validar_cartao_do_lancamento();

CREATE OR REPLACE FUNCTION public.atualizar_total_cartao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid;
BEGIN
  FOR v_id IN SELECT DISTINCT id FROM (VALUES
    (CASE WHEN TG_OP <> 'INSERT' THEN OLD.cartao_id END),
    (CASE WHEN TG_OP <> 'DELETE' THEN NEW.cartao_id END)
  ) AS ids(id) WHERE id IS NOT NULL LOOP
    PERFORM 1 FROM public.cartoes WHERE id = v_id FOR UPDATE;
    UPDATE public.cartoes SET valor = (
      SELECT coalesce(sum(valor), 0) FROM public.lancamentos_cartao
      WHERE cartao_id = v_id
    ) WHERE id = v_id;
  END LOOP;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS atualizar_total_cartao ON public.lancamentos_cartao;
CREATE TRIGGER atualizar_total_cartao AFTER INSERT OR UPDATE OF valor, cartao_id, user_id OR DELETE
  ON public.lancamentos_cartao FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_total_cartao();
COMMIT;
