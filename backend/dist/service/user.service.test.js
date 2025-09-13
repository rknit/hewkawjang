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
const db_1 = require("../db");
const user_service_1 = __importDefault(require("./user.service"));
let mockUsers = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNo: '+1234567890',
        displayName: 'John Doe',
        profileUrl: 'https://example.com/avatars/john.jpg',
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phoneNo: '+1987654321',
        displayName: 'Jane Smith',
        profileUrl: null,
    },
    {
        id: 3,
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phoneNo: '+1555123456',
        displayName: null,
        profileUrl: 'https://example.com/avatars/bob.jpg',
    },
];
jest.mock('../db', () => ({
    db: {
        select: jest.fn(),
    },
    // IMPORTANT: mock client so that it won't error out when SUPABASE_DB_URL is not set in automated tests
    client: jest.fn(),
}));
describe('User Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getUsers', () => {
        let mockSelect;
        let mockFrom;
        let mockOrderBy;
        let mockOffset;
        let mockLimit;
        let mockWhere;
        function setupMocks({ expectResult, hasWhereClause = false }) {
            // Initialize all mocks
            mockSelect = jest.fn().mockReturnThis();
            mockFrom = jest.fn().mockReturnThis();
            mockOrderBy = jest.fn().mockReturnThis();
            mockOffset = jest.fn().mockReturnThis();
            mockLimit = jest.fn().mockReturnThis();
            mockWhere = jest.fn().mockResolvedValue(expectResult);
            // Build the query chain
            const queryChain = {
                from: mockFrom,
            };
            const fromChain = {
                orderBy: mockOrderBy,
            };
            const orderByChain = {
                offset: mockOffset,
            };
            const offsetChain = {
                limit: mockLimit,
            };
            // Configure the final step based on whether we expect a where clause
            if (hasWhereClause) {
                const limitChain = {
                    where: mockWhere,
                };
                mockLimit.mockReturnValue(limitChain);
            }
            else {
                mockLimit.mockResolvedValue(expectResult);
            }
            // Wire up the chain
            mockSelect.mockReturnValue(queryChain);
            mockFrom.mockReturnValue(fromChain);
            mockOrderBy.mockReturnValue(orderByChain);
            mockOffset.mockReturnValue(offsetChain);
            // Set up the initial db.select mock
            db_1.db.select = mockSelect;
        }
        it('should return users with default pagination', () => __awaiter(void 0, void 0, void 0, function* () {
            setupMocks({ expectResult: mockUsers.slice(0, 2) });
            const result = yield user_service_1.default.getUsers();
            expect(result).toHaveLength(2);
            expect(mockOffset).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(10);
        }));
        it('should return users with custom offset and limit', () => __awaiter(void 0, void 0, void 0, function* () {
            setupMocks({ expectResult: [mockUsers[2]] }); // Return one user as if paginated
            // Actually pass the offset and limit parameters
            const result = yield user_service_1.default.getUsers({ offset: 2, limit: 5 });
            expect(result).toHaveLength(1);
            expect(mockOffset).toHaveBeenCalledWith(2);
            expect(mockLimit).toHaveBeenCalledWith(5);
        }));
        it('should handle zero offset and custom limit', () => __awaiter(void 0, void 0, void 0, function* () {
            setupMocks({ expectResult: [mockUsers[0]] }); // Return one user
            const result = yield user_service_1.default.getUsers({ offset: 0, limit: 1 });
            expect(result).toHaveLength(1);
            expect(mockOffset).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(1);
        }));
        it('should filter by ids when provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const filteredUsers = [mockUsers[0], mockUsers[2]]; // Users with IDs 1 and 3
            setupMocks({ expectResult: filteredUsers, hasWhereClause: true });
            const result = yield user_service_1.default.getUsers({ ids: [1, 3] });
            expect(result).toHaveLength(2);
            expect(result).toEqual(filteredUsers);
            expect(mockWhere).toHaveBeenCalledWith(expect.any(Object)); // Called with inArray condition
            expect(mockOffset).toHaveBeenCalledWith(0); // Default offset
            expect(mockLimit).toHaveBeenCalledWith(10); // Default limit
        }));
    });
});
