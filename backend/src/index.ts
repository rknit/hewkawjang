import express, { Request, Response } from 'express';
import userRoute from './route/user.route';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.use('/users', userRoute);

app.use((_: Request, res: Response) => {
  res.status(403).send('Forbidden');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
