# ScholarLink — Scholarship Information Exchange System

## 1. Project Overview

**ScholarLink** is a DBMS mini-project that demonstrates consent-based scholarship information exchange across a central system and three independent scholarship-organization databases. It collects permitted scholarship assistance information and estimates a student's education funding gap. It does not award scholarships or determine official eligibility.

## 2. Problem Statement

Scholarship information can be spread across different organizations. A student or authorized reviewer may need a consolidated view of recorded scholarship support alongside education expenses. ScholarLink demonstrates how relational databases, consent records, and REST APIs can exchange this information while keeping each organization's scholarship records in its own database.

## 3. Objectives

- Design normalized relational schemas and enforce primary-key, foreign-key, uniqueness, and check constraints.
- Store student, academic, financial, query, and consent information centrally.
- Keep scholarship programmes, applications, and awards in separate organization databases.
- Verify consent before a federated lookup.
- Aggregate successful organization responses and estimate an education funding gap.
- Demonstrate SQL joins, views, transactions, and API-based database integration.

## 4. Technology Stack

- **Backend:** Node.js, Express.js, JavaScript ES Modules
- **Database:** MySQL
- **Database connectivity:** `mysql2`
- **API testing:** Postman
- **Configuration:** environment variables in `.env`

## 5. Architecture and Workflow

The project uses one central MySQL database and three separate organization databases: SBI Foundation, Tata Capital, and Reliance Foundation. For this academic prototype, the databases may run on the same local MySQL server, but they remain separate schemas and are accessed through distinct connection pools. Each organization's API accesses its own database.

**Workflow:**

1. Create a student query and select the organization targets.
2. Request consent and verify the OTP.
3. The central backend checks that consent is verified and has not expired.
4. The federation service calls each selected organization's REST API.
5. Organization APIs return scholarship award summaries and declared prior-support indicators.
6. ScholarLink records each target's lookup status and aggregates successful responses.
7. The funding-gap service combines the central education-cost information with the returned scholarship assistance.

## 6. Main Database Tables

### Central database: `scholarlink_central`

- `STUDENT`: student details and references to course and college.
- `COURSE`: course and degree information.
- `COLLEGE`: college and university information.
- `COURSE_FEE`: annual fee by course, college, and academic year.
- `STUDENT_FINANCIAL_PROFILE`: annual family income, family size, and other education expenses.
- `ORGANIZATION`: organization identifiers, names, and API configuration.
- `QUERY_LOG`: student query, primary organization, purpose, timestamp, and status.
- `QUERY_TARGET`: organizations targeted by each query and each organization's lookup status.
- `CONSENT`: OTP verification status, verification time, and expiry information.
- `schema_migrations`: records database migrations applied by the migration script.
- `vw_student_overview`: a view combining student, course, college, and available financial-profile information.

### Separate organization databases

Each organization database contains:

- `SCHOLARSHIP_PROGRAM`: scholarship programme details.
- `APPLICATION`: student application and application status, including the self-declared prior-support field.
- `AWARD`: amounts and academic-year information associated with applications.

The organization databases do not use cross-database foreign keys to the central student table. The student identifier is exchanged through the APIs.

## 7. Implemented Features

1. Student and financial-profile CRUD APIs.
2. Organization and scholarship-programme CRUD APIs.
3. Application and award CRUD APIs.
4. Query creation and query-status management.
5. Consent request, OTP verification, and denial workflow.
6. Three independent organization API servers.
7. Consent-checked federated scholarship lookup with per-organization success/failure status.
8. Previous scholarship support indicator based on the organization's recorded `self_declared_prior_support` field. This is a disclosure indicator, not proof of duplicate funding or fraud.
9. Funding-gap estimate and funding adequacy status.
10. SQL view for a consolidated student overview.

## 8. Funding-Gap Calculation

`Estimated Education Cost = Annual Course Fee + Other Education Expenses`

`Estimated Funding Gap = max(0, Estimated Education Cost - Total Scholarship Assistance)`

The adequacy status is:

- `FUNDING_GAP_REMAINS`: estimated education cost is greater than assistance.
- `FULLY_COVERED`: assistance equals estimated education cost.
- `ASSISTANCE_EXCEEDS_COST`: assistance is greater than estimated education cost.

The estimate is based on recorded data and is not an official financial-aid decision. Annual family income is shown as context and is not automatically subtracted from education costs.

## 9. DBMS Concepts Demonstrated

