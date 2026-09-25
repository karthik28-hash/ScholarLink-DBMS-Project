import mysql from "mysql2/promise";
import env from "./env.js";

const poolOrgC = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.orgCDb,
  port: env.dbPort,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default poolOrgC;