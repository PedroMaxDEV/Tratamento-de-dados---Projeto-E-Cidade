# Reversão

Ainda não há procedimentos de reversão implementados.

Usar o mesmo identificador da migração: `NNN_descricao.sql`, quando uma reversão SQL for possível. Documentar a ordem inversa das dependências.

Quando a alteração destruir informação, a recuperação pode depender de um backup ou cópia controlada dos dados originais. Documentar o procedimento no relatório e testar em ambiente separado. Não prometer reversão automática sem demonstrá-la.
