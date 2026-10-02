import {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
} from "../services/applicationService.js";

export async function fetchAllApplications(
    req,
    res,
    next
) {
    try {
        const { organizationId } = req.params;

        const applications =
            await getAllApplications(organizationId);

        return res.json({
            success: true,
            organizationId,
            count: applications.length,
            data: applications
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

export async function fetchApplicationById(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            applicationId
        } = req.params;

        const application =
            await getApplicationById(
                organizationId,
                Number(applicationId)
            );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        return res.json({
            success: true,
            data: application
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

export async function addApplication(
    req,
    res,
    next
) {
    try {
        const { organizationId } = req.params;

        const {
            studentId,
            scholarshipId,
            applicationDate,
            selfDeclaredPriorSupport,
            status
        } = req.body;

        if (
            !studentId ||
            scholarshipId === undefined ||
            !applicationDate ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "studentId, scholarshipId, applicationDate and status are required"
            });
        }

        const application =
            await createApplication(
                organizationId,
                studentId,
                Number(scholarshipId),
                applicationDate,
                Boolean(selfDeclaredPriorSupport),
                status
            );

        return res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: application
        });
    } catch (error) {
        if (
            error.code === "ER_NO_REFERENCED_ROW_2"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Referenced scholarship program does not exist"
            });
        }

        if (error.message === "Unknown organization") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

export async function editApplication(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            applicationId
        } = req.params;

        const {
            studentId,
            scholarshipId,
            applicationDate,
            selfDeclaredPriorSupport,
            status
        } = req.body;

        if (
            !studentId ||
            scholarshipId === undefined ||
            !applicationDate ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "studentId, scholarshipId, applicationDate and status are required"
            });
        }

        const existing =
            await getApplicationById(
                organizationId,
                Number(applicationId)
            );

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        const result =
            await updateApplication(
                organizationId,
                Number(applicationId),
                studentId,
                Number(scholarshipId),
                applicationDate,
                Boolean(selfDeclaredPriorSupport),
                status
            );

        const updated =
            await getApplicationById(
                organizationId,
                Number(applicationId)
            );

        return res.json({
            success: true,
            message: "Application updated successfully",
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
            data: updated
        });
    } catch (error) {
        if (
            error.code === "ER_NO_REFERENCED_ROW_2"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Referenced scholarship program does not exist"
            });
        }

        next(error);
    }
}

export async function removeApplication(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            applicationId
        } = req.params;

        const existing =
            await getApplicationById(
                organizationId,
                Number(applicationId)
            );

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        const result =
            await deleteApplication(
                organizationId,
                Number(applicationId)
            );

        return res.json({
            success: true,
            message: "Application deleted successfully",
            affectedRows: result.affectedRows
        });
    } catch (error) {
        if (
            error.code === "ER_ROW_IS_REFERENCED_2"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Application cannot be deleted because award records reference it"
            });
        }

        next(error);
    }
}