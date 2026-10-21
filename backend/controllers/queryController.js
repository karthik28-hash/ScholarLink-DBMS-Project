import {
    createQuery,
    getAllQueries,
    getQueryById,
    getQueriesByStudent,
    updateQueryStatus
} from "../services/queryService.js";

import { getStudentById } from "../services/studentService.js";

import {
    getOrganizationById
} from "../services/organizationService.js";

import generateId from "../utils/generateId.js";

export async function addQuery(req, res, next) {
    try {
        const {
            studentId,
            organizationId,
            organizationIds,
            purpose
        } = req.body;

        if (!studentId || !purpose) {
            return res.status(400).json({
                success: false,
                message: "studentId and purpose are required"
            });
        }

        if (
            organizationIds !== undefined &&
            !Array.isArray(organizationIds)
        ) {
            return res.status(400).json({
                success: false,
                message: "organizationIds must be an array"
            });
        }

        const requestedIds = [
            ...(organizationIds ?? []),
            ...(organizationId ? [organizationId] : [])
        ];

        const targetIds = [
            ...new Set(requestedIds)
        ];

        if (targetIds.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Provide organizationId or organizationIds"
            });
        }

        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const organizations = await Promise.all(
            targetIds.map(id => getOrganizationById(id))
        );

        const missingIndex = organizations.findIndex(
            organization => organization === null
        );

        if (missingIndex !== -1) {
            return res.status(404).json({
                success: false,
                message:
                    `Organization not found: ${targetIds[missingIndex]}`
            });
        }

        const primaryOrganizationId =
            organizationId || targetIds[0];

        const queryId = generateId("Q");

        await createQuery(
            queryId,
            studentId,
            primaryOrganizationId,
            targetIds,
            purpose
        );

        const query = await getQueryById(queryId);

        return res.status(201).json({
            success: true,
            message: "Query created successfully",
            data: {
                ...query,
                targetOrganizations: organizations.map(org => ({
                    organization_id: org.organization_id,
                    organization_name: org.organization_name
                }))
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function fetchAllQueries(
    req,
    res,
    next
) {
    try {
        const queries =
            await getAllQueries();

        return res.json({
            success: true,
            count: queries.length,
            data: queries
        });
    } catch (error) {
        next(error);
    }
}

export async function fetchQueryById(
    req,
    res,
    next
) {
    try {
        const { queryId } = req.params;

        const query =
            await getQueryById(queryId);

        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found"
            });
        }

        return res.json({
            success: true,
            data: query
        });
    } catch (error) {
        next(error);
    }
}

export async function fetchStudentQueries(
    req,
    res,
    next
) {
    try {
        const { studentId } = req.params;

        const student =
            await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const queries =
            await getQueriesByStudent(studentId);

        return res.json({
            success: true,
            studentId,
            count: queries.length,
            data: queries
        });
    } catch (error) {
        next(error);
    }
}

export async function editQueryStatus(
    req,
    res,
    next
) {
    try {
        const { queryId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "status is required"
            });
        }

        const existing =
            await getQueryById(queryId);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Query not found"
            });
        }

        const result =
            await updateQueryStatus(
                queryId,
                status
            );

        const updated =
            await getQueryById(queryId);

        return res.json({
            success: true,
            message: "Query status updated successfully",
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
            data: updated
        });
    } catch (error) {
        next(error);
    }
}