import { type Topic, type InsertTopic } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getTopic(id: string): Promise<Topic | undefined>;
  getAllTopics(): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, data: Partial<Topic>): Promise<Topic | undefined>;
  deleteTopic(id: string): Promise<boolean>;
  importData(topics: Topic[]): Promise<void>;
  exportData(): Promise<Topic[]>;
}

export class MemStorage implements IStorage {
  private topics: Map<string, Topic>;
  private dataFile = path.join(process.cwd(), 'topics-data.json');

  constructor() {
    this.topics = new Map();
    this.loadFromFile();
  }

  private async loadFromFile() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf-8');
      const topics: Topic[] = JSON.parse(data);
      topics.forEach(topic => {
        this.topics.set(topic.id, topic);
      });
    } catch (error) {
      // File doesn't exist or is invalid, start with empty data
      console.log('No data file found, starting with empty data');
    }
  }

  private async saveToFile() {
    try {
      const topics = Array.from(this.topics.values());
      await fs.writeFile(this.dataFile, JSON.stringify(topics, null, 2));
    } catch (error) {
      console.error('Failed to save data to file:', error);
    }
  }

  async importData(topics: Topic[]): Promise<void> {
    this.topics.clear();
    topics.forEach(topic => {
      this.topics.set(topic.id, topic);
    });
    await this.saveToFile();
  }

  async exportData(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async getAllTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = randomUUID();
    const topic: Topic = {
      id,
      name: insertTopic.name,
      unit: insertTopic.unit,
      data: insertTopic.data || {}
    };
    this.topics.set(id, topic);
    await this.saveToFile();
    return topic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;
    
    const updatedTopic = { ...topic, ...updates };
    this.topics.set(id, updatedTopic);
    await this.saveToFile();
    return updatedTopic;
  }

  async deleteTopic(id: string): Promise<boolean> {
    const deleted = this.topics.delete(id);
    if (deleted) {
      await this.saveToFile();
    }
    return deleted;
  }
}

export const storage = new MemStorage();
