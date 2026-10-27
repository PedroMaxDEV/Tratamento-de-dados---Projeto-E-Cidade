# Testes do banco

Estado atual: 8 testes automatizados da ferramenta executados e aprovados em Node.js 22.14.0. Nenhum teste conectado ao PostgreSQL foi executado. O inventário não substitui testes de qualidade dos dados.

Execute `node --test testes/diagnostico.test.js` na raiz. Os testes verificam regras de diagnóstico, rejeição de coleta incompleta, escape de metadados no Markdown, argumentos do cliente, falhas e preservação de relatórios anteriores. A chamada ao PostgreSQL é simulada nos testes.

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
