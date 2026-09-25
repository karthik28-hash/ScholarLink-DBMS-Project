import dotenv from "dotenv";

dotenv.config();

const env = {
    port: process.env.PORT || 5000,

    centralDb: process.env.CENTRAL_DB,
    orgADb: process.env.ORG_A_DB,
    orgBDb: process.env.ORG_B_DB,
    orgCDb: process.env.ORG_C_DB,

    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbPort: process.env.DB_PORT || 3306,

    jwtSecret: process.env.JWT_SECRET
};

export default env;