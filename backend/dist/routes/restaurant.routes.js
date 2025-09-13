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
const restaurant_service_1 = __importDefault(require("../service/restaurant.service"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield restaurant_service_1.default.getRestaurants(req.body);
    res.json(users);
}));
router.get('/owner/:ownerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ownerId = Number(req.params.ownerId);
    const offset = req.query.offset ? Number(req.query.offset) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    if (isNaN(ownerId)) {
        return res.status(400).json({ error: 'ownerId must be a number' });
    }
    const restaurants = yield restaurant_service_1.default.getRestaurantsByOwner({
        ownerId,
        offset,
        limit,
    });
    res.json(restaurants);
}));
router.get('/reject', auth_middleware_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield restaurant_service_1.default.rejectReservation(req.body.id);
    res.status(200);
}));
router.get('/update/status', auth_middleware_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield restaurant_service_1.default.updateRestaurantStatus(req.body.id, req.body.status);
    res.status(200);
}));
exports.default = router;
