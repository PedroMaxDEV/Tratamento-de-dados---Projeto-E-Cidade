# Testes do banco

Atualização 0.3.0: execute a suíte completa com `node --test testes/diagnostico.test.js testes/qualidade.test.js testes/comparacao.test.js`. São 26 testes locais aprovados, incluindo sete verificações da comparação antes/depois. Os registros abaixo descrevem a entrega anterior de qualidade.

Estado atual: 19 testes automatizados executados e aprovados em Node.js 22.14.0. Os cinco testes conectados ao PostgreSQL foram pulados localmente por falta do ambiente; estão configurados no GitHub para PostgreSQL 14 e 16. O inventário não substitui testes de qualidade dos dados.

Execute `node --test testes/diagnostico.test.js testes/qualidade.test.js` na raiz. Os testes verificam regras de diagnóstico e qualidade, configurações, chaves compostas, contagens grandes, rejeição de coleta incompleta, escape de metadados no Markdown, argumentos do cliente, falhas e preservação de relatórios anteriores. A chamada ao PostgreSQL é simulada nesses testes.

Consulte `docs/QUALIDADE_DE_DADOS.md` para preparar um banco descartável e executar `testes/integracao/postgres.test.js`. A massa de `testes/fixtures/base-sintetica.sql` é exclusivamente sintética e não deve ser instalada no e-Cidade real.

Para cada tratamento, criar um caso de teste com o mesmo identificador. Usar dados sintéticos e uma instância descartável de desenvolvimento.

## Caso de teste NNN

| Campo | Preencher |
| --- | --- |
| Regra verificada | Qual comportamento é correto |
| Preparação | Dados sintéticos, versão e pré-condições |
| Antes da migração | Consulta e resultado esperado que evidencia o problema |
| Aplicação | Migração e comando |
| Depois da migração | Consulta e resultado esperado |
| Integridade | Chaves e relacionamentos preservados |
| Reexecução | Resultado esperado: segura ou impedida com mensagem clara |
| Reversão | Procedimento e resultado esperado |
| Aplicação | Fluxo PHP/Laravel e resultado observado |
| Resultado real | Não executado / passou / falhou, com data |

Registrar falhas e limitações. Não marcar um teste como aprovado apenas porque o SQL não apresentou erro.
