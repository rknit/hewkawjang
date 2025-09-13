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
const __1 = __importDefault(require("..")); // your Express app
const supertest_1 = __importDefault(require("supertest"));
const reservation_service_1 = __importDefault(require("../service/reservation.service"));
jest.mock('../service/reservation.service');
jest.mock('../db', () => ({
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
describe('Reservation Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /reservations/unconfirmed/inspect', () => {
        it('should return 200 and call getUnconfirmedReservationsByRestaurant', () => __awaiter(void 0, void 0, void 0, function* () {
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
            reservation_service_1.default.getUnconfirmedReservationsByRestaurant = jest.fn().mockResolvedValue(mockReservations);
            yield (0, supertest_1.default)(__1.default)
                .get('/reservations/unconfirmed/inspect')
                .query({ restaurantId: 1 })
                .expect(200)
                .then((response) => {
                expect(response.body).toEqual(mockReservations);
                expect(reservation_service_1.default.getUnconfirmedReservationsByRestaurant).toHaveBeenCalledWith({ restaurantId: 1, offset: undefined });
            });
        }));
        it('should return 400 if restaurantId is missing/not a number', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(__1.default)
                .get('/reservations/unconfirmed/inspect')
                .expect(400)
                .then((response) => {
                expect(response.body.error).toBe('restaurantId must be a number');
            });
        }));
    });
    describe('POST /reservations/cancel', () => {
        it('should return 200 and call cancelReservation for valid request', () => __awaiter(void 0, void 0, void 0, function* () {
            reservation_service_1.default.cancelReservation = jest.fn().mockResolvedValue(undefined);
            yield (0, supertest_1.default)(__1.default)
                .post('/reservations/cancel')
                .send({ reservationId: 1, restaurantId: 1 }) // userId comes from auth middleware mock
                .expect(200);
            expect(reservation_service_1.default.cancelReservation).toHaveBeenCalledWith({
                reservationId: 1,
                userId: 42,
                restaurantId: 1,
            });
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(__1.default)
                .post('/reservations/cancel')
                .send({ reservationId: 1, userId: 42 }) // missing restarantId
                .expect(400)
                .then((response) => {
                expect(response.body.error).toBe('reservationId, userId and restarantId are required');
            });
        }));
    });
});
