import express from "express";

import {
    fetchStudentScholarships,
    fetchStudentAwardSummary
} from "../controllers/scholarshipController.js";

const router = express.Router();

router.get(
    "/organizations/:organizationId/students/:studentId/scholarships",
    fetchStudentScholarships
);

router.get(
    "/organizations/:organizationId/students/:studentId/scholarship-summary",
    fetchStudentAwardSummary
);

export default router;