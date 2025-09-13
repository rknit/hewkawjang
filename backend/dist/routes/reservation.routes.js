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
const reservation_service_1 = __importDefault(require("../service/reservation.service"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/unconfirmed/inspect', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const restaurantId = req.query.restaurantId
        ? Number(req.query.restaurantId)
        : NaN;
    if (isNaN(restaurantId)) {
        return res.status(400).json({ error: 'restaurantId must be a number' });
    }
    const offset = req.query.offset ? Number(req.query.offset) : undefined;
    const reservations = yield reservation_service_1.default.getUnconfirmedReservationsByRestaurant({
        restaurantId,
        offset,
    });
    return res.json(reservations);
}));
router.post('/cancel', auth_middleware_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.userAuthPayload) === null || _a === void 0 ? void 0 : _a.userId;
    const { reservationId, restaurantId } = req.body;
    if (!reservationId || !userId || !restaurantId) {
        return res
            .status(400)
            .json({ error: 'reservationId, userId and restarantId are required' });
    }
    yield reservation_service_1.default.cancelReservation({
        reservationId,
        userId,
        restaurantId,
    });
    return res.sendStatus(200);
}));
exports.default = router;
