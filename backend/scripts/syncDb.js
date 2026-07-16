const sequelize = require('../src/config/database');
const {
    User,
    Customer,
    LaundryOrder,
    OrderItem,
    ClothingType,
    Employee,
    Expense,
    ExpenseCategory,
    Inventory,
    InventoryTransaction,
    MachineMaintenance,
    DailyReport,
    OrderStatusHistory,
    DeliveryTracking
} = require('../src/models');

const bcrypt = require('bcryptjs');

/**
 * Database Sync Script
 * This script will sync all models with database
 * Usage: npm run db:sync
 */

const syncDatabase = async () => {
    try {
        console.log('🔄 Starting database sync...');
        console.log('====================================');

        // Sync all models
        // force: true will drop tables and recreate
        // alter: true will alter tables to match models
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced successfully');

        // Seed initial data
        await seedDatabase();

        console.log('====================================');
        console.log('✅ Database sync completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database sync failed:', error);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding initial data...');

        // ==================== Create Admin User ====================
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
            console.log('✅ Admin user created: admin / Admin@123');
        } else {
            console.log('ℹ️ Admin user already exists');
        }

        // ==================== Create Accountant User ====================
        const accountantExists = await User.findOne({ where: { username: 'accountant' } });
        if (!accountantExists) {
            const hashedPassword = await bcrypt.hash('Account@123', 10);
            await User.create({
                username: 'accountant',
                email: 'accountant@laundry.com',
                password_hash: hashedPassword,
                full_name: 'Accountant User',
                role: 'accountant',
                is_active: true
            });
            console.log('✅ Accountant user created: accountant / Account@123');
        }

        // ==================== Create Employee User ====================
        const employeeExists = await User.findOne({ where: { username: 'employee' } });
        if (!employeeExists) {
            const hashedPassword = await bcrypt.hash('Employee@123', 10);
            const user = await User.create({
                username: 'employee',
                email: 'employee@laundry.com',
                password_hash: hashedPassword,
                full_name: 'Employee User',
                role: 'employee',
                is_active: true
            });

            // Create employee record
            await Employee.create({
                user_id: user.user_id,
                employee_code: `EMP-${Date.now()}`,
                position: 'washer',
                salary_type: 'fixed',
                salary_amount: 300000,
                hire_date: new Date(),
                is_active: true
            });
            console.log('✅ Employee user created: employee / Employee@123');
        }

        // ==================== Create Delivery User ====================
        const deliveryExists = await User.findOne({ where: { username: 'delivery' } });
        if (!deliveryExists) {
            const hashedPassword = await bcrypt.hash('Delivery@123', 10);
            const user = await User.create({
                username: 'delivery',
                email: 'delivery@laundry.com',
                password_hash: hashedPassword,
                full_name: 'Delivery Person',
                role: 'delivery',
                is_active: true
            });

            // Create employee record for delivery
            await Employee.create({
                user_id: user.user_id,
                employee_code: `EMP-${Date.now()}`,
                position: 'delivery',
                salary_type: 'daily',
                salary_amount: 10000,
                hire_date: new Date(),
                is_active: true
            });
            console.log('✅ Delivery user created: delivery / Delivery@123');
        }

        // ==================== Create Expense Categories ====================
        const expenseCategories = [
            { category_name: 'Detergent', description: 'Laundry detergent' },
            { category_name: 'Fabric Softener', description: 'Fabric softener' },
            { category_name: 'Bleach', description: 'Bleach' },
            { category_name: 'Stain Remover', description: 'Stain remover' },
            { category_name: 'Packaging', description: 'Packaging materials' },
            { category_name: 'Machine Maintenance', description: 'Machine maintenance and repair' },
            { category_name: 'Electricity', description: 'Electricity bills' },
            { category_name: 'Water', description: 'Water bills' },
            { category_name: 'Transportation', description: 'Transportation costs' },
            { category_name: 'Marketing', description: 'Marketing and advertising' },
            { category_name: 'Salary', description: 'Employee salaries' },
            { category_name: 'Rent', description: 'Shop rent' },
            { category_name: 'Other', description: 'Other expenses' }
        ];

        for (const category of expenseCategories) {
            const exists = await ExpenseCategory.findOne({
                where: { category_name: category.category_name }
            });
            if (!exists) {
                await ExpenseCategory.create({
                    ...category,
                    is_active: true
                });
            }
        }
        console.log('✅ Expense categories seeded');

        // ==================== Create Clothing Types ====================
        const clothingTypes = [
            { type_name: 'Shirt', default_price: 500, description: 'Men/Women Shirt' },
            { type_name: 'Pants', default_price: 700, description: 'Men/Women Pants' },
            { type_name: 'Dress', default_price: 1000, description: 'Women Dress' },
            { type_name: 'Jacket', default_price: 1500, description: 'Jacket' },
            { type_name: 'Suit', default_price: 2000, description: 'Suit' },
            { type_name: 'T-shirt', default_price: 400, description: 'T-shirt' },
            { type_name: 'Jeans', default_price: 800, description: 'Jeans' },
            { type_name: 'Skirt', default_price: 600, description: 'Skirt' },
            { type_name: 'Socks', default_price: 200, description: 'Socks' },
            { type_name: 'Underwear', default_price: 300, description: 'Underwear' },
            { type_name: 'Towel', default_price: 500, description: 'Towel' },
            { type_name: 'Bed Sheet', default_price: 1200, description: 'Bed Sheet' },
            { type_name: 'Blouse', default_price: 600, description: 'Blouse' },
            { type_name: 'Uniform', default_price: 800, description: 'Uniform' },
            { type_name: 'Baby Clothes', default_price: 300, description: 'Baby Clothes' }
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

        // ==================== Create Sample Customer ====================
        const sampleCustomer = await Customer.findOne({
            where: { phone: '09123456789' }
        });
        if (!sampleCustomer) {
            await Customer.create({
                name: 'Sample Customer',
                phone: '09123456789',
                email: 'customer@example.com',
                address: 'Yangon, Myanmar',
                note: 'Sample customer for testing',
                loyalty_points: 100,
                is_active: true
            });
            console.log('✅ Sample customer created');
        }

        // ==================== Create Sample Inventory ====================
        const inventoryItems = [
            { item_name: 'Detergent Powder', category: 'detergent', quantity: 50, unit: 'kg', unit_price: 5000, reorder_level: 10 },
            { item_name: 'Liquid Detergent', category: 'detergent', quantity: 30, unit: 'liter', unit_price: 8000, reorder_level: 10 },
            { item_name: 'Fabric Softener', category: 'fabric_softener', quantity: 40, unit: 'liter', unit_price: 6000, reorder_level: 10 },
            { item_name: 'Bleach', category: 'bleach', quantity: 20, unit: 'liter', unit_price: 4000, reorder_level: 5 },
            { item_name: 'Stain Remover', category: 'stain_remover', quantity: 15, unit: 'bottle', unit_price: 3000, reorder_level: 5 },
            { item_name: 'Plastic Bags (Large)', category: 'packaging', quantity: 500, unit: 'piece', unit_price: 50, reorder_level: 100 },
            { item_name: 'Paper Tags', category: 'packaging', quantity: 1000, unit: 'piece', unit_price: 20, reorder_level: 200 }
        ];

        for (const item of inventoryItems) {
            const exists = await Inventory.findOne({
                where: { item_name: item.item_name }
            });
            if (!exists) {
                await Inventory.create({
                    ...item,
                    supplier: 'Sample Supplier',
                    is_active: true
                });
            }
        }
        console.log('✅ Sample inventory created');

        console.log('✅ Seeding completed!');
    } catch (error) {
        console.error('⚠️ Seeding error:', error.message);
        throw error;
    }
};

// Run sync
syncDatabase();