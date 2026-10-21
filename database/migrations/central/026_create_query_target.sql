USE scholarlink_central;

CREATE TABLE QUERY_TARGET (
    query_id VARCHAR(20) NOT NULL,
    organization_id VARCHAR(20) NOT NULL,

    lookup_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    error_message VARCHAR(255),

    checked_at DATETIME,

    PRIMARY KEY (query_id, organization_id),

    CONSTRAINT fk_target_query
        FOREIGN KEY (query_id)
        REFERENCES QUERY_LOG(query_id),

    CONSTRAINT fk_target_organization
        FOREIGN KEY (organization_id)
        REFERENCES ORGANIZATION(organization_id),

    CONSTRAINT chk_lookup_status
        CHECK (
            lookup_status IN (
                'PENDING',
                'COMPLETED',
                'FAILED'
            )
        )
);