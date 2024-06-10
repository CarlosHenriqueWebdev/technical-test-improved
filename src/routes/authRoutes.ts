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

// Register a new user with advanced validation
router.post('/register', 
  AuthController.blockAuthenticatedUsers,
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
  UserController.register
);

// Login user
router.post('/login', AuthController.blockAuthenticatedUsers, UserController.login)

// Logout user and invalidate token
router.post('/logout', AuthController.authenticateToken, AuthController.checkBlacklist, UserController.logout);

export default router;