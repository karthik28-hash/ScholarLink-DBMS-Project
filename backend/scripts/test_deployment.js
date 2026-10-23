import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

console.log("Starting ScholarLink deployment verification test...");

function startServer(name, scriptPath, envOverrides = {}) {
  const p = spawn("node", [scriptPath], {
    cwd: backendDir,
    env: { ...process.env, ...envOverrides },
    stdio: ["ignore", "pipe", "pipe"],
  });
  p.stdout.on("data", (d) => console.log(`[${name} stdout]:`, d.toString().trim()));
  p.stderr.on("data", (d) => console.error(`[${name} stderr]:`, d.toString().trim()));
  return p;
}

const central = startServer("central", "server.js", { PORT: "5000", FRONTEND_URL: "https://scholarlink.vercel.app" });
const sbi = startServer("sbi", "organizationApis/sbiServer.js", { SBI_API_PORT: "5001" });
const tata = startServer("tata", "organizationApis/tataServer.js", { TATA_API_PORT: "5002" });
const reliance = startServer("reliance", "organizationApis/relianceServer.js", { RELIANCE_API_PORT: "5003" });



const processes = [central, sbi, tata, reliance];

function cleanup() {
  processes.forEach((p) => {
    if (p && p.pid) {
      try {
        spawn("taskkill", ["/pid", p.pid.toString(), "/f", "/t"]);
      } catch {}
    }
  });
}

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(1);
});

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  let lastInfo = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (res.ok) {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
      lastInfo = `status ${res.status}: ${text.slice(0, 100)}`;
      console.log(`[${url}] returned ${lastInfo}`);
    } catch (err) {
      lastInfo = `error: ${err.message}`;
    }
    await sleep(500);
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms: ${lastInfo}`);
}


async function run() {
  console.log("Waiting for servers to initialize and listen...");
  await sleep(4000);

  console.log("Testing health endpoints...");
  await Promise.all([
    waitForServer("http://127.0.0.1:5000/api/health/db"),
    waitForServer("http://127.0.0.1:5001/health"),
    waitForServer("http://127.0.0.1:5002/health"),
    waitForServer("http://127.0.0.1:5003/health")
  ]);
  console.log("All servers responded successfully!");



  let passed = true;

  try {
    // 1. Central API Health
    const centralHealthRes = await fetch("http://127.0.0.1:5000/api/health/db");
    const centralHealth = await centralHealthRes.json();
    console.log("1. Central API DB Health:", centralHealth.success ? "PASS" : "FAIL", centralHealth);
    if (!centralHealth.success) passed = false;

    // 2. CORS Verification with Vercel Origin
    const corsRes = await fetch("http://127.0.0.1:5000/api/health/db", {
      headers: { Origin: "https://scholarlink.vercel.app" },
    });
    const allowOrigin = corsRes.headers.get("access-control-allow-origin");
    console.log("2. CORS Vercel Origin Allow:", allowOrigin === "https://scholarlink.vercel.app" ? "PASS" : "FAIL", allowOrigin);
    if (allowOrigin !== "https://scholarlink.vercel.app") passed = false;

    // 3. Organization SBI Health
    const sbiRes = await fetch("http://127.0.0.1:5001/health");
    const sbiData = await sbiRes.json();
    console.log("3. SBI Org Health:", sbiData.success ? "PASS" : "FAIL", sbiData.organizationName);
    if (!sbiData.success) passed = false;

    // 4. Organization Tata Health
    const tataRes = await fetch("http://127.0.0.1:5002/health");
    const tataData = await tataRes.json();
    console.log("4. Tata Org Health:", tataData.success ? "PASS" : "FAIL", tataData.organizationName);
    if (!tataData.success) passed = false;

    // 5. Organization Reliance Health
    const relianceRes = await fetch("http://127.0.0.1:5003/health");
    const relianceData = await relianceRes.json();
    console.log("5. Reliance Org Health:", relianceData.success ? "PASS" : "FAIL", relianceData.organizationName);
    if (!relianceData.success) passed = false;

    // 6. Student Overview
    const studentRes = await fetch("http://127.0.0.1:5000/api/students/STU1001/overview");
    const studentData = await studentRes.json();
    console.log("6. Student STU1001 Overview:", studentData.success ? "PASS" : "FAIL", studentData.data?.name);
    if (!studentData.success || studentData.data?.name !== "Rahul Sharma") passed = false;

    // 7. Full Federated Query & Consent Flow
    console.log("7. Testing End-to-End Consent & Federated Query...");
    const queryRes = await fetch("http://127.0.0.1:5000/api/queries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "STU1001",
        purpose: "Scholarship verification audit",
        organizationIds: ["ORG001", "ORG002", "ORG003"]
      })
    });
    const queryData = await queryRes.json();
    const queryId = queryData.data?.query_id || queryData.data?.queryId;


    const consentRes = await fetch(`http://127.0.0.1:5000/api/consents/${queryId}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const consentData = await consentRes.json();
    const otpCode = consentData.data?.otp_code || consentData.data?.otpCode;

    const verifyRes = await fetch(`http://127.0.0.1:5000/api/consents/${queryId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpCode })
    });
    const verifyData = await verifyRes.json();

    const fedRes = await fetch("http://127.0.0.1:5000/api/federation/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: "STU1001", queryId })
    });
    const fedData = await fedRes.json();
    console.log("fedData payload:", JSON.stringify(fedData));
    console.log("7. Federated Lookup across all 3 Nodes:", fedData.success ? "PASS" : "FAIL", `Status: ${fedData.data?.status}, Total Awards: ${fedData.data?.summary?.totalAwards}`);
    if (!fedData.success || fedData.data?.status !== "LOOKUP_COMPLETED") passed = false;







  } catch (err) {
    console.error("Test execution failed:", err);
    passed = false;
  } finally {
    cleanup();
    if (passed) {
      console.log("\nALL BACKEND DEPLOYMENT HEALTH & ARCHITECTURE CHECKS PASSED!");
      process.exit(0);
    } else {
      console.error("\nSOME BACKEND CHECKS FAILED!");
      process.exit(1);
    }
  }
}

run();
