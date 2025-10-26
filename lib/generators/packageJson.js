const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const initializePackageJson = (projectName, packageManager) => {
  try {
    if (packageManager === 'pnpm') {
      execSync('pnpm init', { cwd: projectName, stdio: 'pipe' });
    } else {
      execSync(`${packageManager} init -y`, { cwd: projectName, stdio: 'pipe' });
    }
  } catch (error) {
    console.warn(`\n[!] Failed to initialize with ${packageManager}. Falling back to npm...`);
    try {
      execSync('npm init -y', { cwd: projectName, stdio: 'pipe' });
      console.log('[+] Successfully initialized with npm.');
      return 'npm';
    } catch (npmError) {
      console.error('\n[!!] Critical error: Failed to initialize project.');
      throw npmError;
    }
  }
  return packageManager;
};

const updatePackageJson = (projectName, language, includeJest, includeSwagger) => {
  const pkgPath = path.join(projectName, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  
  const extension = language === 'TypeScript' ? 'ts' : 'js';
  
  pkg.main = `src/index.${extension}`;
  pkg.scripts = {};
  
  if (language === 'TypeScript') {
    pkg.scripts.dev = 'ts-node-dev --respawn --transpile-only src/index.ts';
    pkg.scripts.build = 'tsc';
    pkg.scripts.start = 'node dist/index.js';
  } else {
    pkg.scripts.dev = 'nodemon src/index.js';
    pkg.scripts.start = 'node src/index.js';
  }
  
  if (includeJest) {
    pkg.scripts.test = 'jest --passWithNoTests';
  }

  if (includeSwagger) {
    if (language === 'TypeScript') {
      pkg.scripts.swagger = 'ts-node src/swagger.ts';
    } else {
      pkg.scripts.swagger = 'node src/swagger.js';
    }
  }
  
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
};

module.exports = { initializePackageJson, updatePackageJson };