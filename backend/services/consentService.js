import centralDb from "../config/db.js";
import generateId from "../utils/generateId.js";
import { generateOtp } from "../utils/otp.js";

export async function requestConsent(queryId) {
    const connection =
        await centralDb.getConnection();

    try {
        await connection.beginTransaction();

        const [queryRows] =
            await connection.query(
                `
                SELECT
                    query_id,
                    student_id,
                    organization_id,
                    status
                FROM QUERY_LOG
                WHERE query_id = ?
                FOR UPDATE;
                `,
                [queryId]
            );

        if (queryRows.length === 0) {
            throw new Error("Query not found");
        }

        const [consentRows] =
            await connection.query(
                `
                SELECT consent_id
                FROM CONSENT
                WHERE query_id = ?;
                `,
                [queryId]
            );

        if (consentRows.length > 0) {
            throw new Error(
                "Consent request already exists"
            );
        }

        const consentId = generateId("C");
        const otpCode = generateOtp();

        await connection.query(
            `
            INSERT INTO CONSENT (
                consent_id,
                query_id,
                otp_status,
                otp_code
            )
            VALUES (?, ?, 'PENDING', ?);
            `,
            [
                consentId,
                queryId,
                otpCode
            ]
        );

        await connection.query(
            `
            UPDATE QUERY_LOG
            SET status = 'CONSENT_REQUESTED'
            WHERE query_id = ?;
            `,
            [queryId]
        );

        await connection.commit();

        return {
            consentId,
            queryId,
            otpStatus: "PENDING",
            otpCode
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function verifyConsent(
    queryId,
    otpCode
) {
    const connection =
        await centralDb.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] =
            await connection.query(
                `
                SELECT
                    c.consent_id,
                    c.query_id,
                    c.otp_status,
                    c.otp_code,
                    q.status AS query_status
                FROM CONSENT c
                JOIN QUERY_LOG q
                    ON c.query_id = q.query_id
                WHERE c.query_id = ?
                FOR UPDATE;
                `,
                [queryId]
            );

        if (rows.length === 0) {
            throw new Error(
                "Consent request not found"
            );
        }

        const consent = rows[0];

        if (consent.otp_status !== "PENDING") {
            throw new Error(
                "Consent is no longer pending"
            );
        }

        if (consent.otp_code !== otpCode) {
            throw new Error("Invalid OTP");
        }

        const consentTime = new Date();

        const validUntil = new Date(
            consentTime.getTime() +
            24 * 60 * 60 * 1000
        );

        await connection.query(
            `
            UPDATE CONSENT
            SET
                otp_status = 'VERIFIED',
                consent_time = ?,
                valid_until = ?
            WHERE query_id = ?;
            `,
            [
                consentTime,
                validUntil,
                queryId
            ]
        );

        await connection.query(
            `
            UPDATE QUERY_LOG
            SET status = 'CONSENT_GRANTED'
            WHERE query_id = ?;
            `,
            [queryId]
        );

        await connection.commit();

        return {
            queryId,
            otpStatus: "VERIFIED",
            consentTime,
            validUntil
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function denyConsent(queryId) {
    const connection =
        await centralDb.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] =
            await connection.query(
                `
                SELECT
                    consent_id,
                    otp_status
                FROM CONSENT
                WHERE query_id = ?
                FOR UPDATE;
                `,
                [queryId]
            );

        if (rows.length === 0) {
            throw new Error(
                "Consent request not found"
            );
        }

        if (rows[0].otp_status !== "PENDING") {
            throw new Error(
                "Consent is no longer pending"
            );
        }

        await connection.query(
            `
            UPDATE CONSENT
            SET
                otp_status = 'DENIED',
                consent_time = NULL,
                valid_until = NULL
            WHERE query_id = ?;
            `,
            [queryId]
        );

        await connection.query(
            `
            UPDATE QUERY_LOG
            SET status = 'CONSENT_DENIED'
            WHERE query_id = ?;
            `,
            [queryId]
        );

        await connection.commit();

        return {
            queryId,
            otpStatus: "DENIED"
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function getConsentByQueryId(
    queryId
) {
    const [rows] = await centralDb.query(
        `
        SELECT
            c.consent_id,
            c.query_id,
            c.otp_status,
            c.consent_time,
            c.valid_until,
            q.student_id,
            q.organization_id,
            q.purpose,
            q.status AS query_status
        FROM CONSENT c
        JOIN QUERY_LOG q
            ON c.query_id = q.query_id
        WHERE c.query_id = ?;
        `,
        [queryId]
    );

    return rows[0] || null;
}