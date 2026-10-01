import express from "express";

import {
    fetchAllOrganizations,
    fetchOrganizationById,
    addOrganization,
    editOrganization,
    removeOrganization
} from "../controllers/organizationController.js";

const router = express.Router();

router.get("/", fetchAllOrganizations);

router.post("/", addOrganization);

router.get("/:organizationId", fetchOrganizationById);

router.put("/:organizationId", editOrganization);

router.delete("/:organizationId", removeOrganization);

export default router;