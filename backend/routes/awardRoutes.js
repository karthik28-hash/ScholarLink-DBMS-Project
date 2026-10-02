import express from "express";

import {
    fetchAllAwards,
    fetchAwardById,
    addAward,
    editAward,
    removeAward
} from "../controllers/awardController.js";

const router = express.Router();

router.get(
    "/organizations/:organizationId/awards",
    fetchAllAwards
);

router.get(
    "/organizations/:organizationId/awards/:awardId",
    fetchAwardById
);

router.post(
    "/organizations/:organizationId/awards",
    addAward
);

router.put(
    "/organizations/:organizationId/awards/:awardId",
    editAward
);

router.delete(
    "/organizations/:organizationId/awards/:awardId",
    removeAward
);

export default router;