- **Relational model:** information is organized into tables with defined relationships.
- **Primary keys:** uniquely identify records, such as `STUDENT.student_id`.
- **Foreign keys:** maintain referential integrity between related central tables and within each organization database.
- **UNIQUE constraints:** prevent duplicate combinations such as a repeated course/college/academic-year fee record.
- **CHECK constraints:** restrict invalid values such as negative fees or award amounts.
- **Normalization:** student, course, college, financial profile, organization, application, programme, and award information are separated to reduce duplication and update anomalies.
- **JOINs:** combine related records, such as student with course and college.
- **LEFT JOIN:** preserves the main record even when optional financial-profile information is absent, allowing the application to detect missing data.
- **Aggregate functions:** `COUNT`, `SUM`, `MAX`, and `COALESCE` summarize award and prior-support data.
- **VIEW:** `vw_student_overview` simplifies repeated retrieval of student overview information.
- **Transactions:** consent and lookup-state updates use transaction boundaries to keep related changes consistent.
- **Migrations:** numbered SQL scripts create and update the schema in a tracked order.

## 10. Final Demonstration Checklist

1. Start the central backend on port 5000 and organization APIs on ports 5001, 5002, and 5003.
2. Confirm `GET /api/health/db` reports successful database connections.
3. Create a query targeting `ORG001`, `ORG002`, and `ORG003`.
4. Request and verify consent for that query.
5. Run `POST /api/federation/lookup` and check that all three targets show `COMPLETED`.
6. Confirm the organization responses include award totals and prior-support fields.
7. Run `POST /api/federation/funding-gap` with academic year `2026-27` and inspect the estimate and adequacy status.
8. In MySQL, query `QUERY_LOG`, `QUERY_TARGET`, and `vw_student_overview` to show the persisted data.

Use current query IDs and OTP values during the demonstration. Expected amounts depend on the database records currently present.

## 11. Limitations and Scope

- This is an academic prototype using synthetic records.
- Organization databases are separate logical databases, but may run on one local MySQL server for demonstration.
- OTP handling is designed for prototype testing; a production deployment would require a secure OTP delivery and secret-management process.
- The prior-support indicator only reports what is recorded in application data; it does not prove that support is duplicated or fraudulent.
- The funding-gap result is an estimate, not an eligibility decision.
- A production system would additionally need stronger authentication/authorization, API security, audit policies, deployment configuration, and privacy review.

## 12. Viva Questions and Short Answers

**1. What is ScholarLink?**  
A consent-based scholarship information exchange prototype that combines records returned by independent organization APIs and estimates a student's education funding gap.

**2. Why use multiple databases?**  
Each organization owns its scholarship records. Separate databases model that ownership and prevent the central system from directly modifying organization records.

**3. How are the databases connected?**  
The central backend calls each organization's REST API over HTTP. Each API uses its own MySQL connection pool and queries only its organization's database.

**4. Why not use a cross-database JOIN?**  
The design models independent organizations. The central system requests permitted data through APIs instead of directly joining to another organization's tables.

**5. What is a primary key?**  
A column or set of columns that uniquely identifies each row in a table.

**6. What is a foreign key?**  
A constraint that ensures a referenced record exists in the related table, helping maintain referential integrity.

**7. Why separate `APPLICATION` and `AWARD`?**  
An application and an award represent different entities: an application may exist without an award, and an application can have associated award records.

**8. Why use `LEFT JOIN` for the financial profile?**  
A student record remains in the result even if the optional financial profile is missing; the application can then report that missing data.

**9. What is a view?**  
A named SQL query that can be queried like a virtual table. `vw_student_overview` combines selected student, course, college, and financial details.

**10. What is normalization?**  
Structuring tables to reduce repeated data and prevent insertion, update, and deletion anomalies.

**11. Why use transactions?**  
Transactions group related database changes so they can be committed together or rolled back if an operation fails.

**12. How does consent work?**  
A query is created, consent is requested, and the OTP is verified. Federated lookup checks that consent is verified and unexpired before calling organization APIs.

**13. What happens if one organization API fails?**  
The lookup records that target as failed and labels the overall lookup partial if at least one other organization succeeded. The funding-gap service requires all requested organizations to respond before returning a complete estimate.

**14. How is the funding gap calculated?**  
Add annual course fee and other education expenses, then subtract total retrieved scholarship assistance, with the result bounded below by zero.

**15. Does the project decide scholarship eligibility?**  
No. It presents recorded support and an estimated funding gap; it does not award scholarships or make official eligibility decisions.

**16. What makes the project distinctive?**  
Its combination of consent verification, independent organization databases and APIs, federated lookup, prior-support disclosure, and funding-gap estimation.

---

**Project status:** Core backend and database workflows are implemented. Before submission, run the final demonstration checklist against the current local code and data, and make sure the report matches the actual endpoints and schema in the repository.
