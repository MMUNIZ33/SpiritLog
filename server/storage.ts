import {
  practiceEntries,
  type PracticeEntry,
  type InsertPracticeEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Practice entry operations
  getPracticeEntry(userName: string, date: string): Promise<PracticeEntry | undefined>;
  createPracticeEntry(entry: InsertPracticeEntry): Promise<PracticeEntry>;
  updatePracticeEntry(id: string, entry: Partial<InsertPracticeEntry>): Promise<PracticeEntry>;
  getCommunityPracticeEntries(date: string, limit?: number): Promise<PracticeEntry[]>;
  getUserStats(userName: string): Promise<{
    currentStreak: number;
    totalPractices: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Practice entry operations
  async getPracticeEntry(userName: string, date: string): Promise<PracticeEntry | undefined> {
    const [entry] = await db
      .select()
      .from(practiceEntries)
      .where(and(eq(practiceEntries.userName, userName), eq(practiceEntries.date, date)));
    return entry;
  }

  async createPracticeEntry(entry: InsertPracticeEntry): Promise<PracticeEntry> {
    const [newEntry] = await db
      .insert(practiceEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async updatePracticeEntry(id: string, entry: Partial<InsertPracticeEntry>): Promise<PracticeEntry> {
    const [updatedEntry] = await db
      .update(practiceEntries)
      .set(entry)
      .where(eq(practiceEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async getCommunityPracticeEntries(date: string, limit = 20): Promise<PracticeEntry[]> {
    return await db
      .select()
      .from(practiceEntries)
      .where(eq(practiceEntries.date, date))
      .orderBy(desc(practiceEntries.createdAt))
      .limit(limit);
  }

  async getUserStats(userName: string): Promise<{
    currentStreak: number;
    totalPractices: number;
  }> {
    // Get user's entries sorted by date descending
    const entries = await db
      .select()
      .from(practiceEntries)
      .where(eq(practiceEntries.userName, userName))
      .orderBy(desc(practiceEntries.date));

    let currentStreak = 0;
    let totalPractices = entries.length;

    // Calculate current streak
    const today = new Date();
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const entryDate = new Date(entry.date);
      const hasPractice = entry.meditation || entry.prayer || entry.reading;
      
      if (hasPractice) {
        const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1 || (i > 0 && Math.floor((new Date(sortedEntries[i-1].date).getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) === 1)) {
          currentStreak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return { currentStreak, totalPractices };
  }
}

export const storage = new DatabaseStorage();
