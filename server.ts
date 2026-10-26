import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { db, connection, checkConnection } from "./src/db";
import { initDatabaseTables } from "./src/db/init";
import { reports, categories, industries, departments, users } from "./src/db/schema";
import { eq, count, sql } from "drizzle-orm";

async function seedInitialData() {
  if (!db) return;
  try {
    const existingCats = await db.select().from(categories).limit(1);
    if (existingCats.length === 0) {
      await db.insert(categories).values([
        { name: 'Bribery', description: 'Offering or receiving gifts for influence' },
        { name: 'Embezzlement', description: 'Theft of organizational funds' },
        { name: 'Procurement Fraud', description: 'Manipulation of bidding processes' },
        { name: 'Nepotism', description: 'Favoritism in hiring or promotion' },
      ]);
      console.log('Seed categories added');
    }

    const existingInds = await db.select().from(industries).limit(1);
    if (existingInds.length === 0) {
      await db.insert(industries).values([
        { name: 'Construction & Infrastructure' },
        { name: 'Finance & Banking' },
        { name: 'Manufacturing' },
        { name: 'Healthcare & Pharma' },
      ]);
      console.log('Seed industries added');
    }

    const existingDepts = await db.select().from(departments).limit(1);
    if (existingDepts.length === 0) {
      await db.insert(departments).values([
        { name: 'Procurement Department' },
        { name: 'Human Resources (HR)' },
        { name: 'Finance & Accounting' },
        { name: 'Legal & Compliance' },
      ]);
      console.log('Seed departments added');
    }

    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      await db.insert(users).values([
        { name: 'Federal Inspector', email: 'admin@deig.gov.et', password: 'admin123', role: 'Administrator' },
        { name: 'Lead Investigator', email: 'investigator@deig.gov.et', password: 'investigator123', role: 'Investigator' },
        { name: 'Integrity Analyst', email: 'analyst@deig.gov.et', password: 'analyst123', role: 'Analyst' }
      ]);
      console.log('Seed users added');
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize MySQL tables and default seed data if connected
  if (connection) {
    await initDatabaseTables();
    await seedInitialData();
  }

  // Health check for Render and monitoring
  app.get("/api/health", async (req, res) => {
    const isDbAlive = await checkConnection();
    res.json({ 
      status: "operational", 
      timestamp: new Date().toISOString(),
      database: isDbAlive ? "connected" : (db ? "connecting" : "fallback"),
      port: PORT,
      telemetry: "active"
    });
  });

  // Auth logic (Simplified for demo, in production use bcrypt and real JWT)
  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader === "Bearer mock-jwt-token") {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized access. Valid token required." });
    }
  };

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Built-in accounts (accessible in both connected & fallback modes)
      if (email === "admin@deig.gov.et" && password === "admin123") {
        return res.json({ 
          token: "mock-jwt-token", 
          user: { name: "Federal Inspector", role: "Administrator", email } 
        });
      }
      if (email === "investigator@deig.gov.et" && password === "investigator123") {
        return res.json({ 
          token: "mock-jwt-token", 
          user: { name: "Lead Investigator", role: "Investigator", email } 
        });
      }
      if (email === "analyst@deig.gov.et" && password === "analyst123") {
        return res.json({ 
          token: "mock-jwt-token", 
          user: { name: "Integrity Analyst", role: "Analyst", email } 
        });
      }

      if (!db) return res.status(401).json({ error: "Invalid credentials" });

      // Check database for any registered user
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
      });

      if (user && user.password === password) {
        return res.json({ 
          token: "mock-jwt-token", 
          user: { name: user.name, role: user.role, email: user.email } 
        });
      }

      res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Auth failed" });
    }
  });

  app.get("/api/reports", authenticate, async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({ error: "Database not configured. Set DATABASE_URL in .env." });
      }
      const allReports = await db.select().from(reports).orderBy(sql`${reports.createdAt} DESC`);
      res.json(allReports);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", authenticate, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not configured" });
      const report = await db.query.reports.findFirst({
        where: eq(reports.trackingId, req.params.id)
      });
      if (!report) return res.status(404).json({ error: "Report not found" });
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Error fetching report" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not configured" });
      
      const counts = await db.select({ value: count() }).from(reports);
      const nextId = (counts[0]?.value || 0) + 1;
      const trackingId = `DEIG-CRS-2026-${String(nextId).padStart(6, '0')}`;

      const { title, description, category, organization, location, date, isAnonymous, reporterName, reporterEmail, evidence } = req.body;

      const newReportData: typeof reports.$inferInsert = {
        trackingId,
        title,
        description,
        category,
        organization,
        location,
        date,
        isAnonymous: !!isAnonymous,
        reporter: isAnonymous ? "Anonymous" : `${reporterName || ''} <${reporterEmail || ''}>`.trim(),
        evidence: evidence || [],
        status: "Submitted",
        createdAt: new Date(),
      };

      await db.insert(reports).values(newReportData);
      
      io.emit("new_report", { ...newReportData, id: trackingId });
      res.status(201).json({ ...newReportData, id: trackingId });
    } catch (error) {
      console.error('Failed to create report:', error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.patch("/api/reports/:id/status", authenticate, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not configured" });
      const { status } = req.body;
      
      await db.update(reports)
        .set({ status })
        .where(eq(reports.trackingId, req.params.id));

      io.emit("status_updated", { id: req.params.id, status });
      res.json({ id: req.params.id, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // Analytics endpoint
  app.get("/api/stats", authenticate, async (req, res) => {
    try {
      if (!db) return res.json({ total: 0, pending: 0, investigating: 0, resolved: 0, trends: [], byCategory: [], byLocation: [] });
      
      const allReports = await db.select().from(reports);
      
      // Calculate real location based stats
      const locationCounts: Record<string, number> = {};
      allReports.forEach(r => {
        if (r.location) {
          locationCounts[r.location] = (locationCounts[r.location] || 0) + 1;
        }
      });

      // Calculate dynamic category stats
      const categoryCounts: Record<string, number> = {};
      allReports.forEach(r => {
        if (r.category) {
          categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
        }
      });

      const stats = {
        total: allReports.length,
        pending: allReports.filter(r => r.status === "Submitted" || r.status === "Under Review").length,
        investigating: allReports.filter(r => r.status === "Investigation Started").length,
        resolved: allReports.filter(r => r.status === "Resolved").length,
        trends: [
          { name: 'Jan', reports: 4 },
          { name: 'Feb', reports: 7 },
          { name: 'Mar', reports: 5 },
          { name: 'Apr', reports: 12 },
          { name: 'May', reports: allReports.length },
        ],
        byCategory: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
        byLocation: Object.entries(locationCounts).map(([name, cases]) => ({ name, cases }))
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Config Items Endpoints
  app.get("/api/categories", async (req, res) => {
    if (!db) return res.json([]);
    res.json(await db.select().from(categories));
  });

  app.post("/api/categories", authenticate, async (req, res) => {
    if (!db) return res.status(503).json({ error: "DB not configured" });
    const { name, description } = req.body;
    await db.insert(categories).values({ name, description });
    res.status(201).json({ success: true });
  });

  app.get("/api/industries", async (req, res) => {
    if (!db) return res.json([]);
    res.json(await db.select().from(industries));
  });

  app.post("/api/industries", authenticate, async (req, res) => {
    if (!db) return res.status(503).json({ error: "DB not configured" });
    const { name } = req.body;
    await db.insert(industries).values({ name });
    res.status(201).json({ success: true });
  });

  app.get("/api/departments", async (req, res) => {
    if (!db) return res.json([]);
    res.json(await db.select().from(departments));
  });

  app.post("/api/departments", authenticate, async (req, res) => {
    if (!db) return res.status(503).json({ error: "DB not configured" });
    const { name } = req.body;
    await db.insert(departments).values({ name });
    res.status(201).json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Professional error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Server Error] ${err.message}`);
    res.status(err.status || 500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message,
      requestId: Math.random().toString(36).substring(7)
    });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
