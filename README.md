# nassauTickets

Projeto acadêmico desenvolvido para a disciplina, com o objetivo de criar um sistema de atendimento para um laboratório de análises clínicas.

A ideia do sistema é controlar a emissão e o atendimento de senhas, simulando o funcionamento de um laboratório.

Nesta primeira etapa estamos trabalhando principalmente na estrutura do projeto, backend, frontend e organização das funcionalidades. O banco de dados será integrado em uma etapa posterior do projeto.

## Integrantes

| Nome | Matrícula | Função |
|---|---|---|
| Gildo Junior da Silva | 01856945 | Scrum Master |
| Caio Henrique Melo Diniz | 01847836 | Documentador |
| Ruben Marques de Souza Barbosa | 01849527 | Programador |
| Carlos Henrique do Monte | 01803176 | Testador |

## Tecnologias utilizadas

Até o momento o projeto utiliza:

- Node.js
- Express
- JavaScript
- React
- Vite
- Git
- GitHub

O MySQL também será utilizado no projeto, porém a integração com o banco de dados ficará para uma das próximas etapas.

## Estrutura do projeto

O projeto foi separado em frontend e backend.

```text
nassauTickets/
│
├── backend/
├── frontend/
├── docs/
├── .github/
├── .gitignore
├── LICENSE
└── README.md
```

### Backend

A pasta `backend` contém a parte responsável pelas rotas, regras e funcionamento da API.

### Frontend

A pasta `frontend` contém as telas do sistema feitas em React.

### Docs

A pasta `docs` está sendo utilizada para guardar a documentação do projeto, requisitos, diagramas e outros arquivos relacionados à atividade.

## Funcionalidades do sistema

A proposta do projeto inclui as seguintes funcionalidades:

- emissão de senhas;
- login de atendente;
- chamada da próxima senha;
- rechamada de senha;
- início do atendimento;
- finalização do atendimento;
- registro de ausência;
- painel de chamadas;
- controle de guichês;
- cadastro de usuários;
- relatórios.

Algumas dessas funções ainda estão sendo ajustadas e outras serão finalizadas durante a próxima etapa do projeto.

## Como executar o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Depois execute:

```bash
npm run dev
```

O backend roda localmente na porta configurada no projeto.

## Como executar o frontend

Em outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Depois:

```bash
npm run dev
```

O Vite irá mostrar no terminal o endereço para acessar o sistema no navegador.

Normalmente:

```text
http://localhost:5173
```

## Organização do atendimento

O sistema foi pensado com três áreas principais.

### Totem

Área onde a senha é emitida.

Os tipos de senha previstos são:

- SP
- SE
- SG

### Atendente

Área utilizada pelo atendente para controlar as senhas.

O atendente poderá:

- chamar a próxima senha;
- rechamar;
- iniciar atendimento;
- finalizar atendimento;
- registrar ausência.

### Painel

Tela utilizada para mostrar as senhas que estão sendo chamadas.

A ideia é que essa tela possa ficar visível para as pessoas que estão aguardando atendimento.

## Backend

O backend está sendo feito utilizando Node.js e Express.

As rotas são responsáveis por receber as requisições do frontend e executar as ações necessárias dentro do sistema.

Exemplo da estrutura:

```text
Frontend
   ↓
API Express
   ↓
Regras do sistema
```

Nesta etapa ainda não estamos utilizando o banco de dados na aplicação.

Quando a integração com MySQL for feita, o fluxo ficará aproximadamente:

```text
Frontend
   ↓
Backend
   ↓
MySQL
```

## Banco de dados

O banco de dados será desenvolvido e integrado mais para frente.

A ideia é utilizar MySQL para armazenar informações como:

- usuários;
- guichês;
- senhas;
- atendimentos;
- horários;
- relatórios.

Por enquanto, essa parte ainda não faz parte da implementação final do projeto.

## Git e GitHub

O GitHub está sendo utilizado para organizar o desenvolvimento e permitir que os integrantes trabalhem no mesmo projeto.

As branches principais são:

```text
main
dev
```

A `dev` é utilizada durante o desenvolvimento.

Depois que uma alteração é testada, ela pode ser integrada à `main`.

Cada integrante deve realizar os próprios commits de acordo com o que trabalhou no projeto.

Exemplo:

```bash
git add .
git commit -m "ajuste na tela de atendimento"
git push
```

## Função de cada integrante

**Gildo Junior da Silva — Scrum Master**

Responsável por ajudar na organização do grupo e acompanhar o andamento das atividades.

**Caio Henrique Melo Diniz — Documentador**

Responsável pela documentação do projeto, organização do README e materiais relacionados à entrega.

**Ruben Marques de Souza Barbosa — Programador**

Responsável principalmente pelo desenvolvimento das funcionalidades do sistema.

**Carlos Henrique do Monte — Testador**

Responsável por testar as funcionalidades e verificar possíveis erros durante o desenvolvimento.

As funções servem para organizar a equipe, mas todos podem ajudar em outras partes do projeto quando necessário.

## Próximas etapas

Algumas coisas que ainda pretendemos adicionar ou melhorar:

- integração com MySQL;
- melhorar as telas;
- finalizar as regras de atendimento;
- melhorar o painel;
- finalizar os relatórios;
- testar as funcionalidades;
- corrigir erros encontrados;
- melhorar a organização do código.

## Observação

O projeto ainda está em desenvolvimento.

Algumas funcionalidades podem mudar ou ser melhoradas durante as próximas etapas da atividade.

## Licença

MIT.