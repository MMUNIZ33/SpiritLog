import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPracticeEntrySchema, updatePracticeEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Practice entry routes
  app.get('/api/practice-entries/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.params;
      
      const entry = await storage.getPracticeEntry(userId, date);
      res.json(entry);
    } catch (error) {
      console.error("Error fetching practice entry:", error);
      res.status(500).json({ message: "Failed to fetch practice entry" });
    }
  });

  app.post('/api/practice-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPracticeEntrySchema.parse({
        ...req.body,
        userId,
      });

      // Check if entry already exists for this date
      const existingEntry = await storage.getPracticeEntry(userId, validatedData.date);
      
      let entry;
      if (existingEntry) {
        entry = await storage.updatePracticeEntry({
          id: existingEntry.id,
          ...validatedData,
        });
      } else {
        entry = await storage.createPracticeEntry(validatedData);
      }

      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
        return;
      }
      console.error("Error saving practice entry:", error);
      res.status(500).json({ message: "Failed to save practice entry" });
    }
  });

  app.get('/api/practice-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const entries = await storage.getUserPracticeEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching practice entries:", error);
      res.status(500).json({ message: "Failed to fetch practice entries" });
    }
  });

  app.get('/api/community/:date', isAuthenticated, async (req: any, res) => {
    try {
      const { date } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const entries = await storage.getCommunityPracticeEntries(date, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching community entries:", error);
      res.status(500).json({ message: "Failed to fetch community entries" });
    }
  });

  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
