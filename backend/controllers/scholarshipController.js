import {
    getStudentScholarships,
    getStudentAwardSummary
} from "../services/scholarshipService.js";

export async function fetchStudentScholarships(
    req,
    res,
    next
) {
    try {
        const { organizationId, studentId } = req.params;

        const scholarships =
            await getStudentScholarships(
                organizationId,
                studentId
            );

        return res.json({
            success: true,
            organizationId,
            studentId,
            count: scholarships.length,
            data: scholarships
        });
    } catch (error) {
        if (error.message === "Unknown organization") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

export async function fetchStudentAwardSummary(
    req,
    res,
    next
) {
    try {
        const { organizationId, studentId } = req.params;

        const summary =
            await getStudentAwardSummary(
                organizationId,
                studentId
            );

        return res.json({
            success: true,
            organizationId,
            data: summary
        });
    } catch (error) {
        if (error.message === "Unknown organization") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}