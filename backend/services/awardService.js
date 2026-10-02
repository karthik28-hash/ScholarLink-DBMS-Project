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

export async function getAllAwards(
    organizationId
) {
    const db = getOrganizationDb(organizationId);

    const [rows] = await db.query(`
        SELECT
            a.award_id,
            a.application_id,
            ap.student_id,
            sp.scholarship_name,
            a.amount,
            a.award_date,
            a.academic_year
        FROM AWARD a
        JOIN APPLICATION ap
            ON a.application_id = ap.application_id
        JOIN SCHOLARSHIP_PROGRAM sp
            ON ap.scholarship_id = sp.scholarship_id
        ORDER BY a.award_id;
    `);

    return rows;
}

export async function getAwardById(
    organizationId,
    awardId
) {
    const db = getOrganizationDb(organizationId);

    const [rows] = await db.query(
        `
        SELECT
            a.award_id,
            a.application_id,
            ap.student_id,
            sp.scholarship_name,
            a.amount,
            a.award_date,
            a.academic_year
        FROM AWARD a
        JOIN APPLICATION ap
            ON a.application_id = ap.application_id
        JOIN SCHOLARSHIP_PROGRAM sp
            ON ap.scholarship_id = sp.scholarship_id
        WHERE a.award_id = ?;
        `,
        [awardId]
    );

    return rows[0] || null;
}

export async function createAward(
    organizationId,
    applicationId,
    amount,
    awardDate,
    academicYear
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        INSERT INTO AWARD (
            application_id,
            amount,
            award_date,
            academic_year
        )
        VALUES (?, ?, ?, ?);
        `,
        [
            applicationId,
            amount,
            awardDate,
            academicYear
        ]
    );

    return {
        awardId: result.insertId,
        applicationId,
        amount,
        awardDate,
        academicYear
    };
}

export async function updateAward(
    organizationId,
    awardId,
    applicationId,
    amount,
    awardDate,
    academicYear
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        UPDATE AWARD
        SET
            application_id = ?,
            amount = ?,
            award_date = ?,
            academic_year = ?
        WHERE award_id = ?;
        `,
        [
            applicationId,
            amount,
            awardDate,
            academicYear,
            awardId
        ]
    );

    return result;
}

export async function deleteAward(
    organizationId,
    awardId
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        DELETE FROM AWARD
        WHERE award_id = ?;
        `,
        [awardId]
    );

    return result;
}