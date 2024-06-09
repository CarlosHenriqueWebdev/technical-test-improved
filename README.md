# API de Usuários

Esta API permite criar, atualizar, listar, visualizar e excluir usuários. Ela utiliza Node.js com Express para o servidor e faz validações nos dados dos usuários, como nome, email e idade.

## Configuração

1. Certifique-se de ter o Node.js instalado em sua máquina.
2. Clone este repositório usando o comando:

    ```bash
    git clone https://github.com/CarlosHenriqueWebdev/programador-junior-backend-teste-tecnico.git
    ```

3. Instale as dependências do projeto usando o comando:

    ```bash
    npm install
    ```

4. (opcional) Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

    ```plaintext
    PORT=3000
    ```

## Uso

1. Para iniciar o servidor, execute o comando:

    ```bash
    npm start
    ```

    Ou:

    ```bash
    node app.js
    ```

   O servidor será iniciado na porta especificada no arquivo `.env`.

2. Utilize ferramentas como Postman para fazer requisições HTTP para a API.

   Primeiro, importe a pasta "http-request" que se encontra dentro do projeto. Para importar, basta abrir o Postman Desktop e arrastar o arquivo JSON até o programa para ter acesso aos requests facilmente. Você pode ver o vídeo a seguir, já que um exemplo vale mil palavras: [Watch the video](https://imgur.com/a/dhiZSIG)

   Aqui estão alguns exemplos de endpoints disponíveis:

   - `POST /users`: Cria um novo usuário.
   - `PUT /users/:id`: Atualiza as informações de um usuário existente.
   - `GET /users`: Lista todos os usuários.
   - `GET /users/:id`: Retorna um usuário específico.
   - `DELETE /users/:id`: Exclui um usuário específico.

   Exemplo:

   - `POST http://localhost:3000/users`: Cria um novo usuário.
   - `PUT http://localhost:3000/users/<seu-id>`: Atualiza as informações de um usuário existente.
   - `GET http://localhost:3000/users`: Lista todos os usuários.
   - `GET http://localhost:3000/users/<seu-id>`: Retorna um usuário específico.
   - `DELETE http://localhost:3000/users/<seu-id>`: Exclui um usuário específico.

## Documentação HTTP com mais informações

- `GET http://localhost:3000/users`: Lista todos os usuários. Se não houver nenhum usuário, mostra um erro. Para iniciar, basta apenas colocar a rota GET e enviar.

- `POST http://localhost:3000/users`: Cria um novo usuário. É necessário ter todos os parâmetros JSON preparados. Não é possível criar um email se esse email já existir. Contém validação em detalhe para todos os campos.

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

- `DELETE http://localhost:3000/users/<seu-id>`: Exclui um usuário específico. Não funciona se o usuário não existir. Para iniciar, basta apenas colocar a rota DELETE com o ID e enviar. Se não houver ID ou ele estiver incorreto, dá um erro.

## Mensagem

Oi, bom dia! Não tenho certeza da complexidade desejada do projeto. De fato, as pastas inicialmente iriam ficar meio que assim, com bastante coisas adicionais:

```plaintext
- src/
  - routes/
    - userRoutes.js
    - authRoutes.js
  - middleware/
    - authMiddleware.js
  - validators/
    - nameValidator.js
    - emailValidator.js
    - ageValidator.js
  - utils/
    - database.js
  - app.js
```

Mas, como seria muito ruim de ver, decidi optar pelo método atual mesmo, que é mais fácil de visualizar no seu caso. Espero que isso não seja um problema.

```plaintext
- root/
  - validators/
    - nameValidator.js
    - emailValidator.js
    - ageValidator.js
  - app.js
```

Se precisar de mais alguma informação ou se tiver alguma dúvida sobre o projeto, fique à vontade para entrar em contato comigo[carloshenrique.webdev@gmail.com]. Estou disponível para ajudar no que for necessário. Obrigado pela oportunidade e tenha uma ótima semana!