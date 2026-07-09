const fs = require('fs');
const path = require('path');

function search(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git') {
          search(fullPath);
        }
      } else {
        if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.env') || file.endsWith('.jsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.toLowerCase().includes('kit')) {
            console.log('Found in:', fullPath);
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (line.toLowerCase().includes('kit')) {
                console.log(`  Line ${idx + 1}: ${line.trim()}`);
              }
            });
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}
search('../../queuing-system');
