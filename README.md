# nassauTickets — Projeto Evolutivo AV2

Sistema de senhas e atendimento para um laboratório de análises clínicas. A AV2 mantém o tema e as funcionalidades da AV1 e passa a usar API, autenticação e persistência no MySQL.

O paciente retira a senha no totem e acompanha o painel. O atendente acessa uma área protegida para chamar, rechamar, iniciar e finalizar atendimentos. O gestor cadastra usuários e guichês e consulta relatórios.

## Membros

| Nome | Matrícula | Papel |
|---|---|---|
| Gildo Junior da Silva | A preencher | Scrum Master |
| Caio Henrique Melo Diniz | A preencher | Documentador |
| Ruben Marques de Souza Barbosa | A preencher | Desenvolvedor |
| Carlos Henrique do Monte | A preencher | Testador |

**Antes da entrega:** preencher as matrículas reais e confirmar os papéis com a equipe. A participação individual deve aparecer no histórico do GitHub.

## Modalidade de integração AV2

**Opção B — API própria do projeto.** O React consome a API Express por HTTP/JSON, e somente o back-end se conecta ao MySQL. É a modalidade a confirmar com o professor no contrato de integração, mantendo o mesmo tema e repositório da AV1.

## Tecnologias

- Front-end: React, JavaScript, Vite, React Router e CSS tradicional.
- Requisições: `fetch`, centralizado em `frontend/src/services/api.js`.
- Back-end: Node.js, Express e `mysql2`.
- Banco: MySQL 8, com tabelas, transações e sessões persistidas.
- Ambiente: Node.js 22.12+ e Docker com Compose (recomendado) ou MySQL 8 instalado localmente.

## Como executar

Os comandos abaixo são executados a partir da pasta raiz do projeto.

### 1. Gerar a configuração local

```bash
cd backend
npm run setup
```

Esse comando cria `backend/.env` e `frontend/.env` com os endereços e senhas locais. **A senha inicial do gestor é exibida no terminal apenas quando o arquivo é criado.** Guarde essa senha. Os arquivos `.env` não devem ser enviados ao GitHub.

O acesso inicial terá o e-mail `gestor@local.test`, com a senha gerada no comando anterior.

Se preferir configurar manualmente, copie `backend/.env.example` para `backend/.env` e `frontend/.env.example` para `frontend/.env`, substituindo as senhas de exemplo.

### 2. Iniciar o MySQL

Com Docker instalado, dentro da pasta `backend`:

```bash
docker compose --env-file .env up -d
```

O container cria automaticamente o banco `nassau_tickets` e o usuário da aplicação. A porta 3306 fica acessível somente pela máquina local. Caso já exista outro MySQL nessa porta, pare o serviço antigo ou altere a porta no `compose.yaml` e o `DB_PORT` no `.env`.

**Sem Docker:** crie no MySQL Workbench um banco chamado `nassau_tickets` e um usuário local com permissão sobre esse banco. Se já estiver usando `root` no MySQL Workbench para testes locais, configure `DB_USER=root` e `DB_PASSWORD` com **a senha real do MySQL**. A senha aleatória de banco gerada pelo `npm run setup` não redefine nem substitui a senha do servidor MySQL. Ajuste `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` em `backend/.env`. Exemplo de comandos, substituindo `<SENHA_ESCOLHIDA>`:

```sql
CREATE DATABASE IF NOT EXISTS nassau_tickets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'nassau_app'@'localhost' IDENTIFIED BY '<SENHA_ESCOLHIDA>';
GRANT ALL PRIVILEGES ON nassau_tickets.* TO 'nassau_app'@'localhost';
```

Se seu servidor autentica o usuário pelo IP `127.0.0.1`, configure o host/usuário correspondente no MySQL.

### 3. Criar as tabelas e o gestor

Ainda dentro de `backend`:

```bash
npm ci
npm run db:init
npm run db:seed
npm run dev
```

O primeiro comando de inicialização cria as tabelas de `docs/mer/schema.sql`. O `db:seed` cria o gestor e três guichês. É seguro executar novamente: ele não duplica esses registros. O servidor fica em `http://localhost:3001/api`.

