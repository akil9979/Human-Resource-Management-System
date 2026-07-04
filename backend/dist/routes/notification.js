"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_js_1 = require("../controllers/notification.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All notification routes require a valid JWT
router.use(auth_js_1.authMiddleware);
router.get('/', notification_js_1.getNotifications);
router.patch('/read-all', notification_js_1.markAllAsRead);
router.patch('/:id/read', notification_js_1.markAsRead);
exports.default = router;
