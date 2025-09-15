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
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const http_errors_1 = __importDefault(require("http-errors"));
class MailerService {
    static sendVerifiedEmail(email, OTP) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Email Verification",
                html: `<p>This is your OTP: ${OTP}</p>`
            };
            try {
                const info = yield transporter.sendMail(mailOptions);
                console.log("✅ Email sent:", info.response);
            }
            catch (error) {
                console.error("❌ Error sending email:", error);
            }
        });
    }
    static sendOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let dup = yield db_1.db
                .select({ id: schema_1.usersTable.id })
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, email))
                .limit(1);
            if (dup.length > 0) {
                throw http_errors_1.default.Conflict('Email already exists');
            }
            const otp = yield this.generateOTP();
            yield this.sendVerifiedEmail(email, otp);
            let timestamp = new Date(Date.now());
            let data = { "email": email, "otp": otp, "sendTime": timestamp };
            yield db_1.db.insert(schema_1.emailVerificationTable).values(data);
        });
    }
    static generateOTP() {
        return __awaiter(this, arguments, void 0, function* (length = 6) {
            return (Math.floor(100000 + Math.random() * 900000 + Math.random()) % 1000000).toString(); // 6 หลัก
        });
    }
}
exports.default = MailerService;
