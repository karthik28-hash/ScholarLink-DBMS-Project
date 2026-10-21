USE scholarlink_central;

ALTER TABLE QUERY_LOG
    DROP FOREIGN KEY fk_query_organization,
    CHANGE COLUMN organization_id
        primary_organization_id VARCHAR(20) NOT NULL,
    ADD CONSTRAINT fk_query_primary_organization
        FOREIGN KEY (primary_organization_id)
        REFERENCES ORGANIZATION(organization_id);