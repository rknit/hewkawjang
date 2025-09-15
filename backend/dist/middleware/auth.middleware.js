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
exports.authClientTypeHandler = authClientTypeHandler;
exports.authHandler = authHandler;
exports.refreshAuthHandler = refreshAuthHandler;
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../utils/jwt");
const user_service_1 = __importDefault(require("../service/user.service"));
function authClientTypeHandler(req, res, next) {
    const clientTypeHeader = req.headers['hkj-auth-client-type'];
    if (!clientTypeHeader) {
        return next(http_errors_1.default.BadRequest('Missing hkj-auth-client-type'));
    }
    switch (clientTypeHeader) {
        case 'web':
            req.userAuthClientType = 'web';
            break;
        case 'mobile':
            req.userAuthClientType = 'mobile';
            break;
        default:
            return next(http_errors_1.default.BadRequest('Invalid client type'));
    }
    next();
}
function authHandler(req, res, next) {
    if (!req.headers.authorization) {
        return next(http_errors_1.default.Unauthorized());
    }
    const accessToken = req.headers.authorization.replace('Bearer ', '');
    jsonwebtoken_1.default.verify(accessToken, jwt_1.ACCESS_TOKEN_SECRET, (err, decoded) => __awaiter(this, void 0, void 0, function* () {
        if (err) {
            return next(http_errors_1.default.Unauthorized());
        }
        let payload = getPayloadFrom(decoded);
        if (!payload) {
            return next(http_errors_1.default.Unauthorized());
        }
        req.userAuthPayload = payload;
        try {
            const isDeleted = yield user_service_1.default.isUserDeleted(payload.userId);
            if (isDeleted) {
                return next(http_errors_1.default.Unauthorized('User account is deleted'));
            }
        }
        catch (error) {
            return next(error);
        }
        next();
    }));
}
function refreshAuthHandler(req, res, next) {
    if (!req.userAuthClientType) {
        return next(http_errors_1.default.BadRequest('Missing client type'));
    }
    let refreshToken;
    switch (req.userAuthClientType) {
        case 'mobile':
            if (!req.headers ||
                !req.headers.authorization ||
                !req.headers.authorization.startsWith('Bearer ')) {
                return next(http_errors_1.default.Unauthorized());
            }
            refreshToken = req.headers.authorization.replace('Bearer ', '');
            break;
        case 'web':
            if (!req.cookies || !req.cookies.refreshToken) {
                return next(http_errors_1.default.Unauthorized());
            }
            refreshToken = req.cookies.refreshToken;
            break;
    }
    jsonwebtoken_1.default.verify(refreshToken, jwt_1.REFRESH_TOKEN_SECRET, (err, decoded) => __awaiter(this, void 0, void 0, function* () {
        if (err) {
            return next(http_errors_1.default.Unauthorized());
        }
        let payload = getPayloadFrom(decoded);
        if (!payload) {
            return next(http_errors_1.default.Unauthorized());
        }
        req.userAuthPayload = payload;
        req.userAuthRefreshToken = refreshToken;
        try {
            const isDeleted = yield user_service_1.default.isUserDeleted(payload.userId);
            if (isDeleted) {
                return next(http_errors_1.default.Unauthorized('User account is deleted'));
            }
        }
        catch (error) {
            return next(error);
        }
        next();
    }));
}
function getPayloadFrom(data) {
    if (data && data.userId) {
        return { userId: data.userId };
    }
    return undefined;
}
