import centralDb from "../config/db.js";
import env from "../config/env.js";

const organizationApiUrls = {
    ORG001: env.sbiApiUrl,
    ORG002: env.tataApiUrl,
    ORG003: env.relianceApiUrl
};

export async function performFederatedLookup(
    studentId,
    queryId
) {
    // 1. Verify query, student and consent.

    const [queryRows] = await centralDb.query(
        `
        SELECT
            q.query_id,
            q.student_id,
            q.status AS query_status,
            c.otp_status,
            c.valid_until,
            (
                c.valid_until > CURRENT_TIMESTAMP
            ) AS consent_is_valid
        FROM QUERY_LOG q
        LEFT JOIN CONSENT c
            ON q.query_id = c.query_id
        WHERE q.query_id = ?;
        `,
        [queryId]
    );

    if (queryRows.length === 0) {
        throw new Error("Query not found");
    }

    const query = queryRows[0];

    if (query.student_id !== studentId) {
        throw new Error(
            "Query does not belong to this student"
        );
    }

    if (query.otp_status !== "VERIFIED") {
        throw new Error("Consent is not verified");
    }

    if (Number(query.consent_is_valid) !== 1) {
        throw new Error(
            "Consent has expired or is invalid"
        );
    }

    // 2. Load organization targets.

    const [targets] = await centralDb.query(
        `
        SELECT
            qt.organization_id,
            o.organization_name
        FROM QUERY_TARGET qt
        JOIN ORGANIZATION o
            ON qt.organization_id = o.organization_id
        WHERE qt.query_id = ?
        ORDER BY qt.organization_id;
        `,
        [queryId]
    );

    if (targets.length === 0) {
        throw new Error(
            "Query has no organization targets"
        );
    }

    // 3. Call each organization's API.

    const organizationResults = await Promise.all(
        targets.map(async target => {
            const {
                organization_id: organizationId,
                organization_name: organizationName
            } = target;

            const baseUrl =
                organizationApiUrls[organizationId];

            if (!baseUrl) {
                return {
                    organizationId,
                    organizationName,
                    status: "FAILED",
                    error:
                        "Organization API URL is not configured"
                };
            }

            try {
                const response = await fetch(
                    `${baseUrl}/api/students/${encodeURIComponent(studentId)}/summary`,
                    {
                        signal: AbortSignal.timeout(5000)
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Organization API returned HTTP ${response.status}`
                    );
                }

                const payload = await response.json();

                if (!payload.success || !payload.data) {
                    throw new Error(
                        "Organization API returned an invalid response"
                    );
                }

                const numberOfAwards = Number(
                    payload.data.number_of_awards
                );

                const totalAwarded = Number(
                    payload.data.total_awarded
                );

                if (
                    !Number.isFinite(numberOfAwards) ||
                    !Number.isFinite(totalAwarded)
                ) {
                    throw new Error(
                        "Organization API returned invalid aggregate values"
                    );
                }

                // NEW: Read previous scholarship support information.

                const priorSupportFlag = Number(
                    payload.data.has_declared_prior_support
                );

                const declaredPriorSupportApplications = Number(
                    payload.data.declared_prior_support_applications
                );

                if (
                    ![0, 1].includes(priorSupportFlag) ||
                    !Number.isInteger(
                        declaredPriorSupportApplications
                    ) ||
                    declaredPriorSupportApplications < 0
                ) {
                    throw new Error(
                        "Organization API returned invalid prior support information"
                    );
                }

                return {
                    organizationId,
                    organizationName,
                    status: "COMPLETED",
                    numberOfAwards,
                    totalAwarded,

                    // NEW: Additional transparency information.
                    hasDeclaredPriorSupport:
                        priorSupportFlag === 1,

                    declaredPriorSupportApplications
                };

            } catch (error) {
                return {
                    organizationId,
                    organizationName,
                    status: "FAILED",
                    error: String(error.message).slice(0, 255)
                };
            }
        })
    );

    // 4. Summarize successful and failed responses.

    const successfulResults = organizationResults.filter(
        result => result.status === "COMPLETED"
    );

    const failedResults = organizationResults.filter(
        result => result.status === "FAILED"
    );

    const totalAwards = successfulResults.reduce(
        (sum, result) => sum + result.numberOfAwards,
        0
    );

    const totalAssistance = successfulResults.reduce(
        (sum, result) => sum + result.totalAwarded,
        0
    );

    let lookupStatus;

    if (successfulResults.length === 0) {
        lookupStatus = "LOOKUP_FAILED";
    } else if (failedResults.length > 0) {
        lookupStatus = "LOOKUP_PARTIAL";
    } else {
        lookupStatus = "LOOKUP_COMPLETED";
    }

    // 5. Save lookup status in the central database.

    const connection = await centralDb.getConnection();

    try {
        await connection.beginTransaction();

        for (const result of organizationResults) {
            await connection.query(
                `
                UPDATE QUERY_TARGET
                SET
                    lookup_status = ?,
                    error_message = ?,
                    checked_at = CURRENT_TIMESTAMP
                WHERE query_id = ?
                  AND organization_id = ?;
                `,
                [
                    result.status,
                    result.error ?? null,
                    queryId,
                    result.organizationId
                ]
            );
        }

        await connection.query(
            `
            UPDATE QUERY_LOG
            SET status = ?
            WHERE query_id = ?;
            `,
            [lookupStatus, queryId]
        );

        await connection.commit();

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }

    // 6. Return final federated lookup response.

    return {
        queryId,
        studentId,
        status: lookupStatus,

        summary: {
            organizationsRequested: targets.length,
            organizationsResponded: successfulResults.length,
            organizationsFailed: failedResults.length,
            totalAwards,
            totalScholarshipAssistance:
                Number(totalAssistance.toFixed(2))
        },

        organizations: organizationResults
    };
}