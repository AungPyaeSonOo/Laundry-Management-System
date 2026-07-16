const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ Railway PostgreSQL Connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: console.log, // ✅ Log ထွက်အောင် ထားပါ (Error စစ်ဖို့)
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true
    }
});

// ✅ Test connection function
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        console.error('📋 DATABASE_URL:', process.env.DATABASE_URL);
        return false;
    }
};

module.exports = { sequelize, testConnection };