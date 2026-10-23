import mysql from "mysql2/promise";
import env from "./env.js";
import { getDbSslOptions } from "./dbSsl.js";

const ssl = getDbSslOptions();

const poolOrgB = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.orgBDb,
  port: env.dbPort,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(ssl ? { ssl } : {})
});

export default poolOrgB;