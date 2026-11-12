# Atualização 008

## Título

feat: adiciona diagnóstico piloto do cadastro CGM

## Descrição

Adiciona regras de preenchimento de Nome/Razão Social e de presença e unicidade do número do cadastro na tabela `protocolo.cgm`. Os nomes e tipos das colunas foram conferidos no dump de referência do e-Cidade. O diagnóstico retorna contagens agregadas e inclui instruções para execução na cópia de desenvolvimento ou no contêiner original.

A configuração foi testada com dados fictícios em PostgreSQL em memória. A medição na base de desenvolvimento do e-Cidade segue pendente.
