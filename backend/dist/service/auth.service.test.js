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
const db_1 = require("../db");
const auth_service_1 = __importDefault(require("./auth.service"));
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const http_errors_1 = __importDefault(require("http-errors"));
// Mock the database
jest.mock('../db', () => ({
    db: {
        select: jest.fn(),
        update: jest.fn(),
    },
    // IMPORTANT: mock client so that it won't error out when SUPABASE_DB_URL is not set in automated tests
    client: jest.fn(),
}));
// Mock the hash utility
jest.mock('../utils/hash', () => ({
    comparePassword: jest.fn(),
}));
// Mock the JWT utility
jest.mock('../utils/jwt', () => ({
    genJwtTokens: jest.fn(),
}));
const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNo: '+1234567890',
    password: 'hashedPassword123',
    displayName: 'John Doe',
    profileUrl: 'https://example.com/avatars/john.jpg',
    refreshToken: 'existing_refresh_token',
};
const mockTokens = {
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
};
// Helper function to create database mock chains
function createDbMockChains() {
    const mockSelect = jest.fn().mockReturnThis();
    const mockFrom = jest.fn().mockReturnThis();
    const mockWhere = jest.fn();
    const mockUpdate = jest.fn().mockReturnThis();
    const mockSet = jest.fn().mockReturnThis();
    const mockWhereUpdate = jest.fn().mockResolvedValue([]);
    // Wire up the select chain
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    // Wire up the update chain
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhereUpdate });
    // Set up db mocks
    db_1.db.select = mockSelect;
    db_1.db.update = mockUpdate;
    return {
        mockSelect,
        mockFrom,
        mockWhere,
        mockUpdate,
        mockSet,
        mockWhereUpdate,
    };
}
describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('loginUser', () => {
        const loginData = {
            email: 'john.doe@example.com',
            password: 'password123',
        };
        function setupLoginMocks(options = {}) {
            const { userExists = true, passwordMatch = true } = options;
            const { mockWhere } = createDbMockChains();
            mockWhere.mockResolvedValue(userExists ? [mockUser] : []);
            hash_1.comparePassword.mockResolvedValue(passwordMatch);
            jwt_1.genJwtTokens.mockReturnValue(mockTokens);
        }
        it('should successfully login user with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            setupLoginMocks();
            const result = yield auth_service_1.default.loginUser(loginData);
            expect(result).toEqual(mockTokens);
            expect(db_1.db.select).toHaveBeenCalled();
            expect(hash_1.comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword123');
            expect(jwt_1.genJwtTokens).toHaveBeenCalledWith({ userId: 1 });
            expect(db_1.db.update).toHaveBeenCalled();
        }));
        it('should throw Unauthorized error when user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            setupLoginMocks({ userExists: false });
            yield expect(auth_service_1.default.loginUser(loginData)).rejects.toThrow(http_errors_1.default.Unauthorized('Invalid email or password'));
            expect(db_1.db.select).toHaveBeenCalled();
            expect(hash_1.comparePassword).not.toHaveBeenCalled();
            expect(jwt_1.genJwtTokens).not.toHaveBeenCalled();
            expect(db_1.db.update).not.toHaveBeenCalled();
        }));
        it('should throw Unauthorized error when password does not match', () => __awaiter(void 0, void 0, void 0, function* () {
            setupLoginMocks({ passwordMatch: false });
            yield expect(auth_service_1.default.loginUser(loginData)).rejects.toThrow(http_errors_1.default.Unauthorized('Invalid email or password'));
            expect(db_1.db.select).toHaveBeenCalled();
            expect(hash_1.comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword123');
            expect(jwt_1.genJwtTokens).not.toHaveBeenCalled();
            expect(db_1.db.update).not.toHaveBeenCalled();
        }));
        it('should handle different user credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const differentLoginData = {
                email: 'jane.smith@example.com',
                password: 'password456',
            };
            setupLoginMocks();
            yield auth_service_1.default.loginUser(differentLoginData);
            expect(hash_1.comparePassword).toHaveBeenCalledWith('password456', 'hashedPassword123');
        }));
    });
    describe('refreshTokens', () => {
        const refreshToken = 'valid_refresh_token';
        const userAuthPayload = { userId: 1 };
        function setupRefreshMocks(options = {}) {
            const { userExists = true, hasRefreshToken = true, refreshTokenMatches = true, } = options;
            const { mockWhere } = createDbMockChains();
            const userData = userExists
                ? Object.assign(Object.assign({}, mockUser), { refreshToken: hasRefreshToken
                        ? refreshTokenMatches
                            ? refreshToken
                            : 'different_token'
                        : null }) : null;
            mockWhere.mockResolvedValue(userData ? [userData] : []);
            jwt_1.genJwtTokens.mockReturnValue(mockTokens);
        }
        it('should successfully refresh tokens with valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            setupRefreshMocks();
            const result = yield auth_service_1.default.refreshTokens(refreshToken, userAuthPayload);
            expect(result).toEqual(mockTokens);
            expect(db_1.db.select).toHaveBeenCalled();
            expect(jwt_1.genJwtTokens).toHaveBeenCalledWith({ userId: 1 });
            expect(db_1.db.update).toHaveBeenCalled();
        }));
        it('should throw Unauthorized error when user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            setupRefreshMocks({ userExists: false });
            yield expect(auth_service_1.default.refreshTokens(refreshToken, userAuthPayload)).rejects.toThrow(http_errors_1.default.Unauthorized());
            expect(db_1.db.select).toHaveBeenCalled();
            expect(jwt_1.genJwtTokens).not.toHaveBeenCalled();
            expect(db_1.db.update).not.toHaveBeenCalled();
        }));
        it('should throw Unauthorized error when user has no refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            setupRefreshMocks({ hasRefreshToken: false });
            yield expect(auth_service_1.default.refreshTokens(refreshToken, userAuthPayload)).rejects.toThrow(http_errors_1.default.Unauthorized());
            expect(db_1.db.select).toHaveBeenCalled();
            expect(jwt_1.genJwtTokens).not.toHaveBeenCalled();
            expect(db_1.db.update).not.toHaveBeenCalled();
        }));
        it('should throw Unauthorized error when refresh token does not match', () => __awaiter(void 0, void 0, void 0, function* () {
            setupRefreshMocks({ refreshTokenMatches: false });
            yield expect(auth_service_1.default.refreshTokens(refreshToken, userAuthPayload)).rejects.toThrow(http_errors_1.default.Unauthorized());
            expect(db_1.db.select).toHaveBeenCalled();
            expect(jwt_1.genJwtTokens).not.toHaveBeenCalled();
            expect(db_1.db.update).not.toHaveBeenCalled();
        }));
    });
});
