import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and } from "drizzle-orm";
import * as schema from "../shared/schema";
import {
  users, quotes, projects, reviews, paymentCodes, subscriptions,
  insertQuoteSchema,
  insertProjectSchema,
  insertReviewSchema,
  insertPaymentCodeSchema,
  type User,
} from "../shared/schema";
import { z } from "zod";

// Database setup for Vercel serverless + Neon PostgreSQL
const databaseUrl = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (databaseUrl) {
  const sql = postgres(databaseUrl, { 
    ssl: 'require',
    prepare: false,
    max: 1,
  });
  db = drizzle(sql, { schema });
}

// Express app setup
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "bragawork-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Whop API helper function
async function createWhopCheckoutSession(params: {
  planId: string;
  redirectUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string; checkout_url: string } | null> {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.whop.com/api/v5/checkout_sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: params.planId,
        redirect_url: params.redirectUrl,
        metadata: params.metadata || {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Whop API error:", errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Whop checkout error:", error);
    return null;
  }
}

// Middleware
const requireDb = (_req: any, res: any, next: any) => {
  if (!db) {
    return res.status(500).json({ error: "Database not configured" });
  }
  next();
};

const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Não autorizado" });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user?.isAdmin) return next();
  res.status(403).json({ error: "Acesso negado" });
};

// Type declarations
declare module "express-session" {
  interface SessionData { userId?: number; }
}

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      displayName: string;
      avatarUrl?: string | null;
      isAdmin?: boolean | null;
    }
  }
}

// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && db) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        if (!db) return done(new Error("Database not available"));
        try {
          let [user] = await db.select().from(users).where(eq(users.googleId, profile.id));

          if (!user) {
            const email = profile.emails?.[0]?.value || "";
            [user] = await db.select().from(users).where(eq(users.email, email));

            if (user) {
              [user] = await db.update(users).set({ googleId: profile.id } as any).where(eq(users.id, user.id)).returning();
            } else {
              [user] = await db.insert(users).values({
                googleId: profile.id,
                email,
                username: email.split("@")[0] + "_" + Date.now(),
                displayName: profile.displayName || "Usuário",
                avatarUrl: profile.photos?.[0]?.value,
                isAdmin: email === "bragawork01@gmail.com",
              } as any).returning();
            }
          }

          return done(null, user!);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  if (!db) return done(new Error("Database not available"));
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    done(null, user || undefined);
  } catch (error) {
    done(error);
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Database test
app.get("/api/db-test", requireDb, async (_req, res) => {
  try {
    const result = await db!.execute("SELECT NOW() as now");
    res.json({ status: "connected", timestamp: result[0]?.now, database_url_exists: true });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Auth routes
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/?error=auth_failed" }),
  (_req, res) => res.redirect("/")
);

app.get("/api/auth/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Não autenticado" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Erro ao fazer logout" });
    res.json({ success: true });
  });
});

// Project routes
app.get("/api/projects", requireDb, async (_req, res) => {
  try {
    const result = await db!.select().from(projects).orderBy(projects.displayOrder);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar projetos", details: error.message });
  }
});

app.get("/api/projects/active", requireDb, async (_req, res) => {
  try {
    const result = await db!.select().from(projects).where(eq(projects.isActive, true)).orderBy(projects.displayOrder);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar projetos", details: error.message });
  }
});

app.post("/api/projects", requireDb, requireAdmin, async (req, res) => {
  try {
    const data = insertProjectSchema.parse(req.body);
    const [project] = await db!.insert(projects).values(data as any).returning();
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao criar projeto" });
  }
});

// Review routes
app.get("/api/reviews", requireDb, async (_req, res) => {
  try {
    const result = await db!.select().from(reviews).where(eq(reviews.isApproved, true)).orderBy(desc(reviews.createdAt));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar avaliações", details: error.message });
  }
});

