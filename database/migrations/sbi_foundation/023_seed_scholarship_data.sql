USE scholarlink_sbi_foundation;

INSERT INTO SCHOLARSHIP_PROGRAM (
    scholarship_id,
    scholarship_name,
    scholarship_type,
    maximum_amount
)
VALUES
    (
        1,
        'SBI Foundation Higher Education Support',
        'Need-based',
        50000.00
    ),
    (
        2,
        'SBI Foundation Merit Support',
        'Merit-based',
        30000.00
    );

INSERT INTO APPLICATION (
    application_id,
    student_id,
    scholarship_id,
    application_date,
    self_declared_prior_support,
    status
)
VALUES
    (1, 'STU1001', 1, '2026-06-10', FALSE, 'APPROVED'),
    (2, 'STU1002', 2, '2026-06-12', FALSE, 'APPROVED'),
    (3, 'STU1003', 1, '2026-06-15', FALSE, 'APPROVED');

INSERT INTO AWARD (
    award_id,
    application_id,
    amount,
    award_date,
    academic_year
)
VALUES
    (1, 1, 25000.00, '2026-07-01', '2026-27'),
    (2, 2, 20000.00, '2026-07-03', '2026-27'),
    (3, 3, 30000.00, '2026-07-05', '2026-27'),
    (4, 3, 5000.00, '2026-08-01', '2026-27');