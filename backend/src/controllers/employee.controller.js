// controllers/employee.controller.js

const { Employee, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');

// ✅ Get all employees (Admin only)
exports.getAllEmployees = async (req, res) => {
    try {
        const { position, is_active, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const where = {};
        if (position) where.position = position;
        if (is_active !== undefined) where.is_active = is_active === 'true';

        const userWhere = {};
        if (search) {
            userWhere[Op.or] = [
                { full_name: { [Op.iLike]: `%${search}%` } },
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Employee.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password_hash'] },
                    where: userWhere
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, {
            employees: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        }, 'Employees fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Get employee by ID (Admin only)
exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByPk(id, {
            include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }]
        });

        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        return successResponse(res, employee, 'Employee fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Create employee (Admin only)
exports.createEmployee = async (req, res) => {
    try {
        const {
            user_id,
            position,
            salary_type,
            salary_amount,
            hire_date
        } = req.body;

        if (!user_id || !position) {
            return errorResponse(res, 'Missing required fields: user_id and position are required', 400);
        }

        // ✅ Check if user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // ✅ Check if user is already an employee
        const existingEmployee = await Employee.findOne({ where: { user_id } });
        if (existingEmployee) {
            return errorResponse(res, 'User is already an employee', 409);
        }

        // ✅ Generate employee code
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const employeeCode = `EMP${timestamp}${random}`;

        // ✅ Create employee
        const employee = await Employee.create({
            user_id,
            employee_code: employeeCode,
            position,
            salary_type: salary_type || 'fixed',
            salary_amount: salary_amount || 0,
            hire_date: hire_date || new Date().toISOString().split('T')[0],
            is_active: user.is_active // ✅ Sync with user status
        });

        // ✅ Update user role based on position
        const roleMap = {
            manager: 'manager',
            washer: 'employee',
            ironer: 'employee',
            packer: 'employee',
            delivery: 'delivery'
        };
        await user.update({ role: roleMap[position] || 'employee' });

        const result = await Employee.findByPk(employee.employee_id, {
            include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }]
        });

        return successResponse(res, result, 'Employee created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Update employee (Admin only) - FIXED
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { position, salary_type, salary_amount, is_active, termination_date } = req.body;

        const employee = await Employee.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        // ✅ Update employee
        await employee.update({
            position: position || employee.position,
            salary_type: salary_type || employee.salary_type,
            salary_amount: salary_amount !== undefined ? salary_amount : employee.salary_amount,
            is_active: is_active !== undefined ? is_active : employee.is_active,
            termination_date: termination_date || employee.termination_date
        });

        // ✅ Update user role based on position
        if (position && employee.user) {
            const roleMap = {
                manager: 'manager',
                washer: 'employee',
                ironer: 'employee',
                packer: 'employee',
                delivery: 'delivery'
            };
            await employee.user.update({ 
                role: roleMap[position] || 'employee' 
            });
        }

        // ✅ Update user active status to match employee
        if (is_active !== undefined && employee.user) {
            await employee.user.update({ is_active: is_active });
        }

        const updatedEmployee = await Employee.findByPk(id, {
            include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }]
        });

        return successResponse(res, updatedEmployee, 'Employee updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Delete employee (Admin only)
exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        // ✅ Remove employee role from user
        if (employee.user) {
            await employee.user.update({ role: 'customer' });
        }

        // ✅ Delete employee record
        await employee.destroy();

        return successResponse(res, null, 'Employee deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Get employee stats (Admin only)
exports.getEmployeeStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.count();
        const activeEmployees = await Employee.count({ where: { is_active: true } });
        
        const positions = await Employee.findAll({
            attributes: [
                'position',
                [require('sequelize').fn('COUNT', require('sequelize').col('employee_id')), 'count']
            ],
            group: ['position']
        });

        return successResponse(res, {
            total: totalEmployees,
            active: activeEmployees,
            inactive: totalEmployees - activeEmployees,
            by_position: positions
        }, 'Employee stats fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};