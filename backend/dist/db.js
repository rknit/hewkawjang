"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.client = void 0;
require("dotenv/config");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const connectionString = process.env.SUPABASE_DB_URL;
exports.client = (0, postgres_1.default)(connectionString, { prepare: false });
exports.db = (0, postgres_js_1.drizzle)(exports.client);
