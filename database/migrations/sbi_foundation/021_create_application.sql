USE scholarlink_sbi_foundation;

CREATE TABLE APPLICATION (
    application_id INT PRIMARY KEY AUTO_INCREMENT,

    student_id VARCHAR(20) NOT NULL,

    scholarship_id INT NOT NULL,

    application_date DATE NOT NULL,

    self_declared_prior_support BOOLEAN NOT NULL DEFAULT FALSE,

    status VARCHAR(30) NOT NULL,

    CONSTRAINT fk_application_scholarship
        FOREIGN KEY (scholarship_id)
        REFERENCES SCHOLARSHIP_PROGRAM(scholarship_id)
);