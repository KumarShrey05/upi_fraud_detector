const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'components', 'ui');
const dryRun = process.argv.includes('--dry-run');

console.log(`\\n=== TSX to JS Converter for components/ui/ ===`);
console.log(`Dry run: ${dryRun ? 'YES' : 'NO (will write files)'}\\n`);

// Regex patterns to strip TS types (based on shadcn/ui samples)
const tsStrips = [
  // Remove 'type' imports
  [/^import type {.*}$/gm, ''],

  // Remove type declarations
  [/^\\s*type \\w+ = .*?;$\\n?/gm, ''],

  // Remove prop types like : React.ComponentProps<'div'>
  [/:\\s*React\\.ComponentProps<['"`][^'`]*['`]>|\\s*:\\s*React\\.ComponentProps<typeof [^>]+>/g, ''],

  // VariantProps
  [/:\\s*VariantProps<typeof \\w+>/g, ''],

  // Inline intersections like & { asChild?: boolean }
  [/&\\s*\\{[^{}]*\\}/g, ''],

  // Simple primitives : boolean, : string etc. after param (conservative)
  [/(\\w+(?:\\[\\w+\\])?\\s*(?:=\\s*[^,]+)?)\\s*:\\s*(boolean|number|string|any)/g, '$1'],

  // ComponentProps without tag
  [/:\\s*React\\.ComponentProps\\s*<\\w+>/g, '']
];

function convertTStoJS(content) {
  let converted = content;
  tsStrips.forEach(([regex, repl]) => {
    converted = converted.replace(regex, repl);
  });
  // Clean extra spaces ,, 
converted = converted.replace(/,\s*}/g, '}').replace(/,\s*\)/g, ')')
  .replace(/,+/g, ',')
  .replace(/;;/g, ';')
  .replace(/\s*\n\s*}/g, '}');
  return converted;
}

function processFiles() {
  try {
    const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx'));
    console.log(`Found ${files.length} .tsx files.`);

    files.forEach(filename => {
      const tsPath = path.join(uiDir, filename);
      const jsPath = path.join(uiDir, filename.replace('.tsx', '.js'));
      
      const content = fs.readFileSync(tsPath, 'utf8');
      const converted = convertTStoJS(content);
      
      console.log(`\\n--- ${filename} --> ${path.basename(jsPath)} ---`);
      console.log('Before (first 200 chars):', content.slice(0, 200));
      console.log('After (first 200 chars):', converted.slice(0, 200));
      
      if (!dryRun) {
        fs.writeFileSync(jsPath, converted);
        console.log(`✓ Created ${path.basename(jsPath)}`);
      }
    });

    if (!dryRun) {
      console.log('\\n✓ All conversions complete. Delete old .tsx manually or via command.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

processFiles();

