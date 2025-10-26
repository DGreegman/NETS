const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const getPackageManager = () => {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.startsWith('pnpm')) return 'pnpm';
    if (userAgent.startsWith('yarn')) return 'yarn';
    if (userAgent.startsWith('npm')) return 'npm';
  }
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch (e) {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch (e) {
      return 'npm';
    }
  }
};

const installAllPackages = (projectName, dependencies, devDependencies, packageManager) => {
  return new Promise((resolve, reject) => {
    const ora = require('ora');
    const spinner = ora(`Installing dependencies with ${packageManager}...`).start();
    
    let args;
    const allDeps = [...dependencies];
    const allDevDeps = [...devDependencies];
    
    if (packageManager === 'yarn') {
      args = ['add', '--silent'];
      if (allDeps.length > 0) {
        args.push(...allDeps);
      }
      if (allDevDeps.length > 0) {
        args.push('--dev', ...allDevDeps);
      }
    } else if (packageManager === 'pnpm') {
      args = ['add', '--reporter', 'silent'];
      if (allDeps.length > 0) {
        args.push(...allDeps);
      }
      if (allDevDeps.length > 0) {
        args.push('-D', ...allDevDeps);
      }
    } else {
      args = ['install', '--silent', '--no-audit', '--no-fund'];
      if (allDeps.length > 0) {
        args.push(...allDeps);
      }
      if (allDevDeps.length > 0) {
        args.push(...allDevDeps);
      }
    }

    const child = spawn(packageManager, args, { 
      cwd: projectName, 
      stdio: 'pipe',
      shell: true 
    });

    child.on('close', (code) => {
      if (code !== 0) {
        spinner.fail('Installation failed.');
        reject(new Error(`${packageManager} install failed`));
        return;
      }
      
      if (packageManager === 'npm' && allDevDeps.length > 0) {
        const pkgPath = path.join(projectName, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        
        pkg.devDependencies = pkg.devDependencies || {};
        pkg.dependencies = pkg.dependencies || {};
        
        allDevDeps.forEach(dep => {
          let depName;
          if (dep.startsWith('@')) {
            const parts = dep.split('/');
            if (parts.length >= 2) {
              const secondPart = parts[1].split('@')[0];
              depName = `${parts[0]}/${secondPart}`;
            }
          } else {
            depName = dep.split('@')[0];
          }
          
          if (depName && pkg.dependencies[depName]) {
            pkg.devDependencies[depName] = pkg.dependencies[depName];
            delete pkg.dependencies[depName];
          }
        });
        
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      }
      
      spinner.succeed('Dependencies installed.');
      resolve();
    });
  });
};

module.exports = { getPackageManager, installAllPackages };