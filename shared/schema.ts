import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").default(""),
  gender: text("gender").default(""),
  country: text("country").default("ID"),
  zipCode: text("zip_code").default(""),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  completedSurveys: integer("completed_surveys").default(0),
  profileCompleteness: integer("profile_completeness").default(0),
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
  profileCompleteness: true,
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

// Validasi password yang kuat
const passwordSchema = z.string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
  .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung minimal 1 angka")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password harus mengandung minimal 1 karakter khusus (!@#$%^&*(),.?\":{}|<>)");

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = insertUserSchema.extend({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
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
