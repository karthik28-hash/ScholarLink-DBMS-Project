import mysql from "mysql2/promise";
import env from "./env.js";

const poolOrgB = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.orgBDb,
  port: env.dbPort,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default poolOrgB;