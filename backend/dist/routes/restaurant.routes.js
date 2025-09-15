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
const restaurant_validator_1 = require("../validators/restaurant.validator");
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
    res.status(200).send();
}));
router.get('/update/status', auth_middleware_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield restaurant_service_1.default.updateRestaurantStatus(req.body.id, req.body.status);
    res.status(200).send();
}));
router.put('/', auth_middleware_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body) {
        req.body.ownerId = req.userAuthPayload.userId; // from auth middleware
    }
    const info = restaurant_validator_1.updateRestaurantInfoSchema.parse(req.body);
    const updated = yield restaurant_service_1.default.updateInfo(info);
    res.status(200).json(updated);
}));
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // validate request body
        const parsedData = restaurant_validator_1.createRestaurantSchema.parse(req.body);
        // call service
        const restaurant = yield restaurant_service_1.default.createRestaurant(parsedData);
        res.status(201).json({
            message: "Restaurant submitted successfully",
            restaurant,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(400).json({ error: "Bad request because some fields are missing or invalid." });
        }
        next(err);
    }
}));
router.patch('/:id/activation', auth_middleware_1.authHandler, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const restaurantId = Number(req.params.id);
        if (isNaN(restaurantId)) {
            return res.status(400).json({ error: 'Invalid restaurant id' });
        }
        const { status } = req.body;
        if (status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ error: "New status must be either 'active' or 'inactive'" });
        }
        const userId = (_a = req.userAuthPayload) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // check ownership
        const restaurant = yield restaurant_service_1.default.getRestaurantById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        if (restaurant.ownerId !== userId) {
            return res.status(403).json({ error: 'Forbidden: not owner' });
        }
        if (restaurant.activation === status) {
            return res.status(200).json({
                message: `Restaurant is already ${status}`,
                restaurant,
            });
        }
        const updated = yield restaurant_service_1.default.updateRestaurantActivation(restaurantId, status);
        res.status(200).json({
            message: status === 'inactive'
                ? 'Restaurant deactivated successfully and all reservations cancelled'
                : 'Restaurant activated successfully',
            restaurant: updated,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
