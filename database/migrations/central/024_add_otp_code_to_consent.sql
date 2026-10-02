USE scholarlink_central;

ALTER TABLE CONSENT
ADD COLUMN otp_code VARCHAR(6) NULL AFTER otp_status;