"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_js_1 = require("../controllers/employee.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Endpoint restricted to Admin and HR users
router.get('/', auth_js_1.authMiddleware, (0, auth_js_1.roleMiddleware)('Admin', 'HR'), employee_js_1.searchEmployees);
// Endpoint restricted to Admin users
router.post('/', auth_js_1.authMiddleware, (0, auth_js_1.roleMiddleware)('Admin'), employee_js_1.createEmployee);
// Admin-only employee deletion route
router.delete('/:id', auth_js_1.authMiddleware, (0, auth_js_1.roleMiddleware)('Admin'), employee_js_1.deleteEmployee);
exports.default = router;
