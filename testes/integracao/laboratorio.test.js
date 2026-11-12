import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { collectQuality, buildQualityReport, saveQualityReport } from '../../src/qualidade.js';
import { executeReadOnlySql } from '../../src/diagnostico.js';
import { compareReports, saveComparison } from '../../src/comparacao.js';

const enabled = process.env.ECIDADE_TEST_DB === '1';
const config = JSON.parse(readFileSync(new URL('../../laboratorio/regras.json', import.meta.url), 'utf8'));
function writeSql(sql) {
  const result = spawnSync('psql', ['-X', '-q', '-w', '-v', 'ON_ERROR_STOP=1', '-f', '-'], {
    input: sql, encoding: 'utf8', shell: false, timeout: 30_000,
    env: { ...process.env, PGCLIENTENCODING: 'UTF8', PGCONNECT_TIMEOUT: '10' }
  });
  assert.ifError(result.error);
  return result;
}
function script(name) { return readFileSync(new URL(`../../laboratorio/${name}`, import.meta.url), 'utf8'); }
function snapshot() {
  return executeReadOnlySql('BEGIN READ ONLY; SELECT row_to_json(p) FROM (SELECT id, nome FROM ecidade_lab.pessoa ORDER BY id) p; ROLLBACK;');
}
function collect() { return buildQualityReport(config, collectQuality(config)); }

test('laboratório: tratamento, comparação, conflitos e reversão preservam a massa sintética', { skip: !enabled }, () => {
  assert.ok(['ecidade_test', 'ecidade_laboratorio'].includes(process.env.PGDATABASE), 'Use apenas o banco isolado ecidade_test ou ecidade_laboratorio.');
  assert.equal(writeSql(script('001_preparar.sql')).status, 0, 'Preparação falhou: use banco vazio, sem schema ecidade_lab.');
  const original = snapshot();
  const before = collect();
  assert.equal(before.results[0].affected_rows, '3');
  assert.equal(writeSql(script('002_tratar.sql')).status, 0);
  const after = collect();
  assert.equal(after.results[0].affected_rows, '0');
  const comparison = compareReports(before, after);
  assert.equal(comparison.changes[0].state, 'resolved');
  // Reaplicar nao pode destruir a copia necessaria para reverter.
  assert.notEqual(writeSql(script('002_tratar.sql')).status, 0);
  assert.equal(collect().results[0].affected_rows, '0');
  // Uma edicao posterior deve impedir sobrescrita silenciosa na reversao.
  assert.equal(writeSql("UPDATE ecidade_lab.pessoa SET nome = 'Edicao posterior sintetica' WHERE id = 2;").status, 0);
  const changed = snapshot();
  assert.notEqual(writeSql(script('003_reverter.sql')).status, 0);
  assert.equal(snapshot(), changed);
  assert.equal(writeSql("UPDATE ecidade_lab.pessoa SET nome = 'Pessoa demonstrativa 2' WHERE id = 2;").status, 0);
  assert.equal(writeSql(script('003_reverter.sql')).status, 0);
  assert.equal(snapshot(), original, 'Reversão deve preservar NULL, texto vazio e espaços exatamente.');
  const restored = collect();
  assert.equal(restored.results[0].affected_rows, '3');
  // Relatorios sao de consultas reais, mas os dados desta base sao ficticios.
  const root = resolve('resultados-locais/laboratorio');
  mkdirSync(root, { recursive: true });
  const paths = { antes: saveQualityReport(before, root), depois: saveQualityReport(after, root),
    comparacao: saveComparison(comparison, root), revertido: saveQualityReport(restored, root) };
  writeFileSync(join(root, 'LEIA-ME.json'), JSON.stringify({ origem: 'MASSA SINTETICA — nao representa o e-Cidade real', resultado: '3 violações antes, 0 depois, 3 após reversão; conteúdo original preservado', caminhos: paths }, null, 2));
});
