import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { users, User, blacklistedTokens } from '../app';

export const AuthController = {
    authenticateToken: (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.TOKEN_SECRET!, (err: any, user: any) => {
            if (err) return res.status(403).json({ error: 'You must be authenticated to access this route' });;
            req.user = user;
            next();
        });
    },
    blockAuthenticatedUsers: (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            jwt.verify(token, process.env.TOKEN_SECRET!, (err: any) => {
                if (!err) {
                    return res.status(403).json({ error: 'Authenticated users cannot access this route.' });
                }
                next();
            });
        } else {
            next();
        }
    },
    checkBlacklist: (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (blacklistedTokens.includes(token!)) {
            return res.status(401).json({ error: 'Token has been blacklisted' });
        }

        next();
    }
};