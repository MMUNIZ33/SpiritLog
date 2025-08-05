import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily practice entries
export const practiceEntries = pgTable("practice_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  meditationMinutes: integer("meditation_minutes").default(0),
  meditationNotes: text("meditation_notes"),
  prayerMinutes: integer("prayer_minutes").default(0),
  prayerNotes: text("prayer_notes"),
  readingMinutes: integer("reading_minutes").default(0),
  readingNotes: text("reading_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  practiceEntries: many(practiceEntries),
}));

export const practiceEntriesRelations = relations(practiceEntries, ({ one }) => ({
  user: one(users, {
    fields: [practiceEntries.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertPracticeEntrySchema = createInsertSchema(practiceEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePracticeEntrySchema = insertPracticeEntrySchema.partial().extend({
  id: z.string(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type PracticeEntry = typeof practiceEntries.$inferSelect;
export type InsertPracticeEntry = z.infer<typeof insertPracticeEntrySchema>;
export type UpdatePracticeEntry = z.infer<typeof updatePracticeEntrySchema>;
