"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leave_js_1 = require("../controllers/leave.js");
const auth_js_1 = require("../middleware/auth.js");
const leaveUpload_js_1 = require("../middleware/leaveUpload.js");
const router = (0, express_1.Router)();
// Apply authMiddleware globally to leave requests
router.use(auth_js_1.authMiddleware);
router.get('/', leave_js_1.getLeaves);
router.post('/', leaveUpload_js_1.leaveUpload.single('attachment'), leave_js_1.requestLeave);
router.patch('/:leaveId/status', (0, auth_js_1.roleMiddleware)('Admin', 'HR'), leave_js_1.updateLeaveStatus);
exports.default = router;
