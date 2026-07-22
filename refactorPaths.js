const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'client', 'src', 'pages');

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We are looking for `${API_URL}/${xxx.path}` and want to replace it with 
    // `${xxx.path.startsWith('http') ? xxx.path : \`\${API_URL}/\${xxx.path}\`}`
    
    const regex = /\$\{API_URL\}\/\$\{([a-zA-Z0-9_]+)\.path\}/g;
    
    let modified = false;
    content = content.replace(regex, (match, p1) => {
      modified = true;
      return `\${${p1}.path.startsWith('http') ? ${p1}.path : \`\${API_URL}/\${${p1}.path}\`}`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated paths in ${file}`);
    }
  }
});
