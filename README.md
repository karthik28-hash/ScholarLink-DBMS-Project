# ScholarLink

### Scholarship Information Exchange System

ScholarLink is a DBMS-based prototype for sharing permitted scholarship information between scholarship organizations without centralizing their complete scholarship databases.

## About the Project

Scholarship records are maintained separately by different organizations. When a scholarship organization wants to verify a student's previous scholarship assistance, it may not have access to records maintained by other organizations.

ScholarLink follows a **federated database architecture**. Each participating organization maintains its own scholarship database, while a central registry manages student references, participating organizations, information queries, and consent.

The system uses **read-only REST APIs** to request permitted information from organization databases.

> **ScholarLink informs; it does not decide.**

The system provides scholarship-history information and an estimated funding gap for decision-support. The final eligibility and award decision remains with the requesting scholarship organization.

## Architecture

### Central Registry Database

- `STUDENT`
- `ORGANIZATION`
- `QUERY_LOG`
- `CONSENT`

### Organization Database

Each participating organization maintains its own database containing:

- `SCHOLARSHIP_PROGRAM`
- `APPLICATION`
- `AWARD`

The central registry does not directly join the scholarship tables of participating organizations. Communication takes place through read-only REST APIs.

## Main Workflow

1. A scholarship organization initiates a lookup for a student.
2. ScholarLink records the request in `QUERY_LOG`.
3. Consent is obtained for that specific query.
4. After successful consent, ScholarLink contacts participating organization APIs.
5. Each organization checks its own local database.
6. Only permitted information is returned.
7. ScholarLink aggregates the returned scholarship information.
8. Previous scholarship assistance and an estimated funding gap are calculated.
9. The requesting organization makes the final decision.

## DBMS Concepts

This project demonstrates:

- ER modelling using Chen notation
- Relational schema design
- Primary and foreign keys
- Relationship cardinalities
- Normalization up to 3NF
- SQL queries
- JOIN
- GROUP BY
- COUNT
- SUM
- HAVING
- Transactions and ACID properties
- Views
- Multiple independent MySQL databases
- Query logging
- Consent tracking

## Technology Stack

- **Database:** MySQL
- **Backend:** Node.js / Express
- **Query Language:** SQL
- **Development Tools:** VS Code, MySQL Workbench
- **API:** REST API

## Project Scope

This is an academic prototype. Organization databases, APIs, and student identifiers are simulated.

No real scholarship portal, government database, Aadhaar/NSP integration, or real student data is used.

The system does not make scholarship eligibility or award decisions.

## Team

- **B V Karthik**
- **Jayaram Naik**

## Status

🚧 **Project in Development**
