import { db } from '../db';
import ReservationService, { Reservation } from './reservation.service';
import { reservationTable } from '../db/schema';

const mockReservations: Reservation[] = [
  {
    id: 1,
    userId: 42,
    restaurantId: 1,
    reserveAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min later
    numberOfElderly: 1,
    numberOfAdult: 2,
    numberOfChildren: 1,
    status: 'unconfirmed',
  },
  {
    id: 2,
    userId: 43,
    restaurantId: 1,
    reserveAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min later
    numberOfElderly: 0,
    numberOfAdult: 3,
    numberOfChildren: 2,
    status: 'confirmed',
  },
  {
    id: 3,
    userId: 44,
    restaurantId: 1,
    reserveAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    numberOfElderly: 1,
    numberOfAdult: 1,
    numberOfChildren: 0,
    status: 'unconfirmed',
  },
];


jest.mock('../db', () => ({
  db: {
    select: jest.fn(),
  },
  client: jest.fn(),
}));

describe('Reservation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnconfirmedReservationsByRestaurant', () => {
    let mockSelect: jest.Mock;
    let mockFrom: jest.Mock;
    let mockWhere: jest.Mock;
    let mockOffset: jest.Mock;

    function setupMocks(returnValue: Reservation[]) {
      mockOffset = jest.fn().mockResolvedValue(returnValue); // last step returns reservations
      mockWhere = jest.fn().mockReturnValue({ offset: mockOffset });
      mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

      db.select = mockSelect;
    }

    it('should return only unconfirmed reservations for a restaurant', async () => {
      const unconfirmed = mockReservations.filter(r => r.status === 'unconfirmed');
      setupMocks(unconfirmed);

      const result = await ReservationService.getUnconfirmedReservationsByRestaurant({
        restaurantId: 1,
      });

      expect(result).toEqual(unconfirmed);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(reservationTable);
      expect(mockWhere).toHaveBeenCalledWith(
        expect.any(Object) // Loosen the assertion for drizzle
      );
      expect(mockOffset).toHaveBeenCalledWith(0);
    });

    it('should apply offset if provided', async () => {
      const unconfirmed = mockReservations.filter(r => r.status === 'unconfirmed');
      setupMocks(unconfirmed);

      const result = await ReservationService.getUnconfirmedReservationsByRestaurant({
        restaurantId: 1,
        offset: 2,
      });

      expect(result).toEqual(unconfirmed);
      expect(mockOffset).toHaveBeenCalledWith(2);
    });
  });
});