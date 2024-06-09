const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

let users = [];

// Criar Usuário
app.post('/users', (req, res) => {
    const { name, email, age } = req.body;
    const user = { id: uuidv4(), name, email, age };
    users.push(user);
    res.status(201).json(user);
});

// Listar Usuários
app.get('/users', (req, res) => {
    res.json(users);
});

// Obter Usuário por ID
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

// Atualizar Usuário
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    const updatedUser = { id, name, email, age };
    users[userIndex] = updatedUser;
    res.json(updatedUser);
});

// Deletar Usuário
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    users.splice(userIndex, 1);
    res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});