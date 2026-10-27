-- EXCLUSIVO para banco vazio de testes. Nao executar na base do e-Cidade.
-- Falha se o schema ja existir; nao remove nem substitui dados existentes.
BEGIN;
CREATE SCHEMA ecidade_qa;
CREATE TABLE ecidade_qa.cidade (id integer PRIMARY KEY);
CREATE TABLE ecidade_qa.pessoa (id integer, nome text, cidade_id integer);
INSERT INTO ecidade_qa.cidade VALUES (1), (2);
INSERT INTO ecidade_qa.pessoa VALUES
  (1, 'Ana', 1), (2, '   ', 9), (3, NULL, NULL),
  (4, 'Ana', 1), (5, 'Bia', 2), (6, 'C', 9);
ALTER TABLE ecidade_qa.pessoa ADD CONSTRAINT nome_nao_nulo CHECK (nome IS NOT NULL) NOT VALID;
CREATE TABLE ecidade_qa.vazia (id integer);
CREATE TABLE ecidade_qa.destino_composto (a integer, b integer, PRIMARY KEY(a, b));
CREATE TABLE ecidade_qa.origem_composta (a integer, b integer);
INSERT INTO ecidade_qa.destino_composto VALUES (1, 2);
INSERT INTO ecidade_qa.origem_composta VALUES (1, 2), (1, 2), (1, 3), (1, NULL), (NULL, 2);
COMMIT;
