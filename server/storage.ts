import { users, surveys, userSurveys, transactions, type User, type InsertUser, type Survey, type InsertSurvey, type UserSurvey, type InsertUserSurvey, type Transaction, type InsertTransaction } from "@shared/schema";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  validateUser(email: string, password: string): Promise<User | null>;
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private surveys: Map<number, Survey>;
  private userSurveys: Map<number, UserSurvey>;
  private transactions: Map<number, Transaction>;
  private currentUserId: number;
  private currentSurveyId: number;
  private currentUserSurveyId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.userSurveys = new Map();
    this.transactions = new Map();
    this.currentUserId = 1;
    this.currentSurveyId = 1;
    this.currentUserSurveyId = 1;
    this.currentTransactionId = 1;
    
    // Initialize with sample surveys
    this.initializeSampleData();
  }

  private async initializeSampleData() {
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
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      dateOfBirth: insertUser.dateOfBirth || null,
      gender: insertUser.gender || null,
      country: insertUser.country || null,
      zipCode: insertUser.zipCode || null,
      balance: "0.00",
      totalEarnings: "0.00",
      completedSurveys: 0,
      profileCompleteness: this.calculateProfileCompleteness(insertUser),
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  private calculateProfileCompleteness(user: Partial<User>): number {
    const fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'country', 'zipCode'];
    const completedFields = fields.filter(field => user[field as keyof User]).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  async getSurveys(): Promise<Survey[]> {
    return Array.from(this.surveys.values()).filter(survey => survey.isActive);
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const id = this.currentSurveyId++;
    const survey: Survey = {
      ...insertSurvey,
      id,
      isActive: insertSurvey.isActive ?? true,
      createdAt: new Date(),
    };
    this.surveys.set(id, survey);
    return survey;
  }

  async updateSurvey(id: number, updates: Partial<Survey>): Promise<Survey | undefined> {
    const survey = this.surveys.get(id);
    if (!survey) return undefined;
    
    const updatedSurvey = { ...survey, ...updates };
    this.surveys.set(id, updatedSurvey);
    return updatedSurvey;
  }

  async getUserSurveys(userId: number): Promise<UserSurvey[]> {
    return Array.from(this.userSurveys.values()).filter(us => us.userId === userId);
  }

  async createUserSurvey(insertUserSurvey: InsertUserSurvey): Promise<UserSurvey> {
    const id = this.currentUserSurveyId++;
    const userSurvey: UserSurvey = {
      ...insertUserSurvey,
      id,
      reward: insertUserSurvey.reward || null,
      startedAt: new Date(),
      completedAt: null,
    };
    this.userSurveys.set(id, userSurvey);
    return userSurvey;
  }

  async updateUserSurvey(id: number, updates: Partial<UserSurvey>): Promise<UserSurvey | undefined> {
    const userSurvey = this.userSurveys.get(id);
    if (!userSurvey) return undefined;
    
    const updatedUserSurvey = { ...userSurvey, ...updates };
    this.userSurveys.set(id, updatedUserSurvey);
    return updatedUserSurvey;
  }

  async getUserSurveyByCpxId(userId: number, cpxSurveyId: string): Promise<UserSurvey | undefined> {
    return Array.from(this.userSurveys.values()).find(
      us => us.userId === userId && us.cpxSurveyId === cpxSurveyId
    );
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserStats(userId: number): Promise<{
    totalEarnings: string;
    completedSurveys: number;
    completionRate: number;
    availableSurveys: number;
  }> {
    const user = await this.getUser(userId);
    const userSurveys = await this.getUserSurveys(userId);
    const completedSurveys = userSurveys.filter(us => us.status === 'completed').length;
    const totalAttempts = userSurveys.length;
    const availableSurveys = (await this.getSurveys()).length;
    
    return {
      totalEarnings: user?.totalEarnings || "0.00",
      completedSurveys,
      completionRate: totalAttempts > 0 ? Math.round((completedSurveys / totalAttempts) * 100) : 0,
      availableSurveys,
    };
  }
}

export const storage = new MemStorage();
