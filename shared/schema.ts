import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  pattern: text("pattern").notNull(), // Store pattern as string like "1-2-3-6-9"
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  completedSurveys: integer("completed_surveys").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  cpxSurveyId: text("cpx_survey_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: decimal("reward", { precision: 8, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSurveys = pgTable("user_surveys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  surveyId: integer("survey_id").references(() => surveys.id).notNull(),
  cpxSurveyId: text("cpx_survey_id").notNull(),
  status: text("status").notNull(), // 'started', 'completed', 'failed'
  reward: decimal("reward", { precision: 8, scale: 2 }),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'earning', 'withdrawal'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  balance: true,
  totalEarnings: true,
  completedSurveys: true,
  isActive: true,
  createdAt: true,
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
});

export const insertUserSurveySchema = createInsertSchema(userSurveys).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Validasi pattern lock
const patternSchema = z.string()
  .min(7, "Pola minimal 4 titik") // "1-2-3-4" = 7 characters minimum
  .regex(/^[1-9](-[1-9])*$/, "Format pola tidak valid")
  .refine(
    (pattern) => {
      const points = pattern.split('-').map(Number);
      return points.length >= 4 && points.length <= 9;
    },
    "Pola harus terdiri dari 4-9 titik"
  )
  .refine(
    (pattern) => {
      const points = pattern.split('-').map(Number);
      const uniquePoints = new Set(points);
      return uniquePoints.size === points.length;
    },
    "Setiap titik hanya boleh digunakan sekali"
  );

export const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  pattern: z.string().min(1, "Pola wajib diisi"),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh mengandung huruf, angka, dan underscore"),
  pattern: patternSchema,
  confirmPattern: z.string(),
}).refine((data) => data.pattern === data.confirmPattern, {
  message: "Pola tidak cocok",
  path: ["confirmPattern"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;
export type InsertUserSurvey = z.infer<typeof insertUserSurveySchema>;
export type UserSurvey = typeof userSurveys.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
