"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pool_1 = __importDefault(require("./pool"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.get('/', (req, res) => {
    // return SELECT NOW() from PostgreSQL
    pool_1.default.query('SELECT NOW()', (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error querying database');
        }
        else {
            res.send(`Database time: ${result.rows[0].now}}`);
        }
    });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
