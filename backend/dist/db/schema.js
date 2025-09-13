"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailVerificationTable = exports.reservationTable = exports.reservationStatusEnum = exports.restaurantTable = exports.restaurantStatusEnum = exports.usersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.usersTable = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    firstName: (0, pg_core_1.text)('first_name').notNull(),
    lastName: (0, pg_core_1.text)('last_name').notNull(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    phoneNo: (0, pg_core_1.text)('phone_no').notNull(),
    password: (0, pg_core_1.text)('password').notNull(),
    displayName: (0, pg_core_1.text)('display_name'),
    profileUrl: (0, pg_core_1.text)('profile_url'),
    refreshToken: (0, pg_core_1.text)('refresh_token'),
});
exports.restaurantStatusEnum = (0, pg_core_1.pgEnum)('restaurant_status', [
    'open',
    'closed',
]);
exports.restaurantTable = (0, pg_core_1.pgTable)('restaurant', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    ownerId: (0, pg_core_1.integer)('owner_id').references(() => exports.usersTable.id),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    phoneNo: (0, pg_core_1.text)('phone_no').notNull(),
    // address
    houseNo: (0, pg_core_1.text)('house_no'),
    village: (0, pg_core_1.text)('village'),
    building: (0, pg_core_1.text)('building'),
    road: (0, pg_core_1.text)('road'),
    soi: (0, pg_core_1.text)('soi'),
    subDistrict: (0, pg_core_1.text)('sub_district'),
    district: (0, pg_core_1.text)('district'),
    province: (0, pg_core_1.text)('province'),
    postalCode: (0, pg_core_1.text)('postal_code'),
    // detail
    openTime: (0, pg_core_1.time)('open_time'),
    closeTime: (0, pg_core_1.time)('close_time'),
    priceRange: (0, pg_core_1.integer)('priceRange'),
    status: (0, exports.restaurantStatusEnum)('status').notNull().default('closed'),
});
exports.reservationStatusEnum = (0, pg_core_1.pgEnum)('reservation_status', [
    'unconfirmed',
    "expired",
    'confirmed',
    'cancelled',
    "rejected",
    "completed",
    "uncompleted"
]);
// Unconfirmed: The reservation has been made but not yet confirmed by the restaurant.
// Expired: The reservation was not confirmed in time and has expired.
// Confirmed: The restaurant has confirmed the reservation.
// Cancelled: The user has cancelled the reservation.
// Rejected: The restaurant has rejected the reservation.
// Completed: The reservation was fulfilled successfully.
// Uncompleted: The reservation was not fulfilled (e.g., no-show).
exports.reservationTable = (0, pg_core_1.pgTable)('reservation', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.usersTable.id),
    restaurantId: (0, pg_core_1.integer)('restaurant_id')
        .notNull()
        .references(() => exports.restaurantTable.id),
    reserveAt: (0, pg_core_1.timestamp)('reserve_at').notNull(),
    reservationfee: (0, pg_core_1.integer)('reservation_fee').default(0),
    numberOfAdult: (0, pg_core_1.integer)('number_of_adult').default(0),
    numberOfChildren: (0, pg_core_1.integer)('number_of_children').default(0),
    status: (0, exports.reservationStatusEnum)('status').notNull().default('unconfirmed'),
    specialRequest: (0, pg_core_1.text)('special_request'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.emailVerificationTable = (0, pg_core_1.pgTable)('emailVerification', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    email: (0, pg_core_1.text)('email').notNull(),
    otp: (0, pg_core_1.text)('otp').notNull(),
    sendTime: (0, pg_core_1.timestamp)('sendTime').notNull(),
});
