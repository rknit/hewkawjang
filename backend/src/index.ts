//  do not put any code before this line
import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoute from './routes/auth.routes';
import userRoute from './routes/user.routes';
import restaurantRoute from './routes/restaurant.routes';
import reservationRoute from './routes/reservation.routes';
import errorHandler from './middleware/error.middleware';
import { authHandler } from './middleware/auth.middleware';
import clientTypeHandler from './middleware/client-type.middleware';

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: ['https://hewkawjang-backend.vercel.app'].concat(
      process.env.NODE_ENV === 'development' ? ['http://localhost:8081'] : [],
    ),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'hkj-client-type'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(clientTypeHandler);

app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/restaurants', authHandler, restaurantRoute);
app.use('/reservations', reservationRoute);

app.get('/', (_: Request, res: Response) => {
  res.status(200).send('Hello, World!');
});

app.use((_: Request, res: Response) => {
  res.status(404).send('Not Found');
});

// make sure error handler is the last middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
