"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = void 0;
exports.genJwtTokens = genJwtTokens;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
if (process.env.NODE_ENV !== 'test' &&
    (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET)) {
    throw new Error('JWT secrets must be defined in environment variables');
}
exports.ACCESS_TOKEN_SECRET = (_a = process.env.ACCESS_TOKEN_SECRET) !== null && _a !== void 0 ? _a : 'access_secret';
exports.REFRESH_TOKEN_SECRET = (_b = process.env.REFRESH_TOKEN_SECRET) !== null && _b !== void 0 ? _b : 'refresh_secret';
function genJwtTokens(payload) {
    const accessToken = genJwtAccessToken(payload);
    const refreshToken = genJwtRefreshToken(payload);
    return { accessToken, refreshToken };
}
function genJwtAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, exports.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
        algorithm: 'HS512',
    });
}
function genJwtRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, exports.REFRESH_TOKEN_SECRET, {
        expiresIn: '1d',
        algorithm: 'HS512',
    });
}
