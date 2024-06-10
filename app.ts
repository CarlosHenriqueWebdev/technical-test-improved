import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(express.json());

// Extend the Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  password: string;
}

let users: User[] = [];

// Function to create a dummy user
const createDummyUser = async () => {
  const dummyPassword = await bcrypt.hash('dummyPassword123', 10);
  const dummyUser: User = {
    id: "123",
    name: 'Dummy User',
    email: 'dummy@example.com',
    age: 30,
    password: dummyPassword
  };
  users.push(dummyUser);

  const token = jwt.sign({ id: dummyUser.id, email: dummyUser.email }, process.env.TOKEN_SECRET!, { expiresIn: '1h' });

  console.log('Dummy user created:');
  console.log({
    id: dummyUser.id,
    name: dummyUser.name,
    email: dummyUser.email,
    age: dummyUser.age,
    token
  });
};

// Call the function to create a dummy user
createDummyUser();

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

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

// Validate password field for a user. Returns an array of error messages if validation fails.
function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (!password) {
    errors.push("Validation error: 'password' field is required.");
  } 
  if (password.length < 6) {
    errors.push("Validation error: 'password' must be at least 6 characters long.");
  }
  
  return errors;
}


// Register a new user
app.post('/register', async (req: Request, res: Response) => {
  const { name, email, age, password } = req.body;

  let errors: string[] = [];
  errors = errors.concat(validateName(name));
  errors = errors.concat(validateEmail(email));
  errors = errors.concat(validateAge(age));
  errors = errors.concat(validatePassword(password));

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user: User = { id: uuidv4(), name, email, age, password: hashedPassword };
  users.push(user);

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN_SECRET!, { expiresIn: '1h' });

  res.status(201).json({ message: 'User registered successfully', user: { ...user, password: undefined }, token });
});

// Login user
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = users.find(user => user.email === email);
  
  if (!user) {
    return res.status(400).json({ error: 'User not found with this email' });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN_SECRET!, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

// Update an existing user's information. Validates input and updates the user in the users array.
app.put('/users/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  const userIndex = users.findIndex(user => user.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Error: User with ID not found.' });
  }

  // Ensure that the user ID from the token matches the ID in the request
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'Unauthorized: You do not have permission to update this user.' });
  }

  // Check if at least one valid field is present
  if (!name && !email && !age) {
    return res.status(422).json({ error: 'Error: At least one field (name, email, age) must be present for this operation.' });
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
    return res.status(400).json({ errors });
  }

  const updatedUser: User = {
    id,
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    age: age || users[userIndex].age,
    password: users[userIndex].password
  };

  users[userIndex] = updatedUser;
  res.status(200).json({ message: 'User updated successfully', updatedUser: { ...updatedUser, password: undefined } });
});

// Retrieve a list of all users.
app.get('/users', (req: Request, res: Response) => {
  if (users.length === 0) {
    return res.status(404).json({ error: 'Error: No users found.' });
  }
  res.status(200).json({ message: 'All current users found', users: users.map(user => ({ ...user, password: undefined })) });
});

// Retrieve a specific user by ID.
app.get('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find(user => user.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Error: User with ID not found.' });
  }

  res.status(200).json({ message: 'User found', user: { ...user, password: undefined } });
});

// Delete a user by ID.
app.delete('/users/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const userIndex = users.findIndex(user => user.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Error: No user found to delete.' });
  }

  // Ensure that the user ID from the token matches the ID in the request
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'Unauthorized: You do not have permission to update this user.' });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
});

// Set up server port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
