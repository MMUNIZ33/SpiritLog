import {
  users,
  practiceEntries,
  type User,
  type UpsertUser,
  type PracticeEntry,
  type InsertPracticeEntry,
  type UpdatePracticeEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Practice entry operations
  getPracticeEntry(userId: string, date: string): Promise<PracticeEntry | undefined>;
  createPracticeEntry(entry: InsertPracticeEntry): Promise<PracticeEntry>;
  updatePracticeEntry(entry: UpdatePracticeEntry): Promise<PracticeEntry>;
  getUserPracticeEntries(userId: string, limit?: number): Promise<PracticeEntry[]>;
  getCommunityPracticeEntries(date: string, limit?: number): Promise<(PracticeEntry & { user: User })[]>;
  getUserStats(userId: string): Promise<{
    currentStreak: number;
    bestStreak: number;
    monthlyTotal: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Practice entry operations
  async getPracticeEntry(userId: string, date: string): Promise<PracticeEntry | undefined> {
    const [entry] = await db
      .select()
      .from(practiceEntries)
      .where(and(eq(practiceEntries.userId, userId), eq(practiceEntries.date, date)));
    return entry;
  }

  async createPracticeEntry(entry: InsertPracticeEntry): Promise<PracticeEntry> {
    const [newEntry] = await db
      .insert(practiceEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async updatePracticeEntry(entry: UpdatePracticeEntry): Promise<PracticeEntry> {
    const [updatedEntry] = await db
      .update(practiceEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(practiceEntries.id, entry.id))
      .returning();
    return updatedEntry;
  }

  async getUserPracticeEntries(userId: string, limit = 50): Promise<PracticeEntry[]> {
    return await db
      .select()
      .from(practiceEntries)
      .where(eq(practiceEntries.userId, userId))
      .orderBy(desc(practiceEntries.date))
      .limit(limit);
  }

  async getCommunityPracticeEntries(date: string, limit = 20): Promise<(PracticeEntry & { user: User })[]> {
    const results = await db
      .select({
        id: practiceEntries.id,
        userId: practiceEntries.userId,
        date: practiceEntries.date,
        meditationMinutes: practiceEntries.meditationMinutes,
        meditationNotes: practiceEntries.meditationNotes,
        prayerMinutes: practiceEntries.prayerMinutes,
        prayerNotes: practiceEntries.prayerNotes,
        readingMinutes: practiceEntries.readingMinutes,
        readingNotes: practiceEntries.readingNotes,
        createdAt: practiceEntries.createdAt,
        updatedAt: practiceEntries.updatedAt,
        user: users,
      })
      .from(practiceEntries)
      .leftJoin(users, eq(practiceEntries.userId, users.id))
      .where(eq(practiceEntries.date, date))
      .orderBy(desc(practiceEntries.createdAt))
      .limit(limit);

    return results.map(row => ({
      ...row,
      user: row.user!,
    }));
  }

  async getUserStats(userId: string): Promise<{
    currentStreak: number;
    bestStreak: number;
    monthlyTotal: number;
  }> {
    // Get user's entries sorted by date descending
    const entries = await db
      .select({ date: practiceEntries.date, meditationMinutes: practiceEntries.meditationMinutes, prayerMinutes: practiceEntries.prayerMinutes, readingMinutes: practiceEntries.readingMinutes })
      .from(practiceEntries)
      .where(eq(practiceEntries.userId, userId))
      .orderBy(desc(practiceEntries.date));

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let monthlyTotal = 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calculate streaks and monthly total
    let checkingCurrent = true;
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const entryDate = new Date(entry.date);
      const totalMinutes = (entry.meditationMinutes || 0) + (entry.prayerMinutes || 0) + (entry.readingMinutes || 0);
      
      // Calculate monthly total
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        monthlyTotal += totalMinutes;
      }

      // Only count as streak if they did any practice
      if (totalMinutes > 0) {
        tempStreak++;
        
        // Check for current streak (must be consecutive from today or yesterday)
        if (checkingCurrent) {
          const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff <= 1 || (i > 0 && Math.floor((new Date(sortedEntries[i-1].date).getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) === 1)) {
            currentStreak = tempStreak;
          } else {
            checkingCurrent = false;
            currentStreak = 0;
          }
        }
        
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
        checkingCurrent = false;
      }
    }

    return { currentStreak, bestStreak, monthlyTotal };
  }
}

export const storage = new DatabaseStorage();
