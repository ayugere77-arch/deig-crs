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

  // In-memory fallbacks for uninterrupted operations
  const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Bribery & Extortion', description: 'Offering or receiving gifts for influence' },
    { id: 2, name: 'Procurement & Tender Fraud', description: 'Manipulation of bidding processes' },
    { id: 3, name: 'Embezzlement & Misappropriation', description: 'Theft of organizational funds' },
    { id: 4, name: 'Nepotism & Cronyism', description: 'Favoritism in hiring or promotion' },
    { id: 5, name: 'Abuse of Authority', description: 'Misuse of public power for private gain' },
    { id: 6, name: 'Tax Evasion & Customs Fraud', description: 'False declarations and illicit tariff avoidance' },
    { id: 7, name: 'Money Laundering', description: 'Disguising financial origins of illegal funds' },
    { id: 8, name: 'Judicial Corruption', description: 'Subversion of lawful judicial decisions' },
  ];

  const DEFAULT_INDUSTRIES = [
    { id: 1, name: 'Construction & Infrastructure' },
    { id: 2, name: 'Banking & Financial Services' },
    { id: 3, name: 'Revenue & Customs Authorities' },
    { id: 4, name: 'Healthcare & Pharmaceuticals' },
    { id: 5, name: 'Education & Academia' },
    { id: 6, name: 'Mining, Energy & Natural Resources' },
    { id: 7, name: 'Telecommunications & Technology' },
    { id: 8, name: 'Judiciary & Law Enforcement' },
    { id: 9, name: 'Land Administration & Urban Development' },
  ];

  const DEFAULT_DEPARTMENTS = [
    { id: 1, name: 'Procurement & Bidding Directorate' },
    { id: 2, name: 'Finance & Budget Administration' },
    { id: 3, name: 'Human Resources & Personnel' },
    { id: 4, name: 'Licensing, Permits & Compliance' },
    { id: 5, name: 'Audit, Risk & Internal Inspection' },
    { id: 6, name: 'Executive & Board Administration' },
  ];

  let inMemoryReports: any[] = [
    {
      id: 1,
      trackingId: 'DEIG-CRS-2026-000001',
      title: 'Irregular Procurement in Federal Highway Extension',
      description: 'Substantial discrepancy between approved bill of quantities and contracted cement specifications.',
      category: 'Procurement & Tender Fraud',
      organization: 'Federal Road Authority',
      location: 'Addis Ababa',
      date: '2026-10-15',
      status: 'Investigation Started',
      priority: 'High',
      isAnonymous: true,
      reporter: 'Anonymous',
      evidence: [],
      createdAt: new Date('2026-10-15T10:30:00Z'),
    },
    {
      id: 2,
      trackingId: 'DEIG-CRS-2026-000002',
      title: 'Customs Valuation Underrating on Imported Cargo',
      description: 'Cargo clearing agents colluding with terminal inspectors to issue fraudulent clearance tariffs.',
      category: 'Tax Evasion & Customs Fraud',
      organization: 'Customs Commission Terminal',
      location: 'Dire Dawa',
      date: '2026-10-20',
      status: 'Under Review',
      priority: 'Medium',
      isAnonymous: false,
      reporter: 'Confidential Officer <inspector.dawa@gov.et>',
      evidence: [],
      createdAt: new Date('2026-10-20T14:15:00Z'),
    }
  ];

  app.get("/api/reports", authenticate, async (req, res) => {
    try {
      if (db) {
        const allReports = await db.select().from(reports).orderBy(sql`${reports.createdAt} DESC`);
        if (allReports && allReports.length > 0) {
          return res.json(allReports);
        }
      }
    } catch (error) {
      console.warn('[Reports] Database query failed, using in-memory store:', error);
    }
    res.json(inMemoryReports);
  });

  app.get("/api/reports/:id", authenticate, async (req, res) => {
    try {
      if (db) {
        const report = await db.query.reports.findFirst({
          where: eq(reports.trackingId, req.params.id)
        });
        if (report) return res.json(report);
      }
    } catch (error) {
      console.warn('[Report] DB fetch error:', error);
    }
    const memReport = inMemoryReports.find(r => r.trackingId === req.params.id);
    if (memReport) return res.json(memReport);
    res.status(404).json({ error: "Report not found" });
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const { title, description, category, organization, location, date, isAnonymous, reporterName, reporterEmail, evidence } = req.body;
      
      let nextId = inMemoryReports.length + 1;
      if (db) {
        try {
          const counts = await db.select({ value: count() }).from(reports);
          if (counts && counts[0]?.value) {
            nextId = counts[0].value + 1;
          }
        } catch (cErr) {
          console.warn('[Reports] Count failed, using fallback counter');
        }
      }

      const trackingId = `DEIG-CRS-2026-${String(nextId).padStart(6, '0')}`;
      const newReportData = {
        trackingId,
        title: title || 'Integrity Incident',
        description: description || '',
        category: category || 'General Infraction',
        organization: organization || 'Federal Institution',
        location: location || 'Federal Territory',
        date: date || new Date().toISOString().split('T')[0],
        isAnonymous: !!isAnonymous,
        reporter: isAnonymous ? "Anonymous" : `${reporterName || ''} <${reporterEmail || ''}>`.trim(),
        evidence: evidence || [],
        status: "Submitted",
        priority: "Medium",
        createdAt: new Date(),
      };

      if (db) {
        try {
          await db.insert(reports).values(newReportData as any);
        } catch (dbErr) {
          console.error('[Reports] Database insert error, stored in in-memory list:', dbErr);
        }
      }

      inMemoryReports.unshift(newReportData);
      io.emit("new_report", { ...newReportData, id: trackingId });
      res.status(201).json({ ...newReportData, id: trackingId });
    } catch (error) {
      console.error('Failed to create report:', error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.patch("/api/reports/:id/status", authenticate, async (req, res) => {
    try {
      const { status } = req.body;
      if (db) {
        try {
          await db.update(reports)
            .set({ status })
            .where(eq(reports.trackingId, req.params.id));
        } catch (err) {
          console.warn('[Status] Database update failed:', err);
        }
      }

      const memReport = inMemoryReports.find(r => r.trackingId === req.params.id);
      if (memReport) {
        memReport.status = status;
      }

      io.emit("status_updated", { id: req.params.id, status });
      res.json({ id: req.params.id, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // Analytics endpoint
  app.get("/api/stats", authenticate, async (req, res) => {
    try {
      let activeReports = inMemoryReports;
      if (db) {
        try {
          const dbReports = await db.select().from(reports);
          if (dbReports && dbReports.length > 0) {
            activeReports = dbReports;
          }
        } catch (err) {
          console.warn('[Stats] Database query failed, using in-memory list');
        }
      }
      
      const locationCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      activeReports.forEach((r: any) => {
        if (r.location) {
          locationCounts[r.location] = (locationCounts[r.location] || 0) + 1;
        }
        if (r.category) {
          categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
        }
      });

      const stats = {
        total: activeReports.length,
        pending: activeReports.filter((r: any) => r.status === "Submitted" || r.status === "Under Review").length,
        investigating: activeReports.filter((r: any) => r.status === "Investigation Started").length,
        resolved: activeReports.filter((r: any) => r.status === "Resolved").length,
        trends: [
          { name: 'Jan', reports: 4 },
          { name: 'Feb', reports: 7 },
          { name: 'Mar', reports: 5 },
          { name: 'Apr', reports: 12 },
          { name: 'May', reports: activeReports.length },
        ],
        byCategory: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
        byLocation: Object.entries(locationCounts).map(([name, cases]) => ({ name, cases }))
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Config Items Endpoints (with guaranteed fallback responses)
  app.get("/api/categories", async (req, res) => {
    try {
      if (db) {
        const dbCats = await db.select().from(categories);
        if (dbCats && dbCats.length > 0) return res.json(dbCats);
      }
    } catch (err) {
      console.warn('[Categories] Database fetch failed, using fallback list');
    }
    res.json(DEFAULT_CATEGORIES);
  });

  app.post("/api/categories", authenticate, async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    try {
      if (db) {
        await db.insert(categories).values({ name, description });
      }
    } catch (err) {
      console.warn('[Categories] Could not insert to DB, saving locally');
    }
    DEFAULT_CATEGORIES.push({ id: DEFAULT_CATEGORIES.length + 1, name, description: description || '' });
    res.status(201).json({ success: true, name });
  });

  app.get("/api/industries", async (req, res) => {
    try {
      if (db) {
        const dbInds = await db.select().from(industries);
        if (dbInds && dbInds.length > 0) return res.json(dbInds);
      }
    } catch (err) {
      console.warn('[Industries] Database fetch failed, using fallback list');
    }
    res.json(DEFAULT_INDUSTRIES);
  });

  app.post("/api/industries", authenticate, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    try {
      if (db) {
        await db.insert(industries).values({ name });
      }
    } catch (err) {
      console.warn('[Industries] Could not insert to DB, saving locally');
    }
    DEFAULT_INDUSTRIES.push({ id: DEFAULT_INDUSTRIES.length + 1, name });
    res.status(201).json({ success: true, name });
  });

  app.get("/api/departments", async (req, res) => {
    try {
      if (db) {
        const dbDepts = await db.select().from(departments);
        if (dbDepts && dbDepts.length > 0) return res.json(dbDepts);
      }
    } catch (err) {
      console.warn('[Departments] Database fetch failed, using fallback list');
    }
    res.json(DEFAULT_DEPARTMENTS);
  });

  app.post("/api/departments", authenticate, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    try {
      if (db) {
        await db.insert(departments).values({ name });
      }
    } catch (err) {
      console.warn('[Departments] Could not insert to DB, saving locally');
    }
    DEFAULT_DEPARTMENTS.push({ id: DEFAULT_DEPARTMENTS.length + 1, name });
    res.status(201).json({ success: true, name });
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
