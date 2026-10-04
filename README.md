# nassauTickets

Sistema acadêmico de controle de atendimento de um laboratório de análises clínicas.
Objetivo: estudar desenvolvimento backend, integração REST, React, MySQL, organização e colaboração no GitHub.
Base da primeira fase com código para emissão, atendimento, painel, login e relatórios.
O grupo deve estudar, validar e evoluir esta base; a segunda fase exige concluir o projeto.

## Membros

**Substitua os campos abaixo pelos integrantes reais antes de entregar. Remova linhas não utilizadas.**
No máximo 6 participantes; exatamente um Scrum Master. Não invente matrículas nem participação.

| Nome | Matrícula | Papel |
|---|---|---|
| PREENCHER | PREENCHER | Scrum Master |
| PREENCHER | PREENCHER | Documentador |
| PREENCHER | PREENCHER | Desenvolvedor |
| PREENCHER | PREENCHER | Testador |

## Tecnologias e justificativa

- Node.js 22 (versão indicada na atividade; usar patch recente da linha 22, >=22.12).
- Express 5 para rotas HTTP, middlewares e tratamento de erros.
- MySQL 8.0/InnoDB para persistência, transações e bloqueios de concorrência.
- mysql2 para consultas parametrizadas e pool.
- nodemon como dependência de desenvolvimento.
- React 19 + Vite 7 para um frontend simples que consome a API.
- Test runner nativo do Node e GitHub Actions.
JavaScript nas duas camadas reduz a troca de linguagem e permite concentrar o estudo nas regras do backend.

## Arquitetura

Frontend React → API Express → serviços/regras de domínio → MySQL.
A API é a autoridade sobre estados, prioridades e reservas. O navegador não escolhe a próxima senha.
src/routes.js faz o papel de controlador HTTP; services contém os casos de uso;
domain contém regras puras; db centraliza conexão/transação. SQL está nos serviços para facilitar a leitura inicial.
Uma camada de repositories pode ser adicionada posteriormente.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| backend/ | API, scripts e testes |
| docs/branding/ | Identidade visual a produzir; .gitkeep |
| docs/mer/ | Schema SQL e modelo relacional |
| docs/mockups/ | Descrição do protótipo executável |
| docs/models/uml/ | Diagramas de estados e sequência |
| docs/requirements/ | Requisitos, decisões, casos de uso e plano de testes |
| frontend/ | Aplicação React independente |
| docs/guia-backend.md | Tutorial com cada arquivo e código |
| .github/workflows/ci.yml | Verificação automática |
| .gitignore, LICENSE, README.md | Organização da raiz |

## Instalação do backend

Requisitos locais: Node >=22.12, npm e MySQL 8.0 (ou Docker Desktop/Engine com Compose).

```bash
cd backend
npm ci
```

Crie .env copiando .env.example:
- PowerShell: Copy-Item .env.example .env
- Bash/Git Bash: cp .env.example .env

Edite DB_PASSWORD e MYSQL_ROOT_PASSWORD. Defina BOOTSTRAP_PASSWORD com 12 a 128 caracteres,
além do nome e e-mail do gestor. Valores do exemplo são somente para ambiente local.

### Banco com Docker
No diretório backend:
```bash
docker compose up -d
docker compose ps
```
Aguarde o estado healthy antes de inicializar as tabelas. Se 3306 já estiver ocupado, use seu MySQL existente
ou ajuste a porta externa e DB_PORT. O volume mysql_data preserva os dados.

### Banco já instalado
Como administrador, no MySQL Workbench crie o banco e usuário da aplicação:
```sql
CREATE DATABASE nassau_tickets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nassau_app'@'%' IDENTIFIED BY 'SUA_SENHA_LOCAL';
GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX,REFERENCES ON nassau_tickets.* TO 'nassau_app'@'%';
```
Use os mesmos dados em .env. Esse usuário com permissão para criar tabelas é voltado ao desenvolvimento;
no deploy, separar usuário de migrações e usuário de execução.
O banco é dedicado a este projeto.

### Tabelas, gestor e execução
```bash
npm run db:init
npm run db:seed
npm run dev
```
Depois de criar o gestor, apague o valor BOOTSTRAP_PASSWORD do .env.
Não repita o seed com o campo vazio; ele não é necessário para iniciar a aplicação.
A API fica em http://localhost:3001/api.
GET /api/health deve retornar status ok quando o banco responde.
npm run dev usa nodemon; npm start usa node sem reinicialização automática.

