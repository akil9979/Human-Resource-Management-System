"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_js_1 = require("../controllers/attendance.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Apply authMiddleware globally to attendance records
router.use(auth_js_1.authMiddleware);
router.get('/', attendance_js_1.getAttendanceLogs);
router.post('/check-in', attendance_js_1.checkIn);
router.put('/check-out', attendance_js_1.checkOut);
router.post('/flag-missing', (0, auth_js_1.roleMiddleware)('Admin', 'HR'), attendance_js_1.flagMissingAttendance);
exports.default = router;
