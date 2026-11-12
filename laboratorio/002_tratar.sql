\set ON_ERROR_STOP on
-- EXEMPLO DIDATICO: nomes artificiais so fazem sentido nesta massa sintetica.
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '30s';
LOCK TABLE ecidade_lab.identificacao IN SHARE MODE;
LOCK TABLE ecidade_lab.pessoa IN EXCLUSIVE MODE;
DO $$
BEGIN
  IF (SELECT count(*) FROM ecidade_lab.identificacao
      WHERE codigo = 'ECIDADE_LAB_SINTETICO_V1') <> 1 THEN
    RAISE EXCEPTION 'Base nao identificada como laboratorio sintetico';
  END IF;
END $$;
-- Preserva NULL, vazio e espacos exatamente como estavam.
-- CREATE TABLE impede reaplicacao enquanto este tratamento estiver ativo.
CREATE TABLE ecidade_lab.reversao_001 AS
SELECT id, nome AS nome_original,
       'Pessoa demonstrativa ' || id::text AS nome_aplicado
FROM ecidade_lab.pessoa
WHERE nome IS NULL OR btrim(nome) = '';
ALTER TABLE ecidade_lab.reversao_001 ADD PRIMARY KEY (id);
UPDATE ecidade_lab.pessoa p SET nome = b.nome_aplicado
FROM ecidade_lab.reversao_001 b WHERE p.id = b.id;
COMMIT;
