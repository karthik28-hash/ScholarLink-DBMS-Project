USE scholarlink_reliance_foundation;

INSERT INTO SCHOLARSHIP_PROGRAM (
    scholarship_id,
    scholarship_name,
    scholarship_type,
    maximum_amount
)
VALUES
    (
        1,
        'Reliance Foundation Higher Education Support',
        'Need-based',
        50000.00
    ),
    (
        2,
        'Reliance Foundation Academic Support',
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
    (1, 'STU1001', 1, '2026-06-28', FALSE, 'APPROVED'),
    (2, 'STU1002', 2, '2026-06-29', FALSE, 'APPROVED'),
    (3, 'STU1003', 1, '2026-06-30', FALSE, 'APPROVED');

INSERT INTO AWARD (
    award_id,
    application_id,
    amount,
    award_date,
    academic_year
)
VALUES
    (1, 1, 10000.00, '2026-07-20', '2026-27'),
    (2, 2, 20000.00, '2026-07-22', '2026-27'),
    (3, 3, 15000.00, '2026-07-25', '2026-27');