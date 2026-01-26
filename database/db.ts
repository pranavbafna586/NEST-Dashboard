import Database from "better-sqlite3";
import path from "path";

// Get the database path
const dbPath = path.join(process.cwd(), "database", "edc_metrics.db");

// Create a singleton database connection
let db: Database.Database | null = null;

export function getDatabase() {
  // Check if db exists and is open
  if (!db || !db.open) {
    try {
      // Close if exists but not open
      if (db && !db.open) {
        db = null;
      }

      db = new Database(dbPath, { readonly: true });
      console.log("Database connected successfully:", dbPath);
    } catch (error) {
      console.error("Error connecting to database:", error);
      console.error("Database path:", dbPath);
      throw error;
    }
  }
  return db;
}

// Close the database connection
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
