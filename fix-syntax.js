const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'client/src/pages');
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const p = path.join(dir, file);
    let c = fs.readFileSync(p, 'utf8');
    
    // Fix console.error(`Error deleting video', error);
    if (c.includes("console.error(`Error")) {
      const original = c;
      c = c.replace(/console\.error\(`(Error[^']*)', error\);/g, "console.error('$1', error);");
      
      if (c !== original) {
        fs.writeFileSync(p, c);
        console.log('Fixed ' + file);
      }
    }
  }
});
