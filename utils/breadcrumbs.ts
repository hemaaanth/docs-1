import * as fs from 'fs/promises';
import * as path from 'path';

const rootDir = path.join(process.cwd(), 'pages');
const errors: string[] = [];

async function checkDirectory(dirPath: string): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip if it's the root directory
      if (fullPath === rootDir) continue;
      
      // Check if breadcrumb file exists for this directory
      const breadcrumbFile = path.join(dirPath, `${entry.name}.mdx`);
      try {
        await fs.access(breadcrumbFile);
      } catch {
        const relativePath = path.relative(rootDir, dirPath);
        errors.push(`Missing breadcrumb file for directory: ${relativePath}/${entry.name}`);
      }
      
      // Recursively check subdirectories
      await checkDirectory(fullPath);
    }
  }
}

async function main() {
  try {
    await checkDirectory(rootDir);
    
    if (errors.length > 0) {
      console.error('Breadcrumb check failed:');
      errors.forEach(error => console.error(`- ${error}`));
      process.exit(1);
    } else {
      console.log('All directories have breadcrumb files.');
    }
  } catch (error) {
    console.error('Error checking breadcrumbs:', error);
    process.exit(1);
  }
}

main();