"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./route/user.route"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use(express_1.default.json());
app.use('/users', user_route_1.default);
app.use((_, res) => {
    res.status(403).send('Forbidden');
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
