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
const express_1 = __importDefault(require("express"));
const user_service_1 = __importDefault(require("../service/user.service"));
const mailer_service_1 = __importDefault(require("../service/mailer.service"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_service_1.default.getUsers(req.body);
    res.json(users);
}));
router.get('/me', auth_middleware_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [user] = yield user_service_1.default.getUsers({
        ids: [(_a = req.userAuthPayload) === null || _a === void 0 ? void 0 : _a.userId],
    });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
}));
router.post('/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { otp } = _a, userData = __rest(_a, ["otp"]);
    const newUser = yield user_service_1.default.registerUser(userData, otp);
    res.status(201).json(newUser);
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield mailer_service_1.default.sendOTP(req.body.email);
    res.status(201).send();
}));
router.post('/updateProfile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_service_1.default.updateUser(req.body);
    res.sendStatus(200);
}));
// Soft delete the authenticated user
router.delete('/me', auth_middleware_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.userAuthPayload) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const result = yield user_service_1.default.softDeleteUser(userId);
    if (!result) {
        // Since there is no function that really deletes a user in db, so this case probably not gonna happen
        return res
            .status(404)
            .json({ message: 'User not found or already removed' });
    }
    res.json({
        message: 'User soft deleted successfully',
    });
}));
exports.default = router;
