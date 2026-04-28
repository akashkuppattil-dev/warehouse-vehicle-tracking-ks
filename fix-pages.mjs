import fs from 'fs';
import path from 'path';

const filesToFix = [
  'app/(protected)/vehicles/page.tsx',
  'app/(protected)/my-location/page.tsx',
  'app/(protected)/my-deliveries/page.tsx',
  'app/(protected)/drivers/page.tsx',
  'app/(protected)/deliveries/page.tsx',
  'app/(protected)/tracking/page.tsx'
];

filesToFix.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Remove header block (regex: <header ...> ... </header>)
    content = content.replace(/<header[\s\S]*?<\/header>/, '');
    
    // Replace outer min-h-screen wrapper with something simpler if needed
    content = content.replace(/<div className="min-h-screen bg-gray-50">/, '<div className="mx-auto max-w-7xl space-y-6">');
    
    // Replace <main className="..."> with <div className="...">
    content = content.replace(/<main className="[^"]*">/, '<div>');
    content = content.replace(/<\/main>/g, '</div>');
    
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  } catch (err) {
    console.error(`Error fixing ${file}:`, err.message);
  }
});
