USE scholarlink_central;

CREATE TABLE STUDENT (
    student_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course_id INT NOT NULL,
    college_id INT NOT NULL,

    CONSTRAINT fk_student_course
        FOREIGN KEY (course_id)
        REFERENCES COURSE(course_id),

    CONSTRAINT fk_student_college
        FOREIGN KEY (college_id)
        REFERENCES COLLEGE(college_id)
);