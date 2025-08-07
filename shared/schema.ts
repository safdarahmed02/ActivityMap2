import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  data: jsonb("data").notNull().default({}),
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  name: true,
  unit: true,
  data: true,
});

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

// Frontend-only types for the heatmap data structure
export interface HeatmapEntry {
  date: string;
  value: number;
}

export interface TopicData {
  [date: string]: number;
}

export interface AppTopic {
  id: string;
  name: string;
  unit: string;
  data: TopicData;
}
