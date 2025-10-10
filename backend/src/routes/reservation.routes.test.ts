import app from '..'; // your Express app
import request from 'supertest';
import ReservationService, {
  Reservation,
} from '../service/reservation.service';
import { create } from 'domain';

jest.mock('../service/reservation.service');

jest.mock('../db', () => ({
  client: jest.fn(),
}));

jest.mock('../middleware/auth.middleware', () => ({
  authHandler: (req: any, _res: any, next: any) => {
    req.userAuthPayload = { userId: 42 };
    next();
  },
  authClientTypeHandler: (_req: any, _res: any, next: any) => next(),
  refreshAuthHandler: (_req: any, _res: any, next: any) => next(),
}));

describe('Reservation Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /reservations/unconfirmed/inspect', () => {
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

      ReservationService.getUnconfirmedReservationsByRestaurant = jest
        .fn()
        .mockResolvedValue(mockReservations);

      await request(app)
        .get('/reservations/unconfirmed/inspect')
        .query({ restaurantId: 1 })
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(mockReservations);
          expect(
            ReservationService.getUnconfirmedReservationsByRestaurant,
          ).toHaveBeenCalledWith({ restaurantId: 1, offset: undefined });
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

  describe('POST /reservations/cancel', () => {
    it('should return 200 and call cancelReservation for valid request', async () => {
      ReservationService.cancelReservation = jest
        .fn()
        .mockResolvedValue(undefined);
      await request(app)
        .post('/reservations/cancel')
        .send({ reservationId: 1, restaurantId: 1 }) // userId comes from auth middleware mock
        .expect(200);

      expect(ReservationService.cancelReservation).toHaveBeenCalledWith({
        reservationId: 1,
        userId: 42,
        restaurantId: 1,
      });
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app)
        .post('/reservations/cancel')
        .send({ reservationId: 1, userId: 42 }) // missing restarantId
        .expect(400)
        .then((response) => {
          expect(response.body.error).toBe(
            'reservationId, userId and restarantId are required',
          );
        });
    });
  });
});

describe('POST /reservations/create', () => {
  it('should return 201 and call createReservation when 30+ minutes ahead', async () => {
    const future = new Date(Date.now() + 31 * 60 * 1000).toISOString();
    const mockCreated = { id: 123, restaurantId: 1, userId: 42 };

    (ReservationService.createReservation as jest.Mock).mockResolvedValue(
      mockCreated,
    );

    await request(app)
      .post('/reservations/create')
      .send({
        restaurantId: 1,
        reserveAt: future,
        numberOfAdult: 2,
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toEqual(mockCreated);
        expect(ReservationService.createReservation).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 42,
            restaurantId: 1,
            // reserveAt will be a Date, so just check it’s a Date
            reserveAt: expect.any(Date),
            numberOfAdult: 2,
          }),
        );
      });
  });

  it('should return 400 if reservation is less than 30 minutes away', async () => {
    const tooSoon = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await request(app)
      .post('/reservations/create')
      .send({ restaurantId: 1, reserveAt: tooSoon })
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe(
          'Reservation must be made at least 30 minutes in advance',
        );
      });
  });

  it('should return 400 if required fields missing', async () => {
    await request(app)
      .post('/reservations/create')
      .send({}) // no restaurantId or reserveAt
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe(
          'userId, restaurantId and reserveAt are required',
        );
      });
  });
});
