\set ON_ERROR_STOP on
-- Exclusivo do laboratorio sintetico. Falha se o schema ja existir.
BEGIN;
CREATE SCHEMA ecidade_lab;
CREATE TABLE ecidade_lab.identificacao (
  codigo text PRIMARY KEY CHECK (codigo = 'ECIDADE_LAB_SINTETICO_V1')
);
INSERT INTO ecidade_lab.identificacao VALUES ('ECIDADE_LAB_SINTETICO_V1');
CREATE TABLE ecidade_lab.pessoa (id integer PRIMARY KEY, nome text);
INSERT INTO ecidade_lab.pessoa VALUES
  (1, 'Pessoa Alfa'), (2, NULL), (3, ''), (4, '   '), (5, 'Pessoa Beta');
COMMIT;
