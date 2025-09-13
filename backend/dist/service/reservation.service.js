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
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const db_1 = require("../db");
const http_errors_1 = __importDefault(require("http-errors"));
class ReservationService {
    static getUnconfirmedReservationsByRestaurant(props) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let restaurantId = props.restaurantId;
            let offset = (_a = props.offset) !== null && _a !== void 0 ? _a : 0;
            let reservations = yield db_1.db
                .select()
                .from(schema_1.reservationTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reservationTable.restaurantId, restaurantId), (0, drizzle_orm_1.eq)(schema_1.reservationTable.status, 'unconfirmed')))
                .offset(offset);
            return reservations;
        });
    }
    static cancelReservation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let reservationId = data.reservationId;
            let userId = data.userId;
            let restarantId = data.restaurantId;
            let reservation = yield db_1.db
                .select()
                .from(schema_1.reservationTable)
                .where((0, drizzle_orm_1.eq)(schema_1.reservationTable.id, reservationId));
            if (!reservation || reservation.length === 0) {
                throw new http_errors_1.default.NotFound('Reservation not found');
            }
            if (new Date(reservation[0].reserveAt).getTime() - Date.now() <=
                24 * 60 * 60 * 1000) {
                throw new http_errors_1.default.BadRequest('Cannot cancel reservation within 24 hours');
            }
            if (reservation[0].status !== 'unconfirmed' &&
                reservation[0].status !== 'confirmed') {
                throw new http_errors_1.default.BadRequest('Reservation status must be unconfirmed or confirmed to cancel');
            }
            yield db_1.db
                .update(schema_1.reservationTable)
                .set({ status: 'cancelled' })
                .where((0, drizzle_orm_1.eq)(schema_1.reservationTable.id, reservationId));
        });
    }
}
exports.default = ReservationService;
