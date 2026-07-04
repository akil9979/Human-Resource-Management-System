import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuth();
  
  // Role-based menu config
  let menuItems: { name: string; path: string; icon?: React.ReactNode }[] = [];
  if (!user) menuItems = [];
  else if (user.role === 'Employee') {
    menuItems = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Profile', path: '/profile' },
      { name: 'Attendance', path: '/attendance' },
      { name: 'Leave', path: '/leave' },
      { name: 'Payroll', path: '/payroll' },
    ];
  } else if (user.role === 'HR') {
    menuItems = [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Employees', path: '/admin/employees' },
      { name: 'Attendance', path: '/admin/attendance' },
      { name: 'Leave Approval', path: '/admin/leaves' },
    ];
  } else if (user.role === 'Admin') {
    menuItems = [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Employees', path: '/admin/employees' },
      { name: 'Attendance', path: '/admin/attendance' },
      { name: 'Leave Approval', path: '/admin/leaves' },
      { name: 'Payroll', path: '/admin/payroll' },
      { name: 'Settings', path: '/admin/settings' },
    ];
  }

  // Extend to add your icons as needed (for brevity, omitted here)

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-full font-sans">
      {/* Branding */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          H
        </div>
        <span className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          HRMS PORTAL
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="text-center text-[11px] text-slate-500 font-medium">
          HRMS Dashboard v0.2.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
