const fs = require('fs');
const path = require('path');

const generateJestConfig = (language) => {
  return `module.exports = {
  preset: '${language === 'TypeScript' ? 'ts-jest' : ''}',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.${language === 'TypeScript' ? 'ts' : 'js'}'],
  testMatch: ['**/__tests__/**/*.test.${language === 'TypeScript' ? 'ts' : 'js'}'],
};
`;
};

const getTestingDependencies = (language) => {
  const dependencies = [];
  const devDependencies = ['jest', 'supertest'];
  
  if (language === 'TypeScript') {
    devDependencies.push('@types/jest', '@types/supertest', 'ts-jest');
  }
  
  return { dependencies, devDependencies };
};

const setupTesting = (projectName, language) => {
  const jestConfigPath = path.join(projectName, 'jest.config.js');
  fs.writeFileSync(jestConfigPath, generateJestConfig(language));
};

module.exports = { 
  getTestingDependencies, 
  setupTesting,
  generateJestConfig 
};