USE scholarlink_central;

CREATE TABLE QUERY_LOG (
    query_id VARCHAR(20) PRIMARY KEY,

    student_id VARCHAR(20) NOT NULL,
    organization_id VARCHAR(20) NOT NULL,

    query_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    purpose VARCHAR(255) NOT NULL,

    status VARCHAR(30) NOT NULL,

    CONSTRAINT fk_query_student
        FOREIGN KEY (student_id)
        REFERENCES STUDENT(student_id),

    CONSTRAINT fk_query_organization
        FOREIGN KEY (organization_id)
        REFERENCES ORGANIZATION(organization_id)
);