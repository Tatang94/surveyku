import { users, surveys, userSurveys, transactions, type User, type InsertUser, type Survey, type InsertSurvey, type UserSurvey, type InsertUserSurvey, type Transaction, type InsertTransaction } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  validateUser(username: string, password: string): Promise<User | null>;
  
  // Survey operations
  getSurveys(): Promise<Survey[]>;
  getSurvey(id: number): Promise<Survey | undefined>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: number, updates: Partial<Survey>): Promise<Survey | undefined>;
  
  // User survey operations
  getUserSurveys(userId: number): Promise<UserSurvey[]>;
  createUserSurvey(userSurvey: InsertUserSurvey): Promise<UserSurvey>;
  updateUserSurvey(id: number, updates: Partial<UserSurvey>): Promise<UserSurvey | undefined>;
  getUserSurveyByCpxId(userId: number, cpxSurveyId: string): Promise<UserSurvey | undefined>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Stats operations
  getUserStats(userId: number): Promise<{
    totalEarnings: string;
    completedSurveys: number;
    completionRate: number;
    availableSurveys: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with sample surveys
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if surveys already exist
      const existingSurveys = await db.select().from(surveys).limit(1);
      if (existingSurveys.length > 0) {
        return; // Data already initialized
      }

      const sampleSurveys = [
        {
          cpxSurveyId: "CPX_001",
          title: "Survey Kepuasan Pelanggan E-commerce",
          description: "Berikan pendapat Anda tentang pengalaman berbelanja online dan dapatkan reward menarik",
          reward: "3500.00",
          duration: 15,
          category: "Premium",
          isActive: true,
        },
        {
          cpxSurveyId: "CPX_002",
          title: "Survey Preferensi Brand Makanan",
          description: "Ceritakan preferensi Anda tentang brand makanan favorit",
          reward: "2200.00",
          duration: 8,
          category: "Cepat",
          isActive: true,
        },
        {
          cpxSurveyId: "CPX_003",
          title: "Survey Gaya Hidup Milenial",
          description: "Bagikan informasi tentang gaya hidup dan kebiasaan sehari-hari Anda",
          reward: "2800.00",
          duration: 12,
          category: "Demografi",
          isActive: true,
        },
        {
          cpxSurveyId: "CPX_004",
          title: "Survey Penggunaan Aplikasi Mobile",
          description: "Berikan feedback tentang aplikasi mobile yang sering Anda gunakan",
          reward: "2500.00",
          duration: 10,
          category: "Teknologi",
          isActive: true,
        },
      ];

      for (const surveyData of sampleSurveys) {
        await this.createSurvey(surveyData);
      }
    } catch (error) {
      console.log('Sample data initialization skipped:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }



  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getSurveys(): Promise<Survey[]> {
    return await db.select().from(surveys).where(eq(surveys.isActive, true));
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey || undefined;
  }

  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const [survey] = await db
      .insert(surveys)
      .values({
        ...insertSurvey,
        isActive: insertSurvey.isActive ?? true,
      })
      .returning();
    return survey;
  }

  async updateSurvey(id: number, updates: Partial<Survey>): Promise<Survey | undefined> {
    const [survey] = await db
      .update(surveys)
      .set(updates)
      .where(eq(surveys.id, id))
      .returning();
    return survey || undefined;
  }

  async getUserSurveys(userId: number): Promise<UserSurvey[]> {
    return await db.select().from(userSurveys).where(eq(userSurveys.userId, userId));
  }

  async createUserSurvey(insertUserSurvey: InsertUserSurvey): Promise<UserSurvey> {
    const [userSurvey] = await db
      .insert(userSurveys)
      .values({
        ...insertUserSurvey,
        reward: insertUserSurvey.reward || null,
      })
      .returning();
    return userSurvey;
  }

  async updateUserSurvey(id: number, updates: Partial<UserSurvey>): Promise<UserSurvey | undefined> {
    const [userSurvey] = await db
      .update(userSurveys)
      .set(updates)
      .where(eq(userSurveys.id, id))
      .returning();
    return userSurvey || undefined;
  }

  async getUserSurveyByCpxId(userId: number, cpxSurveyId: string): Promise<UserSurvey | undefined> {
    const [userSurvey] = await db
      .select()
      .from(userSurveys)
      .where(eq(userSurveys.userId, userId));
    return userSurvey || undefined;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getUserStats(userId: number): Promise<{
    totalEarnings: string;
    completedSurveys: number;
    completionRate: number;
    availableSurveys: number;
  }> {
    const user = await this.getUser(userId);
    const userSurveysList = await this.getUserSurveys(userId);
    const completedSurveys = userSurveysList.filter(us => us.status === 'completed').length;
    const totalAttempts = userSurveysList.length;
    const availableSurveys = (await this.getSurveys()).length;
    
    return {
      totalEarnings: user?.totalEarnings || "0.00",
      completedSurveys,
      completionRate: totalAttempts > 0 ? Math.round((completedSurveys / totalAttempts) * 100) : 0,
      availableSurveys,
    };
  }
}

export const storage = new DatabaseStorage();
