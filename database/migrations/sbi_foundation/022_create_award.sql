USE scholarlink_sbi_foundation;

CREATE TABLE AWARD (
    award_id INT PRIMARY KEY AUTO_INCREMENT,

    application_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    award_date DATE NOT NULL,

    academic_year VARCHAR(20) NOT NULL,

    CONSTRAINT fk_award_application
        FOREIGN KEY (application_id)
        REFERENCES APPLICATION(application_id),

    CONSTRAINT chk_award_amount
        CHECK (amount >= 0)
);