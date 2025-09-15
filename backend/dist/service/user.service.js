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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const db_1 = require("../db");
const http_errors_1 = __importDefault(require("http-errors"));
const hash_1 = require("../utils/hash");
const _a = (0, drizzle_orm_1.getTableColumns)(schema_1.usersTable), { password: _p, refreshToken: _r } = _a, non_sensitive_user_fields = __rest(_a, ["password", "refreshToken"]);
class UserService {
    static getUsers() {
        return __awaiter(this, arguments, void 0, function* (props = {}) {
            var _a, _b;
            let offset = (_a = props.offset) !== null && _a !== void 0 ? _a : 0;
            let limit = (_b = props.limit) !== null && _b !== void 0 ? _b : 10;
            let query = db_1.db
                .select(non_sensitive_user_fields)
                .from(schema_1.usersTable)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.usersTable.id))
                .offset(offset)
                .limit(limit);
            if (props.ids && props.ids.length > 0) {
                return yield query.where((0, drizzle_orm_1.inArray)(schema_1.usersTable.id, props.ids));
            }
            return yield query;
        });
    }
    static createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let dup = yield db_1.db
                .select({ id: schema_1.usersTable.id })
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, data.email))
                .limit(1);
            if (dup.length > 0) {
                throw http_errors_1.default.Conflict('Email already exists');
            }
            data.password = yield (0, hash_1.hashPassword)(data.password);
            let [newUser] = yield db_1.db
                .insert(schema_1.usersTable)
                .values(data)
                .returning(non_sensitive_user_fields);
            return newUser;
        });
    }
    static registerUser(data, otpSend) {
        return __awaiter(this, void 0, void 0, function* () {
            let dup = yield db_1.db
                .select({ id: schema_1.usersTable.id })
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, data.email))
                .limit(1);
            if (dup.length > 0) {
                throw http_errors_1.default.Conflict('Email already exists');
            }
            let query = yield db_1.db
                .select({
                otp: schema_1.emailVerificationTable.otp,
                sendTime: schema_1.emailVerificationTable.sendTime,
            })
                .from(schema_1.emailVerificationTable)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.emailVerificationTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.emailVerificationTable.email, data.email))
                .limit(1);
            if (query.length === 0) {
                throw http_errors_1.default.Unauthorized('Invalid or expired OTP');
            }
            const { otp, sendTime } = query[0];
            const currentTime = new Date();
            const timeDiff = (currentTime.getTime() - new Date(sendTime).getTime()) / 1000;
            if (otp !== otpSend || timeDiff > 180) {
                throw http_errors_1.default.Unauthorized('Invalid or expired OTP');
            }
            data.password = yield (0, hash_1.hashPassword)(data.password);
            let [newUser] = yield db_1.db
                .insert(schema_1.usersTable)
                .values(data)
                .returning(non_sensitive_user_fields);
            return newUser;
        });
    }
    // Change the value to default "deleted" values since the schema reject null
    static softDeleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Soft delete user
                const result = yield tx
                    .update(schema_1.usersTable)
                    .set({
                    firstName: 'Deleted',
                    lastName: 'User',
                    email: `deleted_${userId}@gmail.com`,
                    phoneNo: '0000000000',
                    password: '',
                    displayName: 'Deleted User',
                    profileUrl: null,
                    refreshToken: null,
                    isDeleted: true,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId))
                    .returning();
                if (!result || result.length === 0)
                    return null;
                // Find all unconfirmed reservations
                const reservations = yield tx
                    .select()
                    .from(schema_1.reservationTable)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reservationTable.userId, userId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.reservationTable.status, 'unconfirmed'), (0, drizzle_orm_1.eq)(schema_1.reservationTable.status, 'confirmed'))));
                // Force cancel them one by one (even if violate the 24-hour constraint)
                for (const r of reservations) {
                    yield tx
                        .update(schema_1.reservationTable)
                        .set({ status: 'cancelled' })
                        .where((0, drizzle_orm_1.eq)(schema_1.reservationTable.id, r.id));
                }
                return result[0];
            }));
        });
    }
    static isUserDeleted(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db
                .select()
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, id))
                .limit(1);
            if (!user) {
                throw http_errors_1.default.NotFound('User not found');
            }
            return user.isDeleted;
        });
    }
    static updateUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = yield db_1.db
                .select({ lastName: schema_1.usersTable.lastName })
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, data.id));
            if (query.length === 0) {
                throw http_errors_1.default.NotFound('User not found');
            }
            yield db_1.db
                .update(schema_1.usersTable)
                .set({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phoneNo: data.phoneNo,
                displayName: data.displayName,
                profileUrl: data.profileUrl,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, data.id));
        });
    }
}
exports.default = UserService;
