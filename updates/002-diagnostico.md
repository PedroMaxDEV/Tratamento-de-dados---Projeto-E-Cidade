# Atualização 002 — texto para o GitHub

## Título

feat: adiciona ferramenta de diagnóstico PostgreSQL com relatórios

## Descrição

Implementa uma ferramenta de linha de comando em Node.js para coletar metadados do PostgreSQL em modo somente leitura e gerar relatórios JSON e Markdown.

- Inventaria tabelas, colunas, restrições e índices acessíveis.
- Aponta codificação para revisão, tabelas sem chave primária, restrições não validadas e índices inválidos.
- Inclui modo demonstrativo com metadados sintéticos, sem precisar de banco instalado.
- Trata falhas de execução e coletas incompletas, preservando relatórios anteriores.
- Adiciona oito testes automatizados, workflow GitHub e instruções de execução.

Validação: oito testes passaram localmente e o modo demonstrativo gerou os relatórios esperados. A conexão com PostgreSQL e a base real do e-Cidade ainda não foi testada. Nenhum dado ou esquema de banco foi alterado. O workflow aguarda execução no GitHub.

## Como demonstrar

```powershell
node src/cli.js --demo
node --test testes/diagnostico.test.js
```

## Arquivos para este commit

Na raiz do repositório:

```powershell
git add src package.json sql/diagnostico/002_coleta_json.sql testes/diagnostico.test.js testes/README.md .github/workflows/testes.yml docs/FERRAMENTA_DIAGNOSTICO.md updates/002-diagnostico.md README.md CHANGELOG.md .gitignore
git diff --cached
git commit -m "feat: adiciona ferramenta de diagnóstico PostgreSQL com relatórios"
```

Depois, faça o push da sua branch e abra o pull request conforme `docs/PUBLICAR_NO_GITHUB.md`. Esta atualização publica código no repositório; não instala nem modifica o e-Cidade em um servidor.
