const fs = require('fs');
const path = require('path');

const generateIndexFile = (language, includeSwagger) => {
  if (language === 'TypeScript') {
    let content = `import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
`;
    if (includeSwagger) {
      content += `import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
`;
    }

    content += `
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
`;

    if (includeSwagger) {
      content += `
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
`;
    }

    content += `
/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns a hello world message
 *     responses:
 *       200:
 *         description: A hello world message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
    return content;
  } else {
    let content = `const express = require('express');
require('dotenv').config();
`;
    if (includeSwagger) {
      content += `const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger');
`;
    }

    content += `
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
`;

    if (includeSwagger) {
      content += `
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
`;
    }

    content += `
/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns a hello world message
 *     responses:
 *       200:
 *         description: A hello world message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
    return content;
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

const generateSwaggerFile = (language) => {
  if (language === 'TypeScript') {
    return `import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'A simple Express API application with Swagger documentation'
    },
    servers: [
      {
        url: 'http://localhost:8080'
      }
    ]
  },
  apis: ['./src/index.ts']
};

export const swaggerSpec = swaggerJSDoc(options);
`;
  } else {
    return `const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'A simple Express API application with Swagger documentation'
    },
    servers: [
      {
        url: 'http://localhost:8080'
      }
    ]
  },
  apis: ['./src/index.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
`;
  }
};

const createAllFiles = (projectName, language, database, includeJest, includeSwagger) => {
  const extension = language === 'TypeScript' ? 'ts' : 'js';
  
  const files = {
    '.gitignore': generateGitignore(),
    '.env': generateEnvFile(database),
    '.prettierrc.json': generatePrettierConfig(),
    '.eslintrc.json': generateEslintConfig(language),
    [`src/index.${extension}`]: generateIndexFile(language, includeSwagger),
  };
  
  if (language === 'TypeScript') {
    files['tsconfig.json'] = generateTsConfig();
  }

  if (includeSwagger) {
    files[`src/swagger.${extension}`] = generateSwaggerFile(language);
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
  generateEnvFile,
  generateSwaggerFile
};