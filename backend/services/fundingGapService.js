import centralDb from "../config/db.js";
import { performFederatedLookup } from "./federationService.js";

export async function estimateFundingGap(studentId, queryId, academicYear) {
  // 1. Retrieve student, course, college, fee and financial information.
  const [rows] = await centralDb.execute(
    `SELECT
            s.student_id,
            s.name,
            c.course_name,
            c.degree,
            cl.college_name,
            cf.academic_year,
            cf.annual_fee,
            fp.annual_family_income,
            fp.other_education_expense
         FROM STUDENT s
         JOIN COURSE c
            ON s.course_id = c.course_id
         JOIN COLLEGE cl
            ON s.college_id = cl.college_id
         LEFT JOIN COURSE_FEE cf
            ON cf.course_id = s.course_id
            AND cf.college_id = s.college_id
            AND cf.academic_year = ?
         LEFT JOIN STUDENT_FINANCIAL_PROFILE fp
            ON fp.student_id = s.student_id
         WHERE s.student_id = ?`,
    [academicYear, studentId],
  );

  if (rows.length === 0) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  const student = rows[0];

  // 2. Make sure a fee record exists for the requested academic year.
  if (student.annual_fee === null) {
    const error = new Error(
      `Course fee not found for academic year ${academicYear}`,
    );
    error.statusCode = 404;
    throw error;
  }

  // 3. A financial profile is required for this estimate.
  if (
    student.annual_family_income === null ||
    student.other_education_expense === null
  ) {
    const error = new Error(
      "Student financial profile is missing. Create the profile before calculating the funding gap.",
    );
    error.statusCode = 400;
    throw error;
  }

  // 4. Retrieve current scholarship assistance through the organization APIs.
  const lookup = await performFederatedLookup(studentId, queryId);

  const requested = Number(lookup.summary?.organizationsRequested ?? 0);

  const responded = Number(lookup.summary?.organizationsResponded ?? 0);

  // Do not calculate a final estimate from incomplete scholarship data.
  if (requested === 0 || responded !== requested) {
    const error = new Error(
      "Funding gap cannot be calculated because not all requested organizations responded successfully.",
    );

    error.statusCode = 503;
    error.data = { lookup };
    throw error;
  }

  const totalScholarshipAssistance = Number(
    lookup.summary.totalScholarshipAssistance,
  );

  if (!Number.isFinite(totalScholarshipAssistance)) {
    const error = new Error(
      "The returned scholarship assistance total is invalid.",
    );

    error.statusCode = 502;
    throw error;
  }

  // 5. Calculate the estimated education cost.
  const annualCourseFee = Number(student.annual_fee);

  const otherEducationExpenses = Number(student.other_education_expense);

  const estimatedEducationCost = annualCourseFee + otherEducationExpenses;

  // 6. Calculate the estimated funding gap.
  const estimatedFundingGap = Math.max(
    0,
    estimatedEducationCost - totalScholarshipAssistance,
  );

  const amountExceedingCost = Math.max(
    0,
    totalScholarshipAssistance - estimatedEducationCost,
  );

  let fundingAdequacyStatus;

  if (amountExceedingCost > 0) {
    fundingAdequacyStatus = "ASSISTANCE_EXCEEDS_COST";
  } else if (estimatedFundingGap === 0) {
    fundingAdequacyStatus = "FULLY_COVERED";
  } else {
    fundingAdequacyStatus = "FUNDING_GAP_REMAINS";
  }

  const money = (amount) => Number(amount.toFixed(2));

  // 7. Return the combined result.
  return {
    student: {
      studentId: student.student_id,
      name: student.name,
      course: student.course_name,
      degree: student.degree,
      college: student.college_name,
      academicYear: student.academic_year,
    },

    financialInformation: {
      annualFamilyIncome: money(Number(student.annual_family_income)),
      annualCourseFee: money(annualCourseFee),
      otherEducationExpenses: money(otherEducationExpenses),
      estimatedEducationCost: money(estimatedEducationCost),
    },

    scholarshipInformation: {
      totalScholarshipAssistance: money(totalScholarshipAssistance),
      estimatedFundingGap: money(estimatedFundingGap),
      amountExceedingEstimatedCost: money(amountExceedingCost),
      fundingAdequacyStatus,
    },

    organizationResults: lookup.organizations,

    note: "This is an estimate based on recorded education expenses and successfully retrieved scholarship assistance. It is not an official financial-aid eligibility decision.",
  };
}
