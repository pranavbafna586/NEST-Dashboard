import { getDatabase } from "./db";

// Get all tables in the database
function getAllTables() {
  try {
    const database = getDatabase();
    const query = `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
    const rows = database.prepare(query).all() as Array<{ name: string }>;

    console.log("\n=== Tables in edc_metrics.db ===\n");
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}`);
    });
    console.log(`\nTotal tables: ${rows.length}\n`);

    // For each table, show column info
    rows.forEach((row) => {
      const tableInfo = database
        .prepare(`PRAGMA table_info(${row.name})`)
        .all();
      console.log(`\n📊 Table: ${row.name}`);
      console.log("Columns:");
      tableInfo.forEach((col: any) => {
        console.log(`  - ${col.name} (${col.type})`);
      });
    });
  } catch (error) {
    console.error("Error querying database:", error);
  }
}

getAllTables();
