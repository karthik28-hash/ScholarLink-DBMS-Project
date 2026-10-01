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

export async function createStudent(
    studentId,
    name,
    courseId,
    collegeId
) {
    const [result] = await centralDb.query(
        `
        INSERT INTO STUDENT (
            student_id,
            name,
            course_id,
            college_id
        )
        VALUES (?, ?, ?, ?);
        `,
        [
            studentId,
            name,
            courseId,
            collegeId
        ]
    );

    return {
        studentId,
        name,
        courseId,
        collegeId,
        affectedRows: result.affectedRows
    };
}

export async function updateStudent(
    studentId,
    name,
    courseId,
    collegeId
) {
    const [result] = await centralDb.query(
        `
        UPDATE STUDENT
        SET
            name = ?,
            course_id = ?,
            college_id = ?
        WHERE student_id = ?;
        `,
        [
            name,
            courseId,
            collegeId,
            studentId
        ]
    );

    return result;
}

export async function deleteStudent(studentId) {
    const [result] = await centralDb.query(
        `
        DELETE FROM STUDENT
        WHERE student_id = ?;
        `,
        [studentId]
    );

    return result;
}

export async function createFinancialProfile(
    studentId,
    annualFamilyIncome,
    familySize,
    otherEducationExpense
) {
    const [result] = await centralDb.query(
        `
        INSERT INTO STUDENT_FINANCIAL_PROFILE (
            student_id,
            annual_family_income,
            family_size,
            other_education_expense
        )
        VALUES (?, ?, ?, ?);
        `,
        [
            studentId,
            annualFamilyIncome,
            familySize,
            otherEducationExpense
        ]
    );

    return {
        profileId: result.insertId,
        studentId,
        annualFamilyIncome,
        familySize,
        otherEducationExpense
    };
}

export async function getFinancialProfile(studentId) {
    const [rows] = await centralDb.query(
        `
        SELECT
            profile_id,
            student_id,
            annual_family_income,
            family_size,
            other_education_expense
        FROM STUDENT_FINANCIAL_PROFILE
        WHERE student_id = ?;
        `,
        [studentId]
    );

    return rows[0] || null;
}

export async function updateFinancialProfile(
    studentId,
    annualFamilyIncome,
    familySize,
    otherEducationExpense
) {
    const [result] = await centralDb.query(
        `
        UPDATE STUDENT_FINANCIAL_PROFILE
        SET
            annual_family_income = ?,
            family_size = ?,
            other_education_expense = ?
        WHERE student_id = ?;
        `,
        [
            annualFamilyIncome,
            familySize,
            otherEducationExpense,
            studentId
        ]
    );

    return result;
}

export async function deleteFinancialProfile(studentId) {
    const [result] = await centralDb.query(
        `
        DELETE FROM STUDENT_FINANCIAL_PROFILE
        WHERE student_id = ?;
        `,
        [studentId]
    );

    return result;
}

export async function getStudentOverview(studentId) {
    const [rows] = await centralDb.query(
        `
        SELECT
            s.student_id,
            s.name,
            c.course_name,
            col.college_name,
            col.university_name,
            f.annual_family_income,
            f.family_size,
            f.other_education_expense
        FROM STUDENT s
        JOIN COURSE c
            ON s.course_id = c.course_id
        JOIN COLLEGE col
            ON s.college_id = col.college_id
        LEFT JOIN STUDENT_FINANCIAL_PROFILE f
            ON s.student_id = f.student_id
        WHERE s.student_id = ?;
        `,
        [studentId]
    );

    return rows[0] || null;
}