import React from 'react';

export interface EmployeeData {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  manager: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  attendanceStatus: 'Present' | 'Late' | 'On Leave';
}

interface EmployeeCardProps {
  employee: EmployeeData;
  onClick: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick }) => {
  const getInitials = () => {
    return `${employee.firstName[0] || 'E'}${employee.lastName[0] || 'P'}`.toUpperCase();
  };

  const getAttendanceBadge = () => {
    switch (employee.attendanceStatus) {
      case 'Present':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Present</span>
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Late</span>
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <svg className="w-3.5 h-3.5 mr-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>On Leave</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-xl group flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          {/* Avatar Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 text-slate-300 font-extrabold text-sm flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
            {getInitials()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">{employee.designation}</p>
          </div>
        </div>
        {getAttendanceBadge()}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>{employee.department}</span>
        <span className="text-slate-500 font-medium">{employee.employeeId}</span>
      </div>
    </div>
  );
};

export default EmployeeCard;
