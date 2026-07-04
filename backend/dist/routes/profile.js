"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_js_1 = require("../controllers/profile.js");
const auth_js_1 = require("../middleware/auth.js");
const upload_js_1 = require("../middleware/upload.js");
const router = (0, express_1.Router)();
// Apply authMiddleware globally to all profile operations
router.use(auth_js_1.authMiddleware);
router.get('/:userId', profile_js_1.getProfile);
router.put('/:userId', profile_js_1.updateProfile);
router.post('/:userId/avatar', upload_js_1.upload.single('avatar'), profile_js_1.uploadAvatar);
exports.default = router;
