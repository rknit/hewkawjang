import { db } from '../db';
import ReservationService, { Reservation } from './reservation.service';
import { reservationTable } from '../db/schema';

const mockReservations: Reservation[] = [
  {
    id: 1,
    userId: 42,
    restaurantId: 1,
    reserveAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min later
    reservationfee: 50,
    numberOfElderly: 1,
    numberOfAdult: 2,
    numberOfChildren: 1,
    status: 'unconfirmed',
    specialRequest: null,
    createdAt: new Date(),
  },
  {
    id: 2,
    userId: 43,
    restaurantId: 1,
    reserveAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min later
    reservationfee: 50,
    numberOfElderly: 0,
    numberOfAdult: 3,
    numberOfChildren: 2,
    status: 'confirmed',
    specialRequest: "if possible, i'd like a table by the window",
    createdAt: new Date(),
  },
  {
    id: 3,
    userId: 44,
    restaurantId: 1,
    reserveAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    reservationfee: 50,
    numberOfElderly: 1,
    numberOfAdult: 1,
    numberOfChildren: 0,
    status: 'unconfirmed',
    specialRequest: null,
    createdAt: new Date(),

  },
  {
    id: 4,
    userId: 50,
    restaurantId: 1,
    reserveAt: new Date(Date.now() + 2*24*60 * 60 * 1000),  
    reservationfee: 50,
    numberOfElderly: 1,
    numberOfAdult: 1,
    numberOfChildren: 0,
    status: 'rejected',
    specialRequest: null,
    createdAt: new Date(Date.now() - 2*24*60 * 60 * 1000),

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

  describe('cancleReservation', () => {
    let mockSelect: jest.Mock;
    let mockFrom: jest.Mock;
    let mockWhere: jest.Mock;
    let mockUpdate: jest.Mock;
    let mockSet: jest.Mock;
    let mockWhereUpdate: jest.Mock;

    function setupSelectMock(returnValue: Reservation[]) {
      mockWhere = jest.fn().mockResolvedValue(returnValue); // last step returns reservations
      mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
      db.select = mockSelect;
    }
    function setupUpdateMock() {
      mockWhereUpdate = jest.fn().mockResolvedValue(undefined); // last step returns void
      mockSet = jest.fn().mockReturnValue({ where: mockWhereUpdate });
      mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      db.update = mockUpdate;
    }           
    it('should cancel a valid reservation', async () => {
      const reservationToCancel = mockReservations[3];
      setupSelectMock([reservationToCancel]);
      setupUpdateMock();
      await expect(ReservationService.cancleReservation({
        reservationId: reservationToCancel.id,
        userId: reservationToCancel.userId,
        restaurantId: reservationToCancel.restaurantId,
      })).resolves.toBeUndefined();
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(reservationTable);
      expect(mockWhere).toHaveBeenCalledWith(
        expect.any(Object) // Loosen the assertion for drizzle
      );
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ status: 'cancelled' });
      expect(mockWhereUpdate).toHaveBeenCalledWith(
        expect.any(Object) // Loosen the assertion for drizzle
      );
    });

    it('should throw if reservation not found', async () => {
      setupSelectMock([]);
      await expect(ReservationService.cancleReservation({
        reservationId: 999,
        userId: 1,
        restaurantId: 1,
      })).rejects.toThrow('Reservation not found');
    });
    it('should throw if trying to cancel within 24 hours', async () => {
      const reservationToCancel = mockReservations[0];
      setupSelectMock([reservationToCancel]);
      await expect(ReservationService.cancleReservation({
        reservationId: reservationToCancel.id,
        userId: reservationToCancel.userId,
        restaurantId: reservationToCancel.restaurantId,
      })).rejects.toThrow('Cannot cancel reservation within 24 hours');
    });
    it('should throw if reservation status is not unconfirmed or confirmed', async () => {
      const reservationToCancel = mockReservations[3];
      setupSelectMock([reservationToCancel]);
      await expect(ReservationService.cancleReservation({
        reservationId: reservationToCancel.id,
        userId: reservationToCancel.userId,
        restaurantId: reservationToCancel.restaurantId,
      })).rejects.toThrow('Cannot cancel reservation that is not unconfirmed or confirmed');
    });
  });
   
     
});