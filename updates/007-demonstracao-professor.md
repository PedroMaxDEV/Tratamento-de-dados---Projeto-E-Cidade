# Atualização 007

## Título

feat: prepara demonstração executável do tratamento de dados

## Descrição

Executa os scripts SQL de preparação, tratamento e reversão do laboratório em PostgreSQL em memória. A demonstração mede as violações, confere a restauração dos valores linha por linha e gera dois relatórios comparativos. Inclui roteiro para apresentação e mapeamento dos arquivos que podem entrar no repositório final.

O laboratório local mediu 3 violações antes, 0 após a correção e 3 após a reversão. Os 26 testes locais passaram. O teste no banco de desenvolvimento do e-Cidade e a integração com PHP e Laravel continuam pendentes.

Se a atualização 006 ainda estiver local, publique os arquivos do laboratório junto com esta entrega. Confira `git status` antes do commit e inclua `package-lock.json` para reproduzir a instalação usada na demonstração.
