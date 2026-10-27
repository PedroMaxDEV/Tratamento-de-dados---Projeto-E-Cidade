import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { compileQualitySql, parseQualityResults } from './qualidade.js';
import { cell } from './diagnostico.js';

export function validateReport(report) {
  if (!report || report.format_version !== 1 || !['demo', 'database'].includes(report.mode)
      || typeof report.generated_at !== 'string' || !Number.isFinite(Date.parse(report.generated_at))) {
    throw new Error('Relatório de qualidade inválido: confira versão, modo e data.');
  }
  const sql = compileQualitySql(report.config);
  if (createHash('sha256').update(sql).digest('hex') !== report.sql_sha256) throw new Error('Configuração incompatível com o hash SQL do relatório.');
  if (!Array.isArray(report.results)) throw new Error('Relatório sem resultados.');
  const results = parseQualityResults([...report.results, { complete: true }].map(r => JSON.stringify(r)).join('\n'), report.config);
  // Recalcula os estados; nao confia em summary/status editados no arquivo.
  return { ...report, results };
}

function signature(rule) {
  return JSON.stringify([rule.type, rule.schema, rule.table, rule.columns,
    rule.reference ? [rule.reference.schema, rule.reference.table, rule.reference.columns] : null]);
}

export function compareReports(beforeInput, afterInput) {
  const before = validateReport(beforeInput);
  const after = validateReport(afterInput);
  if (before.mode !== after.mode) throw new Error('Não é permitido comparar demonstração com coleta real.');
  if (Date.parse(after.generated_at) < Date.parse(before.generated_at)) throw new Error('O relatório depois é anterior ao relatório antes.');
  const previous = new Map(before.config.rules.map((r, i) => [r.id, { rule: r, result: before.results[i] }]));
  const current = new Map(after.config.rules.map((r, i) => [r.id, { rule: r, result: after.results[i] }]));
  const changes = [];
  for (const id of new Set([...previous.keys(), ...current.keys()])) {
    const a = previous.get(id), b = current.get(id);
    let state;
    let delta = null;
    if (!a) state = 'added';
    else if (!b) state = 'removed';
    else if (signature(a.rule) !== signature(b.rule)) state = 'rule_changed';
    else {
      delta = (BigInt(b.result.affected_rows) - BigInt(a.result.affected_rows)).toString();
      if (a.result.checked_rows === '0' || b.result.checked_rows === '0') state = 'empty';
      else if (a.result.checked_rows !== b.result.checked_rows) state = 'volume_changed';
      else if (BigInt(delta) > 0n) state = 'worsened';
      else if (BigInt(delta) < 0n) state = b.result.affected_rows === '0' ? 'resolved' : 'improved';
      else state = 'unchanged';
    }
    changes.push({ id, state, before: a?.result ?? null, after: b?.result ?? null, delta });
  }
  return { format_version: 1, mode: before.mode, before_at: before.generated_at, after_at: after.generated_at,
    summary: { rules: changes.length, worsened: changes.filter(c => c.state === 'worsened').length,
      improved: changes.filter(c => ['improved', 'resolved'].includes(c.state)).length,
      inconclusive: changes.filter(c => ['added', 'removed', 'rule_changed', 'empty', 'volume_changed'].includes(c.state)).length }, changes };
}

export function renderComparison(report) {
  const labels = { added: 'Adicionada', removed: 'Removida', rule_changed: 'Regra alterada', empty: 'Tabela vazia: inconclusivo', volume_changed: 'Volume alterado: revisar', worsened: 'Aumentou', resolved: 'Zerou', improved: 'Diminuiu', unchanged: 'Igual' };
  const lines = ['# Comparação de qualidade — antes e depois', '',
    report.mode === 'demo' ? '**DEMONSTRAÇÃO SINTÉTICA.**' : '**Comparação de relatórios; nenhuma conexão ou alteração no banco.**', '',
    `Antes: ${cell(report.before_at)} | Depois: ${cell(report.after_at)}`, '',
    '| Regra | Linhas antes/depois | Violações antes | Violações depois | Diferença | Avaliação |',
    '| --- | --- | --- | --- | --- | --- |'];
  for (const c of report.changes) lines.push(`| ${cell(c.id)} | ${c.before?.checked_rows ?? '—'} / ${c.after?.checked_rows ?? '—'} | ${c.before?.affected_rows ?? '—'} | ${c.after?.affected_rows ?? '—'} | ${c.delta ?? '—'} | ${labels[c.state]} |`);
  lines.push('', '## Limites da comparação', '',
    '- Confirme que as coletas pertencem à mesma base, módulo, usuário e escopo de acesso. Os arquivos desta versão não comprovam essa identidade.',
    '- Mesmo total de linhas não garante que sejam os mesmos registros. Redução de contagens não prova que um tratamento causou a melhoria.',
    '- Volume alterado, tabelas vazias e regras diferentes exigem revisão; não são classificados automaticamente como melhoria.',
    '- Diferença = depois menos antes; contagens de regras distintas não devem ser somadas.',
    '- O hash verifica compatibilidade entre configuração e SQL, não autenticidade do relatório.', '');
  return lines.join('\n');
}

export function saveComparison(report, outputRoot = 'resultados-locais') {
  const root = resolve(outputRoot);
  mkdirSync(root, { recursive: true });
  const directory = mkdtempSync(join(root, `comparacao-${report.mode}-`));
  writeFileSync(join(directory, 'comparacao.json'), JSON.stringify(report, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
  writeFileSync(join(directory, 'comparacao.md'), renderComparison(report), { encoding: 'utf8', flag: 'wx' });
  return directory;
}
