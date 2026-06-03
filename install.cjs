const { execSync } = require('child_process');
const path = require('path');
const setupPath = path.resolve('dist', 'react-example Setup 0.0.0.exe');
console.log('Installing silently from', setupPath);
execSync('"' + setupPath + '" /S');
console.log('Installation completed');
