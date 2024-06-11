import express from "express";
import { body } from "express-validator";
import { UserController } from "../controllers/userController";
import { AuthController } from "../controllers/authController";
import { users } from "../app";

const router = express.Router();

// Update an existing user's information with express-validator
router.put(
  "/:id",
  AuthController.authenticateToken,
  AuthController.checkBlacklist,
  body("name")
    .optional()
    .isString()
    .withMessage("Validation error: 'name' must be a string.")
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Validation error: 'name' field is required and cannot exceed 100 characters."
    ),
  body("email")
    .optional()
    .isString()
    .withMessage("Validation error: 'email' must be a string.")
    .isEmail()
    .withMessage("Validation error: 'email' must be a valid email address.")
    .custom((value, { req }) => {
      const userIndex = users.findIndex(
        (user) =>
          user.email.toLowerCase() === value.toLowerCase() &&
          user.id !== req.params!.id!
      );
      if (userIndex !== -1) {
        throw new Error(
          "Validation error: A user with this email already exists."
        );
      }
      return true;
    }),
  body("age")
    .optional()
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
    .optional()
    .isString()
    .withMessage("Validation error: 'password' must be a string.")
    .isLength({ min: 6 })
    .withMessage(
      "Validation error: 'password' must be at least 6 characters long."
    ),
  UserController.updateUser
);

// Retrieve a list of all users with sorting, filtering, and pagination.
router.get("/", UserController.getAllUsers);

// Retrieve a specific user by ID.
router.get("/:id", UserController.getUserById);

// Delete a user by ID.
router.delete(
  "/:id",
  AuthController.authenticateToken,
  AuthController.checkBlacklist,
  UserController.deleteUserById
);

export default router;
