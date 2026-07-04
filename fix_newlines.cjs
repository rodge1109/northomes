const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// The file was messed up by joining with '\\n'. Let's replace the literal '\\n' with actual '\n'
code = code.split('\\n').join('\n');

fs.writeFileSync('src/App.jsx', code);
console.log('Restored newlines in App.jsx');
