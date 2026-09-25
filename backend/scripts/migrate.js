import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import env from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDirectory = path.resolve(
    __dirname,
    "../../database/migrations"
);

const MIGRATION_TABLE = "scholarlink_central.schema_migrations";

function getMigrationNumber(filePath) {
    const fileName = path.basename(filePath);
    const match = fileName.match(/^(\d+)_/);

    if (!match) {
        throw new Error(
            `Migration filename must start with a number: ${fileName}`
        );
    }

    return Number(match[1]);
}

async function collectSqlFiles(directory) {
    const entries = await fs.readdir(directory, {
        withFileTypes: true
    });

    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await collectSqlFiles(fullPath)));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".sql")) {
            files.push(fullPath);
        }
    }

    return files.sort((a, b) => {
        const numberDifference =
            getMigrationNumber(a) - getMigrationNumber(b);

        if (numberDifference !== 0) {
            return numberDifference;
        }

        return a.localeCompare(b);
    });
}

async function databaseExists(connection, databaseName) {
    const [rows] = await connection.query(
        "SHOW DATABASES LIKE ?",
        [databaseName]
    );

    return rows.length > 0;
}

async function createMigrationTable(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
            migration_id INT PRIMARY KEY AUTO_INCREMENT,
            migration_name VARCHAR(255) NOT NULL UNIQUE,
            applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function isMigrationApplied(connection, migrationName) {
    const [rows] = await connection.query(
        `SELECT migration_id
         FROM ${MIGRATION_TABLE}
         WHERE migration_name = ?`,
        [migrationName]
    );

    return rows.length > 0;
}

async function recordMigration(connection, migrationName) {
    await connection.query(
        `INSERT INTO ${MIGRATION_TABLE} (migration_name)
         VALUES (?)`,
        [migrationName]
    );
}

async function main() {
    const migrationFiles = await collectSqlFiles(
        migrationsDirectory
    );

    if (migrationFiles.length === 0) {
        throw new Error(
            `No SQL migrations found in ${migrationsDirectory}`
        );
    }

    // Connect to the MySQL SERVER, not to a specific database.
    // This is necessary because the databases may not exist yet.
    const connection = await mysql.createConnection({
        host: env.dbHost,
        user: env.dbUser,
        password: env.dbPassword,
        port: Number(env.dbPort),

        // Migration files may contain multiple SQL statements.
        multipleStatements: true
    });

    try {
        console.log(
            "ScholarLink database migration started...\n"
        );

        const centralExists = await databaseExists(
            connection,
            env.centralDb
        );

        let startIndex = 0;

        // Bootstrap the databases if they don't exist.
        if (!centralExists) {
            const firstMigration = migrationFiles[0];

            const firstName = path
                .relative(
                    migrationsDirectory,
                    firstMigration
                )
                .replaceAll("\\", "/");

            const firstSql = await fs.readFile(
                firstMigration,
                "utf8"
            );

            console.log(`Running bootstrap: ${firstName}`);

            await connection.query(firstSql);

            startIndex = 1;
        }

        // Store migration history inside the central database.
        await createMigrationTable(connection);

        // Record the bootstrap migration.
        if (!centralExists) {
            const firstName = path
                .relative(
                    migrationsDirectory,
                    migrationFiles[0]
                )
                .replaceAll("\\", "/");

            if (!(await isMigrationApplied(
                connection,
                firstName
            ))) {
                await recordMigration(
                    connection,
                    firstName
                );

                console.log(
                    `Recorded: ${firstName}\n`
                );
            }
        }

        // Execute all remaining migrations.
        for (const migrationFile of migrationFiles.slice(
            startIndex
        )) {
            const migrationName = path
                .relative(
                    migrationsDirectory,
                    migrationFile
                )
                .replaceAll("\\", "/");

            if (await isMigrationApplied(
                connection,
                migrationName
            )) {
                console.log(
                    `Already applied: ${migrationName}`
                );

                continue;
            }

            const sql = await fs.readFile(
                migrationFile,
                "utf8"
            );

            console.log(
                `Running: ${migrationName}`
            );

            await connection.query(sql);

            await recordMigration(
                connection,
                migrationName
            );

            console.log(
                `Applied: ${migrationName}\n`
            );
        }

        console.log(
            "All database migrations completed successfully."
        );
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error("\nDatabase migration failed.");
    console.error(error.message);

    process.exitCode = 1;
});