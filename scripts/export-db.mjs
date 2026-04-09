/**
 * Database Export Script
 * ---------------------
 * Exports ALL data from the Railway MySQL database into:
 *   1. Individual JSON files per table  (./db-export/*.json)
 *   2. A single MySQL-compatible SQL dump (./db-export/full_dump.sql)
 *
 * Usage:
 *   node scripts/export-db.mjs
 *
 * Prerequisites:
 *   - .env file with DATABASE_URL (or individual DB_* / MYSQL* vars)
 *   - `mysql2` package installed (already in project deps)
 */

import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, "..", "db-export");

// ---------------------------------------------------------------------------
// 1. Resolve connection config
// ---------------------------------------------------------------------------
function getConnectionConfig() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const url = new URL(dbUrl);
    return {
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.replace("/", ""),
      ssl: { rejectUnauthorized: false },
      connectTimeout: 30000,
    };
  }

  return {
    host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    user: process.env.DB_USER || process.env.MYSQLUSER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || "railway",
    ssl: { rejectUnauthorized: false },
    connectTimeout: 30000,
  };
}

// ---------------------------------------------------------------------------
// 2. SQL value escaping helpers
// ---------------------------------------------------------------------------
function escapeValue(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "1" : "0";
  if (typeof val === "number") return String(val);
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
  if (Buffer.isBuffer(val)) return `X'${val.toString("hex")}'`;
  if (typeof val === "object") return escapeString(JSON.stringify(val));
  return escapeString(String(val));
}

function escapeString(str) {
  return `'${str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r")}'`;
}

// ---------------------------------------------------------------------------
// 3. Generate CREATE TABLE statement from SHOW CREATE TABLE
// ---------------------------------------------------------------------------
async function getCreateTable(conn, table) {
  const [rows] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
  return rows[0]["Create Table"];
}

// ---------------------------------------------------------------------------
// 4. Main export
// ---------------------------------------------------------------------------
async function main() {
  await fs.mkdir(EXPORT_DIR, { recursive: true });

  const config = getConnectionConfig();
  console.log(`Connecting to ${config.host}:${config.port}/${config.database} ...`);

  const conn = await mysql.createConnection(config);
  console.log("Connected!\n");

  // Get all tables
  const [tableRows] = await conn.query("SHOW TABLES");
  const tableKey = Object.keys(tableRows[0])[0];
  const tables = tableRows.map((r) => r[tableKey]);

  console.log(`Found ${tables.length} tables: ${tables.join(", ")}\n`);

  // SQL dump header
  const sqlParts = [
    "-- ============================================================",
    "-- Full database dump",
    `-- Exported at: ${new Date().toISOString()}`,
    `-- Source: ${config.host}:${config.port}/${config.database}`,
    "-- ============================================================",
    "",
    "SET FOREIGN_KEY_CHECKS = 0;",
    "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';",
    "",
  ];

  let totalRows = 0;

  for (const table of tables) {
    // Skip Prisma migration table
    if (table === "_prisma_migrations") {
      console.log(`  [skip] ${table} (prisma internal)`);
      continue;
    }

    // Fetch all rows
    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    console.log(`  ${table}: ${rows.length} rows`);
    totalRows += rows.length;

    // Save JSON
    const jsonPath = path.join(EXPORT_DIR, `${table}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(rows, null, 2), "utf-8");

    // CREATE TABLE
    const createSQL = await getCreateTable(conn, table);
    sqlParts.push(`-- ────────────────────────────────────────────────────────────`);
    sqlParts.push(`-- Table: ${table}`);
    sqlParts.push(`-- ────────────────────────────────────────────────────────────`);
    sqlParts.push(`DROP TABLE IF EXISTS \`${table}\`;`);
    sqlParts.push(createSQL + ";");
    sqlParts.push("");

    // INSERT statements (batched per 100 rows)
    if (rows.length > 0) {
      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `\`${c}\``).join(", ");

      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const values = batch
          .map((row) => {
            const vals = columns.map((c) => escapeValue(row[c]));
            return `(${vals.join(", ")})`;
          })
          .join(",\n  ");

        sqlParts.push(`INSERT INTO \`${table}\` (${colList}) VALUES`);
        sqlParts.push(`  ${values};`);
        sqlParts.push("");
      }
    }
  }

  sqlParts.push("SET FOREIGN_KEY_CHECKS = 1;");
  sqlParts.push("");

  // Write SQL dump
  const sqlPath = path.join(EXPORT_DIR, "full_dump.sql");
  await fs.writeFile(sqlPath, sqlParts.join("\n"), "utf-8");

  await conn.end();

  console.log(`\n--- Export complete ---`);
  console.log(`Total rows exported: ${totalRows}`);
  console.log(`JSON files: ${EXPORT_DIR}/<table>.json`);
  console.log(`SQL dump:   ${sqlPath}`);
  console.log(`\nTo import into cPanel MySQL, use phpMyAdmin or run:`);
  console.log(`  mysql -u <user> -p <database> < db-export/full_dump.sql`);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