### 4. Iniciar o React

Abra outro terminal:

```bash
cd frontend
npm ci
npm run dev
```

Acesse `http://localhost:5173`.

**Importante:** o padrão é `DEMO_MODE=false`, respeitando o expediente das 7h às 17h (horário de Brasília/Recife). Para uma demonstração supervisionada fora do horário, é possível ajustar `DEMO_MODE=true` temporariamente; nesse modo a restrição de horário fica desativada e isso deve ser explicado ao professor.

### 5. Verificar a integração

Com banco, API e carga inicial ativos, em outro terminal na pasta `backend`:

```bash
npm run test:api
```

A verificação consulta a conexão MySQL, testa o bloqueio de uma rota, faz login, consulta a sessão e os dados remotos, acessa o relatório e verifica o logout. Não cria senhas ou registros de atendimento.

Para os testes de domínio e HTTP:

```bash
npm test
```

O teste completo que modifica o banco exige **um banco de teste separado e vazio**, terminando em `_test`:

```bash
npm run test:integration
```

**Não execute o teste de integração no banco usado pela aplicação.** Leia as variáveis de ambiente do teste antes de executá-lo.

## Rotas do React

| Caminho | Tela | Acesso |
|---|---|---|
| `/` | Página inicial | Público |
| `/totem` | Emissão de senhas SP, SE e SG | Público |
| `/painel` | Últimas cinco chamadas e áudio opcional | Público |
| `/login` | Login do atendente ou gestor | Público |
| `/atendimento` | Fila, guichê e atendimento | Autenticado |
| `/gestao` | Usuários, guichês e relatórios | Gestor |

A navegação usa React Router. Ao abrir uma rota protegida sem sessão, o usuário é enviado para o login. A sessão permanece após atualizar a página e é validada novamente no endpoint `/auth/me`.

## Dados e persistência

- **MySQL:** usuários, guichês, sessões, senhas, sequência por dia/tipo, estados e eventos de atendimento.
- **Navegador:** apenas token de sessão no `localStorage`, sem senha; nenhum dado de atendimento é gravado como definitivo no navegador.
- **Contingência:** `frontend/src/data/contingencia.js` contém uma fila e chamadas ilustrativas, usadas somente quando a API falhar e o usuário escolher a demonstração. O sistema identifica esses dados visualmente. Em modo de demonstração, chamadas e emissões não são simuladas como se tivessem sido persistidas.

As consultas mostram carregamento, dados, listas vazias e erros; é possível tentar novamente após uma falha. A API trata 401 e 403. Quando a sessão expira, o usuário precisa entrar novamente.

## Contrato da API

A descrição dos endpoints, métodos, corpos, respostas de exemplo, erros e regras de autenticação está em **[docs/CONTRATO-API.md](docs/CONTRATO-API.md)**.

- URL-base da API: `VITE_API_URL` em `frontend/.env`.
- Endpoints públicos principais: `POST /api/senhas`, `GET /api/painel` e `POST /api/auth/login`.
- Endpoints protegidos principais: `GET /api/fila`, `GET /api/atendimento/atual`, `POST /api/atendimento/proximo`, `GET /api/auth/me` e `POST /api/auth/logout`.
- Endpoints de gestor: `GET /api/relatorios`, `GET/POST /api/usuarios` e `POST /api/guiches`.

## Evolução da AV1 para a AV2

