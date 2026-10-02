import express from "express";

import {
    fetchScholarshipPrograms,
    fetchScholarshipProgramById,
    addScholarshipProgram,
    editScholarshipProgram,
    removeScholarshipProgram,
    fetchStudentScholarships,
    fetchStudentAwardSummary
} from "../controllers/scholarshipController.js";

const router = express.Router();

// =========================================
// SCHOLARSHIP PROGRAM CRUD
// =========================================

router.get(
    "/organizations/:organizationId/scholarships",
    fetchScholarshipPrograms
);

router.get(
    "/organizations/:organizationId/scholarships/:scholarshipId",
    fetchScholarshipProgramById
);

router.post(
    "/organizations/:organizationId/scholarships",
    addScholarshipProgram
);

router.put(
    "/organizations/:organizationId/scholarships/:scholarshipId",
    editScholarshipProgram
);

router.delete(
    "/organizations/:organizationId/scholarships/:scholarshipId",
    removeScholarshipProgram
);

// =========================================
// STUDENT SCHOLARSHIP LOOKUP
// =========================================

router.get(
    "/organizations/:organizationId/students/:studentId/scholarships",
    fetchStudentScholarships
);

router.get(
    "/organizations/:organizationId/students/:studentId/scholarship-summary",
    fetchStudentAwardSummary
);

export default router;