"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Access denied: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured on the server');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: Access credentials missing' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
            });
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
