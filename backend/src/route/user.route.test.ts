import app from '..';
import request from 'supertest';
import UserService from '../service/user.service';

jest.mock('../service/user.service');

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
});
