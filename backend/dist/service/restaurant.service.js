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
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const db_1 = require("../db");
class RestaurantService {
    static getRestaurants() {
        return __awaiter(this, arguments, void 0, function* (props = {}) {
            var _a, _b;
            let offset = (_a = props.offset) !== null && _a !== void 0 ? _a : 0;
            let limit = (_b = props.limit) !== null && _b !== void 0 ? _b : 10;
            let query = db_1.db
                .select()
                .from(schema_1.restaurantTable)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.restaurantTable.id))
                .offset(offset)
                .limit(limit);
            if (props.ids && props.ids.length > 0) {
                return yield query.where((0, drizzle_orm_1.inArray)(schema_1.restaurantTable.id, props.ids));
            }
            return yield query;
        });
    }
    static getRestaurantsByOwner(props) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let ownerId = props.ownerId;
            let offset = (_a = props.offset) !== null && _a !== void 0 ? _a : 0;
            let limit = (_b = props.limit) !== null && _b !== void 0 ? _b : 10;
            let query = db_1.db
                .select()
                .from(schema_1.restaurantTable)
                .where((0, drizzle_orm_1.eq)(schema_1.restaurantTable.ownerId, ownerId))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.restaurantTable.id))
                .offset(offset)
                .limit(limit);
            return yield query;
        });
    }
    static rejectReservation(reservationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.db
                .update(schema_1.reservationTable)
                .set({ status: 'rejected' })
                .where((0, drizzle_orm_1.eq)(schema_1.reservationTable.id, reservationId));
        });
    }
    static updateRestaurantStatus(restaurantId, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.db
                .update(schema_1.restaurantTable)
                .set({ status: newStatus })
                .where((0, drizzle_orm_1.eq)(schema_1.restaurantTable.id, restaurantId));
        });
    }
}
exports.default = RestaurantService;
