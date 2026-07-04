import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmployeeData } from './EmployeeCard.js';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

interface EmployeeProfileModalProps {
  employee: EmployeeData;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  onClose,
  onDeleteSuccess,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [isDeleting, setIsDeleting] = useState(false);

  const getInitials = () => {
    return `${employee.firstName[0] || 'E'}${employee.lastName[0] || 'P'}`.toUpperCase();
  };

  const infoItems = [
    { label: 'Employee ID', value: employee.employeeId },
    { label: 'Email Address', value: employee.email },
    { label: 'Phone Number', value: employee.phone },
    { label: 'Department', value: employee.department },
    { label: 'Designation', value: employee.designation },
    {
      label: 'Date of Joining',
      value: new Date(employee.dateOfJoining).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    { label: 'Reporting Manager', value: employee.manager },
    { label: 'Account Status', value: employee.status },
  ];

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.delete(`/employees/${employee.id}`);
      if (response.data?.status === 'success') {
        alert('Employee deleted successfully.');
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      alert(error.response?.data?.message || 'Failed to delete employee account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 font-sans">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:space-x-5 text-center sm:text-left pb-6 border-b border-slate-800/80">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 mb-4 sm:mb-0">
            {getInitials()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-sm text-indigo-400 font-semibold mt-0.5">{employee.designation}</p>
            <p className="text-xs text-slate-500 mt-1">Read-Only Employee File</p>
          </div>
        </div>

        {/* Profile details grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {infoItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {item.label}
              </span>
              <p className="text-sm font-semibold text-slate-200 truncate">
                {item.value || 'N/A'}
              </p>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex justify-between items-center">
          <div>
            {isAdmin && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Employee'}
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/profile/${employee.id}`}
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center"
            >
              View Full Profile
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700/60 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
