import express from "express";

import {
    addQuery,
    fetchAllQueries,
    fetchQueryById,
    fetchStudentQueries,
    editQueryStatus
} from "../controllers/queryController.js";

const router = express.Router();

router.post("/", addQuery);

router.get("/", fetchAllQueries);

router.get("/student/:studentId", fetchStudentQueries);

router.get("/:queryId", fetchQueryById);

router.patch("/:queryId/status", editQueryStatus);

export default router;