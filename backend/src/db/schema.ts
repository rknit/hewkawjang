import { pgTable, serial, text , time, integer} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone_no: text('phone_no').notNull(),
  password: text('password').notNull(),
  displayName: text('display_name'),
  profileUrl: text('profile_url'),
  isVerified: integer('is_verified').default(0).notNull(),
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