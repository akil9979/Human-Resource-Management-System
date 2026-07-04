"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.signin = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_js_1 = __importDefault(require("../models/user.js"));
const generateToken = (id, email, role) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured on the server');
    }
    return jsonwebtoken_1.default.sign({ id, email, role }, secret, {
        expiresIn: '24h',
    });
};
const signup = async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }
    // Validate role selection
    const allowedRoles = ['Admin', 'HR', 'Employee'];
    const userRole = role || 'Employee';
    if (!allowedRoles.includes(userRole)) {
        return res.status(400).json({ status: 'error', message: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}` });
    }
    try {
        const existingUser = await user_js_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'A user with this email already exists' });
        }
        const user = new user_js_1.default({
            email,
            password,
            role: userRole,
        });
        await user.save();
        const token = generateToken(user._id.toString(), user.email, user.role);
        return res.status(201).json({
            status: 'success',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.signup = signup;
const signin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }
    try {
        const user = await user_js_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }
        if (!user.isActive) {
            return res.status(403).json({ status: 'error', message: 'Account has been deactivated' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }
        const token = generateToken(user._id.toString(), user.email, user.role);
        return res.status(200).json({
            status: 'success',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.signin = signin;
const getMe = async (req, res) => {
    return res.status(200).json({
        status: 'success',
        user: req.user,
    });
};
exports.getMe = getMe;
