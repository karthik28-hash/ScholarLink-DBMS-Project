import {
    getAllOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization
} from "../services/organizationService.js";

export async function fetchAllOrganizations(req, res, next) {
    try {
        const organizations = await getAllOrganizations();

        return res.json({
            success: true,
            count: organizations.length,
            data: organizations
        });
    } catch (error) {
        next(error);
    }
}

export async function fetchOrganizationById(req, res, next) {
    try {
        const { organizationId } = req.params;

        const organization =
            await getOrganizationById(organizationId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        return res.json({
            success: true,
            data: organization
        });
    } catch (error) {
        next(error);
    }
}

export async function addOrganization(req, res, next) {
    try {
        const {
            organizationId,
            organizationName,
            organizationType,
            apiBaseUrl
        } = req.body;

        if (!organizationId || !organizationName) {
            return res.status(400).json({
                success: false,
                message:
                    "organizationId and organizationName are required"
            });
        }

        const existing =
            await getOrganizationById(organizationId);

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Organization ID already exists"
            });
        }

        const organization = await createOrganization(
            organizationId,
            organizationName,
            organizationType ?? null,
            apiBaseUrl ?? null
        );

        return res.status(201).json({
            success: true,
            message: "Organization created successfully",
            data: organization
        });
    } catch (error) {
        next(error);
    }
}

export async function editOrganization(req, res, next) {
    try {
        const { organizationId } = req.params;

        const {
            organizationName,
            organizationType,
            apiBaseUrl
        } = req.body;

        if (!organizationName) {
            return res.status(400).json({
                success: false,
                message: "organizationName is required"
            });
        }

        const existing =
            await getOrganizationById(organizationId);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        const result = await updateOrganization(
            organizationId,
            organizationName,
            organizationType ?? null,
            apiBaseUrl ?? null
        );

        const updated =
            await getOrganizationById(organizationId);

        return res.json({
            success: true,
            message: "Organization updated successfully",
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
            data: updated
        });
    } catch (error) {
        next(error);
    }
}

export async function removeOrganization(req, res, next) {
    try {
        const { organizationId } = req.params;

        const existing =
            await getOrganizationById(organizationId);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        const result =
            await deleteOrganization(organizationId);

        return res.json({
            success: true,
            message: "Organization deleted successfully",
            affectedRows: result.affectedRows
        });
    } catch (error) {
        next(error);
    }
}