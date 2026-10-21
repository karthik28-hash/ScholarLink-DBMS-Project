import {
    performFederatedLookup
} from "../services/federationService.js";

export async function runFederatedLookup(req, res, next) {
    try {
        const { studentId, queryId } = req.body;

        if (!studentId || !queryId) {
            return res.status(400).json({
                success: false,
                message: "studentId and queryId are required"
            });
        }

        const result = await performFederatedLookup(
            studentId,
            queryId
        );

        if (result.status === "LOOKUP_FAILED") {
            return res.status(503).json({
                success: false,
                message:
                    "All organization API requests failed",
                data: result
            });
        }

        return res.json({
            success: true,
            message:
                result.status === "LOOKUP_PARTIAL"
                    ? "Lookup completed with partial results"
                    : "Federated lookup completed successfully",
            data: result
        });
    } catch (error) {
        const clientErrors = {
            "Query not found": 404,
            "Query does not belong to this student": 403,
            "Consent is not verified": 403,
            "Consent has expired or is invalid": 403,
            "Query has no organization targets": 400
        };

        if (clientErrors[error.message]) {
            return res.status(clientErrors[error.message]).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}