const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ora = require('ora');

const generateDatabaseConfig = (language, database) => {
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

const getDatabaseDependencies = (language, database) => {
  const dependencies = [];
  const devDependencies = [];
  
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
  
  return { dependencies, devDependencies };
};


const setupDatabase = async (projectName, database, language) => {
  if (database === 'Prisma') {
    const prismaSpinner = ora('Setting up Prisma...').start();
    
    // Create prisma directory
    const prismaDir = path.join(projectName, 'prisma');
    fs.mkdirSync(prismaDir, { recursive: true });
    
    // Create schema.prisma file manually (much faster than npx prisma init)
    const schemaContent = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Example model - you can modify this
// model User {
//   id        Int      @id @default(autoincrement())
//   email     String   @unique
//   name      String?
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }
`;
    
    fs.writeFileSync(path.join(prismaDir, 'schema.prisma'), schemaContent);
    
    // Create database config file
    const extension = language === 'TypeScript' ? 'ts' : 'js';
    const dbConfigContent = generateDatabaseConfig(language, database);
    fs.writeFileSync(
      path.join(projectName, 'src', 'config', `db.${extension}`),
      dbConfigContent
    );
    
    prismaSpinner.succeed('Prisma configured.');
    
    // Add note for user
    console.log('   💡 Tip: Run "npx prisma generate" after defining your models');
  } else if (database && database !== 'None') {
    // Create database config file for non-Prisma databases
    const extension = language === 'TypeScript' ? 'ts' : 'js';
    const dbConfigContent = generateDatabaseConfig(language, database);
    fs.writeFileSync(
      path.join(projectName, 'src', 'config', `db.${extension}`),
      dbConfigContent
    );
  }
};

// const setupDatabase = async (projectName, database) => {
//   if (database === 'Prisma') {
//     const prismaSpinner = ora('Initializing Prisma...').start();
//     execSync('npx prisma init', { cwd: projectName, stdio: 'pipe' });
//     prismaSpinner.succeed('Prisma initialized.');
//   }
  
//   if (database && database !== 'None') {
//     // Database config file is created separately in files.js
//     // We just need to write it here
//     const extension = 'ts'; // Will be determined by caller
//     const dbConfigPath = path.join(projectName, 'src', 'config', `db.${extension}`);
//     // This is handled in the main flow, but keeping structure for future enhancements
//   }
// };

module.exports = { 
  getDatabaseDependencies, 
  setupDatabase,
  generateDatabaseConfig 
};
