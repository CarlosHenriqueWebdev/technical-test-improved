require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

let users = [];

// Validate name
function validateName(name) {
    const errors = [];

    if (!name) {
        errors.push('Validation error: \'name\' field is required.');
    }
    if (typeof name === 'number' || !isNaN(name)) {
        errors.push('Validation error: \'name\' must be a string.');
    }
    if (name === "") {
        errors.push('Validation error: \'name\' cannot be an empty string.');
    }
    if (name.length > 100) {
        errors.push('Validation error: \'name\' cannot exceed 100 characters.');
    }
    return errors;
}

// Validate email
function validateEmail(email, currentUserId = null) {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        errors.push('Validation error: \'email\' field is required.');
    }
    if (typeof email === 'number' || !isNaN(email)) {
        errors.push('Validation error: \'email\' must be a string.');
    }
    if (email === "") {
        errors.push('Validation error: \'email\' cannot be an empty string.');
    }
    if (!emailRegex.test(email)) {
        errors.push('Validation error: \'email\' must be a valid email address.');
    }
    if (email.length > 100) {
        errors.push('Validation error: \'email\' cannot exceed 100 characters.');
    }
    // Validate if email already exists, excluding the current user's email.
    if (users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.id !== currentUserId)) {
        errors.push('Validation error: A user with this email already exists.');
    }
    return errors;
}

// Validate age as a number and positive number
function validateAge(age) {
    const errors = [];

    if (!age) {
        errors.push('Validation error: \'age\' field is required.');
    }
    if (age === "" || age === null) {
        errors.push('Validation error: \'age\' cannot be an empty string or null.');
    }
    if (isNaN(age)) {
        errors.push('Validation error: \'age\' must be a number.');
    }
    if (age <= 0 || age > 120) {
        errors.push('Validation error: \'age\' must be a positive number between 1 and 120.');
    }
    return errors;
}

// Criar Usuário
app.post('/users', (req, res) => {
    const { name, email, age } = req.body;

    let errors = [];

    errors = errors.concat(validateName(name));
    errors = errors.concat(validateEmail(email));
    errors = errors.concat(validateAge(age));

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const user = { id: uuidv4(), name, email, age };
    users.push(user);

    res.status(201).json({ message: 'User created successfully', user });
});

// Atualizar Usuário
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Error: User with ID not found.' });
    }

    // Check if at least one valid field is present
    if (!name && !email && !age) {
        return res.status(422).json({ error: 'Error: At least one field (name, email, age) must be present for this operation.' });
    }

    let errors = [];

    if (name) {
        errors = errors.concat(validateName(name));
    }
    if (email) {
        errors = errors.concat(validateEmail(email, id));
    }
    if (age) {
        errors = errors.concat(validateAge(age));
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const updatedUser = {
        id,
        name: name || users[userIndex].name,
        email: email || users[userIndex].email,
        age: age || users[userIndex].age
    };

    users[userIndex] = updatedUser;
    res.status(200).json({ message: 'User updated successfully', updatedUser });
});

// Listar Usuários
app.get('/users', (req, res) => {
    if (users.length === 0) {
        return res.status(404).json({ error: 'Error: No users found.' });
    }
    res.status(200).json({ message: 'All current users found', users });
});

// Obter Usuário por ID
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: 'Error: User with ID not found.' });
    }

    res.status(200).json({ message: 'User found', user });
});

// Deletar Usuário
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Error: No user found to delete.' });
    }

    users.splice(userIndex, 1);
    res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});