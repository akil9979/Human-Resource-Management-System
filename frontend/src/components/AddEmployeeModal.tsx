import React, { useState } from 'react';
import api from '../services/api.js';

interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State matching backend requirements
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'Employee' as 'Employee' | 'HR' | 'Admin',
    companyName: 'MyCompany',
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dateOfBirth: '',
    contactNumber: '',
    address: '',
    department: 'Engineering',
    designation: '',
    dateOfJoining: new Date().toISOString().slice(0, 10),
    salary: 0,
    manager: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        email: form.email,
        password: form.password || undefined, // empty password auto-generates on backend
        role: form.role,
        companyName: form.companyName,
        firstName: form.firstName,
        lastName: form.lastName,
        gender: form.gender,
        dateOfBirth: new Date(form.dateOfBirth),
        contactNumber: form.contactNumber,
        address: form.address,
        department: form.department,
        designation: form.designation,
        dateOfJoining: new Date(form.dateOfJoining),
        salary: Number(form.salary),
        manager: form.manager || undefined,
        emergencyContact: {
          name: form.emergencyName,
          relationship: form.emergencyRelationship,
          phone: form.emergencyPhone,
        },
      };

      const response = await api.post('/employees', payload);
      if (response.data?.status === 'success') {
        alert('Employee created successfully.');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating employee:', err);
      setError(err.response?.data?.message || 'Failed to register employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 font-sans overflow-y-auto">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 relative z-10 max-h-[90vh] overflow-y-auto">
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

        {/* Header */}
        <div className="pb-4 border-b border-slate-800/80 mb-6">
          <h2 className="text-xl font-extrabold text-slate-100">Add New Employee Profile</h2>
          <p className="text-xs text-slate-500 mt-1">Register a new system user and set up their payroll and department file.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl px-4 py-3 text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* Section 1: Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Account Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">System Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="Employee">Employee</option>
                  <option value="HR">HR Officer</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name (For ID Prefix)</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="MyCompany"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Temporary Password (Optional)</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to auto-generate password"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Personal Profile */}
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Personal Bio Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  required
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main St, Springfield"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Job Placement */}
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Employment & Job Placement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="HR">HR</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Designation</label>
                <input
                  type="text"
                  name="designation"
                  required
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  required
                  value={form.dateOfJoining}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Basic Salary ($)</label>
                <input
                  type="number"
                  name="salary"
                  required
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reporting Manager</label>
                <input
                  type="text"
                  name="manager"
                  value={form.manager}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contacts */}
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  required
                  value={form.emergencyName}
                  onChange={handleChange}
                  placeholder="Mary Doe"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Relationship</label>
                <input
                  type="text"
                  name="emergencyRelationship"
                  required
                  value={form.emergencyRelationship}
                  onChange={handleChange}
                  placeholder="Spouse"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  required
                  value={form.emergencyPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 091-8844"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-800/60 flex justify-end space-x-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-600/10"
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
