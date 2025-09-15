"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//  do not put any code before this line
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const restaurant_routes_1 = __importDefault(require("./routes/restaurant.routes"));
const reservation_routes_1 = __importDefault(require("./routes/reservation.routes"));
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// CORS configuration for web client
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'hkj-auth-client-type'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_routes_1.default);
app.use('/users', user_routes_1.default);
app.use('/restaurants', restaurant_routes_1.default);
app.use('/reservations', reservation_routes_1.default);
app.get('/', (_, res) => {
    res.status(200).send('Hello, World!');
});
app.use((_, res) => {
    res.status(404).send('Not Found');
});
// make sure error handler is the last middleware
app.use(error_middleware_1.default);
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
exports.default = app;
