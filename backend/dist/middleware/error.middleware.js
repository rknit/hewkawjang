"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const http_errors_1 = __importDefault(require("http-errors"));
function errorHandler(error, req, res, next) {
    let reqDisp = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
    };
    if (process.env.NODE_ENV === 'development') {
        console.error({
            timestamp: new Date().toISOString(),
            req: reqDisp,
            error,
        }); // Log full error server-side in development
    }
    const isProduction = process.env.NODE_ENV === 'production';
    // If the error is an HTTP error, use its status and message
    if (http_errors_1.default.isHttpError(error)) {
        res.status(error.status).json({
            error: Object.assign({ message: error.message }, (isProduction ? {} : { req: reqDisp, stack: error.stack })),
        });
        return;
    }
    // For unexpected errors, respond with 500
    res.status(500).json({
        error: Object.assign({ message: 'Internal Server Error' }, (isProduction ? {} : { req: reqDisp, stack: error.stack })),
    });
}
