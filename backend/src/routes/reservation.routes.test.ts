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

  describe('POST /api/reservations/cancel', () => {
    it('should return 200 and call cancleReservation', async () => {
      ReservationService.cancleReservation = jest.fn().mockResolvedValue(undefined);
      const requestBody = { reservationId: 1, userId: 42, restarantId: 1 };
      await request(app)
        .post('/reservations/cancel')
        .send(requestBody)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({ message: 'Reservation cancelled successfully' });
          expect(ReservationService.cancleReservation).toHaveBeenCalledWith(requestBody);
        });
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app)
        .post('/reservations/cancel')
        .send({ reservationId: 1, userId: 42 }) // missing restarantId
        .expect(400)
        .then((response) => {
          expect(response.body.error).toBe('reservationId, userId and restarantId are required');
        });
    });
    it('should return 400 if cancleReservation throws an error', async () => {
      ReservationService.cancleReservation = jest.fn().mockRejectedValue(new Error('Some error'));
      const requestBody = { reservationId: 1, userId: 42, restarantId: 1 };
      await request(app)
        .post('/reservations/cancel')
        .send(requestBody)
        .expect(400)
        .then((response) => {
          expect(response.body.error).toBe('Some error');
          expect(ReservationService.cancleReservation).toHaveBeenCalledWith(requestBody);
        });
    });
  });
});
