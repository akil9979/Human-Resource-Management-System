"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePayroll = exports.createPayroll = exports.getMyOrAllPayroll = void 0;
const payroll_js_1 = __importDefault(require("../models/payroll.js"));
/**
 * GET /api/payroll
 * Returns own payroll entries for Employees, or all records for Admin/HR.
 */
const getMyOrAllPayroll = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
    }
    try {
        let payrolls;
        if (req.user.role === 'Admin') {
            payrolls = await payroll_js_1.default.find()
                .populate('employee', 'firstName lastName email loginId')
                .sort({ year: -1, month: -1 });
        }
        else {
            payrolls = await payroll_js_1.default.find({ employee: req.user.id })
                .populate('employee', 'firstName lastName email loginId')
                .sort({ year: -1, month: -1 });
        }
        return res.status(200).json({
            status: 'success',
            data: payrolls,
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getMyOrAllPayroll = getMyOrAllPayroll;
/**
 * POST /api/payroll
 * Creates a new payroll entry for an employee. Restricted to Admin/HR.
 */
const createPayroll = async (req, res) => {
    const { employee, month, year, basic, hra, allowance, bonus, pf, professionalTax, workingDays, wageType, status, paymentMethod, paymentDate, } = req.body;
    if (!employee || !month || !year || basic === undefined || workingDays === undefined || !wageType) {
        return res.status(400).json({
            status: 'error',
            message: 'Mandatory fields are missing: employee, month, year, basic, workingDays, and wageType are required.',
        });
    }
    try {
        // Check for duplicate run
        const existing = await payroll_js_1.default.findOne({ employee, month, year });
        if (existing) {
            return res.status(400).json({
                status: 'error',
                message: 'Payroll record already exists for this employee in the specified month and year.',
            });
        }
        const payroll = new payroll_js_1.default({
            employee,
            month,
            year,
            basic,
            hra,
            allowance,
            bonus,
            pf,
            professionalTax,
            workingDays,
            wageType,
            status,
            paymentMethod,
            paymentDate,
        });
        await payroll.save();
        return res.status(201).json({
            status: 'success',
            message: 'Payroll record created successfully',
            data: payroll,
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createPayroll = createPayroll;
/**
 * PUT /api/payroll/:id
 * Updates an existing payroll record. Restricted to Admin/HR.
 * This triggers pre-validate hooks to automatically recalculate gross, net, and yearly values.
 */
const updatePayroll = async (req, res) => {
    const { id } = req.params;
    const { basic, hra, allowance, bonus, pf, professionalTax, workingDays, wageType, status, paymentMethod, paymentDate, } = req.body;
    try {
        const payroll = await payroll_js_1.default.findById(id);
        if (!payroll) {
            return res.status(404).json({ status: 'error', message: 'Payroll record not found' });
        }
        // Apply updates if defined in request body
        if (basic !== undefined)
            payroll.basic = basic;
        if (hra !== undefined)
            payroll.hra = hra;
        if (allowance !== undefined)
            payroll.allowance = allowance;
        if (bonus !== undefined)
            payroll.bonus = bonus;
        if (pf !== undefined)
            payroll.pf = pf;
        if (professionalTax !== undefined)
            payroll.professionalTax = professionalTax;
        if (workingDays !== undefined)
            payroll.workingDays = workingDays;
        if (wageType !== undefined)
            payroll.wageType = wageType;
        if (status !== undefined)
            payroll.status = status;
        if (paymentMethod !== undefined)
            payroll.paymentMethod = paymentMethod;
        if (paymentDate !== undefined)
            payroll.paymentDate = paymentDate;
        await payroll.save();
        return res.status(200).json({
            status: 'success',
            message: 'Payroll record updated successfully',
            data: payroll,
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.updatePayroll = updatePayroll;
