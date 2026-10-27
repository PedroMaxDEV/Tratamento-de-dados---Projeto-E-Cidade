import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { buildQualityReport } from './qualidade.js';
import { compareReports, saveComparison } from './comparacao.js';

try {
  const { values } = parseArgs({ options: {
    antes: { type: 'string' }, depois: { type: 'string' }, demo: { type: 'boolean', default: false },
    out: { type: 'string', default: 'resultados-locais' }, 'fail-on-regression': { type: 'boolean', default: false }, help: { type: 'boolean' }
  }, allowPositionals: false });
  if (values.help) console.log('Uso: node src/comparacao-cli.js --antes ARQUIVO.json --depois ARQUIVO.json [--out PASTA] [--fail-on-regression]\nOu: node src/comparacao-cli.js --demo');
  else {
    let before, after;
    if (values.demo) {
      if (values.antes || values.depois) throw new Error('--demo não aceita arquivos externos.');
      const config = JSON.parse(readFileSync(new URL('../config/qualidade.exemplo.json', import.meta.url), 'utf8'));
      const results = counts => config.rules.map((r, i) => ({ id: r.id, type: r.type, checked_rows: '6', affected_rows: counts[i] }));
      before = buildQualityReport(config, results(['2', '1', '1', '2']), { demo: true, now: new Date('2026-01-01T12:00:00Z') });
      after = buildQualityReport(config, results(['0', '1', '2', '1']), { demo: true, now: new Date('2026-01-02T12:00:00Z') });
    } else {
      if (!values.antes || !values.depois) throw new Error('Informe --antes e --depois, ou --demo.');
      before = JSON.parse(readFileSync(values.antes, 'utf8'));
      after = JSON.parse(readFileSync(values.depois, 'utf8'));
    }
    const report = compareReports(before, after);
    const directory = saveComparison(report, values.out);
    console.log(`${values.demo ? 'DEMONSTRAÇÃO: ' : ''}${report.summary.improved} regras com redução, ${report.summary.worsened} com aumento, ${report.summary.inconclusive} inconclusivas.\nRelatórios: ${directory}`);
    if (values['fail-on-regression'] && report.summary.worsened) process.exitCode = 2;
  }
} catch (error) { console.error(`Erro: ${error.message}`); process.exitCode = 1; }