## Instalação do frontend

Em OUTRO terminal, a partir da raiz:
```bash
cd frontend
npm ci
npm run dev
```
Abra http://localhost:5173. Configure VITE_API_URL em frontend/.env se mudar a API.
Configure FRONTEND_ORIGIN em backend/.env se mudar a origem do navegador.
Se Vite sugerir outra porta, pare e libere 5173 ou ajuste FRONTEND_ORIGIN.

## Como usar

1. Entre 07h e 17h de São Paulo, use Totem para emitir SP, SE ou SG.
2. Na área Atendente, use as credenciais criadas no seed.
3. Selecione um guichê, chame, inicie e finalize.
4. Se o cliente não chegar, chame novamente e só então confirme ausência.
5. Na área Painel, habilite áudio por clique. A disponibilidade de voz depende do navegador.
6. O gestor cadastra AAs/guichês e consulta relatórios com AAAA-MM ou AAAA-MM-DD.
7. Ao atualizar o navegador, faça login novamente; a API recupera a senha ativa do AA.

Fora do expediente, login, painel e relatórios continuam disponíveis; novas emissões e chamadas retornam 409.
A varredura de encerramento roda a cada 30s e no boot.
Apenas atendimentos já iniciados podem ser finalizados depois de 17h.

## Endpoints

| Método | Rota /api | Permissão |
|---|---|---|
| GET | /health | Pública |
| POST | /auth/login | Pública |
| POST | /auth/logout | AA |
| POST | /senhas | Pública (totem) |
| GET | /painel | Pública |
| GET | /guiches | AA |
| GET | /atendimento/atual | AA |
| POST | /atendimento/proximo | AA |
| POST | /senhas/:id/rechamar | AA responsável |
| POST | /senhas/:id/iniciar | AA responsável |
| POST | /senhas/:id/finalizar | AA responsável |
| POST | /senhas/:id/ausente | AA responsável, após segunda chamada |
| GET | /relatorios?periodo=AAAA-MM | Gestor |
| GET / POST | /usuarios | Gestor |
| POST | /guiches | Gestor |

Use Authorization: Bearer TOKEN nas rotas protegidas.
Exemplos completos de JSON e respostas no guia.

## Testes e validação

```bash
cd backend
npm test
npm ls nodemon --depth=0
```

No frontend: npm run build.
Testes de integração exigem banco de teste separado, vazio, com nome terminado em _test.
Nunca execute os testes de integração no banco de uso normal.
Consulte docs/guia-backend.md para configurar. O workflow de CI cria um MySQL 8 isolado e executa tudo.
Antes de entregar, conferir o resultado verde de Actions; o simples envio do workflow não comprova que passou.

### Verificação feita ao preparar esta base
10 testes de domínio/HTTP passaram, nodemon instalado e build React gerado.
MySQL real não estava disponível no ambiente de preparação: schema, transações e teste de integração
ainda precisam ser verificados no MySQL 8 local ou no workflow.

## Branches e participação

- main: versão integrada para avaliação.
- dev: desenvolvimento.
- Todos os códigos entram em dev antes de main.
- Integrar com merge preservando o histórico. Tutorial completo no guia.
- Cada integrante faz seus próprios commits de contribuições reais.
- Scrum Master cria repositório público nassauTickets e convida todos em Settings → Collaborators.
- Preencher os membros do README e conferir acesso/aceitação.
- Entregar no Teams a URL pública. Conforme aviso, todos devem responder e não há extensão de prazo.
O prazo exato não foi informado nesta base.

## Limitações e continuidade

Consulte docs/requirements/requisitos.md antes de apresentar as regras.
As interpretações de alternância, 5% de ausência, tempos de simulação e cinco eventos do painel estão documentadas.
Ainda falta finalizar UX, impressão, SSE/WebSocket com recuperação, idempotência, rate limiting,
HTTPS/deploy, backup ensaiado, retenção, revisão de acessibilidade e teste de carga.
Não existe garantia automática de conformidade jurídica pela implementação desta base.
Não adicionar dados reais de pacientes, documentos pessoais ou resultados de exames ao repositório público.
Esta base é destinada a estudo e evolução pelo grupo.

## Licença

MIT — veja LICENSE.
"# backend" 
