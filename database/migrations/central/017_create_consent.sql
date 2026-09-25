USE scholarlink_central;

CREATE TABLE CONSENT (
    consent_id VARCHAR(20) PRIMARY KEY,

    query_id VARCHAR(20) NOT NULL UNIQUE,

    otp_status VARCHAR(30) NOT NULL,

    consent_time DATETIME,

    valid_until DATETIME,

    CONSTRAINT fk_consent_query
        FOREIGN KEY (query_id)
        REFERENCES QUERY_LOG(query_id)
);