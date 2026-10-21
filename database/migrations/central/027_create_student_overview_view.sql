USE scholarlink_central;

CREATE OR REPLACE VIEW vw_student_overview AS
SELECT
    s.student_id,
    s.name,
    c.course_name,
    c.degree,
    cl.college_name,
    cl.university_name,
    fp.annual_family_income,
    fp.family_size,
    fp.other_education_expense
FROM STUDENT s
JOIN COURSE c
    ON s.course_id = c.course_id
JOIN COLLEGE cl
    ON s.college_id = cl.college_id
LEFT JOIN STUDENT_FINANCIAL_PROFILE fp
    ON s.student_id = fp.student_id;