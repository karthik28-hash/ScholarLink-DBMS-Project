import orgADb from "../config/dbOrgA.js";
import orgBDb from "../config/dbOrgB.js";
import orgCDb from "../config/dbOrgC.js";

const organizationPools = {
    ORG001: orgADb,
    ORG002: orgBDb,
    ORG003: orgCDb
};

function getOrganizationDb(organizationId) {
    const db = organizationPools[organizationId];

    if (!db) {
        throw new Error("Unknown organization");
    }

    return db;
}

export async function getAllApplications(
    organizationId
) {
    const db = getOrganizationDb(organizationId);

    const [rows] = await db.query(`
        SELECT
            ap.application_id,
            ap.student_id,
            ap.scholarship_id,
            sp.scholarship_name,
            ap.application_date,
            ap.self_declared_prior_support,
            ap.status
        FROM APPLICATION ap
        JOIN SCHOLARSHIP_PROGRAM sp
            ON ap.scholarship_id = sp.scholarship_id
        ORDER BY ap.application_id;
    `);

    return rows;
}

export async function getApplicationById(
    organizationId,
    applicationId
) {
    const db = getOrganizationDb(organizationId);

    const [rows] = await db.query(
        `
        SELECT
            ap.application_id,
            ap.student_id,
            ap.scholarship_id,
            sp.scholarship_name,
            ap.application_date,
            ap.self_declared_prior_support,
            ap.status
        FROM APPLICATION ap
        JOIN SCHOLARSHIP_PROGRAM sp
            ON ap.scholarship_id = sp.scholarship_id
        WHERE ap.application_id = ?;
        `,
        [applicationId]
    );

    return rows[0] || null;
}

export async function createApplication(
    organizationId,
    studentId,
    scholarshipId,
    applicationDate,
    selfDeclaredPriorSupport,
    status
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        INSERT INTO APPLICATION (
            student_id,
            scholarship_id,
            application_date,
            self_declared_prior_support,
            status
        )
        VALUES (?, ?, ?, ?, ?);
        `,
        [
            studentId,
            scholarshipId,
            applicationDate,
            selfDeclaredPriorSupport,
            status
        ]
    );

    return {
        applicationId: result.insertId,
        studentId,
        scholarshipId,
        applicationDate,
        selfDeclaredPriorSupport,
        status
    };
}

export async function updateApplication(
    organizationId,
    applicationId,
    studentId,
    scholarshipId,
    applicationDate,
    selfDeclaredPriorSupport,
    status
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        UPDATE APPLICATION
        SET
            student_id = ?,
            scholarship_id = ?,
            application_date = ?,
            self_declared_prior_support = ?,
            status = ?
        WHERE application_id = ?;
        `,
        [
            studentId,
            scholarshipId,
            applicationDate,
            selfDeclaredPriorSupport,
            status,
            applicationId
        ]
    );

    return result;
}

export async function deleteApplication(
    organizationId,
    applicationId
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        DELETE FROM APPLICATION
        WHERE application_id = ?;
        `,
        [applicationId]
    );

    return result;
}