USE scholarlink_sbi_foundation;

CREATE TABLE SCHOLARSHIP_PROGRAM (
    scholarship_id INT PRIMARY KEY AUTO_INCREMENT,

    scholarship_name VARCHAR(150) NOT NULL,

    scholarship_type VARCHAR(100),

    maximum_amount DECIMAL(10,2) NOT NULL,

    CONSTRAINT chk_scholarship_maximum_amount
        CHECK (maximum_amount >= 0)
);