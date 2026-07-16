const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize'); // ✅ Op ကိုထည့်ပါ

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

const tokenBlacklist = new Set();

const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// ============================================
// LOGIN
// ============================================
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('🔐 Login attempt:', username);

        if (!username || !password) {
            return errorResponse(res, 'Username and password are required', 400);
        }

        const user = await User.findOne({ 
            where: { username },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['position', 'employee_code', 'employee_id']
                }
            ]
        });

        if (!user) {
            console.log('❌ User not found:', username);
            return errorResponse(res, 'Invalid username or password', 401);
        }

        if (!user.is_active) {
            return errorResponse(res, 'Account is deactivated', 403);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return errorResponse(res, 'Invalid username or password', 401);
        }

        const token = generateToken(user);
        const userData = user.toJSON();
        
        if (user.employee) {
            userData.position = user.employee.position;
        }

        console.log('✅ Login successful:', username);
        return successResponse(res, { user: userData, token }, 'Login successful');
    } catch (error) {
        console.error('❌ Login error:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// REGISTER
// ============================================
exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone, role } = req.body;

        if (!username || !email || !password || !full_name) {
            return errorResponse(res, 'Missing required fields', 400);
        }

        const existingUser = await User.findOne({
            where: { 
                [Op.or]: [{ username }, { email }] 
            }
        });

        if (existingUser) {
            return errorResponse(res, 'Username or email already exists', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            full_name,
            phone,
            role: role || 'employee',
            is_active: true
        });

        const userData = user.toJSON();
        delete userData.password_hash;

        return successResponse(res, userData, 'User registered successfully', 201);
    } catch (error) {
        console.error('❌ Register error:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// GET CURRENT USER
// ============================================
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['position', 'employee_code', 'employee_id']
                }
            ]
        });

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const userData = user.toJSON();
        if (user.employee) {
            userData.position = user.employee.position;
        }

        return successResponse(res, userData, 'User profile fetched');
    } catch (error) {
        console.error('❌ Get current user error:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// UPDATE PROFILE
// ============================================
exports.updateProfile = async (req, res) => {
    try {
        const { full_name, phone, email } = req.body;
        const user = await User.findByPk(req.userId);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                where: { email }
            });
            if (existingUser) {
                return errorResponse(res, 'Email already in use', 409);
            }
        }

        await user.update({
            full_name: full_name || user.full_name,
            phone: phone || user.phone,
            email: email || user.email
        });

        const updatedUser = await User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] }
        });

        return successResponse(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
        console.error('❌ Update profile error:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// CHANGE PASSWORD
// ============================================
exports.changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return errorResponse(res, 'Current password and new password are required', 400);
        }

        if (new_password.length < 6) {
            return errorResponse(res, 'New password must be at least 6 characters', 400);
        }

        const user = await User.findByPk(req.userId);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
        if (!isPasswordValid) {
            return errorResponse(res, 'Current password is incorrect', 401);
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await user.update({ password_hash: hashedPassword });

        return successResponse(res, null, 'Password changed successfully');
    } catch (error) {
        console.error('❌ Change password error:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// LOGOUT
// ============================================
exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            tokenBlacklist.add(token);
        }
        return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
        console.error('❌ Logout error:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// CHECK TOKEN BLACKLIST
// ============================================
exports.checkBlacklist = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && tokenBlacklist.has(token)) {
        return res.status(401).json({
            success: false,
            message: 'Token has been revoked. Please login again.'
        });
    }
    next();
};