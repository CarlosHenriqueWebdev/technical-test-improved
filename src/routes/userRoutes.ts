import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, param, validationResult } from 'express-validator';
import morgan from 'morgan';
import { UserController } from '../controllers/userController';
import { AuthController } from '../controllers/authController';
import { users, User, blacklistedTokens } from '../app';

const router = express.Router();

// Update an existing user's information with express-validator
router.put('/:id', 
  AuthController.authenticateToken,
  AuthController.checkBlacklist,
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
  UserController.updateUser
);

// Retrieve a list of all users with sorting, filtering, and pagination.
router.get('/', UserController.getAllUsers);

// Retrieve a specific user by ID.
router.get('/:id', UserController.getUserById);

// Delete a user by ID.
router.delete('/:id', AuthController.authenticateToken, AuthController.checkBlacklist, UserController.deleteUserById);

export default router;