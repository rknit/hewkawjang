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
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const db_1 = require("../db");
const http_errors_1 = __importDefault(require("http-errors"));
class AuthService {
    static loginUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let [user] = yield db_1.db
                .select()
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, data.email));
            if (!user) {
                throw http_errors_1.default.Unauthorized('Invalid email or password');
            }
            const isMatch = yield (0, hash_1.comparePassword)(data.password, user.password);
            if (!isMatch) {
                throw http_errors_1.default.Unauthorized('Invalid email or password');
            }
            const payload = { userId: user.id };
            const tokens = (0, jwt_1.genJwtTokens)(payload);
            // Store refresh token in database
            yield db_1.db
                .update(schema_1.usersTable)
                .set({ refreshToken: tokens.refreshToken })
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, user.id));
            return tokens;
        });
    }
    static logoutUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.db
                .update(schema_1.usersTable)
                .set({ refreshToken: null })
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, data.userId))
                .returning({ id: schema_1.usersTable.id });
            if (result.length === 0) {
                throw http_errors_1.default.NotFound('User not found or already logged out');
            }
        });
    }
    static refreshTokens(refreshToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db
                .select()
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, data.userId));
            if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
                throw http_errors_1.default.Unauthorized();
            }
            const payload = { userId: user.id };
            const tokens = (0, jwt_1.genJwtTokens)(payload);
            // Store refresh token in database
            yield db_1.db
                .update(schema_1.usersTable)
                .set({ refreshToken: tokens.refreshToken })
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, user.id));
            return tokens;
        });
    }
}
exports.default = AuthService;
