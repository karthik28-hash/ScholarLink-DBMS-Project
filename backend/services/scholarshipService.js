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

// =========================================
// SCHOLARSHIP PROGRAM
// =========================================

export async function getAllScholarshipPrograms(
    organizationId
) {
    const db = getOrganizationDb(organizationId);

    const [rows] = await db.query(`
        SELECT
            scholarship_id,
            scholarship_name,
            scholarship_type,
            maximum_amount
        FROM SCHOLARSHIP_PROGRAM
        ORDER BY scholarship_id;
    `);

    return rows;
}

export async function getScholarshipProgramById(
    organizationId,
    scholarshipId
) {
    const db = getOrganizationDb(organizationId);

    const [rows] = await db.query(
        `
        SELECT
            scholarship_id,
            scholarship_name,
            scholarship_type,
            maximum_amount
        FROM SCHOLARSHIP_PROGRAM
        WHERE scholarship_id = ?;
        `,
        [scholarshipId]
    );

    return rows[0] || null;
}

export async function createScholarshipProgram(
    organizationId,
    scholarshipName,
    scholarshipType,
    maximumAmount
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        INSERT INTO SCHOLARSHIP_PROGRAM (
            scholarship_name,
            scholarship_type,
            maximum_amount
        )
        VALUES (?, ?, ?);
        `,
        [
            scholarshipName,
            scholarshipType,
            maximumAmount
        ]
    );

    return {
        scholarshipId: result.insertId,
        scholarshipName,
        scholarshipType,
        maximumAmount
    };
}

export async function updateScholarshipProgram(
    organizationId,
    scholarshipId,
    scholarshipName,
    scholarshipType,
    maximumAmount
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        UPDATE SCHOLARSHIP_PROGRAM
        SET
            scholarship_name = ?,
            scholarship_type = ?,
            maximum_amount = ?
        WHERE scholarship_id = ?;
        `,
        [
            scholarshipName,
            scholarshipType,
            maximumAmount,
            scholarshipId
        ]
    );

    return result;
}

export async function deleteScholarshipProgram(
    organizationId,
    scholarshipId
) {
    const db = getOrganizationDb(organizationId);

    const [result] = await db.query(
        `
        DELETE FROM SCHOLARSHIP_PROGRAM
        WHERE scholarship_id = ?;
        `,
        [scholarshipId]
    );

    return result;
}

// =========================================
// EXISTING STUDENT SCHOLARSHIP LOOKUP
// =========================================

export async function getStudentScholarships(
    organizationId,
    studentId
) {
    const db = getOrganizationDb(organizationId);

    const [rows] = await db.query(
        `
        SELECT
            ap.application_id,
            ap.student_id,
            sp.scholarship_id,
            sp.scholarship_name,
            sp.scholarship_type,
            ap.application_date,
            ap.status,
            a.award_id,
            a.amount,
            a.award_date,
            a.academic_year
        FROM APPLICATION ap
        JOIN SCHOLARSHIP_PROGRAM sp
            ON ap.scholarship_id = sp.scholarship_id
        LEFT JOIN AWARD a
            ON ap.application_id = a.application_id
        WHERE ap.student_id = ?
        ORDER BY a.award_date;
        `,
        [studentId]
    );

    return rows;
}

export async function getStudentAwardSummary(
    organizationId,
    studentId
) {
    const db = getOrganizationDb(organizationId);

    const [rows] = await db.query(
        `
        SELECT
            ap.student_id,
            COUNT(a.award_id) AS number_of_awards,
            COALESCE(SUM(a.amount), 0) AS total_awarded
        FROM APPLICATION ap
        LEFT JOIN AWARD a
            ON ap.application_id = a.application_id
        WHERE ap.student_id = ?
        GROUP BY ap.student_id;
        `,
        [studentId]
    );

    return rows[0] || {
        student_id: studentId,
        number_of_awards: 0,
        total_awarded: 0
    };
}