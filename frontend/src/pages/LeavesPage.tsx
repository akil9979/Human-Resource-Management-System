import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { isAdminOrHr } from '../utils/auth.js';
import api from '../services/api.js';

// Leave Request Interface
interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: 'Paid' | 'Sick' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  attachment?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminComment?: string;
}

// Reusable Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, colorClass }) => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700/60 transition-all duration-200">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
    <div className="mt-3 flex items-baseline">
      <span className={`text-3xl font-black tracking-tight ${colorClass}`}>{value}</span>
    </div>
    <p className="mt-1 text-[10px] text-slate-500 font-medium">{subtext}</p>
  </div>
);

export const LeavesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrHR = isAdminOrHr(user?.role);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Leaves Master List State
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals Control State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Review target item state
  const [reviewTarget, setReviewTarget] = useState<{
    leaveId: string;
    action: 'Approved' | 'Rejected';
    comment: string;
  } | null>(null);

  // Apply Leave Form State
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Paid' as LeaveRequest['leaveType'],
    startDate: '',
    endDate: '',
    reason: '',
    attachmentFile: null as File | null,
    attachmentName: '',
  });

  // Leave Balances / Counts State
  const [summaryStats, setSummaryStats] = useState({
    paidRemaining: 18,
    sickRemaining: 10,
    unpaidTaken: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  // Fetch Leaves from Backend
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await api.get('/leaves', {
        params: {
          limit: 100, // Retrieve up to 100 records for comprehensive local filtering
        },
      });

      if (response.data?.status === 'success') {
        const apiLeaves = response.data.data.leaves || [];
        const mapped: LeaveRequest[] = apiLeaves.map((l: any) => ({
          id: l._id,
          employeeName: l.employee?.firstName ? `${l.employee.firstName} ${l.employee.lastName}` : l.employee?.email || 'N/A',
          employeeEmail: l.employee?.email || 'N/A',
          leaveType: l.leaveType,
          startDate: new Date(l.startDate).toISOString().slice(0, 10),
          endDate: new Date(l.endDate).toISOString().slice(0, 10),
          reason: l.reason || '',
          attachment: l.attachment || undefined,
          status: l.status,
          adminComment: l.adminComment || '',
        }));

        setLeaves(mapped);
        if (response.data.data.summary) {
          setSummaryStats(response.data.data.summary);
        }
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const employeeBalances = useMemo(() => {
    return {
      paidRemaining: `${summaryStats.paidRemaining} / 18 days`,
      sickRemaining: `${summaryStats.sickRemaining} / 10 days`,
      unpaidTaken: `${summaryStats.unpaidTaken} days taken`,
    };
  }, [summaryStats]);

  // Filtered leaves list for Active Employee
  const employeeLeaves = useMemo(() => {
    return leaves.filter(item => item.employeeEmail === user?.email);
  }, [leaves, user]);

  // Filtered leaves list for Admin Table
  const filteredLeaves = useMemo(() => {
    return leaves.filter(item => {
      const matchSearch = item.employeeName.toLowerCase().includes(searchText.toLowerCase()) || 
                          item.employeeEmail.toLowerCase().includes(searchText.toLowerCase());
      const matchType = typeFilter ? item.leaveType === typeFilter : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchType && matchStatus;
    });
  }, [leaves, searchText, typeFilter, statusFilter]);

  // Handle Apply Leave Form Submissions
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.startDate || !applyForm.endDate || !applyForm.reason) {
      alert('Please fill out all mandatory parameters.');
      return;
    }

    if (new Date(applyForm.endDate) < new Date(applyForm.startDate)) {
      alert('End Date must be greater than or equal to Start Date.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('leaveType', applyForm.leaveType);
      formData.append('startDate', applyForm.startDate);
      formData.append('endDate', applyForm.endDate);
      formData.append('reason', applyForm.reason);
      if (applyForm.attachmentFile) {
        formData.append('attachment', applyForm.attachmentFile);
      }

      const response = await api.post('/leaves', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status === 'success') {
        alert('Leave request submitted successfully.');
        setIsApplyModalOpen(false);
        // Reset Form
        setApplyForm({
          leaveType: 'Paid',
          startDate: '',
          endDate: '',
          reason: '',
          attachmentFile: null,
          attachmentName: '',
        });
        fetchLeaves();
      }
    } catch (error: any) {
      console.error('Error applying leave:', error);
      alert(error.response?.data?.message || 'Failed to submit leave request.');
    }
  };

  // Open Approval/Rejection Dialog
  const triggerReview = (id: string, action: 'Approved' | 'Rejected') => {
    setReviewTarget({
      leaveId: id,
      action,
      comment: '',
    });
    setIsReviewModalOpen(true);
  };

  // Handle Approval/Rejection Submissions
  const handleReviewSave = async () => {
    if (!reviewTarget) return;

    try {
      const response = await api.patch(`/leaves/${reviewTarget.leaveId}/status`, {
        status: reviewTarget.action,
        adminComment: reviewTarget.comment.trim() || undefined,
      });

      if (response.data?.status === 'success') {
        alert(`Leave request has been successfully ${reviewTarget.action.toLowerCase()}.`);
        setIsReviewModalOpen(false);
        setReviewTarget(null);
        fetchLeaves();
      }
    } catch (error: any) {
      console.error('Error reviewing leave:', error);
      alert(error.response?.data?.message || 'Failed to update leave request status.');
    }
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md">
            Rejected
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const handleDownloadAttachment = (attachmentPath: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.open(`${baseUrl}${attachmentPath}`, '_blank');
  };

  return (
    <div className="space-y-6 font-sans">
        
        {/* Header Title */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Leave Requests</h1>
            <p className="text-xs text-slate-500 mt-1">
              {isAdminOrHR 
                ? 'Review, approve, or reject employee leave applications.'
                : 'View your leave balance dashboard, request leaves, and review history.'
              }
            </p>
          </div>
          {!isAdminOrHR && (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-5 py-3 transition-colors shadow-lg shadow-indigo-500/15"
            >
              Apply Leave
            </button>
          )}
        </div>

        {loading && leaves.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-semibold">Loading leave requests...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ---------------- EMPLOYEE VIEW ---------------- */}
            {!isAdminOrHR && (
              <div className="space-y-6">
                {/* Balances Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="Paid Leaves Remaining"
                    value={employeeBalances.paidRemaining}
                    subtext="Annual personal leave quota"
                    colorClass="text-indigo-400"
                  />
                  <StatCard
                    title="Sick Leaves Remaining"
                    value={employeeBalances.sickRemaining}
                    subtext="Medical / Wellness logs balance"
                    colorClass="text-emerald-400"
                  />
                  <StatCard
                    title="Unpaid Leaves Logged"
                    value={employeeBalances.unpaidTaken}
                    subtext="Unpaid leaves registered"
                    colorClass="text-amber-400"
                  />
                </div>

                {/* Leave History List */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-200">Leave Applications History</h3>
                    <span className="text-xs text-slate-500 font-medium">{employeeLeaves.length} logs</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-950/20 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="px-6 py-3.5">Duration (Dates)</th>
                          <th className="px-6 py-3.5">Leave Type</th>
                          <th className="px-6 py-3.5">Remarks / Reason</th>
                          <th className="px-6 py-3.5">Attachment</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5">Admin Comment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-300">
                        {employeeLeaves.map(item => (
                          <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4 text-slate-200">
                              {item.startDate} &rarr; {item.endDate}
                            </td>
                            <td className="px-6 py-4">{item.leaveType} Leave</td>
                            <td className="px-6 py-4 max-w-xs truncate text-slate-400" title={item.reason}>
                              {item.reason}
                            </td>
                            <td className="px-6 py-4">
                              {item.attachment ? (
                                <span 
                                  onClick={() => handleDownloadAttachment(item.attachment!)}
                                  className="text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  <span className="text-[10px] truncate max-w-[80px]">View Attachment</span>
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                            <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate" title={item.adminComment}>
                              {item.adminComment || '-'}
                            </td>
                          </tr>
                        ))}
                        {employeeLeaves.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                              No leave applications submitted yet.
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
              <div className="space-y-6">
                
                {/* Admin Filter bar */}
                <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 backdrop-blur-xl">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search employee name or email..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-9 pr-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    />
                    <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Leave Type filter */}
                  <div className="w-full md:w-44">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="">All Leave Types</option>
                      <option value="Paid">Paid Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  {/* Status filter */}
                  <div className="w-full md:w-44">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Admin Table Registry */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-200">Staff Leave Applications</h3>
                    <span className="text-xs text-slate-500 font-medium">{filteredLeaves.length} records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-950/20 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="px-6 py-3.5">Employee</th>
                          <th className="px-6 py-3.5">Leave Type</th>
                          <th className="px-6 py-3.5">Date Range</th>
                          <th className="px-6 py-3.5">Remarks</th>
                          <th className="px-6 py-3.5">Attachment</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-300">
                        {filteredLeaves.map(item => (
                          <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-slate-200 font-bold">{item.employeeName}</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.employeeEmail}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">{item.leaveType} Leave</td>
                            <td className="px-6 py-4 text-slate-200">
                              {item.startDate} &rarr; {item.endDate}
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate text-slate-400" title={item.reason}>
                              {item.reason}
                            </td>
                            <td className="px-6 py-4">
                              {item.attachment ? (
                                <span 
                                  onClick={() => handleDownloadAttachment(item.attachment!)}
                                  className="text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  <span className="text-[10px] truncate max-w-[80px]">View File</span>
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                            <td className="px-6 py-4">
                              {item.status === 'Pending' ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => triggerReview(item.id, 'Approved')}
                                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => triggerReview(item.id, 'Rejected')}
                                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-[10px] italic">Resolved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredLeaves.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                              No matching leave requests found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ---------------- EMPLOYEE APPLY LEAVE MODAL ---------------- */}
        {isApplyModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Apply for Leave</h3>
                <p className="text-xs text-slate-500 mt-1">Submit your request details and attachments for approval.</p>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                {/* Leave Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Leave Type</label>
                  <select
                    value={applyForm.leaveType}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, leaveType: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Paid">Paid Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Start Date</label>
                    <input
                      type="date"
                      value={applyForm.startDate}
                      onChange={(e) => setApplyForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">End Date</label>
                    <input
                      type="date"
                      value={applyForm.endDate}
                      onChange={(e) => setApplyForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Remarks/Reason */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Reason / Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed reasons for this leave request..."
                    value={applyForm.reason}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Attachment Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Attachment (Optional)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="No file chosen"
                      readOnly
                      value={applyForm.attachmentName}
                      className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 text-xs font-semibold rounded-xl px-4 py-3 outline-none"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setApplyForm(prev => ({
                            ...prev,
                            attachmentFile: file,
                            attachmentName: file.name,
                          }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-xl px-4 py-3 border border-slate-700 transition-colors"
                    >
                      Attach File
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl py-3 border border-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl py-3 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- ADMIN APPROVAL/REJECTION MODAL ---------------- */}
        {isReviewModalOpen && reviewTarget && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {reviewTarget.action === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Add an optional comment to log with this status decision.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Admin Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Enter approval notes or rejection reason..."
                    value={reviewTarget.comment}
                    onChange={(e) => setReviewTarget(prev => prev ? { ...prev, comment: e.target.value } : null)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      setReviewTarget(null);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl py-3 border border-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSave}
                    className={`flex-1 font-bold text-xs rounded-xl py-3 text-white transition-colors ${
                      reviewTarget.action === 'Approved' 
                        ? 'bg-emerald-600 hover:bg-emerald-500' 
                        : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    Confirm {reviewTarget.action}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default LeavesPage;
