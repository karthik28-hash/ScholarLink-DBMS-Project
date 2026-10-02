import {
    requestConsent,
    verifyConsent,
    denyConsent,
    getConsentByQueryId
} from "../services/consentService.js";

export async function createConsentRequest(
    req,
    res,
    next
) {
    try {
        const { queryId } = req.params;

        const consent =
            await requestConsent(queryId);

        return res.status(201).json({
            success: true,
            message:
                "Consent request created successfully",
            data: consent
        });
    } catch (error) {
        if (error.message === "Query not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.message ===
            "Consent request already exists"
        ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

export async function verifyConsentRequest(
    req,
    res,
    next
) {
    try {
        const { queryId } = req.params;
        const { otpCode } = req.body;

        if (!otpCode) {
            return res.status(400).json({
                success: false,
                message: "otpCode is required"
            });
        }

        const result =
            await verifyConsent(
                queryId,
                otpCode
            );

        return res.json({
            success: true,
            message: "Consent verified successfully",
            data: result
        });
    } catch (error) {
        if (
            error.message ===
            "Consent request not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.message ===
                "Invalid OTP" ||
            error.message ===
                "Consent is no longer pending"
        ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

export async function denyConsentRequest(
    req,
    res,
    next
) {
    try {
        const { queryId } = req.params;

        const result =
            await denyConsent(queryId);

        return res.json({
            success: true,
            message: "Consent denied successfully",
            data: result
        });
    } catch (error) {
        if (
            error.message ===
            "Consent request not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.message ===
            "Consent is no longer pending"
        ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

export async function fetchConsent(
    req,
    res,
    next
) {
    try {
        const { queryId } = req.params;

        const consent =
            await getConsentByQueryId(queryId);

        if (!consent) {
            return res.status(404).json({
                success: false,
                message: "Consent not found"
            });
        }

        return res.json({
            success: true,
            data: consent
        });
    } catch (error) {
        next(error);
    }
}