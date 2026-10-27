# Como contribuir

1. Escolha uma tarefa do plano e abra uma issue descrevendo o resultado esperado.
2. Atualize sua cópia da branch principal antes de começar.
3. Crie uma branch, por exemplo `equipe/banco-inventario`.
4. Faça uma entrega pequena e mantenha os caminhos desta estrutura.
5. Registre o que foi executado, o que passou e o que continua pendente.
6. Atualize `CHANGELOG.md` e abra um pull request.

## Convenções

- Diagnósticos consultam informações; correções ficam em `sql/migracoes/`.
- Numere migrações na ordem combinada com a equipe: `001_descricao.sql`.
- Migração já aplicada em ambiente compartilhado não deve ser reescrita; crie uma nova.
- Use o mesmo identificador no relatório, na migração, na reversão e no teste.
- Só crie índices ou restrições quando o diagnóstico justificar a mudança.
- Documente se a migração pode ser reexecutada e como detectar aplicação anterior.
- Cada entrega deve informar versões suportadas e dependências.
- Revise relatórios antes do commit. Não publique dumps, senhas ou registros pessoais.

## Exemplos de commits

```text
docs: registra ambiente de desenvolvimento
docs: adiciona dicionario do modulo piloto
feat: adiciona diagnostico de qualidade do modulo piloto
fix: aplica tratamento validado descrito na issue
test: documenta validacao do tratamento
```

O tipo do commit deve refletir o que realmente foi entregue. Uma proposta de correção ainda não executada deve ser apresentada como proposta.
