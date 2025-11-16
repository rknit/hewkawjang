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
    Report: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
        },
        userId: {
          type: 'integer',
          example: 123,
        },
        adminId: {
          type: 'integer',
          nullable: true,
          example: 1,
        },
        reportType: {
          type: 'string',
          enum: ['user', 'message', 'review', 'restaurant', 'support'],
          nullable: true,
          example: 'review',
        },
        targetRestaurantId: {
          type: 'integer',
          nullable: true,
          example: 456,
        },
        targetReviewId: {
          type: 'integer',
          nullable: true,
          example: 789,
        },
        targetUserId: {
          type: 'integer',
          nullable: true,
          example: 321,
        },
        targetMessageId: {
          type: 'integer',
          nullable: true,
          example: null,
        },
        isSolved: {
          type: 'boolean',
          example: false,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00Z',
        },
      },
    },
    Restaurant: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
        },
        ownerId: {
          type: 'integer',
          example: 123,
        },
        name: {
          type: 'string',
          example: 'Delicious Thai Restaurant',
        },
        phoneNo: {
          type: 'string',
          example: '+66812345678',
        },
        wallet: {
          type: 'number',
          format: 'double',
          example: 1500.5,
        },
        address: {
          type: 'string',
          nullable: true,
          example: '123 Main Street, Bangkok',
        },
        houseNo: {
          type: 'string',
          nullable: true,
          example: '123',
        },
        village: {
          type: 'string',
          nullable: true,
          example: 'Village Name',
        },
        building: {
          type: 'string',
          nullable: true,
          example: 'Building Name',
        },
        road: {
          type: 'string',
          nullable: true,
          example: 'Sukhumvit Road',
        },
        soi: {
          type: 'string',
          nullable: true,
          example: 'Soi 11',
        },
        subDistrict: {
          type: 'string',
          nullable: true,
          example: 'Khlong Toei Nuea',
        },
        district: {
          type: 'string',
          nullable: true,
          example: 'Watthana',
        },
        province: {
          type: 'string',
          nullable: true,
          example: 'Bangkok',
        },
        postalCode: {
          type: 'string',
          nullable: true,
          example: '10110',
        },
        cuisineType: {
          type: 'string',
          enum: [
            'Thai',
            'Chinese',
            'Japanese',
            'Korean',
            'Western',
            'Seafood',
            'Vegetarian',
            'Vegan',
            'Halal',
            'Bakery',
            'Cafe',
            'Buffet',
            'BBQ',
            'Steakhouse',
            'Fast Food',
            'Indian',
            'Italian',
            'Other',
          ],
          example: 'Thai',
        },
        priceRange: {
          type: 'integer',
          nullable: true,
          example: 300,
        },
        paymentMethod: {
          type: 'string',
          enum: ['MasterCard', 'Visa', 'HewkawjangWallet', 'PromptPay'],
          example: 'HewkawjangWallet',
        },
        status: {
          type: 'string',
          enum: ['open', 'closed'],
          example: 'open',
        },
        activation: {
          type: 'string',
          enum: ['active', 'inactive'],
          example: 'active',
        },
        isVerified: {
          type: 'boolean',
          example: true,
        },
        isDeleted: {
          type: 'boolean',
          example: false,
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
          },
          nullable: true,
          example: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
        },
        reservationFee: {
          type: 'integer',
          example: 100,
        },
      },
    },
    RestaurantUnverified: {
      allOf: [
        { $ref: '#/components/schemas/Restaurant' },
        {
          type: 'object',
          properties: {
            isVerified: {
              type: 'boolean',
              example: false,
            },
          },
        },
      ],
    },
    ReportReview: {
      type: 'object',
      properties: {
        // Report fields
        id: {
          type: 'integer',
          example: 1,
        },
        userId: {
          type: 'integer',
          example: 123,
        },
        adminId: {
          type: 'integer',
          nullable: true,
          example: 1,
        },
        reportType: {
          type: 'string',
          enum: ['review'],
          example: 'review',
        },
        targetRestaurantId: {
          type: 'integer',
          nullable: true,
          example: 456,
        },
        targetReviewId: {
          type: 'integer',
          nullable: true,
          example: 789,
        },
        targetUserId: {
          type: 'integer',
          nullable: true,
          example: 321,
        },
        targetChatId: {
          type: 'integer',
          nullable: true,
          example: null,
        },
        isSolved: {
          type: 'boolean',
          example: false,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00Z',
        },
        // Review fields
        reviewId: {
          type: 'integer',
          nullable: true,
          example: 789,
        },
        reviewRating: {
          type: 'integer',
          nullable: true,
          minimum: 1,
          maximum: 5,
          example: 4,
        },
        reviewComment: {
          type: 'string',
          nullable: true,
          example: 'Great food and service!',
        },
        reviewCreatedAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: '2024-01-10T14:30:00Z',
        },
        reviewImages: {
          type: 'array',
          items: {
            type: 'string',
          },
          nullable: true,
          example: ['https://example.com/review1.jpg'],
        },
        // Review author fields
        reviewAuthorId: {
          type: 'integer',
          nullable: true,
          example: 456,
        },
        reviewAuthorName: {
          type: 'string',
          nullable: true,
          example: 'John Doe',
        },
        userImage: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/profile.jpg',
        },
        // Restaurant field
        reviewRestaurant: {
          type: 'string',
          nullable: true,
          example: 'Delicious Thai Restaurant',
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
    restaurantId: {
      name: 'restaurantId',
      in: 'path',
      required: true,
      description: 'ID of the restaurant',
      schema: {
        type: 'integer',
      },
    },
    reportId: {
      name: 'reportId',
      in: 'path',
      required: true,
      description: 'ID of the report',
      schema: {
        type: 'integer',
      },
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
