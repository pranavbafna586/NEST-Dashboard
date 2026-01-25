import { getSitePerformanceData } from "./queries/site-performance";

console.log("=== Testing Site Performance Query ===\n");

// Test 1: Get all sites with signature backlog
console.log("1. All Sites with Signature Backlog:");
const allSites = getSitePerformanceData();
console.log(JSON.stringify(allSites, null, 2));
console.log(`Total sites with backlog: ${allSites.length}\n`);

// Test 2: Filter by study
console.log("2. Filtered by Study (first study from results):");
if (allSites.length > 0) {
  // Get unique studies from results
  const studies = [...new Set(allSites.map((s: any) => s.region))];
  console.log(`Available regions: ${studies.join(", ")}`);
}

// Test 3: Show top 5 sites by signature backlog
console.log("\n3. Top 5 Sites by Signature Backlog:");
const top5 = allSites.slice(0, 5);
top5.forEach((site: any, index: number) => {
  console.log(
    `${index + 1}. ${site.siteId} (${site.country}) - Backlog: ${site.signatureBacklog}, Queries: ${site.openQueries}, Avg Days: ${site.avgDaysOutstanding}`,
  );
});

// Test 4: Summary statistics
console.log("\n4. Summary Statistics:");
if (allSites.length > 0) {
  const totalBacklog = allSites.reduce(
    (sum: number, s: any) => sum + s.signatureBacklog,
    0,
  );
  const totalQueries = allSites.reduce(
    (sum: number, s: any) => sum + s.openQueries,
    0,
  );
  const avgDataQuality =
    allSites.reduce((sum: number, s: any) => sum + s.dataQualityScore, 0) /
    allSites.length;

  console.log(`Total Signature Backlog (>90 days): ${totalBacklog}`);
  console.log(`Total Open Queries: ${totalQueries}`);
  console.log(`Average Data Quality Score: ${avgDataQuality.toFixed(1)}%`);
  console.log(`Total Sites Affected: ${allSites.length}`);
}
