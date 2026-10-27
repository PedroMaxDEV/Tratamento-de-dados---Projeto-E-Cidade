# Tratamento NNN — título

Copie este modelo para `relatorios/NNN_descricao.md`. Substitua os campos e indique explicitamente qualquer validação não executada.

- Estado: proposto / em implementação / validado / integrado.
- Responsável, data e issue:
- Commit do e-Cidade e versão do banco:
- Módulo e objetos afetados:

## Problema e regra de negócio

Descrever o comportamento observado e quem confirmou a regra. Distinguir suspeita de defeito comprovado.

## Diagnóstico reproduzível

Arquivo SQL, pré-condições e resultado agregado antes do tratamento. Não copiar registros pessoais.

## Alteração proposta

Arquivo da migração, ordem de aplicação, dependências, bloqueios esperados e efeito nas equipes PHP/Laravel.

## Execução e reexecução

Comando sem credenciais, ambiente de teste, resultado esperado e forma de detectar uma migração já aplicada. Explicar se uma segunda execução é suportada ou deve ser bloqueada.

## Validação

Quantidade antes/depois, preservação dos relacionamentos, teste de acentos quando pertinente e fluxo da aplicação utilizado. Informar arquivos de teste e resultado real.

## Reversão

Procedimento, pré-condições, limitações e resultado do teste de reversão. Se exigir backup, documentar como a restauração foi testada. Uma exclusão de dados não se desfaz apenas executando ROLLBACK depois do commit.

## Limitações e aprovação técnica

Pendências, revisão da equipe e impactos que precisam de validação conjunta.
