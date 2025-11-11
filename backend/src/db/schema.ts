import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phoneNo: text('phone_no').notNull(),
  password: text('password').notNull(),
  balance: doublePrecision('balance').notNull().default(0),
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
export const paymentMethodEnum = pgEnum(
  'method',

  ['card', 'HewKawJangwallet', 'PromtPay'],
);

export const restaurantTable = pgTable('restaurant', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => usersTable.id),
  name: text('name').notNull().unique(),
  phoneNo: text('phone_no').notNull(),
  wallet: doublePrecision('wallet').notNull().default(0.0),
  // address
  address: text('address'),
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
  paymentMethod: paymentMethodEnum('payment_method')
    .notNull()
    .default('HewKawJangwallet'),
  status: restaurantStatusEnum('status').notNull().default('closed'), // open/close daily ops
  activation: restaurantActivationEnum('activation')
    .notNull()
    .default('active'), // activate/deactivate restaurant
  isVerified: boolean('is_verified').notNull().default(false),
  isDeleted: boolean('is_deleted').notNull().default(false),
  images: text('images').array(), // array of image URLs
  reservationFee: integer('reservation_fee').notNull().default(0),
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

export const restaurantDaysOff = pgTable(
  'restaurant_days_off',
  {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurantTable.id, { onDelete: 'cascade' }),
    date: date('date').notNull(), // specific date like '2025-11-15'
    // optional: holiday, renovation, etc.
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    // Prevent duplicate dates for same restaurant
    uniqueRestaurantDate: unique().on(table.restaurantId, table.date),
    // Index for faster queries
    restaurantDateIdx: index().on(table.restaurantId, table.date),
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
  reservationFee: integer('reservation_fee').default(0),
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
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const notificationTypesEnum = pgEnum('notification_type', [
  'reservation_status',
  'chat',
  'system',
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

export const withdrawsTable = pgTable('withdraw', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id')
    .notNull()
    .references(() => restaurantTable.id),
  balance: doublePrecision('balance').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const topupsTable = pgTable('topup', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id),
  amount: doublePrecision('amount').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const adminsTable = pgTable('admin', {
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

export const reportTypeEnum = pgEnum('type', [
  'chat',
  'user',
  'review',
  'restaurant',
  'support',
]);

export const chatsTable = pgTable('chat', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id),
  restaurantId: integer('restaurant_id')
    .notNull()
    .references(() => restaurantTable.id),
  isBanned: boolean('is_banned').notNull().default(false),
});

export const chatAdminsTable = pgTable('chatadmin', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id),
  adminId: integer('user_id')
    .notNull()
    .references(() => adminsTable.id),
});

export const messagesTable = pgTable(
  'message',
  {
    id: serial('id').primaryKey(),
    chatId: integer('chat_id').references(() => chatsTable.id),
    chatAdminId: integer('chat_admin_id').references(() => chatAdminsTable.id),
    senderId: integer('sender_id')
      .notNull()
      .references(() => usersTable.id),
    text: text('text'),
    imgURL: text('img_url'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    // Ensure exactly one of chatId or chatAdminId is set
    checkEitherChatOrAdmin: check(
      'check_either_chat_or_admin',
      sql`(
      (${table.chatId} IS NOT NULL AND ${table.chatAdminId} IS NULL) OR
      (${table.chatId} IS NULL AND ${table.chatAdminId} IS NOT NULL)
    )`,
    ),
  }),
);

export const imagesTable = pgTable(
  'image',
  {
    id: serial('id').primaryKey(),
    // Foreign key to Message (attached to messages)
    messageId: integer('message_id').references(() => messagesTable.id),
    // Foreign key to User (profile picture)
    userProfileId: integer('user_profile_id').references(() => usersTable.id),
    // Foreign key to Restaurant (profile picture)
    restaurantProfileId: integer('restaurant_profile_id').references(
      () => restaurantTable.id,
    ),
    // Foreign key to Review (attached to reviews)
    reviewId: integer('review_id').references(() => reviewTable.id),
    // Image data/metadata
    url: text('url').notNull(),
    fileName: text('file_name'),
    fileSize: integer('file_size'),
    mimeType: text('mime_type'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // Ensure the image belongs to exactly one entity
    checkSingleReference: check(
      'check_single_reference',
      sql`(
      (${table.messageId} IS NOT NULL AND ${table.userProfileId} IS NULL AND ${table.restaurantProfileId} IS NULL AND ${table.reviewId} IS NULL) OR
      (${table.messageId} IS NULL AND ${table.userProfileId} IS NOT NULL AND ${table.restaurantProfileId} IS NULL AND ${table.reviewId} IS NULL) OR
      (${table.messageId} IS NULL AND ${table.userProfileId} IS NULL AND ${table.restaurantProfileId} IS NOT NULL AND ${table.reviewId} IS NULL) OR
      (${table.messageId} IS NULL AND ${table.userProfileId} IS NULL AND ${table.restaurantProfileId} IS NULL AND ${table.reviewId} IS NOT NULL)
    )`,
    ),
  }),
);

export const reportsTable = pgTable('report', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id),
  adminId: integer('admin_id').references(() => adminsTable.id),
  reportType: reportTypeEnum('report_type').default('support'),
  targetRestaurantId: integer('restaurant_id').references(
    () => restaurantTable.id,
  ),
  targetReviewId: integer('review_id').references(() => reviewTable.id),
  targetUserId: integer('taget_user_id').references(() => usersTable.id),
  targetChatId: integer('chat_id').references(() => chatsTable.id),
  isSolved: boolean('is_solved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
