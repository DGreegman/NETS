// ==================== lib/index.js ====================
const inquirer = require('inquirer');
const ora = require('ora');
const { validateProjectName } = require('./utils/validation');
const { getPackageManager, installAllPackages } = require('./utils/packageManager');
const { createDirectoryStructure } = require('./generators/structure');
const { createAllFiles } = require('./generators/files');
const { initializePackageJson, updatePackageJson } = require('./generators/packageJson');
const { getLanguageDependencies } = require('./setup/language');
const { getDatabaseDependencies, setupDatabase } = require('./setup/database');
const { getTestingDependencies, setupTesting } = require('./setup/testing');
const { getDocumentationDependencies } = require('./setup/documentation');

const startTime = process.hrtime();

const init = async () => {
  console.log('🚀 Express.js Project Generator\n');
  
  const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key && value) {
      acc[key.replace(/^--/, '')] = value;
    }
    return acc;
  }, {});

  let { projectName, language, database, includeJest, includeSwagger } = args;

  if (!projectName || !language || !database || includeJest === undefined || includeSwagger === undefined) {
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
      {
        type: 'confirm',
        name: 'includeSwagger',
        message: 'Include Swagger for API documentation?',
        default: true,
      },
    ]);
    
    projectName = answers.projectName;
    language = answers.language;
    database = answers.database;
    includeJest = answers.includeJest;
    includeSwagger = answers.includeSwagger;
  } else {
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
    includeSwagger = includeSwagger === 'true';
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
    createAllFiles(projectName, language, database, includeJest, includeSwagger);
    updatePackageJson(projectName, language, includeJest, includeSwagger);
    filesSpinner.succeed('Project files generated.');
    
    // Step 4: Setup database-specific configurations
    // await setupDatabase(projectName, database);
    await setupDatabase(projectName, database, language);
    
    // Step 5: Setup testing
    if (includeJest) {
      setupTesting(projectName, language);
    }
    
    // Step 6: Collect all dependencies
    const langDeps = getLanguageDependencies(language);
    const dbDeps = getDatabaseDependencies(language, database);
    const testDeps = includeJest ? getTestingDependencies(language) : { dependencies: [], devDependencies: [] };
    const docDeps = includeSwagger ? getDocumentationDependencies(language) : { dependencies: [], devDependencies: [] };
    
    const allDependencies = [
      ...langDeps.dependencies,
      ...dbDeps.dependencies,
      ...testDeps.dependencies,
      ...docDeps.dependencies
    ];
    
    const allDevDependencies = [
      ...langDeps.devDependencies,
      ...dbDeps.devDependencies,
      ...testDeps.devDependencies,
      ...docDeps.devDependencies
    ];
    
    // Step 7: Install all dependencies
    await installAllPackages(projectName, allDependencies, allDevDependencies, finalPackageManager);
    
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
    console.log('   ├── .env');
    console.log('   ├── .gitignore');
    console.log(`   └── package.json\n`);
    
    console.log('🚀 Get started with:');
    console.log(`   cd ${projectName}`);
    console.log(`   ${finalPackageManager === 'npm' ? 'npm run' : finalPackageManager} dev\n`);
    
  } catch (error) {
    console.error('\n❌ Error creating project:', error.message);
    throw error;
  }
};

module.exports = { init };
