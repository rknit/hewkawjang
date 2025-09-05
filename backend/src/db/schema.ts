import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
});

export const usersProfileTable = pgTable('users_profile', {
  userId: serial('user_id')
    .notNull()
    .unique()
    .references(() => usersTable.id),
  displayName: text('display_name').notNull(),
});
