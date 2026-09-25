import express from "express";
import cors from "cors";

import env from "./config/env.js";
import centralDb from "./config/db.js";
import orgADb from "./config/dbOrgA.js";
import orgBDb from "./config/dbOrgB.js";
import orgCDb from "./config/dbOrgC.js";

import studentRoutes from "./routes/studentRoutes.js";

const app = express();

app.use(cors());
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
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

app.use("/api/students", studentRoutes);

app.listen(env.port, () => {
    console.log(
        `ScholarLink backend running on port ${env.port}`
    );
});