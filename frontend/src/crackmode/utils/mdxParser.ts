import fs from "fs"
import path from "path";
import { parseMDXFiles } from "./helpers/parseMDXFiles";


export async function generateSearchDataFromMDX(
  docsDir: string,
  outputPath: string
): Promise<void> {
  try {
    console.log('🔍 Parsing MDX files...');
    const searchData = await parseMDXFiles(docsDir);

    // sort by section and title
    searchData.sort((a, b) => {
      if (a.section !== b.section) {
        return a.section.localeCompare(b.section);
      }
      return a.title.localeCompare(b.title);
    });

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Write search data
    fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2))

    console.log(`✅ Generated search data for ${searchData.length} documents`);
    console.log(`📁 Output: ${outputPath}`);

    // Log sections found
    const sections = [...new Set(searchData.map(doc => doc.section))];
    console.log(`📚 Sections: ${sections.join(', ')}`);

  } catch (error) {
    console.error('❌ Error generating search data:', error);
    throw error;
  }
}