import { getDatabase } from "./db";

const db = getDatabase();

// Check query types
const queryTypes = db
  .prepare(
    `
  SELECT marking_group_name, COUNT(*) as count 
  FROM query_report 
  WHERE marking_group_name IS NOT NULL AND marking_group_name != ''
  GROUP BY marking_group_name 
  ORDER BY count DESC
`,
  )
  .all();

console.log("Query Types Distribution:");
console.log(JSON.stringify(queryTypes, null, 2));

// Check signature status
const signatureStatus = db
  .prepare(
    `
  SELECT 
    SUM(CASE WHEN no_of_days < 45 THEN 1 ELSE 0 END) as within_45_days,
    SUM(CASE WHEN no_of_days >= 45 AND no_of_days < 90 THEN 1 ELSE 0 END) as days_45_to_90,
    SUM(CASE WHEN no_of_days >= 90 THEN 1 ELSE 0 END) as beyond_90_days,
    SUM(CASE WHEN page_require_signature LIKE '%Broken%' THEN 1 ELSE 0 END) as broken_signatures,
    SUM(CASE WHEN page_require_signature LIKE '%Never%' THEN 1 ELSE 0 END) as never_signed
  FROM pi_signature_report
`,
  )
  .get();

console.log("\nSignature Status:");
console.log(JSON.stringify(signatureStatus, null, 2));
