import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import YAML from 'yaml';
import { Express } from 'express';

export function setupSwagger(app: Express, port: number): void {
  if (process.env.NODE_ENV !== 'production') {
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
          schemas: schemas(),
          securitySchemes: securitySchemes(),
          parameters: parameters(),
          responses: responses(),
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

    // Also output the OpenAPI spec to a YAML file for reference
    fs.writeFileSync('openapi.yaml', YAML.stringify(swaggerDocs), 'utf8');
  }
}

function schemas() {
  return {
    Admin: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
        },
        firstName: {
          type: 'string',
          example: 'John',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@example.com',
        },
        phoneNo: {
          type: 'string',
          example: '+1234567890',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'hashed_password_string',
        },
        displayName: {
          type: 'string',
          nullable: true,
          example: 'John D.',
        },
        profileUrl: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/profile.jpg',
        },
        refreshToken: {
          type: 'string',
          nullable: true,
          example: null,
        },
        isDeleted: {
          type: 'boolean',
          example: false,
        },
      },
    },
  };
}

function securitySchemes() {
  return {
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
  };
}

function parameters() {
  return {
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
  };
}

function responses() {
  return {
    AdminAuthUnauthorized: {
      description:
        'Unauthorized - Invalid or missing token, or admin role required',
    },
    InternalServerError: {
      description: 'Internal Server Error',
    },
  };
}
