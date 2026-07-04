import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AttendancePage from './pages/AttendancePage';
import LeavesPage from './pages/LeavesPage';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';
import EmployeeCard, { EmployeeData } from './components/EmployeeCard';
import EmployeeProfileModal from './components/EmployeeProfileModal';

// Protected Route wrapper component
interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-slate-400 text-sm font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Reusable Stat Card
interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  iconBg: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, iconBg, icon }) => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-200 group">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-400">{title}</span>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform duration-200`}>
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <span className="text-3xl font-extrabold text-slate-100 tracking-tight">{value}</span>
      <p className="mt-1 text-xs text-slate-500 font-medium">{subtext}</p>
    </div>
  </div>
);

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
  return (
    <DashboardLayout title="Admin Overview">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/20 border border-indigo-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Everything is set up and running smoothly. Here is the operational status of your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value="142"
            subtext="+5 new hires this month"
            iconBg="bg-indigo-500/10 text-indigo-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Attendance Rate"
            value="98.2%"
            subtext="+0.4% from yesterday"
            iconBg="bg-emerald-500/10 text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Pending Leaves"
            value="7"
            subtext="Requires authorization"
            iconBg="bg-amber-500/10 text-amber-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Payroll Cycle"
            value="Processed"
            subtext="Disbursed on July 1st"
            iconBg="bg-rose-500/10 text-rose-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout title="Employee Portal">
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
    </DashboardLayout>
  );
};

const EmployeesMockPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  return (
    <DashboardLayout title="Employee Registry">
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
    </DashboardLayout>
  );
};

const MockPlaceholderPage = ({ title }: { title: string }) => (
  <DashboardLayout title={title}>
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center backdrop-blur-xl">
      <h2 className="text-xl font-bold text-slate-200">{title} View</h2>
      <p className="mt-2 text-sm text-slate-400">This operational panel is a placeholder for development.</p>
    </div>
  </DashboardLayout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/employees-mock"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <EmployeesMockPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/attendance-mock"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/leaves-mock"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <LeavesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/payroll-mock"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <MockPlaceholderPage title="Payroll Disbursement" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-dashboard/attendance-mock"
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-dashboard/leaves-mock"
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <LeavesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-dashboard/payroll-mock"
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <MockPlaceholderPage title="My Payroll" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
