USE scholarlink_central;

-- =========================================
-- 1. COLLEGE DATA
-- =========================================

INSERT INTO COLLEGE (
    college_id,
    college_name,
    university_name
)
VALUES
    (1, 'ABC Engineering College', 'ABC University'),
    (2, 'Global Institute of Technology', 'Global University'),
    (3, 'City Engineering University', 'City University');


-- =========================================
-- 2. COURSE DATA
-- =========================================

INSERT INTO COURSE (
    course_id,
    course_name,
    degree
)
VALUES
    (1, 'Computer Science and Engineering', 'B.E.'),
    (2, 'Electronics and Communication Engineering', 'B.E.'),
    (3, 'Information Science and Engineering', 'B.E.'),
    (4, 'Commerce', 'B.Com');


-- =========================================
-- 3. STUDENT DATA
-- =========================================

INSERT INTO STUDENT (
    student_id,
    name,
    course_id,
    college_id
)
VALUES
    ('STU1001', 'Rahul Sharma', 1, 1),
    ('STU1002', 'Ananya Rao', 2, 1),
    ('STU1003', 'Kiran Kumar', 3, 2),
    ('STU1004', 'Sneha Patil', 1, 3),
    ('STU1005', 'Arjun Nair', 4, 2);


-- =========================================
-- 4. COURSE FEE DATA
-- =========================================

INSERT INTO COURSE_FEE (
    course_id,
    college_id,
    academic_year,
    annual_fee
)
VALUES
    (1, 1, '2026-27', 90000.00),
    (2, 1, '2026-27', 85000.00),
    (3, 2, '2026-27', 80000.00),
    (1, 3, '2026-27', 95000.00),
    (4, 2, '2026-27', 60000.00);


-- =========================================
-- 5. FINANCIAL PROFILE DATA
-- =========================================

INSERT INTO STUDENT_FINANCIAL_PROFILE (
    profile_id,
    student_id,
    annual_family_income,
    family_size,
    other_education_expense
)
VALUES
    (1, 'STU1001', 180000.00, 5, 10000.00),
    (2, 'STU1002', 350000.00, 4, 8000.00),
    (3, 'STU1003', 120000.00, 6, 12000.00),
    (4, 'STU1004', 500000.00, 4, 5000.00),
    (5, 'STU1005', 250000.00, 5, 7000.00);


-- =========================================
-- 6. ORGANIZATION DATA
-- =========================================

INSERT INTO ORGANIZATION (
    organization_id,
    organization_name,
    organization_type,
    api_base_url,
    api_key
)
VALUES
    ('ORG001', 'SBI Foundation', 'Foundation', NULL, NULL),
    ('ORG002', 'Tata Capital', 'Corporate CSR', NULL, NULL),
    ('ORG003', 'Reliance Foundation', 'Foundation', NULL, NULL);