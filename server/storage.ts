import { type Topic, type InsertTopic } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTopic(id: string): Promise<Topic | undefined>;
  getAllTopics(): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, data: Partial<Topic>): Promise<Topic | undefined>;
  deleteTopic(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private topics: Map<string, Topic>;

  constructor() {
    this.topics = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample topics with some data
    const codingTopic: Topic = {
      id: randomUUID(),
      name: "Coding",
      unit: "hours",
      data: this.generateSampleData()
    };

    const readingTopic: Topic = {
      id: randomUUID(),
      name: "Reading",
      unit: "pages",
      data: {}
    };

    const exerciseTopic: Topic = {
      id: randomUUID(),
      name: "Exercise",
      unit: "minutes",
      data: {}
    };

    this.topics.set(codingTopic.id, codingTopic);
    this.topics.set(readingTopic.id, readingTopic);
    this.topics.set(exerciseTopic.id, exerciseTopic);
  }

  private generateSampleData(): any {
    const data: any = {};
    const startDate = new Date('2024-01-01');
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const weekday = date.getDay();
      let value = 0;
      
      if (weekday >= 1 && weekday <= 5) {
        value = Math.floor(Math.random() * 9);
      } else if (Math.random() > 0.7) {
        value = Math.floor(Math.random() * 4);
      }
      
      if (value > 0) {
        data[dateStr] = value;
      }
    }
    
    return data;
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
    return topic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;
    
    const updatedTopic = { ...topic, ...updates };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  async deleteTopic(id: string): Promise<boolean> {
    return this.topics.delete(id);
  }
}

export const storage = new MemStorage();
