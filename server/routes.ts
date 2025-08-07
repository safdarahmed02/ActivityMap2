import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTopicSchema, type Topic } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all topics
  app.get("/api/topics", async (_req, res) => {
    try {
      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Get specific topic
  app.get("/api/topics/:id", async (req, res) => {
    try {
      const topic = await storage.getTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topic" });
    }
  });

  // Create new topic
  app.post("/api/topics", async (req, res) => {
    try {
      const validatedData = insertTopicSchema.parse(req.body);
      const topic = await storage.createTopic(validatedData);
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid topic data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  // Update topic data
  app.patch("/api/topics/:id", async (req, res) => {
    try {
      const topic = await storage.updateTopic(req.params.id, req.body);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: "Failed to update topic" });
    }
  });

  // Delete topic
  app.delete("/api/topics/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTopic(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete topic" });
    }
  });

  // Export data as JSON
  app.get("/api/export", async (_req, res) => {
    try {
      const topics = await storage.exportData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="heatmap-data.json"');
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Import data from JSON
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/import", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }
      
      const data = JSON.parse(req.file.buffer.toString());
      
      // Validate that it's an array of topics
      if (!Array.isArray(data)) {
        return res.status(400).json({ message: "Invalid file format" });
      }
      
      // Basic validation of topic structure
      for (const topic of data) {
        if (!topic.id || !topic.name || !topic.unit || typeof topic.data !== 'object') {
          return res.status(400).json({ message: "Invalid topic data format" });
        }
      }
      
      await storage.importData(data as Topic[]);
      res.json({ message: "Data imported successfully", topics: data });
    } catch (error) {
      res.status(500).json({ message: "Failed to import data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
