import Database from "better-sqlite3";
import path from "path";

// Get the database path
const dbPath = path.join(process.cwd(), "database", "edc_metrics.db");

// Create a singleton database connection
let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    try {
      db = new Database(dbPath, { readonly: true });
      console.log("Database connected successfully:", dbPath);
    } catch (error) {
      console.error("Error connecting to database:", error);
      throw error;
    }
  }
  return db;
}

// Get unique studies from subject_level_metrics table
export function getUniqueStudies(): Array<{ project_name: string }> {
  try {
    const database = getDatabase();
    const query = `SELECT DISTINCT project_name FROM subject_level_metrics WHERE project_name IS NOT NULL ORDER BY project_name`;
    const rows = database.prepare(query).all() as Array<{
      project_name: string;
    }>;
    return rows;
  } catch (error) {
    console.error("Error fetching unique studies:", error);
    return [];
  }
}

// Get unique regions from subject_level_metrics table
export function getUniqueRegions(): string[] {
  try {
    const database = getDatabase();
    const query = `SELECT DISTINCT region FROM subject_level_metrics WHERE region IS NOT NULL ORDER BY region`;
    const rows = database.prepare(query).all() as Array<{ region: string }>;
    return rows.map((row) => row.region);
  } catch (error) {
    console.error("Error fetching unique regions:", error);
    return [];
  }
}

// Get unique countries, optionally filtered by region
export function getUniqueCountries(region?: string): string[] {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT country FROM subject_level_metrics WHERE country IS NOT NULL`;

    if (region && region !== "ALL") {
      query += ` AND region = ?`;
    }

    query += ` ORDER BY country`;

    const stmt = database.prepare(query);
    const rows = (
      region && region !== "ALL" ? stmt.all(region) : stmt.all()
    ) as Array<{ country: string }>;
    return rows.map((row) => row.country);
  } catch (error) {
    console.error("Error fetching unique countries:", error);
    return [];
  }
}

// Get unique sites, optionally filtered by region and/or country
export function getUniqueSites(
  region?: string,
  country?: string,
): Array<{ site_id: string }> {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT site_id FROM subject_level_metrics WHERE site_id IS NOT NULL`;
    const params: string[] = [];

    if (region && region !== "ALL") {
      query += ` AND region = ?`;
      params.push(region);
    }

    if (country && country !== "ALL") {
      query += ` AND country = ?`;
      params.push(country);
    }

    query += ` ORDER BY site_id`;

    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Array<{ site_id: string }>;
    return rows;
  } catch (error) {
    console.error("Error fetching unique sites:", error);
    return [];
  }
}

