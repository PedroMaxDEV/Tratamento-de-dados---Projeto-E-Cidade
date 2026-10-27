# Atualização 005

## Título

feat: compara relatórios de qualidade antes e depois

## Descrição

Implementa comparação entre relatórios de qualidade, com geração de JSON e Markdown. Identifica redução, aumento e estabilidade das violações e destaca tabelas vazias, mudanças no volume e regras alteradas como casos que exigem revisão.

Valida contagens, datas e compatibilidade da configuração, preserva números grandes e recusa misturar dados demonstrativos com coletas reais. Inclui demonstração e opção para sinalizar regressões por código de saída.

Validação: 26 testes locais passaram, incluindo sete novos testes da comparação. Nenhuma alteração foi realizada no banco. A comparação não comprova que os relatórios pertencem à mesma instância nem que uma mudança causou a redução; essas informações devem constar nas evidências da equipe.

## Executar

```powershell
node src/comparacao-cli.js --demo
```

## Publicar

```powershell
git add src/comparacao.js src/comparacao-cli.js testes/comparacao.test.js package.json .github/workflows/testes.yml docs/COMPARAR_RELATORIOS.md updates/005-comparacao-relatorios.md README.md CHANGELOG.md testes/README.md
git diff --cached
git commit -m "feat: compara relatórios de qualidade antes e depois"
```

Depois envie sua branch pelo fluxo habitual do GitHub.
