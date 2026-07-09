const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `            className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 \${idx === currentHeroImg ? 'opacity-100 z-10' : 'opacity-0 z-0'}\`}`;

const replacement = `            className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 \${idx === currentHeroImg ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated carousel opacity class!');
} else {
  console.log('Target class not found, trying with generic search...');
  const searchStr = 'className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentHeroImg ? \'opacity-100 z-10\' : \'opacity-0 z-0\'}`}';
  if (content.includes(searchStr)) {
    content = content.replace(searchStr, 'className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentHeroImg ? \'opacity-100\' : \'opacity-0 pointer-events-none\'}`}');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully updated carousel opacity class!');
  } else {
    console.log('Could not find target string.');
  }
}
