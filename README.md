# API de Usuários

Esta API permite criar, atualizar, listar, visualizar e excluir usuários. Ela utiliza Node.js com Express para o servidor e faz validações nos dados dos usuários, como nome, email e idade.

Esta é a versão aprimorada da API, que inclui funcionalidades adicionais, como logout, autenticação com JSON Web Tokens (JWT), logging com Morgan, blacklist de tokens, além de recursos de ordenação e filtros. A versão básica da API pode ser encontrada no seguinte URL do GitHub: https://github.com/CarlosHenriqueWebdev/teste-tecnico.

## Configuração

1. Certifique-se de ter o Node.js instalado em sua máquina. No meu caso, estou utlizano node v18.18.2 

2. Clone este repositório usando o comando:

   ```bash
   git clone https://github.com/CarlosHenriqueWebdev/technical-test-improved.git
   ```

3. Instale as dependências do projeto usando o comando:

   ```bash
   npm install
   ```

4. (IMPORTANTE) Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

   ```plaintext
   TOKEN_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
   PORT=3000
   TOKEN_EXPIRATION_TIME=1h
   ```

## Uso

1. Para iniciar o servidor, execute o comando:

   ```bash
   npm start
   ```

   O servidor será iniciado na porta especificada no arquivo `.env`.

2. Utilize ferramentas como Postman para fazer requisições HTTP para a API.

   Primeiro, importe a pasta "http-request-improved" que se encontra dentro do projeto. Para importar, basta abrir o Postman Desktop e arrastar o arquivo JSON até o programa para ter acesso aos requests facilmente. Você pode ver o vídeo a seguir, já que um exemplo vale mil palavras: [Watch the video](https://imgur.com/a/dhiZSIG)

Aqui estão alguns exemplos de endpoints disponíveis:

### Usuários

- `PUT /users/:id`: Atualiza as informações de um usuário existente.
- `GET /users`: Lista todos os usuários.
  - **Query Parameters**:
    - `name`: Filtra usuários pelo nome.
    - `email`: Filtra usuários pelo email.
    - `sortBy`: Ordena usuários por nome ou idade.
    - `page`: Número da página para paginação (padrão é 1).
    - `pageSize`: Tamanho da página para paginação (padrão é 10).
- `GET /users/:id`: Retorna um usuário específico.
- `DELETE /users/:id`: Exclui um usuário específico.

### Autenticação

- `POST /auth/register`: Registra um novo usuário.
- `POST /auth/login`: Faz login de um usuário.
- `POST /auth/logout`: Faz logout de um usuário.

### Exemplo:

#### Usuários

- `PUT http://localhost:3000/users/<seu-id>`: Atualiza as informações de um usuário existente.
- `GET http://localhost:3000/users`: Lista todos os usuários.
 - **Query Parameters**:
    - `name`: Filtra usuários pelo nome.
    - `email`: Filtra usuários pelo email.
    - `sortBy`: Ordena usuários por nome ou idade.
    - `page`: Número da página para paginação (padrão é 1).
    - `pageSize`: Tamanho da página para paginação (padrão é 10).
  - **Exemplo de Uso**:
    ```plaintext
    GET http://localhost:3000/users?sortBy=name&page=2&pageSize=5
    ```
  - **Resposta**:
    ```json
    {
      "message": "All current users found",
      "totalUsers": 50,
      "page": 2,
      "pageSize": 5,
      "users": [
        {
          "id": "user_id_6",
          "name": "User 6",
          "email": "user6@example.com",
          "age": 24
        },
        {
          "id": "user_id_7",
          "name": "User 7",
          "email": "user7@example.com",
          "age": 25
        },
        ...
      ]
    }
    ```
- `GET http://localhost:3000/users/<seu-id>`: Retorna um usuário específico.
- `DELETE http://localhost:3000/users/<seu-id>`: Exclui um usuário específico.

#### Autenticação

- `POST http://localhost:3000/auth/register`: Registra um novo usuário.
  - **Body**:
    ```json
    {
      "name": "Seu Nome",
      "email": "seu.email@example.com",
      "age": 25,
      "password": "suaSenha"
    }
    ```
- `POST http://localhost:3000/auth/login`: Faz login de um usuário.
  - **Body**:
    ```json
    {
      "email": "seu.email@example.com",
      "password": "suaSenha"
    }
    ```
- `POST http://localhost:3000/auth/logout`: Faz logout de um usuário.
  - **Headers**:
    ```json
    {
      "Authorization": "Bearer <seu-token>"
    }
    ```

## Documentação HTTP com mais informações

- `GET http://localhost:3000/users`: Lista todos os usuários. Se não houver nenhum usuário, mostra um erro. Para iniciar, basta apenas colocar a rota GET e enviar. Não é possivel ver o erro nessa versão, já que 50+ usuários são criados automaticamente para mostrar outras funcionalidades.

- `POST http://localhost:3000/auth/register`: Cria um novo usuário. É necessário ter todos os parâmetros JSON preparados. Não é possível criar um email se esse email já existir. Contém validação em detalhe para todos os campos. Não é possivel accessar se você tiver um header Authorization Token válido.

  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25
  }
  ```

- `GET http://localhost:3000/users/<seu-id>`: Retorna um usuário específico. Se não houver nenhum usuário, mostra um erro. É necessário colocar o ID do usuário na URL primeiro. Para iniciar, basta apenas colocar a rota GET com o ID e enviar. Se o ID estiver incorreto, dá um erro.

- `PUT http://localhost:3000/users/<seu-id>`: Atualiza as informações de um usuário existente. Atualmente, é possível trocar apenas as informações de um campo. Informações existentes não serão alteradas. Exemplo:

  ```json
  {
    "age": 44
  }
  ```

  Continua como:

  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 44
  }
  ```

  Não é possível trocar o email para um email existente de outro usuário, mas é possível trocar o email para o seu próprio email já existente.

  Impossivel de usar se você não tiver um token de autorização que é o mesmo do ID, assim sendo impossivel trocar as informações de outro usuário.

- `DELETE http://localhost:3000/users/<seu-id>`: Exclui um usuário específico. Não funciona se o usuário não existir. Para iniciar, basta apenas colocar a rota DELETE com o ID e enviar. Se não houver ID ou ele estiver incorreto, dá um erro. Impossivel de usar se você não tiver um token de autorização que é o mesmo do ID, assim sendo impossivel deletar outro usuário.

## Teste Básico com Jest

Os testes são essenciais para garantir a qualidade e o funcionamento correto da sua aplicação. Para isso, foram desenvolvidos testes básicos utilizando Jest em conjunto com supertest para testar o userController. Atualmente fiz bem rápido mesmo então não tem tanta coisa assim, mais cobre bastante parte da API no geral.

Para executar os testes, basta abrir o terminal e executar o seguinte comando:

```bash
npm test
```

## Mensagem

Oi, boa noite! Se precisar de mais alguma informação ou se tiver alguma dúvida sobre o projeto, fique à vontade para entrar em contato comigo[carloshenrique.webdev@gmail.com]. Estou disponível para ajudar no que for necessário. Obrigado pela oportunidade e tenha uma ótima semana!
