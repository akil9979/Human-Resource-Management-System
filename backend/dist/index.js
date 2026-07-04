"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_js_1 = require("./config/db.js");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const employee_js_1 = __importDefault(require("./routes/employee.js"));
const profile_js_1 = __importDefault(require("./routes/profile.js"));
const attendance_js_1 = __importDefault(require("./routes/attendance.js"));
const leave_js_1 = __importDefault(require("./routes/leave.js"));
const payroll_js_1 = __importDefault(require("./routes/payroll.js"));
const notification_js_1 = __importDefault(require("./routes/notification.js"));
// Load environment variables
dotenv_1.default.config({ override: true });
// Connect to Database
(0, db_js_1.connectDB)();
const app = (0, express_1.default)();
const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];
const configuredAllowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins]));
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.resolve('uploads')));
// Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/employees', employee_js_1.default);
app.use('/api/profile', profile_js_1.default);
app.use('/api/attendance', attendance_js_1.default);
app.use('/api/leaves', leave_js_1.default);
app.use('/api/payroll', payroll_js_1.default);
app.use('/api/notifications', notification_js_1.default);
// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'HRMS API is running and healthy',
        timestamp: new Date().toISOString(),
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
