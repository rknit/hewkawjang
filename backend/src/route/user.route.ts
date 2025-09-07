import express from 'express';
import createHttpError from 'http-errors';
import UserService from '../service/user.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await UserService.getUsers(req.body);
  res.json(users);
});

router.post('/', async (req, res) => {
  const newUser = await UserService.createUser(req.body);
  res.status(201).json(newUser);
});

// register a new user
router.post('/register', async (req, res) => {
    try {
        // The service handles creating the user and sending the email
        await UserService.createUser(req.body);
        
        // Respond with a message, not the user object.
        // The user is not yet "active" until they verify.
        res.status(201).json({ 
            message: "Registration successful! Please check your email to verify your account." 
        });
    } catch (error) {
        // Pass any errors (like 'Email already exists') to the error handler
        res.status(400).json({ error: (error as Error).message });
    }
});
router.get('/api/auth/verify', async (req, res) => {
    try {
        const { token } = req.query;

        // Basic validation for the token
        if (!token || typeof token !== 'string') {
            throw createHttpError.BadRequest("A verification token is required.");
        }

        // The service handles all the logic of verifying the token and updating the user
        await UserService.verifyUser(token);
        
        // Send a user-friendly success message or redirect them to your login page
        res.status(200).send(`
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>✅ Email Verified Successfully!</h1>
                <p>Your account is now active. You can close this page and log in to the application.</p>
            </div>
        `);
    } catch (error) {
        
    }
});
// User login
router.post("/login", async (req, res) => {
  const loginUser = await UserService.loginUser(req.body);
  res.status(201).json(loginUser);  
});

export default router;
