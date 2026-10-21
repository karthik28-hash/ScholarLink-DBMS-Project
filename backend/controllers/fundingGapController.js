import {
    estimateFundingGap
} from "../services/fundingGapService.js";

export async function calculateFundingGap(req, res) {
    const {
        studentId,
        queryId,
        academicYear
    } = req.body ?? {};

    if (!studentId || !queryId || !academicYear) {
        return res.status(400).json({
            success: false,
            message:
                "studentId, queryId and academicYear are required."
        });
    }

    try {
        const result = await estimateFundingGap(
            studentId,
            queryId,
            academicYear
        );

        return res.status(200).json({
            success: true,
            message: "Funding gap calculated successfully.",
            data: result
        });
    } catch (error) {
        let statusCode = error.statusCode || 500;

        if (error.message === "Query not found") {
            statusCode = 404;
        } else if (
            error.message?.includes("does not belong") ||
            error.message?.toLowerCase().includes("consent")
        ) {
            statusCode = 403;
        } else if (
            error.message?.includes("no organization targets")
        ) {
            statusCode = 400;
        }

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Funding gap calculation failed.",
            data: error.data ?? null
        });
    }
}