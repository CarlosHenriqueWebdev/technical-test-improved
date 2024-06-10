import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { users, User, blacklistedTokens } from '../app';

export const UserController = {
    register: async (req: Request, res: Response) => {
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
    },
    login: async (req: Request, res: Response) => {
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
    },
    updateUser: async (req: Request, res: Response) => {
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
    },
    getAllUsers: async (req: Request, res: Response) => {
        let filteredUsers = users;

        // Filter users by name
        if (req.query.name) {
            const nameFilter = req.query.name.toString().toLowerCase();
            filteredUsers = filteredUsers.filter(user => user.name.toLowerCase().includes(nameFilter));
        }

        // Filter users by email
        if (req.query.email) {
            const emailFilter = req.query.email.toString().toLowerCase();
            filteredUsers = filteredUsers.filter(user => user.email.toLowerCase().includes(emailFilter));
        }

        // Sort users by name or age
        if (req.query.sortBy === 'name') {
            filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
        } else if (req.query.sortBy === 'age') {
            filteredUsers.sort((a, b) => a.age - b.age);
        }

        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        if (filteredUsers.length === 0) {
            return res.status(404).json({ error: 'Error: No users found.' });
        }

        res.status(200).json({
            message: 'All current users found',
            totalUsers: filteredUsers.length,
            page,
            pageSize,
            users: paginatedUsers.map(user => ({ ...user, password: undefined }))
        });
    },
    getUserById: async (req: Request, res: Response) => {
        const { id } = req.params;
        const user = users.find(user => user.id === id);

        if (!user) {
            return res.status(404).json({ error: 'Error: User with ID not found.' });
        }

        res.status(200).json({ message: 'User found', user: { ...user, password: undefined } });
    },
    deleteUserById: async (req: Request, res: Response) => {
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
    },
    logout: (req: Request, res: Response) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            blacklistedTokens.push(token);
            res.status(200).json({ message: 'Logout successful' });
        } else {
            res.status(400).json({ error: 'Invalid token' });
        }
    }
};