# Publicar a primeira entrega e as atualizações

## Qual repositório criar

Esta pasta é um kit auxiliar, com histórico próprio. Sugestão de nome no GitHub: `ecidade-tratamento-dados`. Ele pode ser mantido separado durante o trabalho. Para entregar ao sistema integrado, siga `INTEGRACAO.md`: copie a pasta de contribuição para uma branch derivada do fork comum e abra um pull request.

Se a turma exigir merge direto entre forks, o trabalho deve acontecer em clones desses forks, todos com histórico comum. Publicar este kit independente não transforma seu histórico no histórico do e-Cidade.

## Primeiro envio pelo terminal

Pré-requisitos: Git instalado, conta no GitHub e autenticação configurada. Abra o PowerShell nesta pasta. Ela já contém um repositório Git local; não precisa executar `git init` novamente.

1. No GitHub, crie um repositório vazio. Não peça ao GitHub para gerar README, licença ou `.gitignore`, pois já existem arquivos locais para a primeira entrega. A licença da contribuição deve ser escolhida com o grupo e compatível com o projeto quando integrada.
2. Confira os arquivos e prepare o primeiro commit:

```powershell
git status
git add README.md CHANGELOG.md CONTRIBUTING.md .gitignore docs sql modelos relatorios testes .github
git diff --cached --stat
git diff --cached
git commit -m "docs: prepara estrutura da equipe de banco de dados"
git branch -M main
```

Se o Git solicitar nome e e-mail, configure sua própria identidade antes de repetir o commit. Não use dados de outro integrante.

3. Substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pela conta/organização e nome reais. Confira antes se já existe um remoto:

```powershell
git remote -v
```

Somente se não houver `origin`, execute:

```powershell
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

Se `origin` já existir, confira se aponta para o destino certo. Não substitua a URL sem verificar. Se o push for recusado porque o remoto tem commits, não use `--force`: primeiro examine e integre o histórico existente.

## Publicar cada nova entrega

Com a cópia local limpa e já na branch `main`:

```powershell
git pull --ff-only origin main
git switch -c equipe/documentar-ambiente
```

Edite os arquivos, valide o resultado e atualize o histórico. Exemplo para uma entrega que alterou somente ambiente e changelog:

```powershell
git add docs/AMBIENTE.md CHANGELOG.md
git diff --cached
git commit -m "docs: registra ambiente de desenvolvimento"
git push -u origin equipe/documentar-ambiente
```

Abra um pull request no GitHub para `main`. Nas próximas tarefas, escolha novos nomes de branch e adicione apenas os arquivos daquela entrega. Depois de integrar o pull request e com a cópia local limpa:

```powershell
git switch main
git pull --ff-only origin main
```

## Alternativa pela interface do GitHub

É possível usar o envio de arquivos pela interface web, preservando as subpastas. Envie somente os arquivos da entrega; não envie `.git`, backups, credenciais ou resultados locais. Use uma mensagem que explique a mudança.

Para trabalho contínuo em equipe, o fluxo Git acima facilita atualizar a cópia local e revisar mudanças. Evite alternar envio manual e commits locais sem sincronizar os históricos.

## Sugestão de sequência de publicações

| Entrega | O que publicar | Quando está pronta |
| --- | --- | --- |
| 1 | Estrutura e planejamento | Arquivos revisados pela equipe |
| 2 | Ambiente e inventário | Restauração reproduzida e diagnóstico executado |
| 3 | Dicionário e análise de um módulo | Regras e relacionamentos conferidos |
| 4 | Primeiro tratamento | Migração, teste e reversão validados |
| 5 | Integração | Fluxo conjunto demonstrado |
