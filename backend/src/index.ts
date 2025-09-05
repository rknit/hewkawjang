import express, { Request, Response } from 'express';
import userRoute from './route/user.route';
import errorHandler from './middleware/error.middleware';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.use('/users', userRoute);

app.use((_: Request, res: Response) => {
  res.status(403).send('Forbidden');
});

// make sure error handler is the last middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
