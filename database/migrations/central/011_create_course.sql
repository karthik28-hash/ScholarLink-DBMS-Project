USE scholarlink_central;

CREATE TABLE COURSE (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(150) NOT NULL,
    degree VARCHAR(50) NOT NULL
);