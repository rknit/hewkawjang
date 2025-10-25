import { is } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  time,
  integer,
  timestamp,
  pgEnum,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phoneNo: text('phone_no').notNull(),
  password: text('password').notNull(),
  displayName: text('display_name'),
  profileUrl: text('profile_url'),
  refreshToken: text('refresh_token'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const restaurantStatusEnum = pgEnum('restaurant_status', [
  'open',
  'closed',
]);

export const restaurantActivationEnum = pgEnum('restaurant_activation', [
  'active',
  'inactive',
]);

export const dayOfWeekEnum = pgEnum('day_of_week', [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]);

export const cuisineTypeEnum = pgEnum('cuisine_type', [
  'Thai',
  'Chinese',
  'Japanese',
  'Korean',
  'Western',
  'Seafood',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Bakery',
  'Cafe',
  'Buffet',
  'BBQ',
  'Steakhouse',
  'Fast Food',
  'Indian',
  'Italian',
  'Other',
]);

export const restaurantTable = pgTable('restaurant', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => usersTable.id),
  name: text('name').notNull().unique(),
  phoneNo: text('phone_no').notNull(),
  wallet: integer('wallet').notNull().default(0),
  // address
  houseNo: text('house_no'),
  village: text('village'),
  building: text('building'),
  road: text('road'),
  soi: text('soi'),
  subDistrict: text('sub_district'),
  district: text('district'),
  province: text('province'),
  postalCode: text('postal_code'),
  // detail
  cuisineType: cuisineTypeEnum('cuisine').notNull().default('Other'),
  priceRange: integer('priceRange'),
  status: restaurantStatusEnum('status').notNull().default('closed'), // open/close daily ops
  activation: restaurantActivationEnum('activation')
    .notNull()
    .default('active'), // activate/deactivate restaurant
  isDeleted: boolean('is_deleted').notNull().default(false),
  images: text('images').array(), // array of image URLs
});

export const restaurantHoursTable = pgTable(
  'restaurant_hours',
  {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurantTable.id),
    dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
    isClosed: boolean('is_closed').notNull().default(false),
    openTime: time('open_time').notNull(),
    closeTime: time('close_time').notNull(),
  },
  (t) => ({
    // UNIQUE constraint: one entry per restaurant per day
    uniqueRestaurantDay: uniqueIndex('uniq_restaurant_day').on(
      t.restaurantId,
      t.dayOfWeek,
    ),
  }),
);

export const reservationStatusEnum = pgEnum('reservation_status', [
  'unconfirmed',
  'expired',
  'confirmed',
  'cancelled',
  'rejected',
  'completed',
  'uncompleted',
]);
// Unconfirmed: The reservation has been made but not yet confirmed by the restaurant.
// Expired: The reservation was not confirmed in time and has expired.
// Confirmed: The restaurant has confirmed the reservation.
// Cancelled: The user has cancelled the reservation.
// Rejected: The restaurant has rejected the reservation.
// Completed: The reservation was fulfilled successfully.
// Uncompleted: The reservation was not fulfilled (e.g., no-show).

export const reservationTable = pgTable('reservation', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id),
  restaurantId: integer('restaurant_id')
    .notNull()
    .references(() => restaurantTable.id),
  reserveAt: timestamp('reserve_at').notNull(),
  reservationfee: integer('reservation_fee').default(0),
  numberOfAdult: integer('number_of_adult').default(0),
  numberOfChildren: integer('number_of_children').default(0),
  status: reservationStatusEnum('status').notNull().default('unconfirmed'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const emailVerificationTable = pgTable('emailVerification', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  otp: text('otp').notNull(),
  sendTime: timestamp('sendTime').notNull(),
});

export const reviewTable = pgTable('review', {
  id: serial('id').primaryKey(),
  reservationId: integer('reservation_id')
    .notNull()
    .references(() => reservationTable.id)
    .unique(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  attachPhotos: text('attach_photos').array(), // URL to the photos
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const notificationTypesEnum = pgEnum('notification_type', [
  'reservation_status',
  'chat',
]);

export const notificationTable = pgTable('notification', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id),
  title: text('title').notNull(),
  message: text('message'),
  imageUrl: text('image_url'),
  reservationId: integer('reservation_id').references(
    () => reservationTable.id,
  ),
  notificationType: notificationTypesEnum('notification_type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isRead: boolean('is_read').notNull().default(false),
});
