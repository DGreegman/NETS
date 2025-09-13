#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { execSync, spawn } = require('child_process');
const ora = require('ora');

const getPackageManager = () => {
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

const installPackages = (projectName, packages, dev = false) => {
  return new Promise((resolve, reject) => {
    const packageManager = getPackageManager();
    const spinner = ora(`Installing ${dev ? 'dev ' : ''}dependencies with ${packageManager}...`).start();
    
    let args;
    if (packageManager === 'yarn') {
      args = ['add', ...(dev ? ['-D'] : []), ...packages];
    } else if (packageManager === 'pnpm') {
      args = ['add', ...(dev ? ['-D'] : []), ...packages];
    } else {
      args = ['install', dev ? '--save-dev' : '--save', ...packages];
    }

    const child = spawn(packageManager, args, { cwd: projectName, stdio: 'pipe', shell: true });

    child.on('close', (code) => {
      if (code !== 0) {
        spinner.fail('Installation failed.');
        reject(new Error(`${packageManager} install failed`));
        return;
      }
      spinner.succeed('Dependencies installed.');
      resolve();
    });
  });
};

const createCommonFiles = (projectName) => {
  // Create .gitignore
  const gitignoreContent = 'node_modules\n.env\n';
  fs.writeFileSync(path.join(projectName, '.gitignore'), gitignoreContent);

  // Create .env
  const envContent = 'PORT=8080';
  fs.writeFileSync(path.join(projectName, '.env'), envContent);
};

const setupTypeScript = async (projectName) => {
  // Create directory structure
  fs.mkdirSync(projectName);
  fs.mkdirSync(path.join(projectName, 'src'));
  fs.mkdirSync(path.join(projectName, 'src', 'routes'));
  fs.mkdirSync(path.join(projectName, 'src', 'middlewares'));
  fs.mkdirSync(path.join(projectName, 'src', 'controllers'));
  fs.mkdirSync(path.join(projectName, 'src', 'services'));
  fs.mkdirSync(path.join(projectName, 'src', 'utils'));
  fs.mkdirSync(path.join(projectName, 'src', 'config'));
  fs.mkdirSync(path.join(projectName, 'src', 'interfaces'));
  fs.mkdirSync(path.join(projectName, 'src', 'models'));
  fs.mkdirSync(path.join(projectName, 'src', 'errors'));
  fs.mkdirSync(path.join(projectName, 'src', 'email'));

  createCommonFiles(projectName);

  // Copy template files
  const templateDir = path.join(__dirname, '..', 'templates');
  fs.copyFileSync(path.join(templateDir, 'typescript', 'tsconfig.json'), path.join(projectName, 'tsconfig.json'));
  fs.copyFileSync(path.join(templateDir, 'express', 'index.ts'), path.join(projectName, 'src', 'index.ts'));
  fs.copyFileSync(path.join(templateDir, 'typescript', '.eslintrc.json'), path.join(projectName, '.eslintrc.json'));
  fs.copyFileSync(path.join(templateDir, 'typescript', '.prettierrc.json'), path.join(projectName, '.prettierrc.json'));

  // Initialize package manager
  const packageManager = getPackageManager();
  if (packageManager === 'pnpm') {
    execSync(`${packageManager} init`, { cwd: projectName });
  } else {
    execSync(`${packageManager} init -y`, { cwd: projectName });
  }

  // Install packages
  await installPackages(projectName, ['express', 'dotenv']);
  await installPackages(projectName, ['typescript', 'ts-node', '@types/express', '@types/node', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'eslint', 'eslint-config-prettier', 'eslint-plugin-prettier', 'prettier', 'ts-node-dev'], true);

  // Add scripts to package.json
  const pkgJsonPath = path.join(projectName, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  pkgJson.scripts = {};
  pkgJson.main = 'src/index.ts';
  pkgJson.scripts.dev = 'ts-node-dev --respawn --transpile-only src/index.ts';
  pkgJson.scripts.build = 'tsc';
  pkgJson.scripts.start = 'node dist/index.js';
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
};

const setupJavaScript = async (projectName) => {
  // Create directory structure
  fs.mkdirSync(projectName);
  fs.mkdirSync(path.join(projectName, 'src'));
  fs.mkdirSync(path.join(projectName, 'src', 'routes'));
  fs.mkdirSync(path.join(projectName, 'src', 'middlewares'));
  fs.mkdirSync(path.join(projectName, 'src', 'controllers'));
  fs.mkdirSync(path.join(projectName, 'src', 'services'));
  fs.mkdirSync(path.join(projectName, 'src', 'utils'));
  fs.mkdirSync(path.join(projectName, 'src', 'config'));
  fs.mkdirSync(path.join(projectName, 'src', 'interfaces'));
  fs.mkdirSync(path.join(projectName, 'src', 'models'));
  fs.mkdirSync(path.join(projectName, 'src', 'errors'));
  fs.mkdirSync(path.join(projectName, 'src', 'email'));

  createCommonFiles(projectName);

  // Copy template files
  const templateDir = path.join(__dirname, '..', 'templates');
  fs.copyFileSync(path.join(templateDir, 'express', 'index.js'), path.join(projectName, 'src', 'index.js'));
  fs.copyFileSync(path.join(templateDir, 'javascript', '.eslintrc.json'), path.join(projectName, '.eslintrc.json'));
  fs.copyFileSync(path.join(templateDir, 'javascript', '.prettierrc.json'), path.join(projectName, '.prettierrc.json'));

  // Initialize package manager
  let packageManager = getPackageManager();
  try {
    if (packageManager === 'pnpm') {
      execSync(`${packageManager} init`, { cwd: projectName, stdio: 'inherit' });
    } else {
      execSync(`${packageManager} init -y`, { cwd: projectName, stdio: 'inherit' });
    }
  } catch (error) {
    console.warn(`
[!] Failed to initialize with ${packageManager}. Attempting to fall back to npm...`);
    packageManager = 'npm';
    try {
      execSync('npm init -y', { cwd: projectName, stdio: 'inherit' });
      console.log('[+] Successfully initialized with npm.');
    } catch (npmError) {
      console.error(`
[!!] Critical error: Failed to initialize project with npm as well.`);
      console.error('Please ensure Node.js and npm are installed correctly and try again.');
      throw npmError;
    }
  }

  // Install packages
  await installPackages(projectName, ['express', 'dotenv']);
  await installPackages(projectName, ['nodemon', 'eslint', 'prettier'], true);

  // Add scripts to package.json
  const pkgJsonPath = path.join(projectName, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  pkgJson.scripts = {};
  pkgJson.main = 'src/index.js';
  pkgJson.scripts.dev = 'nodemon src/index.js';
  pkgJson.scripts.start = 'node src/index.js';
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
};

const init = async () => {
  const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key && value) {
      acc[key.replace(/^--/, '')] = value;
    }
    return acc;
  }, {});

  let { projectName, language } = args;

  if (!projectName || !language) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your project?',
        default: 'my-express-app',
      },
      {
        type: 'list',
        name: 'language',
        message: 'Choose a language for your project:',
        choices: ['TypeScript', 'JavaScript'],
      },
    ]);
    projectName = answers.projectName;
    language = answers.language;
  }

  if (language !== 'TypeScript' && language !== 'JavaScript') {
    console.error(`Error: Invalid language "${language}". Please choose 'TypeScript' or 'JavaScript'.`);
    process.exit(1);
  }

  if (language === 'TypeScript') {
    await setupTypeScript(projectName);
  } else {
    await setupJavaScript(projectName);
  }

  console.log(`\nProject ${projectName} is set up and ready to go!`);
  console.log(`\nTo get started, navigate to the project directory and run the following commands:\n`);
  console.log(`cd ${projectName}`);
  const packageManager = getPackageManager();
  console.log(`${packageManager} run dev`);
};

init();
