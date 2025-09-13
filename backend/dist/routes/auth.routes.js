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
const express_1 = __importDefault(require("express"));
const auth_service_1 = __importDefault(require("../service/auth.service"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const http_errors_1 = __importDefault(require("http-errors"));
const router = express_1.default.Router();
// Login and get tokens
router.post('/login', auth_middleware_1.authClientTypeHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    if (!user.email || !user.password) {
        throw http_errors_1.default.BadRequest('Email and password are required');
    }
    const tokens = yield auth_service_1.default.loginUser(user);
    responseTokens(req, res, tokens);
}));
// Token refresh
router.post('/refresh', auth_middleware_1.authClientTypeHandler, auth_middleware_1.refreshAuthHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userAuthRefreshToken || !req.userAuthPayload) {
        // This should not happen due to the middleware, but just in case
        throw http_errors_1.default.InternalServerError();
    }
    const tokens = yield auth_service_1.default.refreshTokens(req.userAuthRefreshToken, req.userAuthPayload);
    responseTokens(req, res, tokens);
}));
function responseTokens(req, res, token) {
    switch (req.userAuthClientType) {
        case 'web':
            // Set refresh token as HttpOnly cookie for web clients
            res.cookie('refreshToken', token.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
            // Send only access token in response body
            res.status(200).json({ accessToken: token.accessToken });
            break;
        case 'mobile':
            // Send both tokens in response body for mobile clients
            res.status(200).json(token);
            break;
        default:
            throw http_errors_1.default.BadRequest('Unknown client type');
    }
}
exports.default = router;
