import type { Topic } from "@shared/schema";

const STORAGE_KEY = 'heatmap-tracker-data';

export class ClientStorage {
  private static instance: ClientStorage;
  private topics: Map<string, Topic> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ClientStorage {
    if (!ClientStorage.instance) {
      ClientStorage.instance = new ClientStorage();
    }
    return ClientStorage.instance;
  }

  private loadFromStorage(): void {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) {
        const topics: Topic[] = JSON.parse(data);
        topics.forEach(topic => {
          this.topics.set(topic.id, topic);
        });
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      this.topics.clear();
    }
  }

  private saveToStorage(): void {
    try {
      const topics = Array.from(this.topics.values());
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  async getAllTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(topic: Omit<Topic, 'id'>): Promise<Topic> {
    const id = crypto.randomUUID();
    const newTopic: Topic = { ...topic, id };
    this.topics.set(id, newTopic);
    this.saveToStorage();
    return newTopic;
  }

  async updateTopic(id: string, updates: Partial<Omit<Topic, 'id'>>): Promise<Topic> {
    const existingTopic = this.topics.get(id);
    if (!existingTopic) {
      throw new Error(`Topic with id ${id} not found`);
    }

    const updatedTopic: Topic = { ...existingTopic, ...updates };
    this.topics.set(id, updatedTopic);
    this.saveToStorage();
    return updatedTopic;
  }

  async deleteTopic(id: string): Promise<void> {
    if (!this.topics.has(id)) {
      throw new Error(`Topic with id ${id} not found`);
    }
    this.topics.delete(id);
    this.saveToStorage();
  }

  async exportData(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async importData(topics: Topic[]): Promise<{ message: string; topics: Topic[] }> {
    this.topics.clear();
    topics.forEach(topic => {
      this.topics.set(topic.id, topic);
    });
    this.saveToStorage();
    return { message: "Data imported successfully", topics };
  }

  async clearAllData(): Promise<void> {
    this.topics.clear();
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const clientStorage = ClientStorage.getInstance();