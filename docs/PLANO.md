# Plano de trabalho

## Escopo proposto

Começar por um módulo escolhido com as outras equipes. O tratamento pode envolver integridade, padronização, migração ou desempenho; cada problema precisa de evidência. Uma tabela sem chave primária, por exemplo, é um item para avaliação, não prova automática de defeito.

| Etapa | Entrega | Critério de aceite |
| --- | --- | --- |
| 1. Ambiente | Versões, revisão do código, origem da base e roteiro de restauração | Outro integrante consegue repetir a restauração em base vazia |
| 2. Inventário | Tabelas, colunas, chaves, índices e dependências do módulo | Objetos relevantes documentados e conferidos com o código |
| 3. Qualidade | Consultas de duplicidade, campos ausentes e relacionamentos inválidos | Cada regra possui justificativa de negócio e contagem reproduzível |
| 4. Tratamento | Uma correção pequena e versionada | Pré-condições, resultado esperado, teste e reversão definidos |
| 5. Integração | Testes com PHP e Laravel | Fluxo escolhido grava e lê os dados corretamente em ambas as frentes |
| 6. Apresentação | Relatório antes/depois e demonstração | Evidências medidas, limitações e participação de cada integrante registradas |

## Primeiras tarefas para o quadro do GitHub

- Definir módulo piloto, prazo e responsáveis.
- Fixar a revisão de referência do e-Cidade.
- Restaurar a base de desenvolvimento e testar backup/restauração.
- Executar o inventário SQL e documentar o dicionário do módulo.
- Confirmar codificação do banco e das conexões; testar acentos com dados sintéticos.
- Definir uma regra de qualidade com a equipe e medir violações.
- Implementar e testar a primeira correção, preservando relacionamentos.
- Validar o fluxo com as equipes PHP e Laravel antes de integrar.

## Modelo de tarefa de tratamento

Problema observado:

Tabela/coluna e módulo:

Regra de negócio e responsável pela validação:

Consulta que reproduz o problema:

Quantidade de ocorrências antes:

Tratamento proposto e possíveis impactos:

Pré-condições e backup de teste:

Como testar e reverter:

Quantidade de ocorrências depois:

Evidência de funcionamento na aplicação:
