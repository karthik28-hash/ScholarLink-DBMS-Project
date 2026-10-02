import express from "express";

import {
    fetchAllApplications,
    fetchApplicationById,
    addApplication,
    editApplication,
    removeApplication
} from "../controllers/applicationController.js";

const router = express.Router();

router.get(
    "/organizations/:organizationId/applications",
    fetchAllApplications
);

router.get(
    "/organizations/:organizationId/applications/:applicationId",
    fetchApplicationById
);

router.post(
    "/organizations/:organizationId/applications",
    addApplication
);

router.put(
    "/organizations/:organizationId/applications/:applicationId",
    editApplication
);

router.delete(
    "/organizations/:organizationId/applications/:applicationId",
    removeApplication
);

export default router;