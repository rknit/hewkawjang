"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = __importDefault(require(".."));
const supertest_1 = __importDefault(require("supertest"));
const auth_service_1 = __importDefault(require("../service/auth.service"));
const http_errors_1 = __importDefault(require("http-errors"));
const auth_middleware_1 = require("../middleware/auth.middleware");
jest.mock('../service/auth.service');
jest.mock('../middleware/auth.middleware', () => ({
    authHandler: jest.fn((req, res, next) => next()),
    refreshAuthHandler: jest.fn((req, res, next) => next()),
    authClientTypeHandler: jest.fn(),
}));
// IMPORTANT: mock client so that it won't error out when SUPABASE_DB_URL is not set in automated tests
jest.mock('../db', () => ({
    client: jest.fn(),
}));
// Mock JWT utilities to avoid needing real JWT secrets in tests
jest.mock('../utils/jwt', () => ({
    ACCESS_TOKEN_SECRET: 'test_access_secret',
    REFRESH_TOKEN_SECRET: 'test_refresh_secret',
    genJwtTokens: jest.fn(),
}));
describe('Auth Routes', () => {
    const mockAuthService = auth_service_1.default;
    const mockRefreshAuthHandler = auth_middleware_1.refreshAuthHandler;
    const mockAuthClientTypeHandler = auth_middleware_1.authClientTypeHandler;
    const validLoginData = {
        email: 'test@example.com',
        password: 'password123',
    };
    const mockTokens = {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /auth/login', () => {
        mockAuthClientTypeHandler.mockImplementation((req, res, next) => {
            req.userAuthClientType = 'web';
            next();
        });
        it('should return 200 and tokens for valid credentials in web client', () => __awaiter(void 0, void 0, void 0, function* () {
            mockAuthClientTypeHandler.mockImplementationOnce((req, res, next) => {
                req.userAuthClientType = 'web';
                next();
            });
            mockAuthService.loginUser.mockResolvedValue(mockTokens);
            const response = yield (0, supertest_1.default)(__1.default)
                .post('/auth/login')
                .send(validLoginData)
                .expect(200);
            expect(response.body).toEqual({ accessToken: mockTokens.accessToken });
            expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=mock_refresh_token/);
            expect(mockAuthService.loginUser).toHaveBeenCalledWith(validLoginData);
        }));
        it('should return 200 and tokens for valid credentials in mobile client', () => __awaiter(void 0, void 0, void 0, function* () {
            mockAuthClientTypeHandler.mockImplementationOnce((req, res, next) => {
                req.userAuthClientType = 'mobile';
                next();
            });
            mockAuthService.loginUser.mockResolvedValue(mockTokens);
            const response = yield (0, supertest_1.default)(__1.default)
                .post('/auth/login')
                .send(validLoginData)
                .expect(200);
            expect(response.body).toEqual(mockTokens);
            expect(mockAuthService.loginUser).toHaveBeenCalledWith(validLoginData);
        }));
        it('should return 400 when email or password is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const testCases = [
                { password: 'password123' }, // missing email
                { email: 'test@example.com' }, // missing password
                {}, // missing both
            ];
            for (const testCase of testCases) {
                const response = yield (0, supertest_1.default)(__1.default)
                    .post('/auth/login')
                    .send(testCase)
                    .expect(400);
                expect(response.body.error.message).toBe('Email and password are required');
                expect(mockAuthService.loginUser).not.toHaveBeenCalled();
            }
        }));
        it('should return 401 for invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidLoginData = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };
            const error = http_errors_1.default.Unauthorized('Invalid email or password');
            mockAuthService.loginUser.mockRejectedValue(error);
            yield (0, supertest_1.default)(__1.default).post('/auth/login').send(invalidLoginData).expect(401);
            expect(mockAuthService.loginUser).toHaveBeenCalledWith(invalidLoginData);
        }));
    });
    // fail path is tested in auth middleware test suite
    describe('POST /auth/refresh', () => {
        mockRefreshAuthHandler.mockImplementation((req, res, next) => {
            req.userAuthPayload = { userId: 1 };
            req.userAuthRefreshToken = 'valid_refresh_token';
            next();
        });
        it('should return 200 and new tokens for valid refresh token in web client', () => __awaiter(void 0, void 0, void 0, function* () {
            mockAuthClientTypeHandler.mockImplementationOnce((req, res, next) => {
                req.userAuthClientType = 'web';
                next();
            });
            mockAuthService.refreshTokens.mockResolvedValue(mockTokens);
            const response = yield (0, supertest_1.default)(__1.default)
                .post('/auth/refresh')
                .set('Cookie', ['refreshToken=valid_refresh_token'])
                .expect(200);
            expect(response.body).toEqual({ accessToken: mockTokens.accessToken });
            expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=mock_refresh_token/);
            expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('valid_refresh_token', { userId: 1 });
        }));
        it('should return 200 and new tokens for valid refresh token in mobile client', () => __awaiter(void 0, void 0, void 0, function* () {
            mockAuthClientTypeHandler.mockImplementationOnce((req, res, next) => {
                req.userAuthClientType = 'mobile';
                next();
            });
            mockAuthService.refreshTokens.mockResolvedValue(mockTokens);
            const response = yield (0, supertest_1.default)(__1.default)
                .post('/auth/refresh')
                .set('Authorization', 'Bearer valid_refresh_token')
                .expect(200);
            expect(response.body).toEqual(mockTokens);
            expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('valid_refresh_token', { userId: 1 });
        }));
    });
});
