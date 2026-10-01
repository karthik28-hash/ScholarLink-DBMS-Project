import express from "express";

import {
  fetchAllStudents,
  fetchStudentById,
  addStudent,
  editStudent,
  removeStudent,
  addFinancialProfile,
  fetchFinancialProfile,
  editFinancialProfile,
  removeFinancialProfile,
  fetchStudentOverview,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", fetchAllStudents);

router.post("/", addStudent);

router.put("/:studentId", editStudent);

router.delete("/:studentId", removeStudent);

router.post("/:studentId/financial-profile", addFinancialProfile);

router.get("/:studentId/financial-profile", fetchFinancialProfile);

router.put("/:studentId/financial-profile", editFinancialProfile);

router.delete("/:studentId/financial-profile", removeFinancialProfile);

router.get("/:studentId/overview", fetchStudentOverview);

router.get("/:studentId", fetchStudentById);

export default router;
