import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildQualityReport } from '../src/qualidade.js';
import { compareReports, saveComparison } from '../src/comparacao.js';
const config = JSON.parse(readFileSync(new URL('../config/qualidade.exemplo.json', import.meta.url), 'utf8'));
function report(counts = ['2', '1', '1', '2'], cfg = config) {
  return buildQualityReport(cfg, cfg.rules.map((r, i) => ({ id: r.id, type: r.type, checked_rows: '6', affected_rows: counts[i] })), { demo: true, now: new Date('2026-01-01T00:00:00Z') });
}
test('classifica redução, resolução, aumento e estabilidade', () => {
  assert.deepEqual(compareReports(report(), report(['0', '1', '2', '1'])).changes.map(c => c.state), ['resolved', 'unchanged', 'worsened', 'improved']);
});
test('volume alterado e tabela vazia nunca significam resolução automática', () => {
  const after = report(['0', '0', '1', '2']); after.results[0].checked_rows = '0'; after.results[1].checked_rows = '5';
  assert.deepEqual(compareReports(report(), after).changes.slice(0, 2).map(c => c.state), ['empty', 'volume_changed']);
});
test('mudança na regra, inclusão e remoção são explicitamente inconclusivas', () => {
  const cfg = structuredClone(config); cfg.rules[0].columns = ['outro_nome']; cfg.rules[1].id = 'nova';
  const states = compareReports(report(), report(undefined, cfg)).changes.map(c => c.state);
  assert.ok(states.includes('rule_changed')); assert.ok(states.includes('removed')); assert.ok(states.includes('added'));
});
test('rejeita dados inválidos, hash alterado, modos mistos e ordem temporal invertida', () => {
  for (const modify of [r => { r.sql_sha256 = 'x'; }, r => { r.mode = 'database'; }, r => { r.generated_at = '2025-01-01T00:00:00Z'; }, r => { r.results[0].affected_rows = '-1'; }]) {
    const after = report(); modify(after); assert.throws(() => compareReports(report(), after));
  }
});
test('não confia em status ou resumo editados e preserva inteiros grandes', () => {
  const before = report(), after = report();
  before.results[0].checked_rows = after.results[0].checked_rows = '90071992547409933333';
  before.results[0].affected_rows = '90071992547409930000'; after.results[0].affected_rows = '90071992547409930001';
  after.results[0].status = 'passed'; after.summary.with_findings = 0;
  const change = compareReports(before, after).changes[0]; assert.equal(change.state, 'worsened'); assert.equal(change.delta, '1');
});
test('preserva arquivos existentes e grava comparação legível', () => {
  const root = mkdtempSync(join(tmpdir(), 'ecidade-comparacao-'));
  const result = compareReports(report(), report());
  const first = saveComparison(result, root); assert.notEqual(first, saveComparison(result, root));
  assert.match(readFileSync(join(first, 'comparacao.md'), 'utf8'), /DEMONSTRAÇÃO/);
});
test('CLI demo gera relatório e sinaliza regressão sem acessar banco', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../src/comparacao-cli.js', import.meta.url)), '--demo', '--fail-on-regression', '--out', mkdtempSync(join(tmpdir(), 'ecidade-compare-cli-'))], { encoding: 'utf8' });
  assert.equal(result.status, 2, result.stderr); assert.match(result.stdout, /2 regras com redução, 1 com aumento/);
});
