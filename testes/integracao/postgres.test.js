import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { collectDatabase, executeReadOnlySql } from '../../src/diagnostico.js';
import { collectQuality } from '../../src/qualidade.js';

// Opt-in: estes testes consultam a massa sintetica ja criada em banco isolado.
const enabled = process.env.ECIDADE_TEST_DB === '1';
const config = JSON.parse(readFileSync(new URL('../../config/qualidade.exemplo.json', import.meta.url), 'utf8'));

test('PostgreSQL: regras detectam as contagens esperadas na massa sintética', { skip: !enabled }, () => {
  const results = collectQuality(config);
  assert.deepEqual(results.map(r => r.checked_rows), ['6', '6', '6', '6']);
  assert.deepEqual(results.map(r => r.affected_rows), ['2', '1', '1', '2']);
});

test('PostgreSQL: inventário encontra tabelas, colunas e restrição não validada', { skip: !enabled }, () => {
  const rows = collectDatabase();
  assert.ok(rows.some(r => r.kind === 'table' && r.schema === 'ecidade_qa' && r.name === 'pessoa' && !r.has_primary_key));
  assert.ok(rows.some(r => r.kind === 'constraint' && r.name === 'nome_nao_nulo' && !r.validated));
  assert.ok(rows.some(r => r.kind === 'column' && r.table_name === 'pessoa' && r.name === 'nome'));
});

test('PostgreSQL: tabela vazia e chaves compostas respeitam a semântica documentada', { skip: !enabled }, () => {
  const result = collectQuality({ version: 1, rules: [
    { id: 'vazia', type: 'not_null', schema: 'ecidade_qa', table: 'vazia', columns: ['id'] },
    { id: 'composta_unica', type: 'unique', schema: 'ecidade_qa', table: 'origem_composta', columns: ['a', 'b'] },
    { id: 'composta_fk', type: 'foreign_key', schema: 'ecidade_qa', table: 'origem_composta', columns: ['a', 'b'], reference: { schema: 'ecidade_qa', table: 'destino_composto', columns: ['a', 'b'] } }
  ] });
  assert.equal(result[0].status, 'empty');
  assert.deepEqual(result.map(r => r.affected_rows), ['0', '1', '1']);
});

test('PostgreSQL: objeto ausente interrompe a execução', { skip: !enabled }, () => {
  const copy = structuredClone(config); copy.rules[0].table = 'tabela_inexistente';
  assert.throws(() => collectQuality(copy), /psql encerrou/);
});

test('PostgreSQL: transação de leitura bloqueia escrita', { skip: !enabled }, () => {
  assert.throws(() => executeReadOnlySql('BEGIN READ ONLY; DELETE FROM ecidade_qa.pessoa; ROLLBACK;'), /psql encerrou/);
  assert.equal(collectQuality(config)[0].checked_rows, '6');
});
