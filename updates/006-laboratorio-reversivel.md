# Atualização 006

## Título

feat: adiciona laboratório de tratamento SQL com reversão

## Descrição

Cria um laboratório isolado com dados sintéticos para demonstrar diagnóstico, tratamento SQL, comparação de resultados e reversão.

- Preserva os valores originais antes de aplicar a mudança.
- Impede reaplicação enquanto o tratamento estiver ativo.
- Interrompe a reversão caso registros tenham sido alterados ou removidos posteriormente.
- Testa o ciclo completo no PostgreSQL 14 e 16 pelo GitHub Actions.
- Disponibiliza relatórios sintéticos como artefatos da execução.
- Inclui Docker Compose e instruções para reprodução local.

Validação local: sintaxe JavaScript conferida; teste integrado pulado por ausência de PostgreSQL. A confirmação do novo cenário depende da execução após o push. Nenhum dado real do e-Cidade foi alterado; os valores artificiais do laboratório não constituem uma proposta de tratamento para cadastros reais.

## Publicar

```powershell
git add laboratorio testes/integracao/laboratorio.test.js .github/workflows/testes.yml package.json README.md CHANGELOG.md updates/006-laboratorio-reversivel.md
git diff --cached
git commit -m "feat: adiciona laboratório de tratamento SQL com reversão"
```

Envie a branch e confira a etapa do laboratório em ambas as versões PostgreSQL. Depois baixe os artefatos sintéticos pela página da execução para apresentar as evidências.
