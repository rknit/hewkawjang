"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("./auth.middleware");
// Mock jwt
jest.mock('jsonwebtoken');
const mockJwt = jsonwebtoken_1.default;
// Mock JWT utilities to avoid needing real JWT secrets in tests
jest.mock('../utils/jwt', () => ({
    ACCESS_TOKEN_SECRET: 'test_access_secret',
    REFRESH_TOKEN_SECRET: 'test_refresh_secret',
}));
describe('Auth Middleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    // Test data
    const validPayload = { userId: 123 };
    const invalidPayload = { someOtherField: 'value' };
    const validToken = 'valid_token_123';
    const invalidToken = 'invalid_token';
    // Helper functions
    const expectUnauthorizedError = () => {
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            status: 401,
            message: 'Unauthorized',
        }));
    };
    const mockJwtVerifySuccess = (payload) => {
        mockJwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, payload);
        });
    };
    const mockJwtVerifyFailure = (error = new Error('Invalid token')) => {
        mockJwt.verify.mockImplementation((token, secret, callback) => {
            callback(error, null);
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
                (0, auth_middleware_1.authHandler)(mockRequest, mockResponse, mockNext);
                expectUnauthorizedError();
            });
        });
        it('should return Unauthorized when JWT verification fails', () => {
            mockRequest.headers = { authorization: `Bearer ${invalidToken}` };
            mockJwtVerifyFailure();
            (0, auth_middleware_1.authHandler)(mockRequest, mockResponse, mockNext);
            expect(mockJwt.verify).toHaveBeenCalledWith(invalidToken, 'test_access_secret', expect.any(Function));
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
                (0, auth_middleware_1.authHandler)(mockRequest, mockResponse, mockNext);
                expectUnauthorizedError();
            });
        });
        it('should set authPayload and call next() for valid token', () => {
            mockRequest.headers = { authorization: `Bearer ${validToken}` };
            mockJwtVerifySuccess(validPayload);
            (0, auth_middleware_1.authHandler)(mockRequest, mockResponse, mockNext);
            expect(mockJwt.verify).toHaveBeenCalledWith(validToken, 'test_access_secret', expect.any(Function));
            expect(mockRequest.userAuthPayload).toEqual(validPayload);
            expect(mockNext).toHaveBeenCalledWith();
        });
        it('should extract payload with only userId from token data', () => {
            const tokenWithExtraData = { userId: 999, otherField: 'value' };
            mockRequest.headers = { authorization: `Bearer ${validToken}` };
            mockJwtVerifySuccess(tokenWithExtraData);
            (0, auth_middleware_1.authHandler)(mockRequest, mockResponse, mockNext);
            expect(mockRequest.userAuthPayload).toEqual({ userId: 999 });
            expect(mockNext).toHaveBeenCalledWith();
        });
    });
    describe('refreshAuthHandler', () => {
        const validRefreshToken = 'valid_refresh_token_123';
        it('should return BadRequest when missing client type', () => {
            mockRequest.headers = { authorization: `Bearer ${validRefreshToken}` };
            (0, auth_middleware_1.refreshAuthHandler)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                status: 400,
                message: 'Missing client type',
            }));
        });
        const testUnauthorizedCases = [
            {
                description: 'missing authorization header in mobile client',
                clientType: 'mobile',
            },
            {
                description: 'empty authorization header in mobile client',
                clientType: 'mobile',
                headers: {
                    authorization: '',
                },
            },
            {
                description: 'missing refreshToken cookie in web client',
                clientType: 'web',
            },
            {
                description: 'empty refreshToken cookie in web client',
                clientType: 'web',
                cookies: { refreshToken: '' },
            },
        ];
        testUnauthorizedCases.forEach(({ description, clientType, headers, cookies }) => {
            it(`should return Unauthorized when ${description}`, () => {
                mockRequest.headers = headers;
                mockRequest.cookies = cookies;
                mockRequest.userAuthClientType = clientType;
                (0, auth_middleware_1.refreshAuthHandler)(mockRequest, mockResponse, mockNext);
                expectUnauthorizedError();
            });
        });
        it('should return Unauthorized when JWT verification fails', () => {
            mockRequest.headers = {
                authorization: `Bearer ${invalidToken}`,
            };
            mockRequest.userAuthClientType = 'mobile';
            mockJwtVerifyFailure();
            (0, auth_middleware_1.refreshAuthHandler)(mockRequest, mockResponse, mockNext);
            expect(mockJwt.verify).toHaveBeenCalledWith(invalidToken, 'test_refresh_secret', expect.any(Function));
            expectUnauthorizedError();
        });
        const invalidPayloadCases = [
            { payload: invalidPayload, description: 'missing userId' },
            { payload: null, description: 'null payload' },
        ];
        invalidPayloadCases.forEach(({ payload, description }) => {
            it(`should return Unauthorized when decoded payload has ${description}`, () => {
                mockRequest.headers = {
                    authorization: `Bearer ${validRefreshToken}`,
                };
                mockRequest.userAuthClientType = 'mobile';
                mockJwtVerifySuccess(payload);
                (0, auth_middleware_1.refreshAuthHandler)(mockRequest, mockResponse, mockNext);
                expectUnauthorizedError();
            });
        });
        it('should set authPayload, authRefreshToken and call next() for valid refresh token in web client', () => {
            mockRequest.cookies = { refreshToken: validRefreshToken };
            mockRequest.userAuthClientType = 'web';
            mockJwtVerifySuccess(validPayload);
            (0, auth_middleware_1.refreshAuthHandler)(mockRequest, mockResponse, mockNext);
            expect(mockJwt.verify).toHaveBeenCalledWith(validRefreshToken, 'test_refresh_secret', expect.any(Function));
            expect(mockRequest.userAuthPayload).toEqual(validPayload);
            expect(mockRequest.userAuthRefreshToken).toEqual(validRefreshToken);
            expect(mockNext).toHaveBeenCalledWith();
        });
        it('should set authPayload, authRefreshToken and call next() for valid refresh token in mobile client', () => {
            mockRequest.headers = {
                authorization: `Bearer ${validRefreshToken}`,
            };
            mockRequest.userAuthClientType = 'mobile';
            mockJwtVerifySuccess(validPayload);
            (0, auth_middleware_1.refreshAuthHandler)(mockRequest, mockResponse, mockNext);
            expect(mockJwt.verify).toHaveBeenCalledWith(validRefreshToken, 'test_refresh_secret', expect.any(Function));
            expect(mockRequest.userAuthPayload).toEqual(validPayload);
            expect(mockRequest.userAuthRefreshToken).toEqual(validRefreshToken);
            expect(mockNext).toHaveBeenCalledWith();
        });
        it('should extract payload with only userId from refresh token data', () => {
            const refreshTokenWithExtraData = { userId: 888, extraData: 'test' };
            mockRequest.headers = {
                authorization: `Bearer ${validRefreshToken}`,
            };
            mockRequest.userAuthClientType = 'mobile';
            mockJwtVerifySuccess(refreshTokenWithExtraData);
            (0, auth_middleware_1.refreshAuthHandler)(mockRequest, mockResponse, mockNext);
            expect(mockRequest.userAuthPayload).toEqual({ userId: 888 });
            expect(mockRequest.userAuthRefreshToken).toEqual(validRefreshToken);
            expect(mockNext).toHaveBeenCalledWith();
        });
    });
});
