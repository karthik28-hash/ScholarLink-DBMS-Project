USE scholarlink_central;

CREATE TABLE STUDENT_FINANCIAL_PROFILE (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,

    student_id VARCHAR(20) NOT NULL UNIQUE,

    annual_family_income DECIMAL(12,2) NOT NULL,
    family_size INT NOT NULL,
    other_education_expense DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_financial_student
        FOREIGN KEY (student_id)
        REFERENCES STUDENT(student_id),

    CONSTRAINT chk_family_income
        CHECK (annual_family_income >= 0),

    CONSTRAINT chk_family_size
        CHECK (family_size > 0),

    CONSTRAINT chk_other_expense
        CHECK (other_education_expense >= 0)
);