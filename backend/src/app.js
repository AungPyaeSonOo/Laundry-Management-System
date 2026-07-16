const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ CORS
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://laundry-frontend-g5u9.onrender.com',  // ✅ Render Frontend URL
        'https://*.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ REMOVE or COMMENT OUT this section (Frontend Static Files)
// if (process.env.NODE_ENV === 'production') {
//     const frontendDist = path.join(__dirname, '../../frontend/dist');
//     app.use(express.static(frontendDist));
//     app.get('*', (req, res) => {
//         if (!req.path.startsWith('/api')) {
//             res.sendFile(path.join(frontendDist, 'index.html'));
//         }
//     });
// }

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const employeeRoutes = require('./routes/employee.routes');
const orderRoutes = require('./routes/order.routes');
const customerRoutes = require('./routes/customer.routes');
const expenseRoutes = require('./routes/expense.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const clothingTypeRoutes = require('./routes/clothingType.routes');

const errorHandler = require('./middleware/error.middleware');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clothing-types', clothingTypeRoutes);

// ✅ Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: 'Laundry API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ✅ Catch-all for non-API routes (Return 404 for frontend routes)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.status(404).json({
            success: false,
            message: 'API endpoint not found. Frontend is hosted on Render.'
        });
    }
});

app.use(errorHandler);

module.exports = app;