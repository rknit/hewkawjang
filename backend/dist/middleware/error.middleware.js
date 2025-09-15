"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const http_errors_1 = __importDefault(require("http-errors"));
const z = __importStar(require("zod"));
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
    if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        res.status(400).json({
            error: Object.assign({ message: 'Validation Error' }, (isProduction
                ? {}
                : { error: error, req: reqDisp, stack: error.stack })),
        });
        return;
    }
    // If the error is an HTTP error, use its status and message
    if (http_errors_1.default.isHttpError(error)) {
        res.status(error.status).json({
            error: Object.assign({ message: error.message }, (isProduction
                ? {}
                : { error: error, req: reqDisp, stack: error.stack })),
        });
        return;
    }
    // For unexpected errors, respond with 500
    res.status(500).json({
        error: Object.assign({ message: 'Internal Server Error' }, (isProduction
            ? {}
            : { error: error, req: reqDisp, stack: error.stack })),
    });
}
