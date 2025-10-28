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
import cookieParser from 'cookie-parser';
import { startScheduledJobs } from './jobs';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

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

app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/restaurants', restaurantRoute);
app.use('/reservations', reservationRoute);
app.use('/notifications', notificationRoute);

const swaggerOptions: swaggerJsDoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'HewKawJang API',
      version: '1.0.0',
      description:
        'API documentation for the HewKawJang Restaurant Reservation system',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        // Access token (used for authenticated requests)
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token in Authorization header',
        },
        // Refresh token (used for token refresh endpoint)
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token stored in HttpOnly cookie',
        },
      },
      parameters: {
        AuthClientTypeHeader: {
          name: 'hkj-auth-client-type',
          in: 'header',
          required: true,
          schema: {
            type: 'string',
            enum: ['web'],
          },
          description:
            'Client type identifier; must be `"web"` for browser clients',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      withCredentials: true, // enables sending cookies with requests
    },
  }),
);
fs.writeFileSync('openapi.yaml', YAML.stringify(swaggerDocs), 'utf8');

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
