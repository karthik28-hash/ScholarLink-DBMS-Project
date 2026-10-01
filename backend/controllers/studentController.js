import {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    createFinancialProfile,
    getFinancialProfile,
    updateFinancialProfile,
    deleteFinancialProfile,
    getStudentOverview
} from "../services/studentService.js";

export async function fetchAllStudents(req, res, next) {
    try {
        const students = await getAllStudents();

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        next(error);
    }
}

export async function fetchStudentById(req, res, next) {
    try {
        const { studentId } = req.params;

        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        next(error);
    }
}

export async function addStudent(req, res, next) {
    try {
        const {
            studentId,
            name,
            courseId,
            collegeId
        } = req.body;

        if (
            !studentId ||
            !name ||
            courseId === undefined ||
            collegeId === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "studentId, name, courseId and collegeId are required"
            });
        }

        const student = await createStudent(
            studentId,
            name,
            Number(courseId),
            Number(collegeId)
        );

        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: student
        });
    } catch (error) {
        next(error);
    }
}

export async function editStudent(req, res, next) {
    try {
        const { studentId } = req.params;

        const {
            name,
            courseId,
            collegeId
        } = req.body;

        if (
            !name ||
            courseId === undefined ||
            collegeId === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "name, courseId and collegeId are required"
            });
        }

        const existingStudent = await getStudentById(studentId);

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const result = await updateStudent(
            studentId,
            name,
            Number(courseId),
            Number(collegeId)
        );

        const updatedStudent = await getStudentById(
            studentId
        );

        return res.json({
            success: true,
            message: "Student updated successfully",
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
            data: updatedStudent
        });
    } catch (error) {
        next(error);
    }
}

export async function removeStudent(req, res, next) {
    try {
        const { studentId } = req.params;

        const existingStudent = await getStudentById(studentId);

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const result = await deleteStudent(studentId);

        return res.json({
            success: true,
            message: "Student deleted successfully",
            affectedRows: result.affectedRows
        });
    } catch (error) {
        next(error);
    }
}

export async function addFinancialProfile(req, res, next) {
    try {
        const { studentId } = req.params;

        const {
            annualFamilyIncome,
            familySize,
            otherEducationExpense
        } = req.body;

        if (
            annualFamilyIncome === undefined ||
            familySize === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "annualFamilyIncome and familySize are required"
            });
        }

        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const existingProfile = await getFinancialProfile(
            studentId
        );

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Financial profile already exists for this student"
            });
        }

        const profile = await createFinancialProfile(
            studentId,
            Number(annualFamilyIncome),
            Number(familySize),
            Number(otherEducationExpense ?? 0)
        );

        return res.status(201).json({
            success: true,
            message: "Financial profile created successfully",
            data: profile
        });
    } catch (error) {
        next(error);
    }
}

export async function fetchFinancialProfile(req, res, next) {
    try {
        const { studentId } = req.params;

        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const profile = await getFinancialProfile(studentId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Financial profile not found"
            });
        }

        return res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
}

export async function editFinancialProfile(req, res, next) {
    try {
        const { studentId } = req.params;

        const {
            annualFamilyIncome,
            familySize,
            otherEducationExpense
        } = req.body;

        if (
            annualFamilyIncome === undefined ||
            familySize === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "annualFamilyIncome and familySize are required"
            });
        }

        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const existingProfile = await getFinancialProfile(
            studentId
        );

        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: "Financial profile not found"
            });
        }

        const result = await updateFinancialProfile(
            studentId,
            Number(annualFamilyIncome),
            Number(familySize),
            Number(otherEducationExpense ?? 0)
        );

        const updatedProfile = await getFinancialProfile(
            studentId
        );

        return res.json({
            success: true,
            message: "Financial profile updated successfully",
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
            data: updatedProfile
        });
    } catch (error) {
        next(error);
    }
}

export async function removeFinancialProfile(req, res, next) {
    try {
        const { studentId } = req.params;

        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const existingProfile = await getFinancialProfile(
            studentId
        );

        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: "Financial profile not found"
            });
        }

        const result = await deleteFinancialProfile(studentId);

        return res.json({
            success: true,
            message: "Financial profile deleted successfully",
            affectedRows: result.affectedRows
        });
    } catch (error) {
        next(error);
    }
}

export async function fetchStudentOverview(req, res, next) {
    try {
        const { studentId } = req.params;

        const overview = await getStudentOverview(studentId);

        if (!overview) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.json({
            success: true,
            data: overview
        });
    } catch (error) {
        next(error);
    }
}