import fs from "fs";
import env from "./env.js";

/**
 * Returns SSL options for mysql2 connection pools and clients.
 * Supports TLS connections using hosted MySQL CA certificates (e.g., Aiven, AWS RDS, DigitalOcean)
 * while retaining certificate verification by default.
 */
export function getDbSslOptions() {
  if (!env.dbSsl) {
    return undefined;
  }

  const ssl = {
    rejectUnauthorized: env.dbRejectUnauthorized,
  };

  if (env.dbCaCert) {
    let certContent = env.dbCaCert.trim();

    // Check if the certificate is base64 encoded (common on Render/Vercel)
    if (!certContent.includes("BEGIN CERTIFICATE") && certContent.length > 50) {
      try {
        const decoded = Buffer.from(certContent, "base64").toString("utf-8");
        if (decoded.includes("BEGIN CERTIFICATE")) {
          certContent = decoded;
        }
      } catch {
        // Fall back to raw string if decoding fails
      }
    }

    // Convert literal escaped newlines '\n' to actual newlines
    if (certContent.includes("\\n")) {
      certContent = certContent.replace(/\\n/g, "\n");
    }

    ssl.ca = certContent;
  } else if (env.dbCaPath) {
    try {
      ssl.ca = fs.readFileSync(env.dbCaPath, "utf-8");
    } catch (err) {
      console.warn(
        `[ScholarLink DB] Warning: Failed to read CA certificate from ${env.dbCaPath}: ${err.message}`
      );
    }
  }

  return ssl;
}
