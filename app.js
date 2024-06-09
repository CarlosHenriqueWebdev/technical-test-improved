require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const validateName = require('./validators/nameValidator');
const validateEmail = require('./validators/emailValidator');
const validateAge = require('./validators/ageValidator');

const app = express();
app.use(express.json());

let users = [];

// Create a new user. Validates user input and adds the user to the users array.
app.post('/users', (request, response) => {
    const { name, email, age } = request.body;

    let errors = [];

    errors = errors.concat(validateName(name));
    errors = errors.concat(validateEmail(email, users));
    errors = errors.concat(validateAge(age));

    if (errors.length > 0) {
        return response.status(400).json({ errors });
    }

    const user = { id: uuidv4(), name, email, age };
    users.push(user);

    response.status(201).json({ message: 'User created successfully', user });
});

// Update an existing user's information. Validates input and updates the user in the users array.
app.put('/users/:id', (request, response) => {
    const { id } = request.params;
    const { name, email, age } = request.body;
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return response.status(404).json({ error: 'Error: User with ID not found.' });
    }

    // Check if at least one valid field is present
    if (!name && !email && !age) {
        return response.status(422).json({ error: 'Error: At least one field (name, email, age) must be present for this operation.' });
    }

    let errors = [];

    if (name) {
        errors = errors.concat(validateName(name));
    }
    if (email) {
        errors = errors.concat(validateEmail(email, users, id));
    }
    if (age) {
        errors = errors.concat(validateAge(age));
    }

    if (errors.length > 0) {
        return response.status(400).json({ errors });
    }

    const updatedUser = {
        id,
        name: name || users[userIndex].name,
        email: email || users[userIndex].email,
        age: age || users[userIndex].age
    };

    users[userIndex] = updatedUser;
    response.status(200).json({ message: 'User updated successfully', updatedUser });
});

// Retrieve a list of all users.
app.get('/users', (request, response) => {
    if (users.length === 0) {
        return response.status(404).json({ error: 'Error: No users found.' });
    }
    response.status(200).json({ message: 'All current users found', users });
});

// Retrieve a specific user by ID.
app.get('/users/:id', (request, response) => {
    const { id } = request.params;
    const user = users.find(user => user.id === id);

    if (!user) {
        return response.status(404).json({ error: 'Error: User with ID not found.' });
    }

    response.status(200).json({ message: 'User found', user });
});

// Delete a user by ID.
app.delete('/users/:id', (request, response) => {
    const { id } = request.params;
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return response.status(404).json({ error: 'Error: No user found to delete.' });
    }

    users.splice(userIndex, 1);
    response.status(204).send();
});

// Set up server port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});