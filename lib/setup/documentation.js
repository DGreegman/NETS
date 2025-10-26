const getDocumentationDependencies = (language) => {
  const dependencies = ['swagger-jsdoc', 'swagger-ui-express'];
  const devDependencies = [];

  if (language === 'TypeScript') {
    devDependencies.push('@types/swagger-jsdoc', '@types/swagger-ui-express');
  }

  return { dependencies, devDependencies };
};

module.exports = { getDocumentationDependencies };
