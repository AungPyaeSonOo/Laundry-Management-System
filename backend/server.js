const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database'); // ✅ ဒီလိုပြောင်းပါ
const { User, ExpenseCategory, ClothingType } = require('./src/models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

// Seed initial data
const seedDatabase = async () => {
    try {
        // Admin user
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await User.create({
                username: 'admin',
                email: 'admin@laundry.com',
                password_hash: hashedPassword,
                full_name: 'System Administrator',
                role: 'admin',
                is_active: true
            });
            console.log('✅ Admin user created');
        }

        // Expense categories
        const categories = [
            'Detergent', 'Fabric Softener', 'Bleach', 'Stain Remover',
            'Packaging', 'Machine Maintenance', 'Electricity', 'Water',
            'Transportation', 'Marketing', 'Salary', 'Other'
        ];

        for (const category of categories) {
            const exists = await ExpenseCategory.findOne({ 
                where: { category_name: category } 
            });
            if (!exists) {
                await ExpenseCategory.create({
                    category_name: category,
                    is_active: true
                });
            }
        }
        console.log('✅ Expense categories seeded');

        // Clothing types
        const clothingTypes = [
            { type_name: 'Shirt', default_price: 500 },
            { type_name: 'Pants', default_price: 700 },
            { type_name: 'Dress', default_price: 1000 },
            { type_name: 'Jacket', default_price: 1500 },
            { type_name: 'Suit', default_price: 2000 },
            { type_name: 'T-shirt', default_price: 400 },
            { type_name: 'Jeans', default_price: 800 },
            { type_name: 'Skirt', default_price: 600 },
            { type_name: 'Towel', default_price: 500 }
        ];

        for (const type of clothingTypes) {
            const exists = await ClothingType.findOne({ 
                where: { type_name: type.type_name } 
            });
            if (!exists) {
                await ClothingType.create(type);
            }
        }
        console.log('✅ Clothing types seeded');

    } catch (error) {
        console.error('⚠️ Seeding error:', error.message);
    }
};

// Sync database and start server
const startServer = async () => {
    try {
        // ✅ Test database connection first
        console.log('📡 Testing database connection...');
        const connected = await testConnection();
        if (!connected) {
            console.error('❌ Database connection failed. Exiting...');
            process.exit(1);
        }

        // ✅ Sync database
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');

        // Seed initial data
        await seedDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}/api`);
            console.log(`🔑 Admin Login: admin / Admin@123`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();