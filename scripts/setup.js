#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { execSync, spawn } = require('child_process');
const ora = require('ora');

const installPackages = (projectName, packages, dev = false) => {
  return new Promise((resolve, reject) => {
    const spinner = ora(`Installing ${dev ? 'dev ' : ''}dependencies...`).start();
    const command = 'npm';
    const args = ['install', dev ? '--save-dev' : '--save', ...packages];

    const child = spawn(command, args, { cwd: projectName, stdio: 'pipe' });

    child.on('close', (code) => {
      if (code !== 0) {
        spinner.fail('Installation failed.');
        reject(new Error('npm install failed'));
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
  fs.mkdirSync(`${projectName}/src`);
  fs.mkdirSync(`${projectName}/src/routes`);
  fs.mkdirSync(`${projectName}/src/middlewares`);
  fs.mkdirSync(`${projectName}/src/controllers`);
  fs.mkdirSync(`${projectName}/src/services`);
  fs.mkdirSync(`${projectName}/src/utils`);
  fs.mkdirSync(`${projectName}/src/config`);
  fs.mkdirSync(`${projectName}/src/interfaces`);
  fs.mkdirSync(`${projectName}/src/models`);
  fs.mkdirSync(`${projectName}/src/errors`);
  fs.mkdirSync(`${projectName}/src/email`);

  createCommonFiles(projectName);

  // Copy template files
  const templateDir = path.join(__dirname, '..', 'templates');
  fs.copyFileSync(path.join(templateDir, 'typescript', 'tsconfig.json'), path.join(projectName, 'tsconfig.json'));
  fs.copyFileSync(path.join(templateDir, 'express', 'index.ts'), path.join(projectName, 'src', 'index.ts'));
  fs.copyFileSync(path.join(templateDir, 'typescript', '.eslintrc.json'), path.join(projectName, '.eslintrc.json'));
  fs.copyFileSync(path.join(templateDir, 'typescript', '.prettierrc.json'), path.join(projectName, '.prettierrc.json'));

  // Initialize npm
  execSync(`cd ${projectName} && npm init -y`);

  // Install packages
  await installPackages(projectName, ['express', 'dotenv']);
  await installPackages(projectName, ['typescript', 'ts-node', '@types/express', '@types/node', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'eslint', 'eslint-config-prettier', 'eslint-plugin-prettier', 'prettier', 'ts-node-dev'], true);

  // Add scripts to package.json
  const pkgJsonPath = path.join(projectName, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  pkgJson.main = 'src/index.ts';
  pkgJson.scripts.dev = 'ts-node-dev --respawn --transpile-only src/index.ts';
  pkgJson.scripts.build = 'tsc';
  pkgJson.scripts.start = 'node dist/index.js';
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
};

const setupJavaScript = async (projectName) => {
  // Create directory structure
  fs.mkdirSync(projectName);
  fs.mkdirSync(`${projectName}/src`);
  fs.mkdirSync(`${projectName}/src/routes`);
  fs.mkdirSync(`${projectName}/src/middlewares`);
  fs.mkdirSync(`${projectName}/src/controllers`);
  fs.mkdirSync(`${projectName}/src/services`);
  fs.mkdirSync(`${projectName}/src/utils`);
  fs.mkdirSync(`${projectName}/src/config`);
  fs.mkdirSync(`${projectName}/src/interfaces`);
  fs.mkdirSync(`${projectName}/src/models`);
  fs.mkdirSync(`${projectName}/src/errors`);
  fs.mkdirSync(`${projectName}/src/email`);

  createCommonFiles(projectName);

  // Copy template files
  const templateDir = path.join(__dirname, '..', 'templates');
  fs.copyFileSync(path.join(templateDir, 'express', 'index.js'), path.join(projectName, 'src', 'index.js'));
  fs.copyFileSync(path.join(templateDir, 'javascript', '.eslintrc.json'), path.join(projectName, '.eslintrc.json'));
  fs.copyFileSync(path.join(templateDir, 'javascript', '.prettierrc.json'), path.join(projectName, '.prettierrc.json'));

  // Initialize npm
  execSync(`cd ${projectName} && npm init -y`);

  // Install packages
  await installPackages(projectName, ['express', 'dotenv']);
  await installPackages(projectName, ['nodemon', 'eslint', 'prettier'], true);

  // Add scripts to package.json
  const pkgJsonPath = path.join(projectName, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  pkgJson.main = 'src/index.js';
  pkgJson.scripts.dev = 'nodemon src/index.js';
  pkgJson.scripts.start = 'node src/index.js';
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
};

const init = async () => {
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

  const { projectName, language } = answers;

  if (language === 'TypeScript') {
    await setupTypeScript(projectName);
  } else {
    await setupJavaScript(projectName);
  }

  console.log(`\nProject ${projectName} is set up and ready to go!`);
  console.log(`\nTo get started, navigate to the project directory and run the following commands:\n`);
  console.log(`cd ${projectName}`);
  console.log(`npm run dev`);
};

init();
