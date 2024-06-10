import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, param, validationResult } from 'express-validator';

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

// Register a new user with advanced validation
app.post('/register', 
  body('name').isLength({ min: 1, max: 100 }).withMessage("Validation error: 'name' field is required and cannot exceed 100 characters."),
  body('email').isEmail().withMessage("Validation error: 'email' must be a valid email address."),
  body('email').custom((value, { req }) => {
    if (users.some(user => user.email.toLowerCase() === value.toLowerCase())) {
      throw new Error('Validation error: A user with this email already exists.');
    }
    return true;
  }),
  body('age').isInt({ min: 1, max: 120 }).withMessage("Validation error: 'age' must be a positive number between 1 and 120."),
  body('password').isLength({ min: 6 }).withMessage("Validation error: 'password' must be at least 6 characters long."),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(error => error.msg) });
    }

    const { name, email, age, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = { id: uuidv4(), name, email, age, password: hashedPassword };
    users.push(user);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN_SECRET!, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', user: { ...user, password: undefined }, token });
  }
);
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

// Update an existing user's information with express-validator
app.put('/users/:id', 
  authenticateToken,
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage("Validation error: 'name' field cannot exceed 100 characters."),
  body('email').optional().isEmail().withMessage("Validation error: 'email' must be a valid email address."),
  body('email').custom((value, { req }) => {
    const userIndex = users.findIndex(user => user.email.toLowerCase() === value.toLowerCase() && user.id !== req.params!.id!);
    if (userIndex !== -1) {
      throw new Error('Validation error: A user with this email already exists.');
    }
    return true;
  }),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage("Validation error: 'age' must be a positive number between 1 and 120."),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(error => error.msg) });
    }

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

    const updatedUser: User = {
      id,
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      age: age || users[userIndex].age,
      password: users[userIndex].password
    };

    users[userIndex] = updatedUser;
    res.status(200).json({ message: 'User updated successfully', updatedUser: { ...updatedUser, password: undefined } });
  }
);

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
