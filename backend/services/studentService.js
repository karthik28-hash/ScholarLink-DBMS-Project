import centralDb from "../config/db.js";

export async function getAllStudents() {
    const [rows] = await centralDb.query(`
        SELECT
            s.student_id,
            s.name,
            s.course_id,
            c.course_name,
            s.college_id,
            col.college_name,
            col.university_name
        FROM STUDENT s
        JOIN COURSE c
            ON s.course_id = c.course_id
        JOIN COLLEGE col
            ON s.college_id = col.college_id
        ORDER BY s.student_id;
    `);

    return rows;
}

export async function getStudentById(studentId) {
    const [rows] = await centralDb.query(
        `
        SELECT
            s.student_id,
            s.name,
            s.course_id,
            c.course_name,
            s.college_id,
            col.college_name,
            col.university_name
        FROM STUDENT s
        JOIN COURSE c
            ON s.course_id = c.course_id
        JOIN COLLEGE col
            ON s.college_id = col.college_id
        WHERE s.student_id = ?;
        `,
        [studentId]
    );

    return rows[0] || null;
}