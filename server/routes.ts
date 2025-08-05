import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPracticeEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Practice entry routes - no authentication required
  app.get('/api/practice-entries/:userName/:date', async (req, res) => {
    try {
      const { userName, date } = req.params;
      
      const entry = await storage.getPracticeEntry(userName, date);
      res.json(entry);
    } catch (error) {
      console.error("Error fetching practice entry:", error);
      res.status(500).json({ message: "Failed to fetch practice entry" });
    }
  });

  app.post('/api/practice-entries', async (req, res) => {
    try {
      const validatedData = insertPracticeEntrySchema.parse(req.body);

      // Check if entry already exists for this user and date
      const existingEntry = await storage.getPracticeEntry(validatedData.userName, validatedData.date);
      
      let entry;
      if (existingEntry) {
        entry = await storage.updatePracticeEntry(existingEntry.id, validatedData);
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

  app.get('/api/community/:date', async (req, res) => {
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

  app.get('/api/stats/:userName', async (req, res) => {
    try {
      const { userName } = req.params;
      const stats = await storage.getUserStats(userName);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
