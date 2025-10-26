#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { execSync, spawn } = require('child_process');
const ora = require('ora');

// Start timing the setup process
const startTime = process.hrtime();

// ==================== UTILITY FUNCTIONS ====================

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

const validateProjectName = (name) => {
  if (!name || name.trim() === '') {
    return 'Project name cannot be empty';
  }
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return 'Project name can only contain letters, numbers, hyphens, and underscores';
  }
  if (fs.existsSync(name)) {
    return `Directory "${name}" already exists`;
  }
  return true;
};

// ==================== FILE GENERATORS ====================

const generateIndexFile = (language) => {
  if (language === 'TypeScript') {
    return `import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
  } else {
    return `const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
  }
};

const generateTsConfig = () => {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      moduleResolution: 'node'
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  }, null, 2);
};

const generateEslintConfig = (language) => {
  if (language === 'TypeScript') {
    return JSON.stringify({
      parser: '@typescript-eslint/parser',
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
      ],
      plugins: ['@typescript-eslint', 'prettier'],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
      },
      env: {
        node: true,
        es6: true
      }
    }, null, 2);
  } else {
    return JSON.stringify({
      extends: ['eslint:recommended', 'prettier'],
      plugins: ['prettier'],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      rules: {
        'prettier/prettier': 'error',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
      },
      env: {
        node: true,
        es6: true
      }
    }, null, 2);
  }
};

const generatePrettierConfig = () => {
  return JSON.stringify({
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2
  }, null, 2);
};

const generateGitignore = () => {
  return `node_modules
.env
dist
*.log
.DS_Store
coverage
.vscode
.idea
`;
};

const generateEnvFile = (database) => {
  let content = 'PORT=8080\n';
  
  if (database === 'Mongoose') {
    content += 'DATABASE_URL=mongodb://localhost:27017/myapp\n';
  } else if (database === 'Sequelize') {
    content += 'DATABASE_URL=postgresql://user:password@localhost:5432/myapp\n';
  } else if (database === 'Prisma') {
    content += 'DATABASE_URL="postgresql://user:password@localhost:5432/myapp"\n';
  }
  
  return content;
};

