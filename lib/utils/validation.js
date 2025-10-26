
// ==================== lib/utils/validation.js ====================
const fs = require('fs');

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

module.exports = {
  validateProjectName,
};