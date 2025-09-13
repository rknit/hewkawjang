import { db } from '../db';
import { restaurantTable } from '../db/schema';
import RestaurantService, { Restaurant } from './restaurant.service';
import { UpdateRestaurantInfo } from '../validators/restaurant.validator';

// Test data factory functions
const createMockRestaurant = (
  overrides: Partial<Restaurant> = {},
): Restaurant => ({
  id: 1,
  ownerId: 1,
  name: 'Test Restaurant',
  phoneNo: '+1234567890',
  houseNo: '123',
  village: null,
  building: null,
  road: null,
  soi: null,
  subDistrict: null,
  district: null,
  province: null,
  postalCode: null,
  openTime: '09:00',
  closeTime: '21:00',
  priceRange: 500,
  status: 'open',
  ...overrides,
});

const createUpdateData = (
  overrides: Partial<UpdateRestaurantInfo> = {},
): UpdateRestaurantInfo => ({
  id: 1,
  ownerId: 1,
  ...overrides,
});

jest.mock('../db', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
  },
  // IMPORTANT: mock client so that it won't error out when SUPABASE_DB_URL is not set in automated tests
  client: jest.fn(),
}));

describe('RestaurantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateInfo', () => {
    let mockUpdate: jest.Mock;
    let mockSet: jest.Mock;
    let mockWhere: jest.Mock;
    let mockReturning: jest.Mock;

    // Helper function to set up database mocks
    const setupDbMocks = (returnValue: Restaurant[] = []) => {
      mockReturning.mockResolvedValue(returnValue);
    };

    // Helper function to assert database calls
    const expectDbCalls = (updateData: UpdateRestaurantInfo) => {
      expect(mockUpdate).toHaveBeenCalledWith(restaurantTable);
      expect(mockSet).toHaveBeenCalledWith(updateData);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
    };

    beforeEach(() => {
      mockReturning = jest.fn();
      mockWhere = jest.fn(() => ({ returning: mockReturning }));
      mockSet = jest.fn(() => ({ where: mockWhere }));
      mockUpdate = jest.fn(() => ({ set: mockSet }));

      db.update = mockUpdate;
    });

    it('should throw NotFound error when restaurant does not exist or is not owned by user', async () => {
      const updateData = createUpdateData({
        id: 999,
        name: 'Updated Restaurant',
        phoneNo: '+1111111111',
      });

      setupDbMocks([]); // No restaurant updated

      await expect(RestaurantService.updateInfo(updateData)).rejects.toThrow(
        'Restaurant not found or not owned by user',
      );

      expectDbCalls(updateData);
    });

    it('should update restaurant info and return the updated restaurant', async () => {
      const updateData = createUpdateData({
        name: 'Updated Restaurant Name',
        phoneNo: '+1111111111',
        priceRange: 600,
      });

      const updatedRestaurant = createMockRestaurant({
        name: 'Updated Restaurant Name',
        phoneNo: '+1111111111',
        priceRange: 600,
      });

      setupDbMocks([updatedRestaurant]);

      const result = await RestaurantService.updateInfo(updateData);

      expect(result).toEqual(updatedRestaurant);
      expectDbCalls(updateData);
    });

    it('should update partial restaurant info successfully', async () => {
      const updateData = createUpdateData({
        id: 2,
        ownerId: 2,
        openTime: '08:00',
        closeTime: '23:00',
      });

      const updatedRestaurant = createMockRestaurant({
        id: 2,
        ownerId: 2,
        openTime: '08:00',
        closeTime: '23:00',
        status: 'closed',
      });

      setupDbMocks([updatedRestaurant]);

      const result = await RestaurantService.updateInfo(updateData);

      expect(result).toEqual(updatedRestaurant);
      expectDbCalls(updateData);
    });
  });
});
