import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
import { validateConfig, compileQualitySql, parseQualityResults, collectQuality, buildQualityReport, saveQualityReport } from './qualidade.js';

try {
  const { values } = parseArgs({ options: {
    config: { type: 'string' }, demo: { type: 'boolean', default: false },
    'emit-sql': { type: 'string' }, 'fail-on-findings': { type: 'boolean', default: false },
    out: { type: 'string', default: 'resultados-locais' }, psql: { type: 'string', default: 'psql' },
    help: { type: 'boolean', default: false }
  }, allowPositionals: false });
  if (values.help) {
    console.log('Uso: node src/qualidade-cli.js --config ARQUIVO [--emit-sql ARQUIVO] [--out PASTA] [--psql CAMINHO] [--fail-on-findings]\nDemonstração: node src/qualidade-cli.js --demo\n--emit-sql valida e exporta SQL sem conectar. --fail-on-findings retorna código 2 se houver violações.');
  } else {
    if (values.demo && (values.config || values['emit-sql'])) throw new Error('--demo não aceita configuração externa nem --emit-sql.');
    if (!values.demo && !values.config) throw new Error('Informe --config ARQUIVO ou --demo.');
    const config = validateConfig(JSON.parse(readFileSync(values.demo ? new URL('../config/qualidade.exemplo.json', import.meta.url) : values.config, 'utf8')));
    if (values['emit-sql']) {
      writeFileSync(values['emit-sql'], compileQualitySql(config), { encoding: 'utf8', flag: 'wx' });
      console.log('SQL gerado para revisão. Nenhuma conexão realizada.');
    } else {
      // Resultados fixos da massa sintetica de testes; nao representam o e-Cidade.
      const results = values.demo ? parseQualityResults(config.rules.map((r, i) => JSON.stringify({ id: r.id, type: r.type, checked_rows: '6', affected_rows: ['2', '1', '1', '2'][i] })).join('\n') + '\n{"complete":true}', config) : collectQuality(config, { psql: values.psql });
      const report = buildQualityReport(config, results, { demo: values.demo });
      const directory = saveQualityReport(report, values.out);
      console.log(`${values.demo ? 'DEMONSTRAÇÃO SINTÉTICA' : 'QUALIDADE'}: ${report.summary.rules} regras, ${report.summary.with_findings} com violações.\nRelatórios: ${directory}`);
      if (values['fail-on-findings'] && report.summary.with_findings) process.exitCode = 2;
    }
  }
} catch (error) {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
}