app.get("/api/reviews/approved", requireDb, async (_req, res) => {
  try {
    const reviewsList = await db!.select().from(reviews).where(eq(reviews.isApproved, true)).orderBy(desc(reviews.createdAt));
    const result = await Promise.all(
      reviewsList.map(async (review) => {
        const [user] = await db!.select().from(users).where(eq(users.id, review.userId));
        return { ...review, user };
      })
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar avaliações", details: error.message });
  }
});

app.post("/api/reviews", requireDb, requireAuth, async (req, res) => {
  try {
    const data = insertReviewSchema.parse({ ...req.body, userId: req.user!.id });
    const [review] = await db!.insert(reviews).values(data as any).returning();
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao criar avaliação" });
  }
});

// Quote routes
app.get("/api/quotes", requireDb, requireAuth, async (req, res) => {
  try {
    const result = await db!.select().from(quotes).where(eq(quotes.userId, req.user!.id)).orderBy(desc(quotes.createdAt));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar orçamentos" });
  }
});

app.post("/api/quotes", requireDb, requireAuth, async (req, res) => {
  try {
    const data = insertQuoteSchema.parse({ ...req.body, userId: req.user!.id });
    const [quote] = await db!.insert(quotes).values(data as any).returning();
    res.json(quote);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao criar orçamento" });
  }
});

// Payment code routes
app.post("/api/payment-codes/verify", requireDb, async (req, res) => {
  try {
    const { code } = req.body;
    const [paymentCode] = await db!.select().from(paymentCodes).where(eq(paymentCodes.code, code));
    if (!paymentCode) return res.status(404).json({ error: "Código não encontrado" });
    if (paymentCode.isUsed) return res.status(400).json({ error: "Código já utilizado" });
    res.json({ id: paymentCode.id, code: paymentCode.code, amount: paymentCode.amount, description: paymentCode.description });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao verificar código" });
  }
});

// Subscription routes
app.get("/api/subscriptions", requireDb, requireAuth, async (req, res) => {
  try {
    const subs = await db!.select().from(subscriptions).where(eq(subscriptions.userId, req.user!.id));
    const active = subs.find(s => s.status === "active");
    res.json(active || null);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar assinatura" });
  }
});

// Whop payment routes
app.post("/api/whop/create-checkout-session", requireAuth, async (req, res) => {
  if (!process.env.WHOP_API_KEY) return res.status(500).json({ error: "Whop não configurado" });
  try {
    const { planId, amount, description } = req.body;
    const baseUrl = req.headers.origin || `https://${process.env.VERCEL_URL}` || "http://localhost:5000";
    
    // Create checkout session using Whop API
    const session = await createWhopCheckoutSession({
      planId: planId || process.env.WHOP_PLAN_ID || "",
      redirectUrl: `${baseUrl}/dashboard?success=true`,
      metadata: {
        userId: req.user!.id.toString(),
        email: req.user!.email,
        amount: amount?.toString() || "0",
        description: description || "Pagamento BragaWork"
      }
    });
    
    if (!session) {
      return res.status(500).json({ error: "Erro ao criar sessão de pagamento" });
    }
    
    res.json({ sessionId: session.id, url: session.checkout_url });
  } catch (error: any) {
    console.error("Whop checkout error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
app.get("/api/admin/stats", requireDb, requireAdmin, async (_req, res) => {
  try {
    const [allUsers, allQuotes, allSubscriptions, allReviews] = await Promise.all([
      db!.select().from(users),
      db!.select().from(quotes),
      db!.select().from(subscriptions),
      db!.select().from(reviews),
    ]);
    res.json({
      totalUsers: allUsers.length,
      totalQuotes: allQuotes.length,
      pendingQuotes: allQuotes.filter(q => q.status === "pending").length,
      activeSubscriptions: allSubscriptions.filter(s => s.status === "active").length,
      totalReviews: allReviews.length,
      approvedReviews: allReviews.filter(r => r.isApproved).length,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

app.get("/api/admin/users", requireDb, requireAdmin, async (_req, res) => {
  try {
    const result = await db!.select().from(users).orderBy(desc(users.createdAt));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

app.get("/api/admin/quotes", requireDb, requireAdmin, async (_req, res) => {
  try {
    const result = await db!.select().from(quotes).orderBy(desc(quotes.createdAt));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar orçamentos" });
  }
});

app.get("/api/admin/projects", requireDb, requireAdmin, async (_req, res) => {
  try {
    const result = await db!.select().from(projects).orderBy(projects.displayOrder);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar projetos" });
  }
});

app.get("/api/admin/reviews", requireDb, requireAdmin, async (_req, res) => {
  try {
    const result = await db!.select().from(reviews).orderBy(desc(reviews.createdAt));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
});

app.patch("/api/admin/reviews/:id", requireDb, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db!.update(reviews).set(req.body).where(eq(reviews.id, id)).returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao atualizar avaliação" });
  }
});

app.post("/api/admin/payment-codes", requireDb, requireAdmin, async (req, res) => {
  try {
    const data = insertPaymentCodeSchema.parse(req.body);
    const [code] = await db!.insert(paymentCodes).values(data as any).returning();
    res.json(code);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao criar código de pagamento" });
  }
});

app.get("/api/admin/payment-codes", requireDb, requireAdmin, async (_req, res) => {
  try {
    const result = await db!.select().from(paymentCodes).orderBy(desc(paymentCodes.createdAt));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar códigos de pagamento" });
  }
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

export default app;
