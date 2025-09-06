import { db } from '../db';
import { User } from './user.service';
import UserService from './user.service';

let mockUsers: User[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone_no: '+1234567890',
    displayName: 'John Doe',
    profileUrl: 'https://example.com/avatars/john.jpg',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone_no: '+1987654321',
    displayName: 'Jane Smith',
    profileUrl: null,
  },
  {
    id: 3,
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    phone_no: '+1555123456',
    displayName: null,
    profileUrl: 'https://example.com/avatars/bob.jpg',
  },
];

jest.mock('../db');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    let mockSelect: jest.Mock;
    let mockFrom: jest.Mock;
    let mockOrderBy: jest.Mock;
    let mockOffset: jest.Mock;
    let mockLimit: jest.Mock;
    let mockWhere: jest.Mock;

    interface MockOptions {
      expectResult: User[];
      hasWhereClause?: boolean;
    }

    function setupMocks({ expectResult, hasWhereClause = false }: MockOptions) {
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
      } else {
        mockLimit.mockResolvedValue(expectResult);
      }

      // Wire up the chain
      mockSelect.mockReturnValue(queryChain);
      mockFrom.mockReturnValue(fromChain);
      mockOrderBy.mockReturnValue(orderByChain);
      mockOffset.mockReturnValue(offsetChain);

      // Set up the initial db.select mock
      db.select = mockSelect;
    }
    it('should return users with default pagination', async () => {
      setupMocks({ expectResult: mockUsers.slice(0, 2) });

      const result = await UserService.getUsers();

      expect(result).toHaveLength(2);
      expect(mockOffset).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should return users with custom offset and limit', async () => {
      setupMocks({ expectResult: [mockUsers[2]] }); // Return one user as if paginated

      // Actually pass the offset and limit parameters
      const result = await UserService.getUsers({ offset: 2, limit: 5 });

      expect(result).toHaveLength(1);
      expect(mockOffset).toHaveBeenCalledWith(2);
      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('should handle zero offset and custom limit', async () => {
      setupMocks({ expectResult: [mockUsers[0]] }); // Return one user

      const result = await UserService.getUsers({ offset: 0, limit: 1 });

      expect(result).toHaveLength(1);
      expect(mockOffset).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should filter by ids when provided', async () => {
      const filteredUsers = [mockUsers[0], mockUsers[2]]; // Users with IDs 1 and 3
      setupMocks({ expectResult: filteredUsers, hasWhereClause: true });

      const result = await UserService.getUsers({ ids: [1, 3] });

      expect(result).toHaveLength(2);
      expect(result).toEqual(filteredUsers);
      expect(mockWhere).toHaveBeenCalledWith(expect.any(Object)); // Called with inArray condition
      expect(mockOffset).toHaveBeenCalledWith(0); // Default offset
      expect(mockLimit).toHaveBeenCalledWith(10); // Default limit
    });
  });
});
