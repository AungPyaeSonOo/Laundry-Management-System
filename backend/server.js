const app = require('./src/app');
const sequelize = require('./src/config/database');
const { User, ExpenseCategory, ClothingType } = require('./src/models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

// Seed initial data
const seedDatabase = async () => {
    try {
        // ✅ Create admin user if not exists with correct password
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
            console.log('✅ Admin user created with username: admin, password: Admin@123');
        } else {
            // ✅ Update admin password if needed
            const admin = await User.findOne({ where: { username: 'admin' } });
            const isValid = await bcrypt.compare('Admin@123', admin.password_hash);
            if (!isValid) {
                admin.password_hash = await bcrypt.hash('Admin@123', 10);
                await admin.save();
                console.log('✅ Admin password updated to: Admin@123');
            }
        }

        // Create expense categories if not exists
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

        // Create clothing types if not exists
        const clothingTypes = [
            { type_name: 'Shirt', default_price: 500 },
            { type_name: 'Pants', default_price: 700 },
            { type_name: 'Dress', default_price: 1000 },
            { type_name: 'Jacket', default_price: 1500 },
            { type_name: 'Suit', default_price: 2000 },
            { type_name: 'T-shirt', default_price: 400 },
            { type_name: 'Jeans', default_price: 800 },
            { type_name: 'Skirt', default_price: 600 },
            { type_name: 'Socks', default_price: 200 },
            { type_name: 'Underwear', default_price: 300 },
            { type_name: 'Towel', default_price: 500 },
            { type_name: 'Bed Sheet', default_price: 1200 }
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
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // ✅ Sync database without force to preserve data
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');

        // Seed initial data
        await seedDatabase();

        // ✅ Verify admin user
        const admin = await User.findOne({ where: { username: 'admin' } });
        if (admin) {
            console.log('✅ Admin user verified:', {
                username: admin.username,
                role: admin.role,
                is_active: admin.is_active,
                password_hash: admin.password_hash.substring(0, 20) + '...'
            });
        }

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