const generateDatabaseConfig = (language, database) => {
  const extension = language === 'TypeScript' ? 'ts' : 'js';
  
  if (database === 'Mongoose') {
    if (language === 'TypeScript') {
      return `import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL || '');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error}\`);
    process.exit(1);
  }
};

export default connectDB;
`;
    } else {
      return `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL || '');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error}\`);
    process.exit(1);
  }
};

module.exports = connectDB;
`;
    }
  } else if (database === 'Sequelize') {
    if (language === 'TypeScript') {
      return `import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: false,
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

export default sequelize;
`;
    } else {
      return `const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
`;
    }
  } else if (database === 'Prisma') {
    if (language === 'TypeScript') {
      return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
`;
    } else {
      return `const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
`;
    }
  }
  
  return '';
};

const generateJestConfig = (language) => {
  return `module.exports = {
  preset: '${language === 'TypeScript' ? 'ts-jest' : ''}',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.${language === 'TypeScript' ? 'ts' : 'js'}'],
  testMatch: ['**/__tests__/**/*.test.${language === 'TypeScript' ? 'ts' : 'js'}'],
};
`;
};

// ==================== SETUP FUNCTIONS ====================

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

const createAllFiles = (projectName, language, database, includeJest) => {
  const extension = language === 'TypeScript' ? 'ts' : 'js';
  
  const files = {
    '.gitignore': generateGitignore(),
    '.env': generateEnvFile(database),
    '.prettierrc.json': generatePrettierConfig(),
    '.eslintrc.json': generateEslintConfig(language),
    [`src/index.${extension}`]: generateIndexFile(language),
  };
  
  if (language === 'TypeScript') {
    files['tsconfig.json'] = generateTsConfig();
  }
  
  if (database && database !== 'None') {
    files[`src/config/db.${extension}`] = generateDatabaseConfig(language, database);
  }
  
  if (includeJest) {
    files['jest.config.js'] = generateJestConfig(language);
  }
  
  Object.entries(files).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(projectName, filename), content);
  });
};

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

const updatePackageJson = (projectName, language, includeJest) => {
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
    pkg.scripts.test = 'jest';
  }
  
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
};

const installAllPackages = (projectName, dependencies, devDependencies, packageManager) => {
  return new Promise((resolve, reject) => {
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
      // npm - install both types at once
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
      
      // For npm, we need to move packages to devDependencies
      if (packageManager === 'npm' && allDevDeps.length > 0) {
        const pkgPath = path.join(projectName, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        
        pkg.devDependencies = pkg.devDependencies || {};
        pkg.dependencies = pkg.dependencies || {};
        
        allDevDeps.forEach(dep => {
          // Handle scoped packages like @types/express correctly
          let depName;
          if (dep.startsWith('@')) {
            // Scoped package: @scope/package or @scope/package@version
            const parts = dep.split('/');
            if (parts.length >= 2) {
              const secondPart = parts[1].split('@')[0]; // Remove version if exists
              depName = `${parts[0]}/${secondPart}`;
            }
          } else {
            // Regular package: package or package@version
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

const getDependencies = (language, database, includeJest) => {
  const dependencies = ['express', 'dotenv'];
  const devDependencies = [];
  
  // Language-specific dependencies
  if (language === 'TypeScript') {
    devDependencies.push(
      'typescript',
      'ts-node',
      '@types/express',
      '@types/node',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint',
      'eslint-config-prettier',
      'eslint-plugin-prettier',
      'prettier',
      'ts-node-dev'
    );
  } else {
    devDependencies.push('nodemon', 'eslint', 'eslint-config-prettier', 'eslint-plugin-prettier', 'prettier');
  }
  
  // Database dependencies
  if (database === 'Mongoose') {
    dependencies.push('mongoose');
  } else if (database === 'Sequelize') {
    dependencies.push('sequelize', 'pg', 'pg-hstore');
    if (language === 'TypeScript') {
      devDependencies.push('@types/sequelize');
    }
  } else if (database === 'Prisma') {
    dependencies.push('@prisma/client');
    devDependencies.push('prisma');
  }
  
  // Jest dependencies
  if (includeJest) {
    devDependencies.push('jest', 'supertest');
    if (language === 'TypeScript') {
      devDependencies.push('@types/jest', '@types/supertest', 'ts-jest');
    }
  }
  
  return { dependencies, devDependencies };
};

// ==================== MAIN FUNCTION ====================

const init = async () => {
  console.log('🚀 Express.js Project Generator\n');
  
  const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key && value) {
      acc[key.replace(/^--/, '')] = value;
    }
    return acc;
  }, {});

  let { projectName, language, database, includeJest } = args;

  if (!projectName || !language || !database || includeJest === undefined) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your project?',
        default: 'my-express-app',
        validate: validateProjectName
      },
      {
        type: 'list',
        name: 'language',
        message: 'Choose a language:',
        choices: ['TypeScript', 'JavaScript'],
      },
      {
        type: 'list',
        name: 'database',
        message: 'Choose a database:',
        choices: ['Mongoose', 'Sequelize', 'Prisma', 'None'],
      },
      {
        type: 'confirm',
        name: 'includeJest',
        message: 'Include Jest for testing?',
        default: true,
      },
    ]);
    
    projectName = answers.projectName;
    language = answers.language;
    database = answers.database;
    includeJest = answers.includeJest;
  } else {
    // Validate when using CLI args
    const validation = validateProjectName(projectName);
    if (validation !== true) {
      console.error(`Error: ${validation}`);
      process.exit(1);
    }
    
    if (language !== 'TypeScript' && language !== 'JavaScript') {
      console.error(`Error: Invalid language "${language}". Choose 'TypeScript' or 'JavaScript'.`);
      process.exit(1);
    }
    
    includeJest = includeJest === 'true';
  }

  const packageManager = getPackageManager();
  
  try {
    // Step 1: Create directory structure
    const structureSpinner = ora('Creating project structure...').start();
    createDirectoryStructure(projectName);
    structureSpinner.succeed('Project structure created.');
    
    // Step 2: Initialize package.json
    const initSpinner = ora('Initializing package.json...').start();
    const finalPackageManager = initializePackageJson(projectName, packageManager);
    initSpinner.succeed('Package.json initialized.');
    
    // Step 3: Create all files
    const filesSpinner = ora('Generating project files...').start();
    createAllFiles(projectName, language, database, includeJest);
    updatePackageJson(projectName, language, includeJest);
    filesSpinner.succeed('Project files generated.');
    
    // Step 4: Handle Prisma initialization
    if (database === 'Prisma') {
      const prismaSpinner = ora('Initializing Prisma...').start();
      execSync('npx prisma init', { cwd: projectName, stdio: 'pipe' });
      prismaSpinner.succeed('Prisma initialized.');
    }
    
    // Step 5: Install all dependencies in one go
    const { dependencies, devDependencies } = getDependencies(language, database, includeJest);
    await installAllPackages(projectName, dependencies, devDependencies, finalPackageManager);
    
  // Calculate total execution time
  const endTime = process.hrtime(startTime);
  const executionTimeInSeconds = (endTime[0] + endTime[1] / 1e9).toFixed(2);

  // Success message
  console.log(`\n✅ Project "${projectName}" created successfully in ${executionTimeInSeconds} seconds!\n`);
    console.log('📁 Project structure:');
    console.log(`   ${projectName}/`);
    console.log('   ├── src/');
    console.log('   │   ├── routes/');
    console.log('   │   ├── controllers/');
    console.log('   │   ├── services/');
    console.log('   │   ├── middlewares/');
    console.log('   │   ├── models/');
    console.log('   │   ├── email/');
    console.log('   │   ├── errors/');
    console.log('   │   ├── interfaces/');
    console.log('   │   ├── config/');
    console.log('   │   └── utils/');
    console.log('   │   ├── index.ts');
    console.log('   ├── .env');
    console.log('   ├── .gitignore');
    console.log(`   └── package.json\n`);
    
    console.log('🚀 Get started with:');
    console.log(`   cd ${projectName}`);
    console.log(`   ${finalPackageManager === 'npm' ? 'npm run' : finalPackageManager} dev\n`);
    
  } catch (error) {
    console.error('\n❌ Error creating project:', error.message);
    process.exit(1);
  }
};

init();