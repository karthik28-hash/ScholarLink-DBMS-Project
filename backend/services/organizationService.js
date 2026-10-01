import centralDb from "../config/db.js";

export async function getAllOrganizations() {
    const [rows] = await centralDb.query(`
        SELECT
            organization_id,
            organization_name,
            organization_type,
            api_base_url
        FROM ORGANIZATION
        ORDER BY organization_id;
    `);

    return rows;
}

export async function getOrganizationById(organizationId) {
    const [rows] = await centralDb.query(
        `
        SELECT
            organization_id,
            organization_name,
            organization_type,
            api_base_url
        FROM ORGANIZATION
        WHERE organization_id = ?;
        `,
        [organizationId]
    );

    return rows[0] || null;
}

export async function createOrganization(
    organizationId,
    organizationName,
    organizationType,
    apiBaseUrl
) {
    const [result] = await centralDb.query(
        `
        INSERT INTO ORGANIZATION (
            organization_id,
            organization_name,
            organization_type,
            api_base_url,
            api_key
        )
        VALUES (?, ?, ?, ?, NULL);
        `,
        [
            organizationId,
            organizationName,
            organizationType,
            apiBaseUrl
        ]
    );

    return {
        organizationId,
        organizationName,
        organizationType,
        apiBaseUrl,
        affectedRows: result.affectedRows
    };
}

export async function updateOrganization(
    organizationId,
    organizationName,
    organizationType,
    apiBaseUrl
) {
    const [result] = await centralDb.query(
        `
        UPDATE ORGANIZATION
        SET
            organization_name = ?,
            organization_type = ?,
            api_base_url = ?
        WHERE organization_id = ?;
        `,
        [
            organizationName,
            organizationType,
            apiBaseUrl,
            organizationId
        ]
    );

    return result;
}

export async function deleteOrganization(organizationId) {
    const [result] = await centralDb.query(
        `
        DELETE FROM ORGANIZATION
        WHERE organization_id = ?;
        `,
        [organizationId]
    );

    return result;
}