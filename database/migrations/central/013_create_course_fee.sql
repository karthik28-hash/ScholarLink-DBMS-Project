USE scholarlink_central;

CREATE TABLE COURSE_FEE (
    fee_id INT PRIMARY KEY AUTO_INCREMENT,

    course_id INT NOT NULL,
    college_id INT NOT NULL,

    academic_year VARCHAR(20) NOT NULL,
    annual_fee DECIMAL(10,2) NOT NULL,

    CONSTRAINT uq_course_college_year
        UNIQUE (course_id, college_id, academic_year),

    CONSTRAINT fk_fee_course
        FOREIGN KEY (course_id)
        REFERENCES COURSE(course_id),

    CONSTRAINT fk_fee_college
        FOREIGN KEY (college_id)
        REFERENCES COLLEGE(college_id),

    CONSTRAINT chk_annual_fee
        CHECK (annual_fee >= 0)
);