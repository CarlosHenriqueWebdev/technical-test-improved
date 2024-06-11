import express from "express";
import { body } from "express-validator";
import { UserController } from "../controllers/userController";
import { AuthController } from "../controllers/authController";
import { users } from "../app";

const router = express.Router();

// Register a new user with advanced validation
router.post(
  "/register",
  AuthController.blockAuthenticatedUsers,
  body("name")
    .isString()
    .withMessage("Validation error: 'name' must be a string.")
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Validation error: 'name' field is required and cannot exceed 100 characters."
    ),
  body("email")
    .isString()
    .withMessage("Validation error: 'email' must be a string.")
    .isEmail()
    .withMessage("Validation error: 'email' must be a valid email address.")
    .custom((value) => {
      if (
        users.some((user) => user.email.toLowerCase() === value.toLowerCase())
      ) {
        throw new Error(
          "Validation error: A user with this email already exists."
        );
      }
      return true;
    }),
  body("age")
    .custom((value) => {
      if (typeof value !== "number") {
        throw new Error("Validation error: 'age' must be a number.");
      }
      return true;
    })
    .isInt({ min: 1, max: 120 })
    .withMessage(
      "Validation error: 'age' must be a positive number between 1 and 120."
    ),
  body("password")
    .isString()
    .withMessage("Validation error: 'password' must be a string.")
    .isLength({ min: 6 })
    .withMessage(
      "Validation error: 'password' must be at least 6 characters long."
    ),
  UserController.register
);

// Login user
router.post(
  "/login",
  AuthController.blockAuthenticatedUsers,
  body("email")
    .isEmail()
    .withMessage("Validation error: 'email' must be a valid email address."),
  body("password")
    .isString()
    .withMessage("Validation error: 'password' must be a string."),
  UserController.login
);

// Logout user and invalidate token
router.post(
  "/logout",
  AuthController.authenticateToken,
  AuthController.checkBlacklist,
  UserController.logout
);

export default router;
