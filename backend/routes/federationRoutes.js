import express from "express";
import {
    calculateFundingGap
} from "../controllers/fundingGapController.js";
import {
    runFederatedLookup
} from "../controllers/federationController.js";

const router = express.Router();

router.post("/lookup", runFederatedLookup);
router.post("/funding-gap", calculateFundingGap);

export default router;