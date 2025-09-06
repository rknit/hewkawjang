import express from 'express';
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
  const newUser = await UserService.createUser(req.body);
  res.status(201).json(newUser);
});

/*
// Example login route using comparePassword from utils/hash.ts
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Get user from DB
    // const user = await db.user.findOne({ where: { username } });
    const user = { username, password: "$2b$10$somethingHashedFromDB" }; // mock

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});
*/

export default router;
