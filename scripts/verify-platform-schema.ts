/**
 * VS-0 platform schema verification — run after prisma:platform:push
 * Usage: npx tsx scripts/verify-platform-schema.ts
 */
import "dotenv/config";
import { Pool } from "pg";

const EXPECTED_TABLES = [
  "tenant",
  "tenant_membership",
  "tenant_scoped_secret",
  "outbox_event",
  "processed_event",
  "audit_entry",
  "idempotency_record",
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { rows } = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'platform' ORDER BY table_name`
    );
    const found = rows.map((r) => r.table_name);
    const missing = EXPECTED_TABLES.filter((t) => !found.includes(t));
    const extra = found.filter((t) => !EXPECTED_TABLES.includes(t));

    const fkCheck = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM information_schema.table_constraints tc
       JOIN information_schema.constraint_column_usage ccu
         ON tc.constraint_name = ccu.constraint_name
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = 'platform'
         AND ccu.table_schema NOT IN ('platform')`
    );
    const crossSchemaFk = Number(fkCheck.rows[0]?.count ?? 0);

    console.log("=== VS-0 Platform Schema Verification ===");
    console.log("Schema: platform");
    console.log("Tables found:", found.join(", ") || "(none)");
    console.log("Expected tables missing:", missing.length ? missing.join(", ") : "none");
    console.log("Extra tables:", extra.length ? extra.join(", ") : "none");
    console.log("Cross-schema FK count:", crossSchemaFk);

    if (missing.length > 0 || crossSchemaFk > 0) {
      process.exitCode = 1;
      console.log("RESULT: FAIL");
    } else {
      console.log("RESULT: PASS");
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
