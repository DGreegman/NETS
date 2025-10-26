const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URI || 'postgres://user:pass@example.com:5432/dbname');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connectDB };
