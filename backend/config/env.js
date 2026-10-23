import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from process.cwd(), then fallback to backend/.env if needed
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });


const env = {
  port: Number(process.env.PORT || 5000),

  centralDb: process.env.CENTRAL_DB || "scholarlink_central",
  orgADb: process.env.ORG_A_DB || "scholarlink_sbi_foundation",
  orgBDb: process.env.ORG_B_DB || "scholarlink_tata_capital",
  orgCDb: process.env.ORG_C_DB || "scholarlink_reliance_foundation",

  dbHost: process.env.DB_HOST || "localhost",
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbPort: Number(process.env.DB_PORT || 3306),

  // TLS / SSL configuration for hosted MySQL providers (e.g. Aiven, AWS RDS, DigitalOcean)
  dbSsl: process.env.DB_SSL === "true" || !!process.env.DB_CA_CERT || !!process.env.DB_CA_PATH,
  dbCaCert: process.env.DB_CA_CERT || null,
  dbCaPath: process.env.DB_CA_PATH || null,
  dbRejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== "false", // Retain verification by default

  jwtSecret: process.env.JWT_SECRET || "scholarlink_super_secret_academic_key",

  sbiApiPort: Number(process.env.SBI_API_PORT || 5001),
  tataApiPort: Number(process.env.TATA_API_PORT || 5002),
  relianceApiPort: Number(process.env.RELIANCE_API_PORT || 5003),

  sbiApiUrl: process.env.SBI_API_URL || "http://localhost:5001",
  tataApiUrl: process.env.TATA_API_URL || "http://localhost:5002",
  relianceApiUrl: process.env.RELIANCE_API_URL || "http://localhost:5003",

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  federationTimeoutMs: Number(process.env.FEDERATION_TIMEOUT_MS || 30000),
};

export default env;

