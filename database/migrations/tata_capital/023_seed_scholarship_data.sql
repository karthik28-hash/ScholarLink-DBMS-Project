USE scholarlink_tata_capital;

INSERT INTO SCHOLARSHIP_PROGRAM (
    scholarship_id,
    scholarship_name,
    scholarship_type,
    maximum_amount
)
VALUES
    (
        1,
        'Tata Capital Student Education Support',
        'Need-based',
        40000.00
    ),
    (
        2,
        'Tata Capital Academic Merit Support',
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
    (1, 'STU1001', 1, '2026-06-20', FALSE, 'APPROVED'),
    (2, 'STU1004', 2, '2026-06-22', FALSE, 'APPROVED'),
    (3, 'STU1005', 1, '2026-06-25', TRUE, 'APPROVED');

INSERT INTO AWARD (
    award_id,
    application_id,
    amount,
    award_date,
    academic_year
)
VALUES
    (1, 1, 15000.00, '2026-07-10', '2026-27'),
    (2, 2, 25000.00, '2026-07-12', '2026-27'),
    (3, 3, 18000.00, '2026-07-15', '2026-27');