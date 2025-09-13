"use strict";
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
    jsonwebtoken_1.default.verify(accessToken, jwt_1.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(http_errors_1.default.Unauthorized());
        }
        let payload = getPayloadFrom(decoded);
        if (!payload) {
            return next(http_errors_1.default.Unauthorized());
        }
        req.userAuthPayload = payload;
        next();
    });
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
    jsonwebtoken_1.default.verify(refreshToken, jwt_1.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(http_errors_1.default.Unauthorized());
        }
        let payload = getPayloadFrom(decoded);
        if (!payload) {
            return next(http_errors_1.default.Unauthorized());
        }
        req.userAuthPayload = payload;
        req.userAuthRefreshToken = refreshToken;
        next();
    });
}
function getPayloadFrom(data) {
    if (data && data.userId) {
        return { userId: data.userId };
    }
    return undefined;
}
