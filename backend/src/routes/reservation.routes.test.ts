import app from '..'; // your Express app
import request from 'supertest';
import ReservationService, { Reservation } from '../service/reservation.service';

jest.mock('../service/reservation.service');

jest.mock('../db', () => ({
  client: jest.fn(),
}));

describe('Reservation Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reservations/unconfirmed/inspect', () => {
    it('should return 200 and call getUnconfirmedReservationsByRestaurant', async () => {
      const mockReservations = [
        {
          id: 1,
          userId: 42,
          restaurantId: 1,
          reserveAt: new Date().toISOString(),
          numberOfElderly: 1,
          numberOfAdult: 2,
          numberOfChildren: 1,
          status: 'unconfirmed',
        },
      ];

      ReservationService.getUnconfirmedReservationsByRestaurant = jest.fn().mockResolvedValue(mockReservations);

      await request(app)
        .get('/reservations/unconfirmed/inspect')
        .query({ restaurantId: 1 })
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(mockReservations);
          expect(
            ReservationService.getUnconfirmedReservationsByRestaurant
          ).toHaveBeenCalledWith({ restaurantId: 1, offset: undefined});
        });
    });

    it('should return 400 if restaurantId is missing/not a number', async () => {
      await request(app)
        .get('/reservations/unconfirmed/inspect')
        .expect(400)
        .then((response) => {
          expect(response.body.error).toBe('restaurantId must be a number');
        });
    });
  });
});
