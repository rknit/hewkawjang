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
const __1 = __importDefault(require(".."));
const supertest_1 = __importDefault(require("supertest"));
const user_service_1 = __importDefault(require("../service/user.service"));
jest.mock('../service/user.service');
// IMPORTANT: mock client so that it won't error out when SUPABASE_DB_URL is not set in automated tests
jest.mock('../db', () => ({
    client: jest.fn(),
}));
describe('User Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /users', () => {
        it('should return 200 and call UserService.getUsers', () => __awaiter(void 0, void 0, void 0, function* () {
            user_service_1.default.getUsers = jest.fn().mockResolvedValue('value');
            yield (0, supertest_1.default)(__1.default)
                .get('/users')
                .expect(200)
                .then((response) => {
                expect(response.body).toEqual('value');
                expect(user_service_1.default.getUsers).toHaveBeenCalled();
            });
        }));
        it('should accept limit and offset in body JSON', () => __awaiter(void 0, void 0, void 0, function* () {
            let limit = 5;
            let offset = 10;
            user_service_1.default.getUsers = jest.fn().mockResolvedValue('value');
            yield (0, supertest_1.default)(__1.default)
                .get('/users')
                .send({ limit, offset })
                .expect(200)
                .then((response) => {
                expect(response.body).toEqual('value');
                expect(user_service_1.default.getUsers).toHaveBeenCalledWith({
                    limit,
                    offset,
                });
            });
        }));
        it('should accept ids in body JSON', () => __awaiter(void 0, void 0, void 0, function* () {
            let ids = [1, 2];
            user_service_1.default.getUsers = jest.fn().mockResolvedValue('value');
            yield (0, supertest_1.default)(__1.default)
                .get('/users')
                .send({ ids })
                .expect(200)
                .then((response) => {
                expect(response.body).toEqual('value');
                expect(user_service_1.default.getUsers).toHaveBeenCalledWith({
                    ids,
                });
            });
        }));
    });
});
