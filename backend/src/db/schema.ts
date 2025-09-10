import {
  pgTable,
  serial,
  text,
  time,
  integer,
  timestamp,
  pgEnum,
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
});

export const restaurantTable = pgTable('restaurant', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').references(() => usersTable.id),
  name: text('name').notNull().unique(),
  phoneNo: text('phone_no').notNull(),
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
  openTime: time('open_time'),
  closeTime: time('close_time'),
  priceRange: integer('priceRange'),
});

export const reservationStatusEnum = pgEnum('reservation_status', [
  'unconfirmed',
  'confirmed',
  'cancelled',
  'expired',
]);

export const reservationTable = pgTable('reservation', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id),
  restaurantId: integer('restaurant_id')
    .notNull()
    .references(() => restaurantTable.id),
  reserveAt: timestamp('reserve_at').notNull(),
  numberOfElderly: integer('number_of_elderly').default(0),
  numberOfAdult: integer('number_of_adult').default(0),
  numberOfChildren: integer('number_of_children').default(0),
  status: reservationStatusEnum('status').notNull().default('unconfirmed'),
});

export const emailVerificationTable = pgTable('emailVerification', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  otp: text('otp').notNull(),
  sendTime: timestamp('sendTime').notNull(),
});

export const registerTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone_no: text('phone_no').notNull(),
  password: text('password').notNull(),
  otp: text('otp').notNull(),
  displayName: text('display_name'),
  profileUrl: text('profile_url'),
});
