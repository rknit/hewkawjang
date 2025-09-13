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
const reservation_service_1 = __importDefault(require("./reservation.service"));
const schema_1 = require("../db/schema");
const mockReservations = [
    {
        id: 1,
        userId: 42,
        restaurantId: 1,
        reserveAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min later
        reservationfee: 50,
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
        reserveAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        reservationfee: 50,
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
        reserveAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        reservationfee: 50,
        numberOfAdult: 1,
        numberOfChildren: 0,
        status: 'rejected',
        specialRequest: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
];
jest.mock('../db', () => ({
    db: {
        select: jest.fn(),
    },
    client: jest.fn(),
}));
jest.mock('../middleware/auth.middleware', () => ({
    authHandler: (req, _res, next) => {
        req.userAuthPayload = { userId: 42 };
        next();
    },
    authClientTypeHandler: (_req, _res, next) => next(),
    refreshAuthHandler: (_req, _res, next) => next(),
}));
describe('Reservation Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getUnconfirmedReservationsByRestaurant', () => {
        let mockSelect;
        let mockFrom;
        let mockWhere;
        let mockOffset;
        function setupMocks(returnValue) {
            mockOffset = jest.fn().mockResolvedValue(returnValue); // last step returns reservations
            mockWhere = jest.fn().mockReturnValue({ offset: mockOffset });
            mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            db_1.db.select = mockSelect;
        }
        it('should return only unconfirmed reservations for a restaurant', () => __awaiter(void 0, void 0, void 0, function* () {
            const unconfirmed = mockReservations.filter(r => r.status === 'unconfirmed');
            setupMocks(unconfirmed);
            const result = yield reservation_service_1.default.getUnconfirmedReservationsByRestaurant({
                restaurantId: 1,
            });
            expect(result).toEqual(unconfirmed);
            expect(mockSelect).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith(schema_1.reservationTable);
            expect(mockWhere).toHaveBeenCalledWith(expect.any(Object) // Loosen the assertion for drizzle
            );
            expect(mockOffset).toHaveBeenCalledWith(0);
        }));
        it('should apply offset if provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const unconfirmed = mockReservations.filter(r => r.status === 'unconfirmed');
            setupMocks(unconfirmed);
            const result = yield reservation_service_1.default.getUnconfirmedReservationsByRestaurant({
                restaurantId: 1,
                offset: 2,
            });
            expect(result).toEqual(unconfirmed);
            expect(mockOffset).toHaveBeenCalledWith(2);
        }));
    });
    describe('cancelReservation', () => {
        let mockSelect;
        let mockFrom;
        let mockWhere;
        let mockUpdate;
        let mockSet;
        let mockWhereUpdate;
        function setupSelectMock(returnValue) {
            mockWhere = jest.fn().mockResolvedValue(returnValue); // last step returns reservations
            mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            db_1.db.select = mockSelect;
        }
        function setupUpdateMock() {
            mockWhereUpdate = jest.fn().mockResolvedValue(undefined); // last step returns void
            mockSet = jest.fn().mockReturnValue({ where: mockWhereUpdate });
            mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            db_1.db.update = mockUpdate;
        }
        it('should cancel a valid reservation', () => __awaiter(void 0, void 0, void 0, function* () {
            const reservationToCancel = mockReservations[2]; // unconfirmed reservation more than 24 hours away
            setupSelectMock([reservationToCancel]);
            setupUpdateMock();
            yield expect(reservation_service_1.default.cancelReservation({
                reservationId: reservationToCancel.id,
                userId: reservationToCancel.userId,
                restaurantId: reservationToCancel.restaurantId,
            })).resolves.toBeUndefined();
            expect(mockSelect).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith(schema_1.reservationTable);
            expect(mockWhere).toHaveBeenCalledWith(expect.any(Object) // Loosen the assertion for drizzle
            );
            expect(mockUpdate).toHaveBeenCalled();
            expect(mockSet).toHaveBeenCalledWith({ status: 'cancelled' });
            expect(mockWhereUpdate).toHaveBeenCalledWith(expect.any(Object) // Loosen the assertion for drizzle
            );
        }));
        it('should throw if reservation not found', () => __awaiter(void 0, void 0, void 0, function* () {
            setupSelectMock([]);
            yield expect(reservation_service_1.default.cancelReservation({
                reservationId: 999,
                userId: 1,
                restaurantId: 1,
            })).rejects.toThrow('Reservation not found');
        }));
        it('should throw if trying to cancel within 24 hours', () => __awaiter(void 0, void 0, void 0, function* () {
            const reservationToCancel = mockReservations[0];
            setupSelectMock([reservationToCancel]);
            yield expect(reservation_service_1.default.cancelReservation({
                reservationId: reservationToCancel.id,
                userId: reservationToCancel.userId,
                restaurantId: reservationToCancel.restaurantId,
            })).rejects.toThrow('Cannot cancel reservation within 24 hours');
        }));
        it('should throw if reservation status is not unconfirmed or confirmed', () => __awaiter(void 0, void 0, void 0, function* () {
            const reservationToCancel = mockReservations[3];
            setupSelectMock([reservationToCancel]);
            yield expect(reservation_service_1.default.cancelReservation({
                reservationId: reservationToCancel.id,
                userId: reservationToCancel.userId,
                restaurantId: reservationToCancel.restaurantId,
            })).rejects.toThrow('Reservation status must be unconfirmed or confirmed to cancel');
        }));
    });
});
