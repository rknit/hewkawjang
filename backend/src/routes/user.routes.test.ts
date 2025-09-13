import app from '..';
import request from 'supertest';
import UserService from '../service/user.service';

jest.mock('../service/user.service');

// Mock auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authHandler: (req: any, _res: any, next: any) => {
    if (req.headers['x-skip-auth']) {
      return next();
    }
    req.userAuthPayload = { userId: 42 };
    next();
  },
  authClientTypeHandler: (_req: any, _res: any, next: any) => next(),
  refreshAuthHandler: (_req: any, _res: any, next: any) => next(),
}));

// IMPORTANT: mock client so that it won't error out when SUPABASE_DB_URL is not set in automated tests
jest.mock('../db', () => ({
  client: jest.fn(),
}));

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return 200 and call UserService.getUsers', async () => {
      UserService.getUsers = jest.fn().mockResolvedValue('value');

      await request(app)
        .get('/users')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual('value');
          expect(UserService.getUsers).toHaveBeenCalled();
        });
    });

    it('should accept limit and offset in body JSON', async () => {
      let limit = 5;
      let offset = 10;
      UserService.getUsers = jest.fn().mockResolvedValue('value');

      await request(app)
        .get('/users')
        .send({ limit, offset })
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual('value');
          expect(UserService.getUsers).toHaveBeenCalledWith({
            limit,
            offset,
          });
        });
    });

    it('should accept ids in body JSON', async () => {
      let ids = [1, 2];
      UserService.getUsers = jest.fn().mockResolvedValue('value');

      await request(app)
        .get('/users')
        .send({ ids })
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual('value');
          expect(UserService.getUsers).toHaveBeenCalledWith({
            ids,
          });
        });
    });
  });

  describe('DELETE /users/me', () => {
    it('should return 401 if userId is missing', async () => {
      await request(app)
        .delete('/users/me')
        .set('x-skip-auth', '1') // to skip auth and simulate missing userId
        .expect(401)
        .then((res) => {
          expect(res.body).toEqual({ message: 'Unauthorized' });
        });
    });

    it('should soft delete user successfully', async () => {
      (UserService.softDeleteUser as jest.Mock).mockResolvedValue(true);

      await request(app)
        .delete('/users/me')
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            message: 'User soft deleted successfully',
          });
          expect(UserService.softDeleteUser).toHaveBeenCalledWith(42);
        });
    });
  });

  describe('POST /users/updateProfile', () => {
    it('should update user profile and return 200', async () => {
      (UserService.updateUser as jest.Mock).mockResolvedValue(true);
      const profileData = { id: 42, name: 'New Name', email: 'fff@gmail.com' };

      await request(app)
        .post('/users/updateProfile')
        .send(profileData)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({});
          expect(UserService.updateUser).toHaveBeenCalledWith(profileData);
        });
    });
  });
});
