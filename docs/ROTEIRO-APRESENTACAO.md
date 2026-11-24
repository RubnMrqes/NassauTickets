# Roteiro de demonstração da AV2

Apresentação de até 7 minutos: aproximadamente 5 minutos de demonstração e 2 minutos para perguntas.

## Antes de começar

1. Execute `docker compose --env-file .env up -d` em `backend`.
2. Execute `npm run dev` em `backend` e `frontend` em terminais separados.
3. Abra `http://localhost:5173`. Verifique `http://localhost:3001/api/health`.
4. A senha do gestor está no `backend/.env` local, se criada por `npm run setup`.
5. O campo `DEMO_MODE=true` permite apresentar o atendimento fora das 7h–17h.

## Demonstração sugerida

**1. Objetivo e evolução (40 s).** Apresente o laboratório, o totem e a mudança de dados locais para API com MySQL. Mostre a tabela de evolução no README.

**2. Totem e painel (60 s).** Emita uma senha SP, SE ou SG e apresente a tela do painel. Reforce que a emissão cria um registro no banco; no painel aparecem até cinco chamadas.

**3. Login e área protegida (60 s).** Acesse `/atendimento` sem login para mostrar o redirecionamento. Entre com a conta do gestor. Atualize a página para mostrar que a sessão é recuperada pelo endpoint `/auth/me`.

**4. Atendimento real (90 s).** Escolha um guichê, chame a próxima senha, mostre a fila, inicie e finalize o atendimento. Se necessário, use rechamada e ausência com outra senha.

**5. Gestão e relatório (40 s).** Abra `/gestao`, consulte um relatório do mês e mostre a funcionalidade vertical adicional: cadastro e gestão com histórico e indicadores.

**6. Erro e contingência (30 s).** Mostre o tratamento de erro sem alterar o banco: com o back-end parado, abra o painel, use "Tentar novamente" e "Ver dados de demonstração". Explique que os dados locais são apenas ilustrativos. Reinicie a API para voltar à consulta real.

**7. Fechamento e perguntas (2 min).** Mostre `frontend/src/services/api.js`, `backend/src/routes.js`, a configuração de URL da API e o `docs/CONTRATO-API.md`. Cada integrante deve conseguir explicar sua contribuição e os commits correspondentes.

## Para entregar

- Atualize o mesmo repositório da AV1 (não crie outro projeto).
- Registre o commit final real e crie a tag `entrega-av2`.
- Envie ao professor o link do repositório e o commit avaliado, liberando o acesso.
- Não envie `.env`, dados pessoais de usuários ou senhas.
- Confirme a data de entrega no Teams: o documento estabelece 7 dias antes da prova, às 23h59, salvo orientação posterior.
