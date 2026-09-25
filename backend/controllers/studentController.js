import {
    getAllStudents,
    getStudentById
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