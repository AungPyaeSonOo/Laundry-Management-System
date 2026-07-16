// controllers/user.controller.js

const { User, Employee } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');

// ✅ Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, is_active, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const where = {};
        if (role) where.role = role;
        if (is_active !== undefined) where.is_active = is_active === 'true';
        if (search) {
            where[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { full_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, {
            users: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        }, 'Users fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Get users available for employee assignment (only role = 'employee')
exports.getAvailableForEmployee = async (req, res) => {
    try {
        // Get all employee user_ids
        const employees = await Employee.findAll({
            attributes: ['user_id']
        });
        const employeeUserIds = employees.map(emp => emp.user_id);

        // Get users who are not employees yet and have role = 'employee'
        const users = await User.findAll({
            where: {
                user_id: {
                    [Op.notIn]: employeeUserIds
                },
                role: 'employee',
                is_active: true
            },
            attributes: { exclude: ['password_hash'] },
            order: [['full_name', 'ASC']]
        });

        return successResponse(res, users, 'Available employee users fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Create user (Admin only)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, full_name, phone, role, is_active } = req.body;

        if (!username || !email || !password || !full_name) {
            return errorResponse(res, 'Missing required fields', 400);
        }

        const existingUser = await User.findOne({
            where: { [Op.or]: [{ username }, { email }] }
        });

        if (existingUser) {
            return errorResponse(res, 'Username or email already exists', 409);
        }

        const user = await User.create({
            username,
            email,
            password_hash: password,
            full_name,
            phone,
            role: role || 'customer',
            is_active: is_active !== undefined ? is_active : true
        });

        return successResponse(res, user.toJSON(), 'User created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Update user (Admin only) - FIXED
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone, role, is_active } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // ✅ Check if user is admin before changing role
        if (user.role === 'admin' && role && role !== 'admin') {
            return errorResponse(res, 'Cannot change admin role', 400);
        }

        // ✅ Prevent deactivating admin
        if (user.role === 'admin' && is_active === false) {
            return errorResponse(res, 'Cannot deactivate admin user', 400);
        }

        // ✅ If user status is changing, update employee status too
        if (is_active !== undefined && is_active !== user.is_active) {
            const employee = await Employee.findOne({ where: { user_id: id } });
            
            if (employee) {
                // ✅ Update employee status to match user status
                await employee.update({ is_active: is_active });
                console.log(`✅ Employee ${employee.employee_id} status updated to ${is_active}`);
            }
        }

        // ✅ Update user
        await user.update({
            full_name: full_name || user.full_name,
            phone: phone || user.phone,
            role: role || user.role,
            is_active: is_active !== undefined ? is_active : user.is_active
        });

        return successResponse(res, user.toJSON(), 'User updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ✅ Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // ✅ Prevent deleting admin users
        if (user.role === 'admin') {
            return errorResponse(res, 'Cannot delete admin user', 400);
        }

        // ✅ Check if user is an employee
        const employee = await Employee.findOne({ where: { user_id: id } });
        if (employee) {
            return errorResponse(res, 'Cannot delete user who is an employee. Remove employee record first.', 400);
        }

        await user.destroy();
        return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// controllers/user.controller.js - အောက်မှာ ထည့်ပါ

// ✅ Change password (Admin only)
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        if (!new_password || new_password.length < 6) {
            return errorResponse(res, 'Password must be at least 6 characters', 400);
        }

        const user = await User.findByPk(id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // ✅ Prevent changing admin password
        if (user.role === 'admin') {
            return errorResponse(res, 'Cannot change admin password through this endpoint', 400);
        }

        user.password_hash = new_password;
        await user.save();

        return successResponse(res, null, 'Password reset successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};