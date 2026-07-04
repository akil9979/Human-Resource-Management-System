"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = require("./config/db.js");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
// Load environment variables
dotenv_1.default.config();
// Connect to Database
(0, db_js_1.connectDB)();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_js_1.default);
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
