const fs = require('fs');
const path = require('path');

const createDirectoryStructure = (projectName) => {
  const dirs = [
    'src/routes',
    'src/middlewares',
    'src/controllers',
    'src/services',
    'src/utils',
    'src/config',
    'src/interfaces',
    'src/models',
    'src/errors',
    'src/email'
  ];
  
  dirs.forEach(dir => {
    fs.mkdirSync(path.join(projectName, dir), { recursive: true });
  });
};

module.exports = { createDirectoryStructure };