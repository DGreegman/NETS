const getLanguageDependencies = (language) => {
  const dependencies = ['express', 'dotenv'];
  const devDependencies = [];
  
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
    devDependencies.push(
      'nodemon',
      'eslint',
      'eslint-config-prettier',
      'eslint-plugin-prettier',
      'prettier'
    );
  }
  
  return { dependencies, devDependencies };
};

module.exports = { getLanguageDependencies };