\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '30s';
LOCK TABLE ecidade_lab.identificacao IN SHARE MODE;
LOCK TABLE ecidade_lab.pessoa IN EXCLUSIVE MODE;
LOCK TABLE ecidade_lab.reversao_001 IN EXCLUSIVE MODE;
DO $$
BEGIN
  IF (SELECT count(*) FROM ecidade_lab.identificacao
      WHERE codigo = 'ECIDADE_LAB_SINTETICO_V1') <> 1 THEN
    RAISE EXCEPTION 'Base nao identificada como laboratorio sintetico';
  END IF;
  IF EXISTS (
    SELECT 1 FROM ecidade_lab.reversao_001 b
    LEFT JOIN ecidade_lab.pessoa p ON p.id = b.id
    WHERE p.id IS NULL OR p.nome IS DISTINCT FROM b.nome_aplicado
  ) THEN
    RAISE EXCEPTION 'Reversao interrompida: registro foi removido ou alterado depois do tratamento';
  END IF;
END $$;
UPDATE ecidade_lab.pessoa p SET nome = b.nome_original
FROM ecidade_lab.reversao_001 b WHERE p.id = b.id;
DROP TABLE ecidade_lab.reversao_001;
COMMIT;
