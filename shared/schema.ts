import { sql } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Simple practice entries without user authentication
export const practiceEntries = pgTable("practice_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userName: varchar("user_name").notNull(),
  date: date("date").notNull(),
  meditation: boolean("meditation").default(false),
  prayer: boolean("prayer").default(false),
  reading: boolean("reading").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertPracticeEntrySchema = createInsertSchema(practiceEntries).omit({
  id: true,
  createdAt: true,
});

export type PracticeEntry = typeof practiceEntries.$inferSelect;
export type InsertPracticeEntry = z.infer<typeof insertPracticeEntrySchema>;
