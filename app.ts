import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(express.json());

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

let users: User[] = [];

// Validate name field for a user. Returns an array of error messages if validation fails.
function validateName(name: string): string[] {
  const errors: string[] = [];

  if (!name) {
    errors.push("Validation error: 'name' field is required.");
  }
  if (typeof name === 'number' || !isNaN(Number(name))) {
    errors.push("Validation error: 'name' must be a string.");
  }
  if (name === "") {
    errors.push("Validation error: 'name' cannot be an empty string.");
  }
  if (name.length > 100) {
    errors.push("Validation error: 'name' cannot exceed 100 characters.");
  }
  return errors;
}

// Validate email field for a user. Returns an array of error messages if validation fails.
function validateEmail(email: string, currentUserId: string | null = null): string[] {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.push("Validation error: 'email' field is required.");
  }
  if (typeof email === 'number' || !isNaN(Number(email))) {
    errors.push("Validation error: 'email' must be a string.");
  }
  if (email === "") {
    errors.push("Validation error: 'email' cannot be an empty string.");
  }
  if (!emailRegex.test(email)) {
    errors.push("Validation error: 'email' must be a valid email address.");
  }
  if (email.length > 100) {
    errors.push("Validation error: 'email' cannot exceed 100 characters.");
  }
  if (users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.id !== currentUserId)) {
    errors.push('Validation error: A user with this email already exists.');
  }
  return errors;
}

// Validate age field for a user. Returns an array of error messages if validation fails.
function validateAge(age: number): string[] {
  const errors: string[] = [];

  if (age === undefined || age === null) {
    errors.push("Validation error: 'age' field is required.");
  } else if (isNaN(Number(age))) {
    errors.push("Validation error: 'age' must be a number.");
  } else if (age <= 0 || age > 120) {
    errors.push("Validation error: 'age' must be a positive number between 1 and 120.");
  }
  return errors;
}

// Create a new user. Validates user input and adds the user to the users array.
app.post('/users', (request: Request, response: Response) => {
  const { name, email, age } = request.body;

  let errors: string[] = [];

  errors = errors.concat(validateName(name));
  errors = errors.concat(validateEmail(email));
  errors = errors.concat(validateAge(age));

  if (errors.length > 0) {
    return response.status(400).json({ errors });
  }

  const user: User = { id: uuidv4(), name, email, age };
  users.push(user);

  response.status(201).json({ message: 'User created successfully', user });
});

// Update an existing user's information. Validates input and updates the user in the users array.
app.put('/users/:id', (request: Request, response: Response) => {
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

  let errors: string[] = [];

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
    return response.status(400).json({ errors });
  }

  const updatedUser: User = {
    id,
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    age: age || users[userIndex].age
  };

  users[userIndex] = updatedUser;
  response.status(200).json({ message: 'User updated successfully', updatedUser });
});

// Retrieve a list of all users.
app.get('/users', (request: Request, response: Response) => {
  if (users.length === 0) {
    return response.status(404).json({ error: 'Error: No users found.' });
  }
  response.status(200).json({ message: 'All current users found', users });
});

// Retrieve a specific user by ID.
app.get('/users/:id', (request: Request, response: Response) => {
  const { id } = request.params;
  const user = users.find(user => user.id === id);

  if (!user) {
    return response.status(404).json({ error: 'Error: User with ID not found.' });
  }

  response.status(200).json({ message: 'User found', user });
});

// Delete a user by ID.
app.delete('/users/:id', (request: Request, response: Response) => {
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
