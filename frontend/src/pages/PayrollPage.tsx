import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { isAdminOrHr } from '../utils/auth.js';
import api from '../services/api.js';

// Employee Salary Structure Interface
interface EmployeeSalary {
  id: string;
  employeeName: string;
  employeeEmail: string;
  designation: string;
  department: string;
  basic: number;
  hra: number;
  allowance: number;
  bonus: number;
  pf: number;
  professionalTax: number;
  workingDays: number;
  wageType: 'Monthly' | 'Hourly' | 'Daily';
}

export const PayrollPage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrHR = isAdminOrHr(user?.role);

  // State
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalary, setSelectedSalary] = useState<EmployeeSalary | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Search Filter State (Admin view)
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all payrolls on mount
  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payroll');
      if (response.data?.status === 'success') {
        setPayrolls(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  // Map payroll list to EmployeeSalary structure for Admin view
  const salaries: EmployeeSalary[] = useMemo(() => {
    return payrolls.map((p) => ({
      id: p._id,
      employeeName: p.employee?.firstName ? `${p.employee.firstName} ${p.employee.lastName}` : p.employee?.email || 'N/A',
      employeeEmail: p.employee?.email || 'N/A',
      designation: p.employee?.designation || 'Staff',
      department: p.employee?.department || 'Operations',
      basic: p.basic || 0,
      hra: p.hra || 0,
      allowance: p.allowance || 0,
      bonus: p.bonus || 0,
      pf: p.pf || 0,
      professionalTax: p.professionalTax || 0,
      workingDays: p.workingDays || 0,
      wageType: p.wageType || 'Monthly',
    }));
  }, [payrolls]);

  // Find Active Employee's salary profile
  const employeeSalary = useMemo(() => {
    if (!isAdminOrHR && salaries.length > 0) {
      return salaries[0];
    }
    return {
      id: 'default',
      employeeName: user?.email || 'Employee',
      employeeEmail: user?.email || '',
      designation: 'Staff',
      department: 'Operations',
      basic: 0,
      hra: 0,
      allowance: 0,
      bonus: 0,
      pf: 0,
      professionalTax: 0,
      workingDays: 0,
      wageType: 'Monthly' as const,
    };
  }, [salaries, isAdminOrHR, user]);

  // Derived calculations for active employee salary structure cards
  const employeeStats = useMemo(() => {
    const gross = employeeSalary.basic + employeeSalary.hra + employeeSalary.allowance + employeeSalary.bonus;
    const deductions = employeeSalary.pf + employeeSalary.professionalTax;
    const net = gross - deductions;
    return { gross, deductions, net };
  }, [employeeSalary]);

  // Filtered employees for Admin View
  const filteredSalaries = useMemo(() => {
    return salaries.filter(item =>
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [salaries, searchQuery]);

  // Edit Form Fields State
  const [editForm, setEditForm] = useState({
    basic: 0,
    hra: 0,
    allowance: 0,
    bonus: 0,
    pf: 0,
    professionalTax: 0,
    workingDays: 0,
    wageType: 'Monthly' as EmployeeSalary['wageType'],
  });

  // Derived real-time calculations inside Admin edit modal
  const editModalStats = useMemo(() => {
    const gross = editForm.basic + editForm.hra + editForm.allowance + editForm.bonus;
    const deductions = editForm.pf + editForm.professionalTax;
    const net = gross - deductions;
    return { gross, deductions, net: Math.max(0, net) };
  }, [editForm]);

  // Open Edit Dialog
  const openEditModal = (sal: EmployeeSalary) => {
    setSelectedSalary(sal);
    setEditForm({
      basic: sal.basic,
      hra: sal.hra,
      allowance: sal.allowance,
      bonus: sal.bonus,
      pf: sal.pf,
      professionalTax: sal.professionalTax,
      workingDays: sal.workingDays,
      wageType: sal.wageType,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Save
  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalary) return;

    try {
      const response = await api.put(`/payroll/${selectedSalary.id}`, {
        basic: Number(editForm.basic),
        hra: Number(editForm.hra),
        allowance: Number(editForm.allowance),
        bonus: Number(editForm.bonus),
        pf: Number(editForm.pf),
        professionalTax: Number(editForm.professionalTax),
        workingDays: Number(editForm.workingDays),
        wageType: editForm.wageType,
      });

      if (response.data?.status === 'success') {
        alert('Salary structure updated successfully.');
        setIsEditModalOpen(false);
        setSelectedSalary(null);
        fetchPayroll();
      }
    } catch (error: any) {
      console.error('Error saving salary configuration:', error);
      alert(error.response?.data?.message || 'Failed to update salary package configuration.');
    }
  };

  const handleDownloadPayslip = (slip: any) => {
    alert(`Downloading payslip for ${slip.month}/${slip.year} (Net payout: $${slip.monthlySalary.toLocaleString()})...`);
  };

  return (
    <div className="space-y-6 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Salary Ledger & Payroll</h1>
            <p className="text-xs text-slate-500 mt-1">
              {isAdminOrHR
                ? 'Configure salary components and manage organization payroll settings.'
                : 'Review your monthly salary structure cards and retrieve monthly payslips.'
              }
            </p>
          </div>
          {isAdminOrHR && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search staff or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500 transition-colors w-64"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>

        {loading && payrolls.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-semibold">Loading payroll info...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ---------------- EMPLOYEE VIEW ---------------- */}
            {!isAdminOrHR && (
              <div className="space-y-6">
                
                {/* Top Summaries Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gross Earnings */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700/60 transition-all duration-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Earnings</span>
                    <div className="mt-3 flex items-baseline">
                      <span className="text-3xl font-black tracking-tight text-indigo-400">
                        ${employeeStats.gross.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3 text-[10px] text-slate-400 font-semibold">
                      <div className="flex justify-between">
                        <span>Basic Salary:</span>
                        <span>${employeeSalary.basic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HRA:</span>
                        <span>${employeeSalary.hra}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allowances:</span>
                        <span>${employeeSalary.allowance}</span>
                      </div>
                      {employeeSalary.bonus > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Bonus Pay:</span>
                          <span>+${employeeSalary.bonus}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deductions Panel */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700/60 transition-all duration-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Deductions</span>
                    <div className="mt-3 flex items-baseline">
                      <span className="text-3xl font-black tracking-tight text-rose-400">
                        ${employeeStats.deductions.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3 text-[10px] text-slate-400 font-semibold">
                      <div className="flex justify-between">
                        <span>Provident Fund (PF):</span>
                        <span>${employeeSalary.pf}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional Tax:</span>
                        <span>${employeeSalary.professionalTax}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Payout Card */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700/60 transition-all duration-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-emerald-400">Take-Home (Net Salary)</span>
                    <div className="mt-3 flex items-baseline">
                      <span className="text-3xl font-black tracking-tight text-emerald-400">
                        ${employeeStats.net.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3 text-[10px] text-slate-400 font-semibold">
                      <div className="flex justify-between">
                        <span>Wage Contract Type:</span>
                        <span>{employeeSalary.wageType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scheduled Working Days:</span>
                        <span>{employeeSalary.workingDays} Days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payslips Logs History */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-slate-200">Personal Payslip Directory</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-950/20 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="px-6 py-3.5">Payslip Period</th>
                          <th className="px-6 py-3.5">Gross Earnings</th>
                          <th className="px-6 py-3.5">Deductions</th>
                          <th className="px-6 py-3.5">Net Payout</th>
                          <th className="px-6 py-3.5">Payment Status</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-300">
                        {payrolls.map(item => {
                          const gross = (item.basic || 0) + (item.hra || 0) + (item.allowance || 0) + (item.bonus || 0);
                          const deductions = (item.pf || 0) + (item.professionalTax || 0);

                          return (
                            <tr key={item._id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="px-6 py-4 text-slate-200">
                                {item.month}/{item.year}
                              </td>
                              <td className="px-6 py-4">${gross.toLocaleString()}</td>
                              <td className="px-6 py-4 text-rose-400">
                                -${deductions.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-emerald-400">${item.monthlySalary.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                  {item.status || 'Paid'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDownloadPayslip(item)}
                                  className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg text-[10px] font-bold transition-all"
                                >
                                  Get Slip (PDF)
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {payrolls.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                              No payslip records available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ---------------- ADMIN VIEW ---------------- */}
            {isAdminOrHR && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-200">Staff Salary Configurations</h3>
                  <span className="text-xs text-slate-500 font-medium">{filteredSalaries.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-950/20 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="px-6 py-3.5">Employee Details</th>
                        <th className="px-6 py-3.5">Department & Job</th>
                        <th className="px-6 py-3.5">Wage Type</th>
                        <th className="px-6 py-3.5">Gross Pay</th>
                        <th className="px-6 py-3.5">Deductions</th>
                        <th className="px-6 py-3.5">Net Payout</th>
                        <th className="px-6 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-300">
                      {filteredSalaries.map(item => {
                        const gross = item.basic + item.hra + item.allowance + item.bonus;
                        const deductions = item.pf + item.professionalTax;
                        const net = gross - deductions;

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-slate-200 font-bold">{item.employeeName}</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.employeeEmail}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-slate-300">{item.designation}</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.department}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">{item.wageType}</td>
                            <td className="px-6 py-4 text-slate-200">${gross.toLocaleString()}</td>
                            <td className="px-6 py-4 text-rose-400">-${deductions.toLocaleString()}</td>
                            <td className="px-6 py-4 text-emerald-400 font-extrabold">${net.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => openEditModal(item)}
                                className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                              >
                                Edit Structure
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredSalaries.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                            No employees match the search filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---------------- ADMIN EDIT MODAL ---------------- */}
            {isEditModalOpen && selectedSalary && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
                  
                  {/* Header */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Configure Salary Ledger</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Adjust payroll packages for <strong className="text-slate-300">{selectedSalary.employeeName}</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSalary} className="space-y-4">
                    
                    {/* Contract Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wage Contract Type</label>
                        <select
                          value={editForm.wageType}
                          onChange={(e) => setEditForm(prev => ({ ...prev, wageType: e.target.value as any }))}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                        >
                          <option value="Monthly">Monthly Salary</option>
                          <option value="Hourly">Hourly Rate</option>
                          <option value="Daily">Daily Wages</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Working Days</label>
                        <input
                          type="number"
                          value={editForm.workingDays}
                          onChange={(e) => setEditForm(prev => ({ ...prev, workingDays: Number(e.target.value) }))}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Earnings Section */}
                    <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/30 space-y-3">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Earnings Breakdown ($)</span>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold">Basic Pay</label>
                          <input
                            type="number"
                            value={editForm.basic}
                            onChange={(e) => setEditForm(prev => ({ ...prev, basic: Number(e.target.value) }))}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold">HRA Allowance</label>
                          <input
                            type="number"
                            value={editForm.hra}
                            onChange={(e) => setEditForm(prev => ({ ...prev, hra: Number(e.target.value) }))}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold">Special Allowance</label>
                          <input
                            type="number"
                            value={editForm.allowance}
                            onChange={(e) => setEditForm(prev => ({ ...prev, allowance: Number(e.target.value) }))}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold">Performance Bonus</label>
                          <input
                            type="number"
                            value={editForm.bonus}
                            onChange={(e) => setEditForm(prev => ({ ...prev, bonus: Number(e.target.value) }))}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deductions Section */}
                    <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/30 space-y-3">
                      <span className="text-[10px] font-bold text-rose-400/80 uppercase tracking-wider">Deductions Breakdown ($)</span>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold">Provident Fund (PF)</label>
                          <input
                            type="number"
                            value={editForm.pf}
                            onChange={(e) => setEditForm(prev => ({ ...prev, pf: Number(e.target.value) }))}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold">Professional Tax</label>
                          <input
                            type="number"
                            value={editForm.professionalTax}
                            onChange={(e) => setEditForm(prev => ({ ...prev, professionalTax: Number(e.target.value) }))}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Calculator Summary Panel */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5 text-center">
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Gross Est.</span>
                        <p className="text-sm font-bold text-slate-200 mt-1">${editModalStats.gross.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Deductions</span>
                        <p className="text-sm font-bold text-rose-400 mt-1">-${editModalStats.deductions.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Calculated Net</span>
                        <p className="text-sm font-black text-emerald-400 mt-1">${editModalStats.net.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditModalOpen(false);
                          setSelectedSalary(null);
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl py-3 border border-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl py-3 transition-colors"
                      >
                        Save Structure
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

    </div>
  );
};

export default PayrollPage;
