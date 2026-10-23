import express from "express";
import cors from "cors";
import organizationRoutes from "./routes/organizationRoutes.js";
import env from "./config/env.js";
import centralDb from "./config/db.js";
import orgADb from "./config/dbOrgA.js";
import orgBDb from "./config/dbOrgB.js";
import orgCDb from "./config/dbOrgC.js";
import scholarshipRoutes from "./routes/scholarshipRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import awardRoutes from "./routes/awardRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import consentRoutes from "./routes/consentRoutes.js";
import federationRoutes from "./routes/federationRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

const app = express();

// Allowed origins configuration: combines env.frontendUrl with local dev ports
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4173",
];

if (env.frontendUrl) {
  env.frontendUrl.split(",").forEach((origin) => {
    const trimmed = origin.trim().replace(/\/+$/, "");
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (server-to-server, health checks, curl)
      if (!origin) return callback(null, true);

      // Always allow local development
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }

      // Allow configured origins or wildcard
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview or production deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS origin '${origin}' not allowed by ScholarLink policy`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "ScholarLink Backend is running"
    });
});

app.get("/api/health/db", async (req, res) => {
    try {
        await centralDb.query("SELECT 1");
        await orgADb.query("SELECT 1");
        await orgBDb.query("SELECT 1");
        await orgCDb.query("SELECT 1");

        res.json({
            success: true,
            message: "All databases connected successfully"
        });
    } catch (error) {
        console.error("Database health check error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: process.env.NODE_ENV === "production" ? "Unable to connect to database" : error.message
        });
    }
});


app.use("/api/organizations", organizationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api", scholarshipRoutes);
app.use("/api", applicationRoutes);
app.use("/api", awardRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/consents", consentRoutes);
app.use("/api/federation", federationRoutes);

// Centralized error-handling middleware preventing stack trace leaks
app.use((err, req, res, next) => {
    console.error("[ScholarLink Error]:", err.message);
    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === "production" && status === 500
            ? "An unexpected internal server error occurred"
            : err.message
    });
});

const port = Number(process.env.PORT || env.port || 5000);

app.listen(port, "0.0.0.0", () => {
    console.log(
        `ScholarLink backend running on port ${port} (0.0.0.0)`
    );
});