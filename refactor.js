const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'client', 'src', 'pages');

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if we need to process this file
    if (content.includes('http://localhost:5000')) {
      // Add import statement if not already there
      if (!content.includes('import { API_URL }')) {
        // Find the last import statement
        const importRegex = /import .* from '.*';\n/g;
        let lastImportIndex = 0;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          lastImportIndex = match.index + match[0].length;
        }
        
        content = content.slice(0, lastImportIndex) + `import { API_URL } from '../config';\n` + content.slice(lastImportIndex);
      }
      
      // Replace hardcoded URLs
      // Case 1: Template literals inside axios like axios.post(`http://localhost:5000/api/...`, ...) -> axios.post(`${API_URL}/api/...`, ...)
      content = content.replace(/`http:\/\/localhost:5000\//g, '`${API_URL}/');
      
      // Case 2: Standard strings in axios like axios.get('http://localhost:5000/api/...') -> axios.get(`${API_URL}/api/...`)
      content = content.replace(/'http:\/\/localhost:5000\//g, '`${API_URL}/');
      
      // Ensure we close the newly created template literal correctly if it was a standard string
      // e.g. axios.get(`${API_URL}/api/documents') -> axios.get(`${API_URL}/api/documents`)
      // This regex looks for `${API_URL}/something' and replaces the trailing ' with `
      content = content.replace(/\$\{API_URL\}\/[^']*'/g, match => match.slice(0, -1) + '`');
      
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});
