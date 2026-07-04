import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import EmployeeCard, { EmployeeData } from './components/EmployeeCard';
import EmployeeProfileModal from './components/EmployeeProfileModal';
import StatCard from './components/StatCard';
import { FullPageSpinner } from './components/LoadingSpinner';
import { PageSkeleton } from './components/Skeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';
import { getRoleRedirectPath } from './utils/auth';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import api from './services/api';

// ── Lazy-loaded pages (code splitting) ────────────────────────────────────────
const LoginPage      = lazy(() => import('./pages/LoginPage'));
const SignupPage     = lazy(() => import('./pages/SignupPage'));
const ProfilePage    = lazy(() => import('./pages/ProfilePage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const LeavesPage     = lazy(() => import('./pages/LeavesPage'));
const PayrollPage    = lazy(() => import('./pages/PayrollPage'));

const AuthenticatedRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner label="Loading session..." />;

  return <Navigate to={user ? getRoleRedirectPath(user.role) : '/login'} replace />;
};

// StatCard is imported from ./components/StatCard

interface EmployeeProfileApi {
  _id: string;
  user: { _id: string; email: string; role?: string; loginId?: string } | string;
  employeeId: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  manager?: string | null;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Resigned';
}

interface AttendanceLogApi {
  _id: string;
  employee?: { _id: string; email?: string; firstName?: string; lastName?: string };
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
}

interface LeaveApi {
  _id: string;
  employee?: { email?: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  createdAt?: string;
}

interface PayrollApi {
  _id: string;
  month: number;
  year: number;
  monthlySalary?: number;
  status: string;
}

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (value?: string) => {
  if (!value) return 'Not logged';
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const getUserId = (profile: EmployeeProfileApi) => {
  return typeof profile.user === 'string' ? profile.user : profile.user?._id;
};

const getUserEmail = (profile: EmployeeProfileApi) => {
  return typeof profile.user === 'string' ? '' : profile.user?.email || '';
};

const mapProfileToEmployee = (profile: EmployeeProfileApi): EmployeeData => ({
  id: getUserId(profile) || profile._id,
  employeeId: profile.employeeId,
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: getUserEmail(profile),
  phone: profile.contactNumber || '',
  department: profile.department,
  designation: profile.designation,
  dateOfJoining: profile.dateOfJoining,
  manager: profile.manager || 'N/A',
  status: profile.status === 'Resigned' ? 'Terminated' : profile.status,
  attendanceStatus: profile.status === 'On Leave' ? 'On Leave' : 'Present',
});

const AdminDashboard = () => {
  const { user } = useAuth();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [todayAttendanceCount, setTodayAttendanceCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [recentEmployees, setRecentEmployees] = useState<EmployeeData[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceLogApi[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [employeesResponse, attendanceResponse, leavesResponse] = await Promise.all([
          api.get('/employees', { params: { limit: 5, sortBy: 'dateOfJoining', sortOrder: 'desc' } }),
          api.get('/attendance', { params: { date: getTodayDateString(), limit: 5 } }),
          api.get('/leaves', { params: { status: 'Pending', limit: 5 } }),
        ]);

        if (!active) return;

        const employeesData = employeesResponse.data?.data;
        const attendanceData = attendanceResponse.data?.data;
        const leavesData = leavesResponse.data?.data;

        setEmployeeCount(employeesData?.pagination?.total || 0);
        setRecentEmployees((employeesData?.employees || []).map(mapProfileToEmployee));
        setTodayAttendanceCount(attendanceData?.totalDocs || 0);
        setTodayAttendance(attendanceData?.docs || []);
        setPendingLeaveCount(leavesData?.totalDocs || 0);
        setPendingLeaves(leavesData?.leaves || []);
      } catch (err: any) {
        if (!active) return;
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/20 border border-indigo-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Everything is set up and running smoothly. Here is the operational status of your organization.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={loading ? '...' : String(employeeCount)}
            subtext="Active employee records"
            iconBg="bg-indigo-500/10 text-indigo-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Present Today"
            value={loading ? '...' : String(todayAttendanceCount)}
            subtext="Attendance logs for today"
            iconBg="bg-emerald-500/10 text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Pending Leaves"
            value={loading ? '...' : String(pendingLeaveCount)}
            subtext="Requests awaiting approval"
            iconBg="bg-amber-500/10 text-amber-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Recent Employees"
            value={loading ? '...' : String(recentEmployees.length)}
            subtext="Latest employee profiles"
            iconBg="bg-rose-500/10 text-rose-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl min-h-[350px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-200">Today&apos;s Attendance</h3>
              <span className="text-[10px] text-slate-500 font-semibold">{todayAttendanceCount} records</span>
            </div>
            <div className="mt-5 space-y-3">
              {todayAttendance.length > 0 ? todayAttendance.map((log) => (
                <div key={log._id} className="flex items-center justify-between border border-slate-800 rounded-2xl px-4 py-3 bg-slate-950/30">
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      {log.employee?.firstName || log.employee?.email || 'Employee'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">{formatTime(log.checkIn)} - {formatTime(log.checkOut)}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    {log.status}
                  </span>
                </div>
              )) : (
                <div className="py-12 text-center text-sm text-slate-500 font-semibold">
                  {loading ? 'Loading attendance...' : 'No attendance records for today.'}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl min-h-[350px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-200">Recent Employees</h3>
              <span className="text-[10px] text-slate-500 font-semibold">{recentEmployees.length} shown</span>
            </div>
            <div className="mt-5 space-y-3">
              {recentEmployees.length > 0 ? recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between border border-slate-800 rounded-2xl px-4 py-3 bg-slate-950/30">
                  <div>
                    <p className="text-sm font-bold text-slate-200">{employee.firstName} {employee.lastName}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{employee.designation} - {employee.department}</p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                    {employee.employeeId}
                  </span>
                </div>
              )) : (
                <div className="py-12 text-center text-sm text-slate-500 font-semibold">
                  {loading ? 'Loading employees...' : 'No employees found.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {pendingLeaves.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-200">Pending Leave Requests</h3>
              <span className="text-[10px] text-slate-500 font-semibold">{pendingLeaveCount} pending</span>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingLeaves.map((leave) => (
                <div key={leave._id} className="border border-slate-800 rounded-2xl px-4 py-3 bg-slate-950/30">
                  <p className="text-sm font-bold text-slate-200">{leave.employee?.email || 'Employee'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {leave.leaveType} leave - {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfileApi | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceLogApi | null>(null);
  const [leaveSummary, setLeaveSummary] = useState<any>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveApi[]>([]);
  const [latestPayroll, setLatestPayroll] = useState<PayrollApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [profileResponse, attendanceResponse, leavesResponse, payrollResponse] = await Promise.all([
          api.get(`/profile/${user.id}`),
          api.get('/attendance', { params: { date: getTodayDateString(), limit: 1 } }),
          api.get('/leaves', { params: { limit: 5 } }),
          api.get('/payroll'),
        ]);

        if (!active) return;

        const attendanceDocs = attendanceResponse.data?.data?.docs || [];
        const payrollRows = payrollResponse.data?.data || [];

        setProfile(profileResponse.data?.data || null);
        setTodayAttendance(attendanceDocs[0] || null);
        setLeaveSummary(leavesResponse.data?.data?.summary || null);
        setRecentLeaves(leavesResponse.data?.data?.leaves || []);
        setLatestPayroll(payrollRows[0] || null);
      } catch (err: any) {
        if (!active) return;
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : user?.email?.split('@')[0] || 'Employee';
  const attendanceStatus = todayAttendance?.status || 'Not checked in';
  const leaveBalance = leaveSummary ? `${leaveSummary.paidRemaining + leaveSummary.sickRemaining} Days` : '0 Days';
  const payrollValue = latestPayroll?.monthlySalary !== undefined ? `$${latestPayroll.monthlySalary.toLocaleString()}` : 'N/A';

  return (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/20 border border-indigo-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{displayName}</span>!
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Have a productive day today. Make sure to log your check-in timings.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Profile"
            value={loading ? '...' : displayName}
            subtext={profile ? `${profile.designation} - ${profile.department}` : 'Employee profile'}
            iconBg="bg-emerald-500/10 text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Today's Attendance"
            value={loading ? '...' : attendanceStatus}
            subtext={todayAttendance ? `Check-in: ${formatTime(todayAttendance.checkIn)}` : 'No check-in recorded'}
            iconBg="bg-indigo-500/10 text-indigo-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Leave Balance"
            value={loading ? '...' : leaveBalance}
            subtext={leaveSummary ? `${leaveSummary.pendingCount} pending requests` : 'Available paid + sick leave'}
            iconBg="bg-amber-500/10 text-amber-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            }
          />
          <StatCard
            title="Payroll Summary"
            value={loading ? '...' : payrollValue}
            subtext={latestPayroll ? `${latestPayroll.status} - ${latestPayroll.month}/${latestPayroll.year}` : 'No payroll records'}
            iconBg="bg-rose-500/10 text-rose-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200">Recent Leave Requests</h3>
            <span className="text-[10px] text-slate-500 font-semibold">{recentLeaves.length} shown</span>
          </div>
          <div className="mt-5 space-y-3">
            {recentLeaves.length > 0 ? recentLeaves.map((leave) => (
              <div key={leave._id} className="flex items-center justify-between border border-slate-800 rounded-2xl px-4 py-3 bg-slate-950/30">
                <div>
                  <p className="text-sm font-bold text-slate-200">{leave.leaveType} Leave</p>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                  {leave.status}
                </span>
              </div>
            )) : (
              <div className="py-10 text-center text-sm text-slate-500 font-semibold">
                {loading ? 'Loading leave requests...' : 'No leave requests found.'}
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

const EmployeesMockPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadEmployees = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/employees', { params: { limit: 12, sortBy: 'employeeId', sortOrder: 'asc' } });
        if (!active) return;
        setEmployees((response.data?.data?.employees || []).map(mapProfileToEmployee));
      } catch (err: any) {
        if (!active) return;
        setError(err.response?.data?.message || 'Unable to load employees.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEmployees();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">All Employees</h1>
            <p className="text-xs text-slate-500 mt-1">Manage and view employee profile files and attendance statuses.</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={() => setSelectedEmployee(employee)}
            />
          ))}
          {!loading && employees.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-slate-500 font-semibold">
              No employees found.
            </div>
          )}
          {loading && (
            <div className="col-span-full py-12 text-center text-sm text-slate-500 font-semibold">
              Loading employees...
            </div>
          )}
        </div>

        {/* Modal Overlay */}
        {selectedEmployee && (
          <EmployeeProfileModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}
    </div>
  );
};

const AdminDashboardPage = lazy(async () => ({ default: AdminDashboard }));
const EmployeeDashboardPage = lazy(async () => ({ default: EmployeeDashboard }));
const EmployeesPage = lazy(async () => ({ default: EmployeesMockPage }));

function App() {
  return (
    <Router>
      <Suspense fallback={<PageSkeleton />}>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthenticatedRedirect />} />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Employee */}
        <Route element={<EmployeeLayout />}>
          <Route path="/dashboard" element={<EmployeeDashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leave" element={<LeavesPage />} />
          <Route path="/payroll" element={<PayrollPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route
            path="payroll"
            element={
              <RoleProtectedRoute allowedRoles={['Admin']}>
                <PayrollPage />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* Shared protected detail routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Route>

        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin-dashboard/employees-mock" element={<Navigate to="/admin/employees" replace />} />
        <Route path="/admin-dashboard/attendance-mock" element={<Navigate to="/admin/attendance" replace />} />
        <Route path="/admin-dashboard/leaves-mock" element={<Navigate to="/admin/leaves" replace />} />
        <Route path="/admin-dashboard/payroll-mock" element={<Navigate to="/admin/payroll" replace />} />
        <Route path="/admin/dashboard/employees-mock" element={<Navigate to="/admin/employees" replace />} />
        <Route path="/admin/dashboard/attendance-mock" element={<Navigate to="/admin/attendance" replace />} />
        <Route path="/admin/dashboard/leaves-mock" element={<Navigate to="/admin/leaves" replace />} />
        <Route path="/admin/dashboard/payroll-mock" element={<Navigate to="/admin/payroll" replace />} />
        <Route path="/employee-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/employee-dashboard/attendance-mock" element={<Navigate to="/attendance" replace />} />
        <Route path="/employee-dashboard/leaves-mock" element={<Navigate to="/leave" replace />} />
        <Route path="/employee-dashboard/payroll-mock" element={<Navigate to="/payroll" replace />} />
        <Route path="/dashboard/attendance-mock" element={<Navigate to="/attendance" replace />} />
        <Route path="/dashboard/leaves-mock" element={<Navigate to="/leave" replace />} />
        <Route path="/dashboard/payroll-mock" element={<Navigate to="/payroll" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ErrorBoundary>
      </Suspense>
    </Router>
  );
}

export default App;
