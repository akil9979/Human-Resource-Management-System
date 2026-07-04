import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

// Attendance Log Interface matching the database payload
interface AttendanceLog {
  _id: string;
  employee: {
    _id: string;
    email: string;
    loginId: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
  };
  date: string;
  checkIn: string;
  checkOut?: string;
  workHours?: number;
  extraHours?: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  location: 'Office' | 'Remote';
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

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  // State Bindings
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination States
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Statistics Summary State
  const [summaryStats, setSummaryStats] = useState({
    workHours: 0,
    extraHours: 0,
    presentCount: 0,
    leaveCount: 0,
  });

  // Time & Date formatting helpers
  const formatTime = (isoString?: string) => {
    if (!isoString || isoString === '-') return '-';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (err) {
      return '-';
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toISOString().split('T')[0];
    } catch (err) {
      return isoString;
    }
  };

  // Fetch from Backend API
  const fetchLogs = async (page: number) => {
    setLoading(true);
    try {
      const today = new Date();
      const params: any = {
        page,
        limit: 10,
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      };

      if (searchText.trim()) params.search = searchText.trim();
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/attendance', { params });
      if (response.data?.status === 'success') {
        const { docs, totalDocs: total, totalPages: pages, currentPage: activePage, summary } = response.data.data;
        setAttendanceLogs(docs);
        setTotalDocs(total);
        setTotalPages(pages || 1);
        setCurrentPage(activePage || 1);
        if (summary) {
          setSummaryStats(summary);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-run fetch when non-text filters or page changes
  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, dateFilter, statusFilter]);

  // Debounced search terms effect trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchLogs(1);
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const getStatusBadge = (status: AttendanceLog['status']) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
            Late
          </span>
        );
      case 'Half Day':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
            Half Day
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md">
            On Leave
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-slate-400 bg-slate-500/10 border border-slate-500/20 rounded-md">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Attendance Ledger">
      <div className="space-y-6 font-sans">
        
        {/* Header Title */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Attendance</h1>
            <p className="text-xs text-slate-500 mt-1">
              {isAdminOrHR 
                ? 'Search, monitor, and filter attendance logs across the organization.'
                : 'Monitor your monthly clockings, working times, and leaves.'
              }
            </p>
          </div>
        </div>

        {/* Loading overlay indicator */}
        {loading && attendanceLogs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-semibold">Loading logs...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ---------------- EMPLOYEE VIEW SUMMARY CARDS ---------------- */}
            {!isAdminOrHR && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Working Hours"
                  value={`${summaryStats.workHours} hrs`}
                  subtext="Cumulative active shift time"
                  colorClass="text-indigo-400"
                />
                <StatCard
                  title="Extra Hours (OT)"
                  value={`${summaryStats.extraHours} hrs`}
                  subtext="Overtime hours (>8 hr shifts)"
                  colorClass="text-purple-400"
                />
                <StatCard
                  title="Present Days"
                  value={summaryStats.presentCount}
                  subtext="Total logs checked-in"
                  colorClass="text-emerald-400"
                />
                <StatCard
                  title="Leaves Logged"
                  value={summaryStats.leaveCount}
                  subtext="Approved leave logs this month"
                  colorClass="text-rose-400"
                />
              </div>
            )}

            {/* ---------------- ADMIN FILTER BLOCK ---------------- */}
            {isAdminOrHR && (
              <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 backdrop-blur-xl">
                {/* Search */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search employee name, email or ID..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-9 pr-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                  />
                  <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Date Picker */}
                <div className="w-full md:w-44">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Status select dropdown */}
                <div className="w-full md:w-44">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
            )}

            {/* ---------------- DATA TABLE REGISTRY ---------------- */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200">
                  {isAdminOrHR ? 'Staff Attendance Registry' : 'Daily Attendance History'}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {loading ? 'Refreshing...' : `${totalDocs} records found`}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-950/20 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {isAdminOrHR && <th className="px-6 py-3.5">Employee</th>}
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Check-In</th>
                      <th className="px-6 py-3.5">Check-Out</th>
                      <th className="px-6 py-3.5">Work Hours</th>
                      <th className="px-6 py-3.5">Extra Hours</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-300">
                    {attendanceLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-800/20 transition-colors">
                        {isAdminOrHR && (
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-slate-200 font-bold">
                                {log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : 'Unlinked Employee'}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                {log.employee?.email || 'N/A'}
                              </p>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-slate-200">{formatDate(log.date)}</td>
                        <td className="px-6 py-4">{formatTime(log.checkIn)}</td>
                        <td className="px-6 py-4">{formatTime(log.checkOut)}</td>
                        <td className="px-6 py-4">{log.workHours !== undefined ? `${log.workHours} hrs` : '-'}</td>
                        <td className="px-6 py-4 text-purple-400">
                          {log.extraHours !== undefined && log.extraHours > 0 ? `+${log.extraHours} hrs` : '-'}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                        <td className="px-6 py-4 text-slate-500">{log.location || 'Office'}</td>
                      </tr>
                    ))}
                    {attendanceLogs.length === 0 && (
                      <tr>
                        <td colSpan={isAdminOrHR ? 8 : 7} className="px-6 py-12 text-center text-slate-500">
                          No attendance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/20 text-xs">
                  <span className="text-slate-500 font-medium">
                    Showing page {currentPage} of {totalPages} ({totalDocs} total records)
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      disabled={currentPage === 1 || loading}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 font-semibold hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages || loading}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 font-semibold hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
