//  do not put any code before this line
import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoute from './routes/auth.routes';
import userRoute from './routes/user.routes';
import restaurantRoute from './routes/restaurant.routes';
import reservationRoute from './routes/reservation.routes';
import notificationRoute from './routes/notification.routes';
import errorHandler from './middleware/error.middleware';
import paymentRoute from './routes/payment.routes';
import adminRoute from './routes/admin.routes';
import reportRoute from './routes/report.routes';
import imgRoute from './routes/image.routes';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { startScheduledJobs } from './jobs';
import chatRoutes from './routes/chat.routes';
import { setupSwagger } from './swagger';

const app = express();
const port = process.env.PORT || 8080;

// CORS configuration for web client
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'hkj-auth-client-type'],
    credentials: true,
  }),
);

app.use(helmet());

app.use(cookieParser());
app.use(express.json());

// Swagger setup
setupSwagger(app, Number(port));

app.use('/admins', adminRoute);
app.use('/reports', reportRoute);
app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/restaurants', restaurantRoute);
app.use('/reservations', reservationRoute);
app.use('/notifications', notificationRoute);
app.use('/payment', paymentRoute);
app.use('/img', imgRoute);
app.use('/chat', chatRoutes);

app.get('/', (_: Request, res: Response) => {
  res.status(200).send('Hello, World!');
});

app.use((_: Request, res: Response) => {
  res.status(404).send('Not Found');
});

// make sure error handler is the last middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  // Start scheduled background jobs
  startScheduledJobs();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