// Get unique subjects, optionally filtered by site, region, and/or country
export function getUniqueSubjects(
  siteId?: string,
  region?: string,
  country?: string,
): string[] {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT subject_id FROM subject_level_metrics WHERE subject_id IS NOT NULL`;
    const params: string[] = [];

    if (siteId && siteId !== "ALL") {
      query += ` AND site_id = ?`;
      params.push(siteId);
    }

    if (region && region !== "ALL") {
      query += ` AND region = ?`;
      params.push(region);
    }

    if (country && country !== "ALL") {
      query += ` AND country = ?`;
      params.push(country);
    }

    query += ` ORDER BY subject_id`;

    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Array<{ subject_id: string }>;
    return rows.map((row) => row.subject_id);
  } catch (error) {
    console.error("Error fetching unique subjects:", error);
    return [];
  }
}

// Get KPI metrics for Missing Visits with trend calculation
export function getMissingVisitsKPI(
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
) {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Base query for current count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM missing_visits
      WHERE 1=1
    `;

    // Build filters
    if (region && region !== "ALL") {
      countQuery += ` AND region = ?`;
      params.push(region);
    }
    if (country && country !== "ALL") {
      countQuery += ` AND country = ?`;
      params.push(country);
    }
    if (siteId && siteId !== "ALL") {
      countQuery += ` AND site_id = ?`;
      params.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      countQuery += ` AND subject_id = ?`;
      params.push(subjectId);
    }

    const stmt = database.prepare(countQuery);
    const result = stmt.get(...params) as { total: number };

    // For trend calculation, compare with last month's data
    // Assuming created_at field exists for time-based filtering
    const trendQuery = `
      SELECT 
        COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as recent,
        COUNT(CASE WHEN created_at < date('now', '-30 days') AND created_at >= date('now', '-60 days') THEN 1 END) as previous
      FROM missing_visits
      WHERE 1=1
      ${region && region !== "ALL" ? " AND region = ?" : ""}
      ${country && country !== "ALL" ? " AND country = ?" : ""}
      ${siteId && siteId !== "ALL" ? " AND site_id = ?" : ""}
      ${subjectId && subjectId !== "ALL" ? " AND subject_id = ?" : ""}
    `;

    const trendStmt = database.prepare(trendQuery);
    const trendResult = trendStmt.get(...params) as {
      recent: number;
      previous: number;
    };

    // Calculate trend percentage
    let trendPercentage = 0;
    if (trendResult.previous > 0) {
      trendPercentage = Math.round(
        ((trendResult.recent - trendResult.previous) / trendResult.previous) *
          100,
      );
    }

    return {
      total: result.total,
      trend: {
        value: Math.abs(trendPercentage),
        isPositive: trendPercentage <= 0, // Decrease is positive for missing visits
      },
    };
  } catch (error) {
    console.error("Error fetching missing visits KPI:", error);
    return {
      total: 0,
      trend: { value: 0, isPositive: true },
    };
  }
}

// Get comprehensive KPI Summary (all-time data without trends)
export function getKPISummaryWithTrends(
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
) {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Build WHERE clause for filters
    let whereClause = "WHERE 1=1";
    if (region && region !== "ALL") {
      whereClause += " AND region = ?";
      params.push(region);
    }
    if (country && country !== "ALL") {
      whereClause += " AND country = ?";
      params.push(country);
    }
    if (siteId && siteId !== "ALL") {
      whereClause += " AND site_id = ?";
      params.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      whereClause += " AND subject_id = ?";
      params.push(subjectId);
    }

    // Get all-time aggregated metrics from subject_level_metrics
    const metricsQuery = `
      SELECT 
        SUM(missing_visits) as totalMissingVisits,
        SUM(total_queries) as openQueries,
        SUM(uncoded_terms) as uncodedTerms
      FROM subject_level_metrics
      ${whereClause}
    `;

    const stmt = database.prepare(metricsQuery);
    const metrics = stmt.get(...params) as {
      totalMissingVisits: number;
      openQueries: number;
      uncodedTerms: number;
    };

    // Get SAE count from sae_issues table (all-time)
    // Note: sae_issues doesn't have region column, only country, site_id, subject_id
    const saeParams: string[] = [];
    let saeWhereClause = "WHERE 1=1";

    if (country && country !== "ALL") {
      saeWhereClause += " AND country = ?";
      saeParams.push(country);
    }
    if (siteId && siteId !== "ALL") {
      saeWhereClause += " AND site_id = ?";
      saeParams.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      saeWhereClause += " AND subject_id = ?";
      saeParams.push(subjectId);
    }

    const saeQuery = `
      SELECT COUNT(*) as saeCount
      FROM sae_issues
      ${saeWhereClause}
      AND (action_status = 'Pending' OR review_status = 'Pending for Review')
    `;

    const saeStmt = database.prepare(saeQuery);
    const saeResult = saeStmt.get(...saeParams) as { saeCount: number };

    return {
      summary: {
        totalMissingVisits: metrics.totalMissingVisits || 0,
        openQueries: metrics.openQueries || 0,
        uncodedTerms: metrics.uncodedTerms || 0,
        seriousAdverseEvents: saeResult.saeCount || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching KPI summary:", error);
    return {
      summary: {
        totalMissingVisits: 0,
        openQueries: 0,
        uncodedTerms: 0,
        seriousAdverseEvents: 0,
      },
    };
  }
}

// Close the database connection
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
