import type { Express } from "express";
import express from "express";
import path from "path";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cpxService } from "./services/cpx-service";
import { loginSchema, registerSchema } from "@shared/schema";
import session from "express-session";
import bcrypt from "bcrypt";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'surveyku-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }

      const user = await storage.createUser(userData);
      req.session.userId = user.id;

      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Gagal mendaftar" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Gagal masuk" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Gagal logout" });
      }
      res.json({ message: "Logout berhasil" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Survey routes
  app.get("/api/surveys", requireAuth, async (req, res) => {
    try {
      const surveys = await storage.getSurveys();
      res.json({ surveys });
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data survey" });
    }
  });

  app.get("/api/surveys/cpx-url", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const userProfile = {
        birthdayDay: user.dateOfBirth?.split('-')[2],
        birthdayMonth: user.dateOfBirth?.split('-')[1],
        birthdayYear: user.dateOfBirth?.split('-')[0],
        gender: user.gender === 'male' ? '1' : user.gender === 'female' ? '2' : undefined,
        countryCode: user.country || undefined,
        zipCode: user.zipCode || undefined,
      };

      const surveyUrl = cpxService.generateSurveyUrl(
        user.id.toString(),
        user.email,
        userProfile
      );

      res.json({ url: surveyUrl });
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil URL survey" });
    }
  });

  app.post("/api/surveys/:surveyId/start", requireAuth, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      const survey = await storage.getSurvey(surveyId);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey tidak ditemukan" });
      }

      const userSurvey = await storage.createUserSurvey({
        userId: req.session.userId!,
        surveyId,
        cpxSurveyId: survey.cpxSurveyId,
        status: 'started',
        reward: null,
      });

      res.json({ userSurvey });
    } catch (error) {
      res.status(500).json({ message: "Gagal memulai survey" });
    }
  });

  // CPX Research IP whitelist
  const CPX_WHITELIST_IPS = [
    '188.40.3.73',
    '2a01:4f8:d0a:30ff::2', 
    '157.90.97.92'
  ];

  // Get client IP helper function
  const getClientIP = (req: any) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
  };

  // CPX Research postback endpoint
  app.post("/api/postback/cpx", async (req, res) => {
    try {
      // Validate IP whitelist
      const clientIP = getClientIP(req);
      console.log(`CPX Postback from IP: ${clientIP}`);
      
      if (!CPX_WHITELIST_IPS.includes(clientIP)) {
        console.log(`Rejected postback from unauthorized IP: ${clientIP}`);
        return res.status(403).json({ 
          error: "Unauthorized IP address",
          ip: clientIP 
        });
      }
      const {
        user_id,
        survey_id,
        reward_amount,
        status,
        hash
      } = req.body;

      // Validate postback
      if (!cpxService.validatePostback({
        user_id,
        survey_id,
        reward_amount,
        status,
        hash
      })) {
        return res.status(400).json({ message: "Invalid postback" });
      }

      const userId = parseInt(user_id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (status === 'completed') {
        // Find the user survey
        let userSurvey = await storage.getUserSurveyByCpxId(userId, survey_id);
        
        if (!userSurvey) {
          // Create new user survey if not exists
          userSurvey = await storage.createUserSurvey({
            userId,
            surveyId: 0, // Will be updated
            cpxSurveyId: survey_id,
            status: 'completed',
            reward: reward_amount,
          });
        } else {
          // Update existing user survey
          await storage.updateUserSurvey(userSurvey.id, {
            status: 'completed',
            reward: reward_amount,
            completedAt: new Date(),
          });
        }

        // Update user balance and stats
        const newBalance = (parseFloat(user.balance || "0") + parseFloat(reward_amount)).toFixed(2);
        const newTotalEarnings = (parseFloat(user.totalEarnings || "0") + parseFloat(reward_amount)).toFixed(2);
        
        await storage.updateUser(userId, {
          balance: newBalance,
          totalEarnings: newTotalEarnings,
          completedSurveys: (user.completedSurveys || 0) + 1,
        });

        // Create transaction record
        await storage.createTransaction({
          userId,
          type: 'earning',
          amount: reward_amount,
          description: `Survey completed: ${survey_id}`,
          status: 'completed',
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('CPX postback error:', error);
      res.status(500).json({ message: "Postback processing failed" });
    }
  });

  // User stats and dashboard data
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil statistik" });
    }
  });

  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.session.userId!);
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil riwayat transaksi" });
    }
  });

  app.post("/api/withdraw", requireAuth, async (req, res) => {
    try {
      const { amount } = req.body;
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const balance = parseFloat(user.balance || "0");
      const withdrawAmount = parseFloat(amount);

      if (withdrawAmount < 50000) {
        return res.status(400).json({ message: "Minimum penarikan Rp 50.000" });
      }

      if (withdrawAmount > balance) {
        return res.status(400).json({ message: "Saldo tidak mencukupi" });
      }

      // Update user balance
      const newBalance = (balance - withdrawAmount).toFixed(2);
      await storage.updateUser(req.session.userId!, { balance: newBalance });

      // Create withdrawal transaction
      await storage.createTransaction({
        userId: req.session.userId!,
        type: 'withdrawal',
        amount: amount,
        description: 'Penarikan dana',
        status: 'pending',
      });

      res.json({ message: "Permintaan penarikan berhasil", newBalance });
    } catch (error) {
      res.status(500).json({ message: "Gagal memproses penarikan" });
    }
  });

  app.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.session.userId!, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Gagal memperbarui profil" });
    }
  });

  const httpServer = createServer(app);
  // Serve CyberThreat LiveMap static files
  const cyberMapsPath = path.resolve(process.cwd(), 'cyber-attack-maps');
  app.use('/cyber-attack-maps', express.static(cyberMapsPath));

  // Route for cyber attack maps
  app.get('/cyber-attack-maps', (req, res) => {
    res.sendFile(path.join(cyberMapsPath, 'index.html'));
  });

  return httpServer;
}
