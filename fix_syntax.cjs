const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '    "/assets/images/gallery/bathroom.jpg"\n  ];\n\n  const nextImg = (e) => {',
  '    "/assets/images/gallery/bathroom.jpg"\n  ]);\n\n  const nextImg = (e) => {'
);
content = content.replace(
  '    "/assets/images/gallery/bathroom.jpg"\r\n  ];\r\n\r\n  const nextImg = (e) => {',
  '    "/assets/images/gallery/bathroom.jpg"\r\n  ]);\r\n\r\n  const nextImg = (e) => {'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error in App.jsx');
