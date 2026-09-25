import express from "express";

import {
    fetchAllStudents,
    fetchStudentById
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", fetchAllStudents);

router.get("/:studentId", fetchStudentById);

export default router;