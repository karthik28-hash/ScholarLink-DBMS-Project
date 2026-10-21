import express from "express";

export function createOrganizationApp({
  db,
  organizationId,
  organizationName,
}) {
  const app = express();

  app.use(express.json());

  // =========================================
  // HEALTH CHECK
  // =========================================

  app.get("/health", async (req, res) => {
    try {
      await db.query("SELECT 1");

      return res.json({
        success: true,
        organizationId,
        organizationName,
        databaseConnected: true,
      });
    } catch (error) {
      console.error(`${organizationName} database error:`, error.message);

      return res.status(500).json({
        success: false,
        organizationId,
        message: "Database connection failed",
      });
    }
  });

  // =========================================
  // GET SCHOLARSHIP RECORDS FOR A STUDENT
  // =========================================

  app.get("/api/students/:studentId/scholarships", async (req, res) => {
    try {
      const { studentId } = req.params;

      const [rows] = await db.query(
        `
                    SELECT
                        ap.application_id,
                        ap.student_id,
                        ap.scholarship_id,
                        sp.scholarship_name,
                        sp.scholarship_type,
                        ap.application_date,
                        ap.status AS application_status,
                        a.award_id,
                        a.amount AS award_amount,
                        a.award_date,
                        a.academic_year
                    FROM APPLICATION ap
                    JOIN SCHOLARSHIP_PROGRAM sp
                        ON ap.scholarship_id =
                           sp.scholarship_id
                    LEFT JOIN AWARD a
                        ON ap.application_id =
                           a.application_id
                    WHERE ap.student_id = ?
                    ORDER BY
                        ap.application_id,
                        a.award_date;
                    `,
        [studentId],
      );

      return res.json({
        success: true,
        organizationId,
        organizationName,
        studentId,
        count: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(
        `${organizationName} scholarship query failed:`,
        error.message,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve scholarship records",
      });
    }
  });

  // =========================================
  // GET AGGREGATED AWARD SUMMARY
  // =========================================

  app.get("/api/students/:studentId/summary", async (req, res) => {
    try {
      const { studentId } = req.params;

      const [rows] = await db.query(
        `
                    SELECT
                        COUNT(DISTINCT aw.award_id) AS number_of_awards,
                        COALESCE(SUM(aw.amount), 0) AS total_awarded,
                        COALESCE(MAX(a.self_declared_prior_support), 0)
                            AS has_declared_prior_support,
                        COUNT(DISTINCT CASE
                            WHEN a.self_declared_prior_support = 1
                            THEN a.application_id
                        END) AS declared_prior_support_applications
                    FROM APPLICATION a
                    LEFT JOIN AWARD aw
                        ON aw.application_id = a.application_id
                    WHERE a.student_id = ?
                    `,
        [studentId],
      );

      return res.json({
        success: true,
        organizationId,
        organizationName,
        studentId,
        data: {
          number_of_awards: rows[0].number_of_awards,
          total_awarded: rows[0].total_awarded,
          has_declared_prior_support: rows[0].has_declared_prior_support,
          declared_prior_support_applications:
            rows[0].declared_prior_support_applications,
        },
      });
    } catch (error) {
      console.error(`${organizationName} summary query failed:`, error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve award summary",
      });
    }
  });

  return app;
}
