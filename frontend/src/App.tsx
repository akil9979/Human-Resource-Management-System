import React, { useState, Suspense, lazy } from 'react';
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

// Dummy Employee JSON Dataset
const mockEmployees: EmployeeData[] = [
  {
    id: 'emp_1',
    employeeId: 'EMP-2025-0001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    dateOfJoining: '2025-01-15',
    manager: 'Sarah Jenkins',
    status: 'Active',
    attendanceStatus: 'Present',
  },
  {
    id: 'emp_2',
    employeeId: 'EMP-2025-0002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    department: 'HR',
    designation: 'HR Lead',
    dateOfJoining: '2025-02-10',
    manager: 'Michael Chang',
    status: 'Active',
    attendanceStatus: 'On Leave',
  },
  {
    id: 'emp_3',
    employeeId: 'EMP-2025-0003',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.j@company.com',
    phone: '+1 (555) 345-6789',
    department: 'Marketing',
    designation: 'Content Specialist',
    dateOfJoining: '2025-03-20',
    manager: 'Sarah Jenkins',
    status: 'Active',
    attendanceStatus: 'Late',
  },
  {
    id: 'emp_4',
    employeeId: 'EMP-2025-0004',
    firstName: 'Bob',
    lastName: 'Miller',
    email: 'bob.m@company.com',
    phone: '+1 (555) 456-7890',
    department: 'Engineering',
    designation: 'QA Analyst',
    dateOfJoining: '2025-04-05',
    manager: 'Sarah Jenkins',
    status: 'Active',
    attendanceStatus: 'Present',
  },
  {
    id: 'emp_5',
    employeeId: 'EMP-2025-0005',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 567-8901',
    department: 'Engineering',
    designation: 'Engineering Manager',
    dateOfJoining: '2025-01-01',
    manager: 'Michael Chang',
    status: 'Active',
    attendanceStatus: 'Present',
  },
];

// Mock Dashboard Page components
const AdminDashboard = () => {
  const { user } = useAuth();

  // Mock attendance bars data (Jan to Jun)
  const attendanceData = [
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 95 },
    { month: 'Mar', rate: 97 },
    { month: 'Apr', rate: 94 },
    { month: 'May', rate: 96 },
    { month: 'Jun', rate: 98 },
  ];

  // Mock leave category distribution data
  const leaveSummaryData = [
    { label: 'Sick Leaves', days: 32, percentage: 40, color: 'bg-emerald-500' },
    { label: 'Paid Vacation', days: 25, percentage: 31, color: 'bg-indigo-500' },
    { label: 'Unpaid Personal', days: 15, percentage: 19, color: 'bg-amber-500' },
    { label: 'Casual / Maternity', days: 8, percentage: 10, color: 'bg-rose-500' },
  ];

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

        {/* 5 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Employees"
            value="142"
            subtext="+5 new joiners this month"
            iconBg="bg-indigo-500/10 text-indigo-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Present Today"
            value="128"
            subtext="90.1% attendance rate"
            iconBg="bg-emerald-500/10 text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="On Leave"
            value="8"
            subtext="5 approved, 3 pending"
            iconBg="bg-amber-500/10 text-amber-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Absent"
            value="6"
            subtext="Requires verification"
            iconBg="bg-rose-500/10 text-rose-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="New Joiners"
            value="5"
            subtext="Arriving next week"
            iconBg="bg-cyan-500/10 text-cyan-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Monthly Attendance (Vertical Bar Chart) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                <h3 className="text-sm font-bold text-slate-200">Monthly Attendance Rate</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Average: 95.8%
                </span>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="flex-1 mt-6 flex items-end justify-between relative h-48 px-2 sm:px-6">
              
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] text-slate-600 font-bold border-b border-slate-800">
                <div className="border-t border-slate-800/40 w-full pt-0.5">100%</div>
                <div className="border-t border-slate-800/40 w-full pt-0.5">75%</div>
                <div className="border-t border-slate-800/40 w-full pt-0.5">50%</div>
                <div className="border-t border-slate-800/40 w-full pt-0.5">25%</div>
              </div>

              {/* Columns */}
              {attendanceData.map((item) => (
                <div key={item.month} className="flex flex-col items-center group z-10 relative flex-1">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-slate-100 text-[10px] font-bold rounded-lg px-2 py-1 shadow-xl border border-slate-800 pointer-events-none whitespace-nowrap">
                    Rate: {item.rate}%
                  </div>
                  
                  {/* Bar fill */}
                  <div 
                    className="w-8 sm:w-12 bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 rounded-t-xl transition-all duration-300 shadow-lg shadow-indigo-500/5 cursor-pointer relative"
                    style={{ height: `${item.rate}%` }}
                  />
                  
                  {/* Label */}
                  <span className="text-[10px] text-slate-500 font-bold mt-2.5">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Leave Summary (Horizontal Progress Categories) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                <h3 className="text-sm font-bold text-slate-200">Leave Category Summary</h3>
                <span className="text-[10px] text-slate-500 font-semibold">Total: 80 Days</span>
              </div>
            </div>

            {/* List area */}
            <div className="flex-1 mt-6 flex flex-col justify-center space-y-4">
              {leaveSummaryData.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-bold text-slate-200">
                      {item.days} Days <span className="text-slate-500 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  
                  {/* Track line */}
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

    </div>
  );
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/20 border border-indigo-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Have a productive day today. Make sure to log your check-in timings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Check-in Status"
            value="Checked In"
            subtext="Logged at 09:12 AM"
            iconBg="bg-emerald-500/10 text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Remaining Leave"
            value="14 Days"
            subtext="Allocated for calendar year"
            iconBg="bg-indigo-500/10 text-indigo-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Tasks In-Progress"
            value="3 Tasks"
            subtext="1 pending review"
            iconBg="bg-amber-500/10 text-amber-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            }
          />
          <StatCard
            title="Latest Payslip"
            value="Paid"
            subtext="June payslip released"
            iconBg="bg-rose-500/10 text-rose-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
    </div>
  );
};

const EmployeesMockPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">All Employees</h1>
            <p className="text-xs text-slate-500 mt-1">Manage and view employee profile files and attendance statuses.</p>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={() => setSelectedEmployee(employee)}
            />
          ))}
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
          <Route path="payroll" element={<PayrollPage />} />
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