| Aspecto | Situação anterior | Evolução na AV2 | Onde verificar |
|---|---|---|---|
| Dados | Protótipo e estrutura inicial; integração ainda pendente | MySQL integrado à API Express | `backend/src/db.js`, `docs/mer/schema.sql`, `backend/src/services/` |
| Autenticação | Login na interface, sessão apenas em memória | Token validado no servidor, restauração no refresh, logout e rotas protegidas | `frontend/src/context/AuthContext.jsx`, `frontend/src/App.jsx`, `backend/src/middleware/auth.js` |
| Navegação | Estado interno para alternar de tela | React Router com rotas públicas e protegidas | `frontend/src/App.jsx` |
| Estados da interface | Tratamento parcial de erro e sucesso | Carregando, sucesso, vazio, erro, retry e contingência local identificada | `frontend/src/components/RequestFeedback.jsx`, `frontend/src/pages/Attendant.jsx`, `frontend/src/components/Panel.jsx` |
| Organização | Front-end e back-end separados | Serviços centralizados, autenticação compartilhada, dados de contingência e documentação de endpoints | `frontend/src/services/`, `frontend/src/context/`, `frontend/src/data/`, `docs/` |
| Escopo para quatro integrantes | Emissão, atendimento e painel | Gestão de usuários e guichês com relatórios e histórico | `frontend/src/pages/Manager.jsx`, `backend/src/services/report-service.js` |

## Limitações e contingência

- O MySQL precisa estar ativo para emitir e alterar senhas. Se cair, o projeto informa o erro e preserva a interface acessível.
- A demonstração local do painel e da fila é apenas visual. Não substitui a API exigida na AV2 e não permite editar dados reais.
- Com `DEMO_MODE=true`, os horários de emissão e chamada ficam liberados somente para demonstração. Fora da apresentação, use `false`.
- O áudio do painel depende do suporte a síntese de voz e de autorização/interação do navegador.
- Relatórios exibem totais, detalhes das senhas, tempo médio real e auditoria. O usuário de teste inicial é criado pelo script de seed, não por dados fixos no React.
- A integração com o MySQL é local: não há deploy ou banco hospedado nesta entrega.

## Organização do repositório

```text
backend/
  scripts/          configuração local, schema, seed e verificação da API
  src/              rotas, serviços, domínio, middleware e banco
  test/             testes de domínio, HTTP e integração MySQL
frontend/
  src/components/   painel e mensagens reutilizáveis
  src/context/      autenticação e sessão
  src/data/         dados de contingência
  src/pages/        totem, atendimento e gestão
  src/services/     fetch e URL-base
  src/App.jsx       rotas e navegação
docs/
  CONTRATO-API.md   endpoints e exemplos
  mer/schema.sql    tabelas do MySQL
  mer/MODELO-ER.md  diagrama entidade-relacionamento
  models/uml/      casos de uso e diagramas
  requirements/     requisitos funcionais, não funcionais e regras de negócio
  mockups/          protótipos textuais das telas
```

O mesmo repositório deve ser mantido entre AV1 e AV2. A disciplina de Back-end exige um repositório público **`nassauTickets`**, com as branches **`dev`** e **`main`**. O desenvolvimento deve ser feito na `dev` e integrado à `main` por merge, preservando o histórico real dos integrantes. Na entrega de Front-end, registrar o commit avaliado e a tag `entrega-av2`. Incluir todos os integrantes como colaboradores e enviar a URL pública pelo Teams. O ZIP não contém histórico Git: essas exigências devem ser confirmadas no GitHub.

## Uso de inteligência artificial

Ferramentas de IA foram usadas como apoio à revisão e à evolução técnica do código para a AV2. A equipe deve revisar, executar, testar e ser capaz de explicar as alterações antes da entrega. Não foram geradas evidências de commits ou resultados de testes de banco que não ocorreram.

## Licença

MIT.

## Documentos do projeto

- [Requisitos funcionais, não funcionais e regras de negócio](docs/requirements/REQUISITOS.md)
- [Casos de uso](docs/models/uml/CASOS-DE-USO.md)
- [Diagramas de estados e sequência](docs/models/uml/DIAGRAMAS.md)
- [Modelo entidade-relacionamento](docs/mer/MODELO-ER.md)
- [Protótipos das telas](docs/mockups/PROTOTIPOS.md)

A regra de fila mantém a alternância SP / SE ou SG. Quando as duas filas comuns têm pacientes, suas oportunidades são alternadas, evitando deixar SG esperando indefinidamente. A estimativa de 5% de não comparecimento é um dado histórico e não deve provocar a exclusão aleatória de pacientes reais: a ausência é confirmada pelo atendente após a segunda chamada.
