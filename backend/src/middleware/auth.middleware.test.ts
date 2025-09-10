import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authHandler, refreshAuthHandler } from './auth.middleware';

// Mock jwt
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Mock JWT utilities to avoid needing real JWT secrets in tests
jest.mock('../utils/jwt', () => ({
  ACCESS_TOKEN_SECRET: 'test_access_secret',
  REFRESH_TOKEN_SECRET: 'test_refresh_secret',
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  // Test data
  const validPayload = { userId: 123 };
  const invalidPayload = { someOtherField: 'value' };
  const validToken = 'valid_token_123';
  const invalidToken = 'invalid_token';

  // Helper functions
  const expectUnauthorizedError = () => {
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: 'Unauthorized',
      }),
    );
  };

  const mockJwtVerifySuccess = (payload: any) => {
    mockJwt.verify.mockImplementation((token, secret, callback) => {
      (callback as Function)(null, payload);
    });
  };

  const mockJwtVerifyFailure = (
    error: Error | null = new Error('Invalid token'),
  ) => {
    mockJwt.verify.mockImplementation((token, secret, callback) => {
      (callback as Function)(error, null);
    });
  };

  beforeEach(() => {
    mockRequest = { headers: {} };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authHandler', () => {
    const testUnauthorizedCases = [
      {
        description: 'missing authorization header',
        headers: {},
      },
      {
        description: 'empty authorization header',
        headers: { authorization: '' },
      },
    ];

    testUnauthorizedCases.forEach(({ description, headers }) => {
      it(`should return Unauthorized when ${description}`, () => {
        mockRequest.headers = headers;

        authHandler(mockRequest as Request, mockResponse as Response, mockNext);

        expectUnauthorizedError();
      });
    });

    it('should return Unauthorized when JWT verification fails', () => {
      mockRequest.headers = { authorization: `Bearer ${invalidToken}` };
      mockJwtVerifyFailure();

      authHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(
        invalidToken,
        'test_access_secret',
        expect.any(Function),
      );
      expectUnauthorizedError();
    });

    const invalidPayloadCases = [
      { payload: invalidPayload, description: 'missing userId' },
      { payload: null, description: 'null payload' },
    ];

    invalidPayloadCases.forEach(({ payload, description }) => {
      it(`should return Unauthorized when decoded payload has ${description}`, () => {
        mockRequest.headers = { authorization: `Bearer ${validToken}` };
        mockJwtVerifySuccess(payload);

        authHandler(mockRequest as Request, mockResponse as Response, mockNext);

        expectUnauthorizedError();
      });
    });

    it('should set authPayload and call next() for valid token', () => {
      mockRequest.headers = { authorization: `Bearer ${validToken}` };
      mockJwtVerifySuccess(validPayload);

      authHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(
        validToken,
        'test_access_secret',
        expect.any(Function),
      );
      expect(mockRequest.authPayload).toEqual(validPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should extract payload with only userId from token data', () => {
      const tokenWithExtraData = { userId: 999, otherField: 'value' };
      mockRequest.headers = { authorization: `Bearer ${validToken}` };
      mockJwtVerifySuccess(tokenWithExtraData);

      authHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.authPayload).toEqual({ userId: 999 });
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('refreshAuthHandler', () => {
    const validRefreshToken = 'valid_refresh_token_123';

    const testUnauthorizedCases = [
      {
        description: 'missing authorization header',
        headers: {},
      },
      {
        description: 'empty authorization header',
        headers: { authorization: '' },
      },
    ];

    testUnauthorizedCases.forEach(({ description, headers }) => {
      it(`should return Unauthorized when ${description}`, () => {
        mockRequest.headers = headers;

        refreshAuthHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expectUnauthorizedError();
      });
    });

    it('should return Unauthorized when JWT verification fails', () => {
      mockRequest.headers = { authorization: `Bearer ${invalidToken}` };
      mockJwtVerifyFailure();

      refreshAuthHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockJwt.verify).toHaveBeenCalledWith(
        invalidToken,
        'test_refresh_secret',
        expect.any(Function),
      );
      expectUnauthorizedError();
    });

    const invalidPayloadCases = [
      { payload: invalidPayload, description: 'missing userId' },
      { payload: null, description: 'null payload' },
    ];

    invalidPayloadCases.forEach(({ payload, description }) => {
      it(`should return Unauthorized when decoded payload has ${description}`, () => {
        mockRequest.headers = { authorization: `Bearer ${validRefreshToken}` };
        mockJwtVerifySuccess(payload);

        refreshAuthHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expectUnauthorizedError();
      });
    });

    it('should set authPayload, authRefreshToken and call next() for valid refresh token', () => {
      mockRequest.headers = { authorization: `Bearer ${validRefreshToken}` };
      mockJwtVerifySuccess(validPayload);

      refreshAuthHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockJwt.verify).toHaveBeenCalledWith(
        validRefreshToken,
        'test_refresh_secret',
        expect.any(Function),
      );
      expect(mockRequest.authPayload).toEqual(validPayload);
      expect(mockRequest.authRefreshToken).toEqual(validRefreshToken);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should extract payload with only userId from refresh token data', () => {
      const refreshTokenWithExtraData = { userId: 888, extraData: 'test' };
      mockRequest.headers = { authorization: `Bearer ${validRefreshToken}` };
      mockJwtVerifySuccess(refreshTokenWithExtraData);

      refreshAuthHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.authPayload).toEqual({ userId: 888 });
      expect(mockRequest.authRefreshToken).toEqual(validRefreshToken);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
