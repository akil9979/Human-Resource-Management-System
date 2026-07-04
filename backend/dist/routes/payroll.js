"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payroll_js_1 = require("../controllers/payroll.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Apply authMiddleware globally to all payroll requests
router.use(auth_js_1.authMiddleware);
router.get('/', (0, auth_js_1.roleMiddleware)('Admin', 'Employee'), payroll_js_1.getMyOrAllPayroll);
router.post('/', (0, auth_js_1.roleMiddleware)('Admin'), payroll_js_1.createPayroll);
router.put('/:id', (0, auth_js_1.roleMiddleware)('Admin'), payroll_js_1.updatePayroll);
exports.default = router;
