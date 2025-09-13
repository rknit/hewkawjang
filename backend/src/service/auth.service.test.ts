import { db } from '../db';
import AuthService, { LoginUser, UserAuthPayload } from './auth.service';
import { comparePassword } from '../utils/hash';
import { genJwtTokens, JwtTokens } from '../utils/jwt';
import createHttpError from 'http-errors';

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

const mockTokens: JwtTokens = {
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
  (db.select as jest.Mock) = mockSelect;
  (db.update as jest.Mock) = mockUpdate;

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
    const loginData: LoginUser = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    function setupLoginMocks(
      options: {
        userExists?: boolean;
        passwordMatch?: boolean;
      } = {},
    ) {
      const { userExists = true, passwordMatch = true } = options;

      const { mockWhere } = createDbMockChains();

      mockWhere.mockResolvedValue(userExists ? [mockUser] : []);
      (comparePassword as jest.Mock).mockResolvedValue(passwordMatch);
      (genJwtTokens as jest.Mock).mockReturnValue(mockTokens);
    }

    it('should successfully login user with valid credentials', async () => {
      setupLoginMocks();

      const result = await AuthService.loginUser(loginData);

      expect(result).toEqual(mockTokens);
      expect(db.select).toHaveBeenCalled();
      expect(comparePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(genJwtTokens).toHaveBeenCalledWith({ userId: 1 });
      expect(db.update).toHaveBeenCalled();
    });

    it('should throw Unauthorized error when user does not exist', async () => {
      setupLoginMocks({ userExists: false });

      await expect(AuthService.loginUser(loginData)).rejects.toThrow(
        createHttpError.Unauthorized('Invalid email or password'),
      );

      expect(db.select).toHaveBeenCalled();
      expect(comparePassword).not.toHaveBeenCalled();
      expect(genJwtTokens).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should throw Unauthorized error when password does not match', async () => {
      setupLoginMocks({ passwordMatch: false });

      await expect(AuthService.loginUser(loginData)).rejects.toThrow(
        createHttpError.Unauthorized('Invalid email or password'),
      );

      expect(db.select).toHaveBeenCalled();
      expect(comparePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(genJwtTokens).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should handle different user credentials', async () => {
      const differentLoginData: LoginUser = {
        email: 'jane.smith@example.com',
        password: 'password456',
      };

      setupLoginMocks();

      await AuthService.loginUser(differentLoginData);

      expect(comparePassword).toHaveBeenCalledWith(
        'password456',
        'hashedPassword123',
      );
    });
  });

  describe('refreshTokens', () => {
    const refreshToken = 'valid_refresh_token';
    const userAuthPayload: UserAuthPayload = { userId: 1 };

    function setupRefreshMocks(
      options: {
        userExists?: boolean;
        hasRefreshToken?: boolean;
        refreshTokenMatches?: boolean;
      } = {},
    ) {
      const {
        userExists = true,
        hasRefreshToken = true,
        refreshTokenMatches = true,
      } = options;

      const { mockWhere } = createDbMockChains();

      const userData = userExists
        ? {
            ...mockUser,
            refreshToken: hasRefreshToken
              ? refreshTokenMatches
                ? refreshToken
                : 'different_token'
              : null,
          }
        : null;

      mockWhere.mockResolvedValue(userData ? [userData] : []);
      (genJwtTokens as jest.Mock).mockReturnValue(mockTokens);
    }

    it('should successfully refresh tokens with valid refresh token', async () => {
      setupRefreshMocks();

      const result = await AuthService.refreshTokens(
        refreshToken,
        userAuthPayload,
      );

      expect(result).toEqual(mockTokens);
      expect(db.select).toHaveBeenCalled();
      expect(genJwtTokens).toHaveBeenCalledWith({ userId: 1 });
      expect(db.update).toHaveBeenCalled();
    });

    it('should throw Unauthorized error when user does not exist', async () => {
      setupRefreshMocks({ userExists: false });

      await expect(
        AuthService.refreshTokens(refreshToken, userAuthPayload),
      ).rejects.toThrow(createHttpError.Unauthorized());

      expect(db.select).toHaveBeenCalled();
      expect(genJwtTokens).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should throw Unauthorized error when user has no refresh token', async () => {
      setupRefreshMocks({ hasRefreshToken: false });

      await expect(
        AuthService.refreshTokens(refreshToken, userAuthPayload),
      ).rejects.toThrow(createHttpError.Unauthorized());

      expect(db.select).toHaveBeenCalled();
      expect(genJwtTokens).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should throw Unauthorized error when refresh token does not match', async () => {
      setupRefreshMocks({ refreshTokenMatches: false });

      await expect(
        AuthService.refreshTokens(refreshToken, userAuthPayload),
      ).rejects.toThrow(createHttpError.Unauthorized());

      expect(db.select).toHaveBeenCalled();
      expect(genJwtTokens).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });
  });
});
