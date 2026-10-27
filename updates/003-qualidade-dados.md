# Atualização 003 — texto para publicação

## Título

feat: adiciona regras configuráveis de qualidade dos dados

## Descrição

Adiciona verificações somente leitura para campos nulos ou vazios, duplicidades e referências sem correspondência. As regras são definidas em JSON e permitem chaves compostas.

- Gera SQL para revisão antes de conectar ao banco.
- Produz relatórios JSON e Markdown apenas com contagens, sem exportar registros pessoais.
- Preserva contagens grandes e identifica tabelas vazias separadamente.
- Valida configurações, delimita identificadores e interrompe coletas incompletas.
- Acrescenta demonstração, massa sintética e testes de integração para PostgreSQL 14 e 16 no GitHub Actions.

Validação local: 19 testes passaram e a demonstração gerou os relatórios esperados. Os cinco testes conectados ao PostgreSQL foram pulados localmente por falta do ambiente e aguardam execução no GitHub. A base real do e-Cidade ainda não foi testada nem alterada.

## Demonstração

```powershell
node src/qualidade-cli.js --demo
node --test testes/diagnostico.test.js testes/qualidade.test.js
```

## Preparar commit

```powershell
git add src/diagnostico.js src/qualidade.js src/qualidade-cli.js config/qualidade.exemplo.json testes/qualidade.test.js testes/integracao/postgres.test.js testes/fixtures/base-sintetica.sql package.json .github/workflows/testes.yml .gitignore README.md CHANGELOG.md testes/README.md docs/QUALIDADE_DE_DADOS.md updates/003-qualidade-dados.md
git diff --cached
git commit -m "feat: adiciona regras configuráveis de qualidade dos dados"
```

Envie sua branch e abra o pull request pelo fluxo de `docs/PUBLICAR_NO_GITHUB.md`. Confira os jobs de teste no GitHub após o push. Publicar este código não aplica tratamentos no banco nem implanta o e-Cidade em um servidor.
