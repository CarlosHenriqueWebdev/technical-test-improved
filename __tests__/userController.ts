import request from 'supertest';
import app from '../src/app';

describe('UserController', () => {
    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    age: 30,
                    password: "123456",
                });

            expect(res.body).toHaveProperty('message', 'User registered successfully');
            expect(res.body.user).toHaveProperty('name', 'John Doe');
            expect(res.body.user).toHaveProperty('email', 'john.doe@example.com');
            expect(res.body.user).toHaveProperty('age', 30);
            expect(res.body).toHaveProperty('token');
            expect(res.statusCode).toEqual(201);
        });

        it('should return validation errors for missing fields', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: 'john.doe@example.com',
                    password: 'password123',
                });

            expect(res.body.errors).toContain('Validation error: \'name\' must be a string.');
            expect(res.body.errors).toContain('Validation error: A user with this email already exists.');
            expect(res.body.errors).toContain('Validation error: \'age\' must be a number.');
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /auth/login', () => {
        it('should login a registered user', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'john.doe@example.com',
                    password: '123456',
                });

            expect(res.body).toHaveProperty('message', 'Login successful');
            expect(res.body).toHaveProperty('token');
            expect(res.statusCode).toEqual(200);
        });

        it('should return error for incorrect password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'john.doe@example.com',
                    password: 'wrongpassword',
                });

            expect(res.body).toHaveProperty('error', 'Invalid password');
            expect(res.statusCode).toEqual(400);
        });

        it('should return error for non-existent email', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: '123456',
                });

            expect(res.body).toHaveProperty('error', 'User not found with this email');
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /users/:id', () => {
        it('should get a user by ID', async () => {
            const usersRes = await request(app).get('/users');
            const userId = usersRes.body.users[0].id;

            const res = await request(app).get(`/users/${userId}`);

            expect(res.body).toHaveProperty('message', 'User found');
            expect(res.body.user).toHaveProperty('id', userId);
            expect(res.statusCode).toEqual(200);
        });

        it('should return error for non-existent user ID', async () => {
            const res = await request(app).get('/users/nonexistentid');

            expect(res.body).toHaveProperty('error', 'Error: User with ID not found.');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('GET /users', () => {
        it('should fetch all users with pagination and sorting', async () => {
            const res = await request(app).get('/users?sortBy=name&page=1&pageSize=10');

            expect(res.body).toHaveProperty('message', 'All current users found');
            expect(res.body).toHaveProperty('totalUsers');
            expect(res.body).toHaveProperty('page', 1);
            expect(res.body).toHaveProperty('pageSize', 10);
            expect(res.body.users).toBeInstanceOf(Array);
            expect(res.statusCode).toEqual(200);
        });

        it('should return error if no users found', async () => {
            const res = await request(app).get('/users?name=nonexistentname');

            expect(res.body).toHaveProperty('error', 'Error: No users found.');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /users/:id', () => {
        it('should update a user', async () => {
            const registerRes = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Update User',
                    email: 'update@example.com',
                    age: 44,
                    password: "123456",
                });

            const token = registerRes.body.token;
            const userId = registerRes.body.user.id;

            // Update the user with the token
            const updateRes = await request(app)
                .put(`/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Name',
                    email: 'updated.email@example.com',
                    age: 35,
                    password: 'newpassword123',
                });

            expect(updateRes.body).toHaveProperty('message', 'User updated successfully');
            expect(updateRes.body.updatedUser).toHaveProperty('name', 'Updated Name');
            expect(updateRes.body.updatedUser).toHaveProperty('email', 'updated.email@example.com');
            expect(updateRes.body.updatedUser).toHaveProperty('age', 35);
            expect(updateRes.statusCode).toEqual(200);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user by ID', async () => {
            // Register a new user
            const registerRes = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Delete User',
                    email: 'delete@example.com',
                    age: 40,
                    password: "123456",
                });

            const token = registerRes.body.token;
            const userId = registerRes.body.user.id;

            // Delete the user with the token
            const deleteRes = await request(app)
                .delete(`/users/${userId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(deleteRes.statusCode).toEqual(204);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout a user', async () => {
            // Register a new user
            const registerRes = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Logout User',
                    email: 'logout@example.com',
                    age: 40,
                    password: "123456",
                });

            const token = registerRes.body.token;

            // Log out the user with the token
            const logoutRes = await request(app)
                .post('/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(logoutRes.body).toHaveProperty('message', 'Logout successful');
            expect(logoutRes.statusCode).toEqual(200);
        });

        it('should return error of required authentication for invalid token', async () => {
            const res = await request(app)
                .post('/auth/logout')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.body).toHaveProperty('error', 'You must be authenticated to access this route');
            expect(res.statusCode).toEqual(403);
        });
    });
});