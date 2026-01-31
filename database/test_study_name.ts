/**
 * Test the AI study name extractor
 */

import { renameStudyFolderWithAI } from "./studyNameExtractor";
import * as path from "path";

async function test() {
  const testFolder = path.join(
    process.cwd(),
    "Study Files",
    "Study 1"
  );
  
  console.log("Testing AI study name extraction...");
  console.log(`Test folder: ${testFolder}\n`);
  
  const result = await renameStudyFolderWithAI(testFolder);
  
  console.log(`\nResult: ${result}`);
}

test().catch(console.error);
