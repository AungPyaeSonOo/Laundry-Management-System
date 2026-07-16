const { MachineMaintenance, Expense, ExpenseCategory, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// 1. ပြုပြင်မှု အသစ်ထည့်ခြင်း (Expense ကို ရွေးချိတ်နိုင် / အသစ်ဆွဲနိုင်)
exports.createMaintenance = async (req, res) => {
    try {
        const {
            machine_name,
            maintenance_date,
            maintenance_type,
            cost,
            description,
            performed_by,
            next_maintenance_date,
            // 👇 Expense နဲ့ပတ်သက်တဲ့ Data ၂ မျိုး
            expense_id,          // ရှိပြီးသား Expense ID ကို ချိတ်ချင်ရင်
            create_expense      // { category_id, amount, description, ... } -> အသစ်ဆွဲချင်ရင်
        } = req.body;

        let finalExpenseId = expense_id || null;

        // အကယ်၍ Expense အသစ်ဆွဲရန် Data ပါလာရင်
        if (create_expense && !expense_id) {
            const newExpense = await Expense.create({
                expense_category_id: create_expense.expense_category_id,
                user_id: req.userId, // Token ထဲက User ID
                amount: create_expense.amount || cost, // မပါရင် Maintenance Cost ကိုယူ
                description: create_expense.description || `Maintenance: ${description}`,
                expense_date: create_expense.expense_date || maintenance_date,
                reference_no: create_expense.reference_no || null,
                receipt_image: create_expense.receipt_image || null,
                status: create_expense.status || 'approved' // Maintenance ဆိုတော့ ချက်ချင်း Approve လုပ်ချင်ရင်
            });
            finalExpenseId = newExpense.expense_id;
        }

        // Maintenance record ကို သိမ်းမယ်
        const maintenance = await MachineMaintenance.create({
            machine_name,
            maintenance_date,
            maintenance_type,
            cost,
            description,
            performed_by,
            next_maintenance_date,
            expense_id: finalExpenseId
        });

        // ပြန်ဆွဲကြည့်တဲ့အခါ Expense ပါ တစ်ပါတည်းပါအောင် include ထည့်မယ်
        const result = await MachineMaintenance.findByPk(maintenance.maintenance_id, {
            include: [
                { 
                    model: Expense, 
                    as: 'expense',
                    include: [
                        { model: ExpenseCategory, as: 'category' },
                        { model: User, as: 'user', attributes: { exclude: ['password_hash'] } }
                    ]
                }
            ]
        });

        return successResponse(res, result, 'Maintenance record created successfully', 201);

    } catch (error) {
        console.error('Error creating maintenance:', error);
        return errorResponse(res, error.message);
    }
};

// 2. ပြုပြင်မှု တစ်ခုချင်းကြည့်ခြင်း (Expense ပါ တွဲပါမယ်)
exports.getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenance = await MachineMaintenance.findByPk(id, {
            include: [
                { 
                    model: Expense, 
                    as: 'expense',
                    include: [
                        { model: ExpenseCategory, as: 'category' },
                        { model: User, as: 'user', attributes: { exclude: ['password_hash'] } }
                    ]
                }
            ]
        });

        if (!maintenance) {
            return errorResponse(res, 'Maintenance record not found', 404);
        }

        return successResponse(res, maintenance, 'Maintenance fetched successfully');
    } catch (error) {
        console.error('Error fetching maintenance:', error);
        return errorResponse(res, error.message);
    }
};

// 3. ပြုပြင်မှု အားလုံးကြည့်ခြင်း (Expense ပါ တွဲပါမယ်)
exports.getAllMaintenances = async (req, res) => {
    try {
        const maintenances = await MachineMaintenance.findAll({
            include: [
                { 
                    model: Expense, 
                    as: 'expense',
                    include: [
                        { model: ExpenseCategory, as: 'category' }
                    ]
                }
            ],
            order: [['maintenance_date', 'DESC']]
        });

        return successResponse(res, maintenances, 'Maintenances fetched successfully');
    } catch (error) {
        console.error('Error fetching maintenances:', error);
        return errorResponse(res, error.message);
    }
};