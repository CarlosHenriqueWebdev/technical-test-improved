import dotenv from "dotenv";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
app.use(express.json());
// Use morgan for logging
app.use(morgan("combined"));

// Extend the Request interface to include user property
declare module "express-serve-static-core" {
  interface Request {
    user?: any; // Custom property to store user information in requests
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  password: string;
}

export let users: User[] = []; // Array to store user data
export const blacklistedTokens: string[] = []; // Array to store blacklisted tokens

// Function to create a dummy user
const createDummyUser = async () => {
  const dummyPassword = await bcrypt.hash("dummyPassword123", 10);
  const dummyUser: User = {
    id: "b1c3620f-ecd6-4d26-9ce5-88d83d2f3cae",
    name: "Dummy User",
    email: "dummy@example.com",
    age: 30,
    password: dummyPassword,
  };
  users.push(dummyUser);

  const token = jwt.sign(
    { id: dummyUser.id, email: dummyUser.email },
    process.env.TOKEN_SECRET!,
    { expiresIn: process.env.TOKEN_EXPIRATION_TIME! }
  );

  console.log("Dummy user created:");
  console.log({
    id: dummyUser.id,
    name: dummyUser.name,
    email: dummyUser.email,
    age: dummyUser.age,
    token,
  });
};

// Call the function to create a dummy user
createDummyUser();

// Generate some dummy users
const generateUsers = (count: number) => {
  const generatedUsers = [];
  for (let i = 0; i < count; i++) {
    const password = `password${i + 1}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    generatedUsers.push({
      id: uuidv4(),
      name: `User${i + 2}`,
      email: `user${i + 2}@example.com`,
      age: Math.floor(Math.random() * 50) + 18, // Random age between 18 and 68
      password: hashedPassword,
    });
  }
  return generatedUsers;
};

// Add multiple users at once
users = users.concat(generateUsers(50)); // Adds 50 users

// Display a message to indicate users have been added
console.log("Added 50 users for testing pagination and sorting:", users.length);

// Use userRoutes for user-related routes
app.use("/users", userRoutes);

// Use authRoutes for authentication-related routes
app.use("/auth", authRoutes);

// Set up server port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
