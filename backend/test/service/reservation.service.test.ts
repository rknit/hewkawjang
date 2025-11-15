import ReservationService from '../../src/service/reservation.service';
import { db } from '../../src/db';
import RefundService from '../../src/service/refund.service';
import NotificationService from '../../src/service/notification.service';
import createHttpError from 'http-errors';

// Mock dependencies
jest.mock('../../src/db', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
  },
  client: jest.fn(), // Prevents SUPABASE_DB_URL errors
}));

jest.mock('../../src/service/refund.service');
jest.mock('../../src/service/notification.service');

describe('ReservationService.cancelReservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    RefundService.processRefund = jest.fn().mockResolvedValue(undefined);
    NotificationService.notifyReservationStatuses = jest.fn().mockResolvedValue(undefined);
  });

  // Helper to create mock database query chains
  const createSelectMock = (returnValue: any) => {
    const mockFrom = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue(returnValue);

    (db.select as jest.Mock).mockReturnValue({
      from: mockFrom,
    });

    mockFrom.mockReturnValue({
      where: mockWhere,
    });

    mockWhere.mockReturnValue({
      limit: mockLimit,
    });

    return { mockFrom, mockWhere, mockLimit };
  };

  const createUpdateMock = (returnValue: any) => {
    const mockSet = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockReturnThis();
    const mockReturning = jest.fn().mockResolvedValue(returnValue);

    (db.update as jest.Mock).mockReturnValue({
      set: mockSet,
    });

    mockSet.mockReturnValue({
      where: mockWhere,
    });

    mockWhere.mockReturnValue({
      returning: mockReturning,
    });

    return { mockSet, mockWhere, mockReturning };
  };

  describe('Successful cancellations', () => {
    it('should allow user to cancel their own reservation', async () => {
      const mockReservation = {
        id: 1,
        userId: 100,
        restaurantId: 50,
        status: 'confirmed',
        reservationFee: 500,
      };

      const mockUpdatedReservation = {
        ...mockReservation,
        status: 'cancelled',
      };

      // Mock SELECT for finding reservation
      createSelectMock([mockReservation]);

      // Mock SELECT for validateReservationOwnership (not needed for user)
      // Mock UPDATE for cancellation
      createUpdateMock([mockUpdatedReservation]);

      await ReservationService.cancelReservation({
        reservationId: 1,
        userId: 100,
        cancelBy: 'user',
      });

      // Verify refund was called (user cancellation triggers refund)
      expect(RefundService.processRefund).toHaveBeenCalledWith(1, 'customer_cancel');

      // Verify notification was sent to restaurant owner
      expect(NotificationService.notifyReservationStatuses).toHaveBeenCalledWith([
        {
          reservation: mockUpdatedReservation,
          target: 'restaurant_owner',
        },
      ]);
    });

    it('should allow restaurant owner to cancel reservation', async () => {
      const mockReservation = {
        id: 2,
        userId: 100,
        restaurantId: 50,
        status: 'unconfirmed',
        reservationFee: 300,
      };

      const mockRestaurant = {
        id: 50,
        ownerId: 200,
        wallet: 5000,
      };

      const mockUpdatedReservation = {
        ...mockReservation,
        status: 'cancelled',
      };

      // First SELECT: find reservation
      let selectCallCount = 0;
      (db.select as jest.Mock).mockImplementation(() => {
        selectCallCount++;
        const mockFrom = jest.fn().mockReturnThis();
        const mockWhere = jest.fn().mockReturnThis();
        const mockLimit = jest.fn();

        if (selectCallCount === 1) {
          // First call: find reservation
          mockLimit.mockResolvedValue([mockReservation]);
        } else {
          // Second call: find restaurant (for validateReservationOwnership)
          mockLimit.mockResolvedValue([mockRestaurant]);
        }

        mockFrom.mockReturnValue({ where: mockWhere });
        mockWhere.mockReturnValue({ limit: mockLimit });

        return { from: mockFrom };
      });

      // Mock UPDATE for cancellation
      createUpdateMock([mockUpdatedReservation]);

      await ReservationService.cancelReservation({
        reservationId: 2,
        userId: 200,
        cancelBy: 'restaurant_owner',
      });

      // Verify refund was NOT called (restaurant owner cancellation doesn't trigger refund here)
      expect(RefundService.processRefund).not.toHaveBeenCalled();

      // Verify notification was sent to user
      expect(NotificationService.notifyReservationStatuses).toHaveBeenCalledWith([
        {
          reservation: mockUpdatedReservation,
          target: 'user',
        },
      ]);
    });
  });

  describe('Error cases - Not Found', () => {
    it('should throw NotFound error when reservation does not exist', async () => {
      // Mock empty result
      createSelectMock([]);

      await expect(
        ReservationService.cancelReservation({
          reservationId: 999,
          userId: 100,
          cancelBy: 'user',
        })
      ).rejects.toThrow(createHttpError.NotFound('Reservation not found'));
    });
  });

  describe('Error cases - Authorization', () => {
    it('should throw Forbidden when user tries to cancel someone else\'s reservation', async () => {
      const mockReservation = {
        id: 1,
        userId: 100, // Different user
        restaurantId: 50,
        status: 'confirmed',
      };

      createSelectMock([mockReservation]);

      await expect(
        ReservationService.cancelReservation({
          reservationId: 1,
          userId: 999, // Wrong user
          cancelBy: 'user',
        })
      ).rejects.toThrow(createHttpError.Forbidden);
    });

    it('should throw Forbidden when wrong restaurant owner tries to cancel', async () => {
      const mockReservation = {
        id: 2,
        userId: 100,
        restaurantId: 50,
        status: 'confirmed',
      };

      const mockRestaurant = {
        id: 50,
        ownerId: 200, // Actual owner
        wallet: 5000,
      };

      // First SELECT: find reservation
      let selectCallCount = 0;
      (db.select as jest.Mock).mockImplementation(() => {
        selectCallCount++;
        const mockFrom = jest.fn().mockReturnThis();
        const mockWhere = jest.fn().mockReturnThis();
        const mockLimit = jest.fn();

        if (selectCallCount === 1) {
          mockLimit.mockResolvedValue([mockReservation]);
        } else {
          mockLimit.mockResolvedValue([mockRestaurant]);
        }

        mockFrom.mockReturnValue({ where: mockWhere });
        mockWhere.mockReturnValue({ limit: mockLimit });

        return { from: mockFrom };
      });

      await expect(
        ReservationService.cancelReservation({
          reservationId: 2,
          userId: 999, // Wrong owner
          cancelBy: 'restaurant_owner',
        })
      ).rejects.toThrow(createHttpError.Forbidden);
    });
  });

  describe('Error cases - Invalid Status', () => {
    it('should throw BadRequest when trying to cancel already cancelled reservation', async () => {
      const mockReservation = {
        id: 1,
        userId: 100,
        restaurantId: 50,
        status: 'cancelled', // Already cancelled
      };

      createSelectMock([mockReservation]);

      await expect(
        ReservationService.cancelReservation({
          reservationId: 1,
          userId: 100,
          cancelBy: 'user',
        })
      ).rejects.toThrow(
        createHttpError.BadRequest(
          'Reservation status must be unconfirmed or confirmed to cancel'
        )
      );
    });

    it('should throw BadRequest when trying to cancel completed reservation', async () => {
      const mockReservation = {
        id: 1,
        userId: 100,
        restaurantId: 50,
        status: 'completed', // Already completed
      };

      createSelectMock([mockReservation]);

      await expect(
        ReservationService.cancelReservation({
          reservationId: 1,
          userId: 100,
          cancelBy: 'user',
        })
      ).rejects.toThrow(createHttpError.BadRequest);
    });

    it('should throw BadRequest when trying to cancel rejected reservation', async () => {
      const mockReservation = {
        id: 1,
        userId: 100,
        restaurantId: 50,
        status: 'rejected',
      };

      createSelectMock([mockReservation]);

      await expect(
        ReservationService.cancelReservation({
          reservationId: 1,
          userId: 100,
          cancelBy: 'user',
        })
      ).rejects.toThrow(createHttpError.BadRequest);
    });
  });

  describe('Refund processing', () => {
    it('should call RefundService when user cancels', async () => {
      const mockReservation = {
        id: 1,
        userId: 100,
        restaurantId: 50,
        status: 'confirmed',
      };

      const mockUpdatedReservation = {
        ...mockReservation,
        status: 'cancelled',
      };

      createSelectMock([mockReservation]);
      createUpdateMock([mockUpdatedReservation]);

      await ReservationService.cancelReservation({
        reservationId: 1,
        userId: 100,
        cancelBy: 'user',
      });

      expect(RefundService.processRefund).toHaveBeenCalledTimes(1);
      expect(RefundService.processRefund).toHaveBeenCalledWith(1, 'customer_cancel');
    });

    it('should NOT call RefundService when restaurant owner cancels', async () => {
      const mockReservation = {
        id: 2,
        userId: 100,
        restaurantId: 50,
        status: 'confirmed',
      };

      const mockRestaurant = {
        id: 50,
        ownerId: 200,
        wallet: 5000,
      };

      const mockUpdatedReservation = {
        ...mockReservation,
        status: 'cancelled',
      };

      // Mock SELECT calls
      let selectCallCount = 0;
      (db.select as jest.Mock).mockImplementation(() => {
        selectCallCount++;
        const mockFrom = jest.fn().mockReturnThis();
        const mockWhere = jest.fn().mockReturnThis();
        const mockLimit = jest.fn();

        if (selectCallCount === 1) {
          mockLimit.mockResolvedValue([mockReservation]);
        } else {
          mockLimit.mockResolvedValue([mockRestaurant]);
        }

        mockFrom.mockReturnValue({ where: mockWhere });
        mockWhere.mockReturnValue({ limit: mockLimit });

        return { from: mockFrom };
      });

      createUpdateMock([mockUpdatedReservation]);

      await ReservationService.cancelReservation({
        reservationId: 2,
        userId: 200,
        cancelBy: 'restaurant_owner',
      });

      expect(RefundService.processRefund).not.toHaveBeenCalled();
    });
  });
});
