import { getPatient360Data } from "./queries/patient-360";

console.log("=== TESTING REDESIGNED PATIENT 360 VIEW ===\n");

// Test with Subject 9 (known to have data)
const patient360 = getPatient360Data("Subject 9");

if (patient360) {
  console.log("📋 PATIENT OVERVIEW");
  console.log("━".repeat(60));
  console.log(`Subject: ${patient360.subject.subjectId}`);
  console.log(
    `Site: ${patient360.subject.siteId} | ${patient360.subject.country} | ${patient360.subject.region}`,
  );
  console.log(
    `Status: ${patient360.subject.status} | Latest Visit: ${patient360.subject.latestVisit}`,
  );
  console.log(
    `High Risk: ${patient360.subject.isHighRisk ? "⚠️ YES" : "✅ NO"}`,
  );
  console.log(`Data Quality Score: ${patient360.dataQuality.score}%`);
  console.log();

  console.log("📊 KEY METRICS SUMMARY");
  console.log("━".repeat(60));
  console.log(`Pages Entered: ${patient360.subject.pagesEntered}`);
  console.log(`Expected Visits: ${patient360.subject.expectedVisits}`);
  console.log(`Total Queries: ${patient360.subject.totalQueries}`);
  console.log(`Missing Visits: ${patient360.subject.missingVisits}`);
  console.log(`Missing Pages: ${patient360.subject.missingPages}`);
  console.log();

  console.log("🏥 VISIT SUMMARY");
  console.log("━".repeat(60));
  console.log(`Completed Visits: ${patient360.visitSummary.completedVisits}`);
  console.log(`Missing Visits: ${patient360.visitSummary.missingVisits}`);
  console.log(`Upcoming Visits: ${patient360.visitSummary.upcomingVisits}`);
  console.log("\n📅 Recent Visits (Last 5):");
  patient360.visitSummary.recentVisits.slice(0, 5).forEach((visit, idx) => {
    console.log(
      `  ${idx + 1}. ${visit.visitName} - ${visit.visitDate || "No date"}`,
    );
  });
  console.log();

  console.log("⚠️ CRITICAL MISSING VISITS (>30 Days Overdue)");
  console.log("━".repeat(60));
  if (patient360.criticalMissingVisits.length === 0) {
    console.log("✅ No critical missing visits");
  } else {
    patient360.criticalMissingVisits.forEach((mv, idx) => {
      console.log(
        `  ${idx + 1}. ${mv.visitName} - ${mv.daysOutstanding} days overdue (Due: ${mv.projectedDate})`,
      );
    });
  }
  console.log();

  console.log("❓ QUERIES BREAKDOWN");
  console.log("━".repeat(60));
  console.log(`Total Open Queries: ${patient360.queries.total}`);
  console.log("\nBy Type:");
  console.log(`  • DM Queries: ${patient360.queries.byType.dmQueries}`);
  console.log(
    `  • Clinical Queries: ${patient360.queries.byType.clinicalQueries}`,
  );
  console.log(
    `  • Medical Queries: ${patient360.queries.byType.medicalQueries}`,
  );
  console.log(`  • Site Queries: ${patient360.queries.byType.siteQueries}`);
  console.log(
    `  • Field Monitor Queries: ${patient360.queries.byType.fieldMonitorQueries}`,
  );
  console.log(`  • Coding Queries: ${patient360.queries.byType.codingQueries}`);
  console.log(`  • Safety Queries: ${patient360.queries.byType.safetyQueries}`);

  if (
    patient360.queries.openQueryDetails &&
    patient360.queries.openQueryDetails.length > 0
  ) {
    console.log("\n🔍 Recent Open Query Details (Top 5):");
    patient360.queries.openQueryDetails.slice(0, 5).forEach((query, idx) => {
      console.log(
        `  ${idx + 1}. Form: ${query.formName} | Visit: ${query.visitName}`,
      );
      console.log(
        `     Type: ${query.markingGroupName} | Owner: ${query.actionOwner} | Days Open: ${query.daysOpen}`,
      );
    });
  }
  console.log();

  console.log("🚨 SAFETY ISSUES (SAEs)");
  console.log("━".repeat(60));
  console.log(`Total SAEs: ${patient360.safetyIssues.totalSAEs}`);
  console.log(`Open SAEs: ${patient360.safetyIssues.openSAEs}`);
  console.log("\nBy Status:");
  console.log(`  • Open: ${patient360.safetyIssues.saesByStatus.open}`);
  console.log(`  • Closed: ${patient360.safetyIssues.saesByStatus.closed}`);
  console.log(`  • Locked: ${patient360.safetyIssues.saesByStatus.locked}`);

  if (patient360.safetyIssues.recentSAEs.length > 0) {
    console.log("\n📋 Recent SAEs (Top 3):");
    patient360.safetyIssues.recentSAEs.slice(0, 3).forEach((sae, idx) => {
      console.log(
        `  ${idx + 1}. ID: ${sae.discrepancyId} | Form: ${sae.formName}`,
      );
      console.log(
        `     Status: ${sae.caseStatus} | Responsible: ${sae.responsibleLF}`,
      );
      console.log(`     Created: ${sae.createdTimestamp}`);
    });
  }
  console.log();

  console.log("📊 DATA QUALITY ISSUES");
  console.log("━".repeat(60));
  console.log(`Quality Score: ${patient360.dataQuality.score}%`);
  console.log(
    `Non-Conformant Pages: ${patient360.dataQuality.nonConformantPages}`,
  );
  console.log(`Open Lab Issues: ${patient360.dataQuality.openLabIssues}`);
  console.log(`Open EDRR Issues: ${patient360.dataQuality.openEDRRIssues}`);
  console.log(`Uncoded Terms: ${patient360.dataQuality.uncodedTerms}`);
  console.log();

  console.log("✅ COMPLIANCE STATUS");
  console.log("━".repeat(60));
  console.log(
    `Forms Require Verification: ${patient360.complianceStatus.formsRequireVerification}`,
  );
  console.log(`Forms Verified: ${patient360.complianceStatus.formsVerified}`);
  console.log(
    `CRFs Overdue >90 Days: ${patient360.complianceStatus.crfsOverdue90Days}`,
  );
  console.log(
    `CRFs Overdue 45-90 Days: ${patient360.complianceStatus.crfsOverdue45to90Days}`,
  );
  console.log(
    `Broken Signatures: ${patient360.complianceStatus.brokenSignatures}`,
  );
  console.log(
    `CRFs Never Signed: ${patient360.complianceStatus.crfsNeverSigned}`,
  );
  console.log(`PDs Confirmed: ${patient360.complianceStatus.pdsConfirmed}`);
  console.log();

  console.log("📁 FORM STATUS");
  console.log("━".repeat(60));
  console.log(`Frozen Forms: ${patient360.formStatus.frozen}`);
  console.log(`Locked Forms: ${patient360.formStatus.locked}`);
  console.log(`Unlocked Forms: ${patient360.formStatus.unlocked}`);
  console.log();

  // Test with another subject
  console.log("\n" + "=".repeat(60));
  console.log("TESTING WITH HIGH QUERY SUBJECT (Subject 80)");
  console.log("=".repeat(60) + "\n");

  const patient80 = getPatient360Data("Subject 80");
  if (patient80) {
    console.log(
      `Subject: ${patient80.subject.subjectId} | Status: ${patient80.subject.status}`,
    );
    console.log(`Total Queries: ${patient80.queries.total}`);
    console.log(`Query Breakdown:`);
    console.log(
      `  DM: ${patient80.queries.byType.dmQueries} | Clinical: ${patient80.queries.byType.clinicalQueries} | Site: ${patient80.queries.byType.siteQueries}`,
    );
    console.log(`Data Quality Score: ${patient80.dataQuality.score}%`);
    console.log(
      `High Risk: ${patient80.subject.isHighRisk ? "⚠️ YES" : "✅ NO"}`,
    );
  }
} else {
  console.log("❌ No data found for Subject 9");
}

console.log("\n✅ Patient 360 redesign test complete!");
