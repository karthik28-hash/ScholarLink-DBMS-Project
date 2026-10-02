import centralDb from "../config/db.js";

export async function createQuery(
    queryId,
    studentId,
    organizationId,
    purpose
) {
    const [result] = await centralDb.query(
        `
        INSERT INTO QUERY_LOG (
            query_id,
            student_id,
            organization_id,
            purpose,
            status
        )
        VALUES (?, ?, ?, ?, 'PENDING');
        `,
        [
            queryId,
            studentId,
            organizationId,
            purpose
        ]
    );

    return result;
}

export async function getAllQueries() {
    const [rows] = await centralDb.query(`
        SELECT
            q.query_id,
            q.student_id,
            s.name AS student_name,
            q.organization_id,
            o.organization_name,
            q.query_time,
            q.purpose,
            q.status
        FROM QUERY_LOG q
        JOIN STUDENT s
            ON q.student_id = s.student_id
        JOIN ORGANIZATION o
            ON q.organization_id = o.organization_id
        ORDER BY q.query_time DESC;
    `);

    return rows;
}

export async function getQueryById(queryId) {
    const [rows] = await centralDb.query(
        `
        SELECT
            q.query_id,
            q.student_id,
            s.name AS student_name,
            q.organization_id,
            o.organization_name,
            q.query_time,
            q.purpose,
            q.status
        FROM QUERY_LOG q
        JOIN STUDENT s
            ON q.student_id = s.student_id
        JOIN ORGANIZATION o
            ON q.organization_id = o.organization_id
        WHERE q.query_id = ?;
        `,
        [queryId]
    );

    return rows[0] || null;
}

export async function getQueriesByStudent(studentId) {
    const [rows] = await centralDb.query(
        `
        SELECT
            q.query_id,
            q.organization_id,
            o.organization_name,
            q.query_time,
            q.purpose,
            q.status
        FROM QUERY_LOG q
        JOIN ORGANIZATION o
            ON q.organization_id = o.organization_id
        WHERE q.student_id = ?
        ORDER BY q.query_time DESC;
        `,
        [studentId]
    );

    return rows;
}

export async function updateQueryStatus(
    queryId,
    status
) {
    const [result] = await centralDb.query(
        `
        UPDATE QUERY_LOG
        SET status = ?
        WHERE query_id = ?;
        `,
        [status, queryId]
    );

    return result;
}