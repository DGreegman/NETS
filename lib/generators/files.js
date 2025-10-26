const fs = require('fs');
const path = require('path');

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
  
  Object.entries(files).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(projectName, filename), content);
  });
};

module.exports = { 
  createAllFiles,
  generateIndexFile,
  generateTsConfig,
  generateEslintConfig,
  generatePrettierConfig,
  generateGitignore,
  generateEnvFile
};