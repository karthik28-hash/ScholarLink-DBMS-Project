import {
    getAllAwards,
    getAwardById,
    createAward,
    updateAward,
    deleteAward
} from "../services/awardService.js";

export async function fetchAllAwards(
    req,
    res,
    next
) {
    try {
        const { organizationId } = req.params;

        const awards =
            await getAllAwards(organizationId);

        return res.json({
            success: true,
            organizationId,
            count: awards.length,
            data: awards
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

export async function fetchAwardById(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            awardId
        } = req.params;

        const award =
            await getAwardById(
                organizationId,
                Number(awardId)
            );

        if (!award) {
            return res.status(404).json({
                success: false,
                message: "Award not found"
            });
        }

        return res.json({
            success: true,
            data: award
        });
    } catch (error) {
        next(error);
    }
}

export async function addAward(
    req,
    res,
    next
) {
    try {
        const { organizationId } = req.params;

        const {
            applicationId,
            amount,
            awardDate,
            academicYear
        } = req.body;

        if (
            applicationId === undefined ||
            amount === undefined ||
            !awardDate ||
            !academicYear
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "applicationId, amount, awardDate and academicYear are required"
            });
        }

        const award =
            await createAward(
                organizationId,
                Number(applicationId),
                Number(amount),
                awardDate,
                academicYear
            );

        return res.status(201).json({
            success: true,
            message: "Award created successfully",
            data: award
        });
    } catch (error) {
        if (
            error.code === "ER_NO_REFERENCED_ROW_2"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Referenced application does not exist"
            });
        }

        next(error);
    }
}

export async function editAward(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            awardId
        } = req.params;

        const {
            applicationId,
            amount,
            awardDate,
            academicYear
        } = req.body;

        if (
            applicationId === undefined ||
            amount === undefined ||
            !awardDate ||
            !academicYear
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "applicationId, amount, awardDate and academicYear are required"
            });
        }

        const existing =
            await getAwardById(
                organizationId,
                Number(awardId)
            );

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Award not found"
            });
        }

        const result =
            await updateAward(
                organizationId,
                Number(awardId),
                Number(applicationId),
                Number(amount),
                awardDate,
                academicYear
            );

        const updated =
            await getAwardById(
                organizationId,
                Number(awardId)
            );

        return res.json({
            success: true,
            message: "Award updated successfully",
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
                    "Referenced application does not exist"
            });
        }

        next(error);
    }
}

export async function removeAward(
    req,
    res,
    next
) {
    try {
        const {
            organizationId,
            awardId
        } = req.params;

        const existing =
            await getAwardById(
                organizationId,
                Number(awardId)
            );

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Award not found"
            });
        }

        const result =
            await deleteAward(
                organizationId,
                Number(awardId)
            );

        return res.json({
            success: true,
            message: "Award deleted successfully",
            affectedRows: result.affectedRows
        });
    } catch (error) {
        next(error);
    }
}