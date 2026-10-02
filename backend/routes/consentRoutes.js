import express from "express";

import {
    createConsentRequest,
    verifyConsentRequest,
    denyConsentRequest,
    fetchConsent
} from "../controllers/consentController.js";

const router = express.Router();

router.post(
    "/:queryId/request",
    createConsentRequest
);

router.post(
    "/:queryId/verify",
    verifyConsentRequest
);

router.post(
    "/:queryId/deny",
    denyConsentRequest
);

router.get(
    "/:queryId",
    fetchConsent
);

export default router;