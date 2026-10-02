import {
    getAllScholarshipPrograms,
    getScholarshipProgramById,
    createScholarshipProgram,
    updateScholarshipProgram,
    deleteScholarshipProgram,
    getStudentScholarships,
    getStudentAwardSummary
} from "../services/scholarshipService.js";

// =========================================
// SCHOLARSHIP PROGRAM
// =========================================

export async function fetchScholarshipPrograms(
    req,
    res,
    next
) {
    try {
        const { organizationId } = req.params;

        const programs =
            await getAllScholarshipPrograms(
                organizationId
            );

        return res.json({
            success: true,
            organizationId,
            count: programs.length,
            data: programs
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

export async function fetchScholarshipProgramById(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            scholarshipId
        } = req.params;

        const program =
            await getScholarshipProgramById(
                organizationId,
                Number(scholarshipId)
            );

        if (!program) {
            return res.status(404).json({
                success: false,
                message: "Scholarship program not found"
            });
        }

        return res.json({
            success: true,
            data: program
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

export async function addScholarshipProgram(
    req,
    res,
    next
) {
    try {
        const { organizationId } = req.params;

        const {
            scholarshipName,
            scholarshipType,
            maximumAmount
        } = req.body;

        if (
            !scholarshipName ||
            maximumAmount === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "scholarshipName and maximumAmount are required"
            });
        }

        const program =
            await createScholarshipProgram(
                organizationId,
                scholarshipName,
                scholarshipType ?? null,
                Number(maximumAmount)
            );

        return res.status(201).json({
            success: true,
            message:
                "Scholarship program created successfully",
            data: program
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

export async function editScholarshipProgram(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            scholarshipId
        } = req.params;

        const {
            scholarshipName,
            scholarshipType,
            maximumAmount
        } = req.body;

        if (
            !scholarshipName ||
            maximumAmount === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "scholarshipName and maximumAmount are required"
            });
        }

        const existing =
            await getScholarshipProgramById(
                organizationId,
                Number(scholarshipId)
            );

        if (!existing) {
            return res.status(404).json({
                success: false,
                message:
                    "Scholarship program not found"
            });
        }

        const result =
            await updateScholarshipProgram(
                organizationId,
                Number(scholarshipId),
                scholarshipName,
                scholarshipType ?? null,
                Number(maximumAmount)
            );

        const updated =
            await getScholarshipProgramById(
                organizationId,
                Number(scholarshipId)
            );

        return res.json({
            success: true,
            message:
                "Scholarship program updated successfully",
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
            data: updated
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

export async function removeScholarshipProgram(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            scholarshipId
        } = req.params;

        const existing =
            await getScholarshipProgramById(
                organizationId,
                Number(scholarshipId)
            );

        if (!existing) {
            return res.status(404).json({
                success: false,
                message:
                    "Scholarship program not found"
            });
        }

        const result =
            await deleteScholarshipProgram(
                organizationId,
                Number(scholarshipId)
            );

        return res.json({
            success: true,
            message:
                "Scholarship program deleted successfully",
            affectedRows: result.affectedRows
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

// =========================================
// STUDENT SCHOLARSHIP LOOKUP
// =========================================

export async function fetchStudentScholarships(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            studentId
        } = req.params;

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
        const {
            organizationId,
            studentId
        } = req.params;

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