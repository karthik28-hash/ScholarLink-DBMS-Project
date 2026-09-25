USE scholarlink_central;

CREATE TABLE ORGANIZATION (
    organization_id VARCHAR(20) PRIMARY KEY,

    organization_name VARCHAR(150) NOT NULL,

    organization_type VARCHAR(100),

    api_base_url VARCHAR(255),

    api_key VARCHAR(255),

    CONSTRAINT uq_organization_name
        UNIQUE (organization_name)
);