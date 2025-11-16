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
    // fs.writeFileSync('openapi.yaml', YAML.stringify(swaggerDocs), 'utf8');
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
    ReportMessage: {
      type: 'object',
      properties: {
        // Report fields
        id: {
          type: 'integer',
          example: 1,
        },
        reportType: {
          type: 'string',
          enum: ['message'],
          example: 'message',
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
        // Message fields
        messageText: {
          type: 'string',
          nullable: true,
          example: 'This is an inappropriate message',
        },
        messageImageUrl: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/message-image.jpg',
        },
        // Reporter fields
        reporterName: {
          type: 'string',
          nullable: true,
          example: 'John Doe',
        },
        reporterImage: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/reporter-profile.jpg',
        },
      },
    },
    LoginRequest: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'Password123!',
        },
      },
    },
    TokenResponseWeb: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token (expires in 15 minutes)',
          example: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
    TokenResponseMobile: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token (expires in 15 minutes)',
          example: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          description: 'JWT refresh token (expires in 1 day)',
          example: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
    LogoutResponse: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logged out successfully',
        },
      },
    },
    User: {
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
          example: 'user@example.com',
        },
        phoneNo: {
          type: 'string',
          example: '+66812345678',
        },
        balance: {
          type: 'number',
          format: 'double',
          example: 1000.0,
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
        isDeleted: {
          type: 'boolean',
          example: false,
        },
      },
    },
    RegisterRequest: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
      },
    },
    VerifyUserRequest: {
      type: 'object',
      required: [
        'otp',
        'firstName',
        'lastName',
        'email',
        'phoneNo',
        'password',
      ],
      properties: {
        otp: {
          type: 'string',
          example: '123456',
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
          example: 'user@example.com',
        },
        phoneNo: {
          type: 'string',
          example: '+66812345678',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'SecurePassword123!',
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
      },
    },
    UpdateUserProfileRequest: {
      type: 'object',
      properties: {
        displayName: {
          type: 'string',
          nullable: true,
          example: 'John D.',
        },
        firstName: {
          type: 'string',
          example: 'John',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
        },
        phoneNo: {
          type: 'string',
          example: '+66812345678',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
      },
    },
    CreateReviewRequest: {
      type: 'object',
      required: ['reservationId', 'rating'],
      properties: {
        reservationId: {
          type: 'integer',
          example: 123,
        },
        rating: {
          type: 'integer',
          minimum: 1,
          maximum: 5,
          example: 5,
        },
        comment: {
          type: 'string',
          nullable: true,
          example: 'Great food and excellent service!',
        },
        attachPhotos: {
          type: 'array',
          items: {
            type: 'string',
          },
          nullable: true,
          example: [
            'https://example.com/photo1.jpg',
            'https://example.com/photo2.jpg',
          ],
        },
      },
    },
    CreateReviewResponse: {
      type: 'object',
      properties: {
        reviewId: {
          type: 'integer',
          example: 456,
        },
      },
    },
    Reservation: {
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
        restaurantId: {
          type: 'integer',
          example: 456,
        },
        reserveAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-25T18:00:00Z',
        },
        reservationFee: {
          type: 'integer',
          nullable: true,
          example: 100,
        },
        numberOfAdult: {
          type: 'integer',
          nullable: true,
          example: 2,
        },
        numberOfChildren: {
          type: 'integer',
          nullable: true,
          example: 1,
        },
        status: {
          type: 'string',
          enum: [
            'unconfirmed',
            'expired',
            'confirmed',
            'cancelled',
            'rejected',
            'completed',
            'uncompleted',
          ],
          example: 'confirmed',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-15T10:00:00Z',
        },
        confirmedAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: '2025-11-15T12:00:00Z',
        },
      },
    },
    ReservationWithRestaurant: {
      allOf: [
        { $ref: '#/components/schemas/Reservation' },
        {
          type: 'object',
          properties: {
            restaurant: {
              $ref: '#/components/schemas/Restaurant',
            },
          },
        },
      ],
    },
    UploadImageResponse: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          example: 'https://example.com/uploads/profile123.jpg',
        },
      },
    },
    ReportUpdateRequest: {
      type: 'object',
      properties: {
        adminId: {
          type: 'integer',
          nullable: true,
          example: 1,
        },
        reportType: {
          type: 'string',
          enum: ['user', 'message', 'review', 'restaurant', 'support'],
          nullable: true,
          example: 'message',
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
          example: 111,
        },
        isSolved: {
          type: 'boolean',
          example: true,
        },
      },
    },
    ImageDeleteRequest: {
      type: 'object',
      required: ['imageUrl'],
      properties: {
        imageUrl: {
          type: 'string',
          example: 'https://example.com/uploads/image123.jpg',
        },
      },
    },
    ImageDeleteResponse: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Image deleted successfully',
        },
      },
    },
    Notification: {
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
        title: {
          type: 'string',
          example: 'Reservation Confirmed',
        },
        message: {
          type: 'string',
          nullable: true,
          example: 'Your reservation at Thai Restaurant has been confirmed',
        },
        imageUrl: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/restaurant-image.jpg',
        },
        reservationId: {
          type: 'integer',
          nullable: true,
          example: 456,
        },
        notificationType: {
          type: 'string',
          enum: ['reservation_status', 'chat', 'system'],
          example: 'reservation_status',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-16T10:00:00Z',
        },
        isRead: {
          type: 'boolean',
          example: false,
        },
      },
    },
    CreateNotificationRequest: {
      type: 'object',
      required: ['userId', 'title', 'message', 'notificationType'],
      properties: {
        userId: {
          type: 'integer',
          example: 123,
        },
        title: {
          type: 'string',
          example: 'Reservation Confirmed',
        },
        message: {
          type: 'string',
          example: 'Your reservation at Thai Restaurant has been confirmed',
        },
        imageUrl: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/restaurant-image.jpg',
        },
        reservationId: {
          type: 'integer',
          nullable: true,
          example: 456,
        },
        notificationType: {
          type: 'string',
          enum: ['reservation_status', 'chat', 'system'],
          example: 'reservation_status',
        },
      },
    },
    UnreadCountResponse: {
      type: 'object',
      properties: {
        count: {
          type: 'integer',
          example: 5,
        },
      },
    },
    Chat: {
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
        restaurantId: {
          type: 'integer',
          example: 456,
        },
        isBanned: {
          type: 'boolean',
          example: false,
        },
      },
    },
    ChatWithDetails: {
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
        restaurantId: {
          type: 'integer',
          example: 456,
        },
        userName: {
          type: 'string',
          nullable: true,
          example: 'John Doe',
        },
        restaurantName: {
          type: 'string',
          nullable: true,
          example: 'Thai Restaurant',
        },
        lastMessage: {
          type: 'string',
          nullable: true,
          example: 'Thanks for the reservation!',
        },
        displayName: {
          type: 'string',
          example: 'Thai Restaurant',
        },
      },
    },
    ChatAdmin: {
      type: 'object',
      properties: {
        chatId: {
          type: 'integer',
          example: 1,
        },
        userId: {
          type: 'integer',
          example: 123,
        },
        adminId: {
          type: 'integer',
          example: 1,
        },
        displayName: {
          type: 'string',
          example: 'John Doe',
        },
        profileUrl: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/profile.jpg',
        },
      },
    },
    Message: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
        },
        chatId: {
          type: 'integer',
          nullable: true,
          example: 1,
        },
        chatAdminId: {
          type: 'integer',
          nullable: true,
          example: null,
        },
        senderId: {
          type: 'integer',
          example: 123,
        },
        text: {
          type: 'string',
          nullable: true,
          example: 'Hello, I have a question about my reservation',
        },
        imgURL: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/message-image.jpg',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-16T10:00:00Z',
        },
      },
    },
    AdminMessage: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
        },
        chatAdminId: {
          type: 'integer',
          example: 1,
        },
        senderId: {
          type: 'integer',
          example: 1,
        },
        senderRole: {
          type: 'string',
          enum: ['user', 'admin', 'restaurant'],
          example: 'admin',
        },
        text: {
          type: 'string',
          nullable: true,
          example: 'How can I help you?',
        },
        imgURL: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/admin-message.jpg',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-16T10:00:00Z',
        },
      },
    },
    CreateChatRequest: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'integer',
          example: 123,
        },
      },
    },
    SendMessageRequest: {
      type: 'object',
      required: ['chatId', 'senderId'],
      properties: {
        chatId: {
          type: 'integer',
          example: 1,
        },
        senderId: {
          type: 'integer',
          example: 123,
        },
        text: {
          type: 'string',
          nullable: true,
          example: 'Hello, I have a question',
        },
        imgURL: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/image.jpg',
        },
      },
    },
    SendAdminMessageRequest: {
      type: 'object',
      required: ['chatAdminId', 'senderRole'],
      properties: {
        chatAdminId: {
          type: 'integer',
          example: 1,
        },
        senderRole: {
          type: 'string',
          enum: ['user', 'admin', 'restaurant'],
          example: 'admin',
        },
        text: {
          type: 'string',
          nullable: true,
          example: 'How can I help you?',
        },
        imgURL: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/image.jpg',
        },
      },
    },
    CreateReservationRequest: {
      type: 'object',
      required: ['restaurantId', 'reserveAt', 'reservationFee'],
      properties: {
        restaurantId: {
          type: 'integer',
          example: 456,
        },
        reserveAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-25T18:00:00Z',
        },
        numberOfAdult: {
          type: 'integer',
          nullable: true,
          example: 2,
        },
        numberOfChildren: {
          type: 'integer',
          nullable: true,
          example: 1,
        },
        reservationFee: {
          type: 'integer',
          example: 100,
        },
      },
    },
    CancelReservationRequest: {
      type: 'object',
      required: ['cancelBy'],
      properties: {
        cancelBy: {
          type: 'string',
          enum: ['user', 'restaurant_owner'],
          example: 'user',
        },
      },
    },
    UpdateReservationStatusRequest: {
      type: 'object',
      required: ['status', 'updateBy'],
      properties: {
        status: {
          type: 'string',
          enum: [
            'unconfirmed',
            'expired',
            'confirmed',
            'cancelled',
            'rejected',
            'completed',
            'uncompleted',
          ],
          example: 'confirmed',
        },
        updateBy: {
          type: 'string',
          enum: ['user', 'restaurant_owner'],
          example: 'restaurant_owner',
        },
      },
    },
    VerifySessionRequest: {
      type: 'object',
      required: ['sessionId'],
      properties: {
        sessionId: {
          type: 'string',
          description: 'Stripe checkout session ID',
          example: 'cs_test_a1b2c3d4e5f6g7h8i9j0',
        },
      },
    },
    VerifySessionResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        balance: {
          type: 'integer',
          description: 'Updated user balance after top-up',
          example: 5000,
        },
      },
    },
    BalanceResponse: {
      type: 'object',
      properties: {
        balance: {
          type: 'integer',
          description: 'Current user balance',
          example: 3500,
        },
      },
    },
    CreateCheckoutSessionRequest: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: {
          type: 'integer',
          description: 'Amount to top up (must be greater than 0)',
          example: 1000,
          minimum: 1,
        },
      },
    },
    CreateCheckoutSessionResponse: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          format: 'uri',
          description: 'Stripe checkout session URL to redirect user',
          example:
            'https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0',
        },
      },
    },
    WithdrawRequest: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: {
          type: 'integer',
          description:
            'Amount to withdraw from restaurant wallet (must be greater than 0)',
          example: 500,
          minimum: 1,
        },
      },
    },
    WithdrawResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
      },
    },
    RestaurantSearchRequest: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term for restaurant name or description',
          example: 'Thai restaurant',
        },
        province: {
          type: 'string',
          description: 'Filter by province',
          example: 'Bangkok',
        },
        priceRange: {
          type: 'object',
          properties: {
            min: {
              type: 'integer',
              example: 0,
            },
            max: {
              type: 'integer',
              example: 1000,
            },
          },
        },
        cuisineTypes: {
          type: 'array',
          items: {
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
          },
          example: ['Thai', 'Japanese'],
        },
        minRating: {
          type: 'number',
          format: 'double',
          minimum: 0,
          maximum: 5,
          example: 4.0,
        },
        sortBy: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              enum: ['rating', 'price', 'name'],
              example: 'rating',
            },
            order: {
              type: 'string',
              enum: ['asc', 'desc'],
              example: 'desc',
            },
          },
        },
        offset: {
          type: 'integer',
          minimum: 0,
          default: 0,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          default: 20,
        },
      },
    },
    RestaurantSearchResponse: {
      type: 'object',
      properties: {
        restaurants: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Restaurant',
          },
        },
        total: {
          type: 'integer',
          description: 'Total number of matching restaurants',
          example: 150,
        },
        hasMore: {
          type: 'boolean',
          description: 'Whether there are more results available',
          example: true,
        },
        searchParams: {
          $ref: '#/components/schemas/RestaurantSearchRequest',
        },
      },
    },
    CreateRestaurantRequest: {
      type: 'object',
      required: [
        'name',
        'phoneNo',
        'cuisineType',
        'paymentMethod',
        'reservationFee',
      ],
      properties: {
        name: {
          type: 'string',
          example: 'New Thai Restaurant',
        },
        phoneNo: {
          type: 'string',
          example: '+66812345678',
        },
        address: {
          type: 'string',
          nullable: true,
          example: '123 Main Street',
        },
        houseNo: {
          type: 'string',
          nullable: true,
        },
        village: {
          type: 'string',
          nullable: true,
        },
        building: {
          type: 'string',
          nullable: true,
        },
        road: {
          type: 'string',
          nullable: true,
        },
        soi: {
          type: 'string',
          nullable: true,
        },
        subDistrict: {
          type: 'string',
          nullable: true,
        },
        district: {
          type: 'string',
          nullable: true,
        },
        province: {
          type: 'string',
          nullable: true,
        },
        postalCode: {
          type: 'string',
          nullable: true,
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
        },
        priceRange: {
          type: 'integer',
          nullable: true,
        },
        paymentMethod: {
          type: 'string',
          enum: ['MasterCard', 'Visa', 'HewkawjangWallet', 'PromptPay'],
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
          },
          nullable: true,
        },
        reservationFee: {
          type: 'integer',
        },
      },
    },
    CreateRestaurantResponse: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Restaurant submitted successfully',
        },
        id: {
          type: 'integer',
          example: 42,
        },
      },
    },
    UpdateRestaurantRequest: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'Restaurant ID to update',
        },
        name: {
          type: 'string',
        },
        phoneNo: {
          type: 'string',
        },
        address: {
          type: 'string',
          nullable: true,
        },
        houseNo: {
          type: 'string',
          nullable: true,
        },
        village: {
          type: 'string',
          nullable: true,
        },
        building: {
          type: 'string',
          nullable: true,
        },
        road: {
          type: 'string',
          nullable: true,
        },
        soi: {
          type: 'string',
          nullable: true,
        },
        subDistrict: {
          type: 'string',
          nullable: true,
        },
        district: {
          type: 'string',
          nullable: true,
        },
        province: {
          type: 'string',
          nullable: true,
        },
        postalCode: {
          type: 'string',
          nullable: true,
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
        },
        priceRange: {
          type: 'integer',
          nullable: true,
        },
        paymentMethod: {
          type: 'string',
          enum: ['MasterCard', 'Visa', 'HewkawjangWallet', 'PromptPay'],
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
          },
          nullable: true,
        },
        reservationFee: {
          type: 'integer',
        },
      },
    },
    RestaurantActivationRequest: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive'],
          example: 'active',
        },
      },
    },
    RestaurantActivationResponse: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Restaurant activated successfully',
        },
        restaurant: {
          $ref: '#/components/schemas/Restaurant',
        },
      },
    },
    RestaurantStatusRequest: {
      type: 'object',
      required: ['id', 'status'],
      properties: {
        id: {
          type: 'integer',
          description: 'Restaurant ID',
        },
        status: {
          type: 'string',
          enum: ['open', 'closed'],
          example: 'open',
        },
      },
    },
    RestaurantHours: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
        restaurantId: {
          type: 'integer',
        },
        dayOfWeek: {
          type: 'string',
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          example: 'Monday',
        },
        openTime: {
          type: 'string',
          format: 'time',
          example: '09:00:00',
        },
        closeTime: {
          type: 'string',
          format: 'time',
          example: '22:00:00',
        },
        isClosed: {
          type: 'boolean',
          example: false,
        },
      },
    },
    DaysOffRequest: {
      type: 'object',
      required: ['dates'],
      properties: {
        dates: {
          type: 'array',
          items: {
            type: 'string',
            format: 'date',
          },
          example: ['2025-11-15', '2025-12-25'],
        },
      },
    },
    DaysOffResponse: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Days off created successfully',
        },
        restaurant_id: {
          type: 'integer',
        },
        dates: {
          type: 'array',
          items: {
            type: 'string',
            format: 'date',
          },
        },
      },
    },
    DaysOffData: {
      type: 'object',
      properties: {
        daysOff: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              restaurantId: {
                type: 'integer',
              },
              date: {
                type: 'string',
                format: 'date',
              },
            },
          },
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
    userId: {
      name: 'id',
      in: 'path',
      required: true,
      description: 'ID of the user',
      schema: {
        type: 'integer',
      },
    },
    reviewId: {
      name: 'id',
      in: 'path',
      required: true,
      description: 'ID of the review',
      schema: {
        type: 'integer',
      },
    },
    messageId: {
      name: 'messageId',
      in: 'path',
      required: true,
      description: 'ID of the message',
      schema: {
        type: 'integer',
      },
    },
    notificationId: {
      name: 'notificationId',
      in: 'path',
      required: true,
      description: 'ID of the notification',
      schema: {
        type: 'integer',
      },
    },
    chatId: {
      name: 'chatId',
      in: 'path',
      required: true,
      description: 'ID of the chat',
      schema: {
        type: 'integer',
      },
    },
    chatAdminId: {
      name: 'chatAdminId',
      in: 'path',
      required: true,
      description: 'ID of the admin chat',
      schema: {
        type: 'integer',
      },
    },
    reservationId: {
      name: 'id',
      in: 'path',
      required: true,
      description: 'ID of the reservation',
      schema: {
        type: 'integer',
      },
    },
  };
}

function responses() {
  return {
    Unauthorized: {
      description: 'Unauthorized - Invalid or missing token (see authHandler)',
    },
    AdminAuthUnauthorized: {
      description:
        'Unauthorized - Invalid or missing token, or admin role required (see authHandler and adminRoleHandler)',
    },
    InternalServerError: {
      description: 'Internal Server Error',
    },
  };
}
