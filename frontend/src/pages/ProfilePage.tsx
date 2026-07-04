import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

type TabType = 'resume' | 'private' | 'salary' | 'security';

// Inline mock data lookup for consistency
const mockEmployees = [
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
    // Mock resume data
    degree: 'Bachelor of Science in Computer Science',
    institution: 'State University',
    passingYear: '2022',
    experience: '3+ years experience developing React and Node apps.',
    skills: 'React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS',
    // Mock private info
    gender: 'Male',
    dateOfBirth: '2000-05-14',
    address: '123 Silicon Valley Road, San Jose, CA',
    emergencyName: 'Mary Doe',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '+1 (555) 987-6543',
    // Mock salary
    basicSalary: 6500,
    allowances: 1200,
    deductions: 500,
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
    degree: 'Master of Human Resources',
    institution: 'Business School',
    passingYear: '2020',
    experience: '5+ years experience managing HR and employee lifecycles.',
    skills: 'Talent Acquisition, Compliance, Payroll Management, Conflict Resolution',
    gender: 'Female',
    dateOfBirth: '1996-08-22',
    address: '456 Oak Avenue, San Francisco, CA',
    emergencyName: 'Robert Smith',
    emergencyRelationship: 'Father',
    emergencyPhone: '+1 (555) 876-5432',
    basicSalary: 5500,
    allowances: 900,
    deductions: 400,
  },
];

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('resume');
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue } = useForm();

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (5MB Limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds the 5MB size limit. Please upload a smaller image.');
      return;
    }

    // Set preview locally
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const uId = profileData.user?._id || profileData.user;
      const response = await api.post(`/profile/${uId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data?.profilePicture) {
        setProfileData((prev: any) => ({
          ...prev,
          profilePicture: response.data.profilePicture,
        }));
        alert('Profile picture uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.response?.data?.message || 'Failed to upload image.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (profileData?.profilePicture) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${baseUrl}${profileData.profilePicture}`;
    }
    return null;
  };
  
  // Watch salary parameters to dynamically display computed Net Salary
  const basicSalary = watch('basicSalary', 0);
  const allowances = watch('allowances', 0);
  const deductions = watch('deductions', 0);
  const netSalary = Math.max(0, Number(basicSalary) + Number(allowances) - Number(deductions));

  useEffect(() => {
    // Resolve if own profile
    if (!id || id === user?.id) {
      setIsOwnProfile(true);
      // Mock loading logged in user's profile
      const loggedInEmp = mockEmployees.find(emp => emp.email === user?.email) || mockEmployees[0];
      setProfileData(loggedInEmp);
    } else {
      setIsOwnProfile(false);
      // Load specific employee's profile
      const match = mockEmployees.find(emp => emp.id === id) || mockEmployees[0];
      setProfileData(match);
    }
  }, [id, user]);

  useEffect(() => {
    if (profileData) {
      // Pre-fill form inputs
      setValue('degree', profileData.degree);
      setValue('institution', profileData.institution);
      setValue('passingYear', profileData.passingYear);
      setValue('experience', profileData.experience);
      setValue('skills', profileData.skills);
      
      setValue('gender', profileData.gender);
      setValue('dateOfBirth', profileData.dateOfBirth);
      setValue('phone', profileData.phone);
      setValue('address', profileData.address);
      setValue('emergencyName', profileData.emergencyName);
      setValue('emergencyRelationship', profileData.emergencyRelationship);
      setValue('emergencyPhone', profileData.emergencyPhone);
      
      setValue('designation', profileData.designation);
      setValue('department', profileData.department);
      setValue('dateOfJoining', profileData.dateOfJoining);
      setValue('basicSalary', profileData.basicSalary);
      setValue('allowances', profileData.allowances);
      setValue('deductions', profileData.deductions);
    }
  }, [profileData, setValue]);

  const onSubmit = (data: any) => {
    console.log('Profile changes saved:', data);
    alert('Dummy Profile Updated! (Check console for output)');
  };

  if (!profileData) {
    return (
      <div className="text-center py-12 text-slate-400 font-sans">Loading Profile details...</div>
    );
  }

  const tabs: { type: TabType; name: string }[] = [
    { type: 'resume', name: 'Resume' },
    { type: 'private', name: 'Private Info' },
    { type: 'salary', name: 'Salary Info' },
    { type: 'security', name: 'Security' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
        {/* Header Block */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col sm:flex-row items-center sm:space-x-6 text-center sm:text-left">
          <div
            onClick={handleAvatarClick}
            className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 mb-4 sm:mb-0 relative overflow-hidden group ${
              isOwnProfile ? 'cursor-pointer' : ''
            }`}
          >
            {getAvatarUrl() ? (
              <img src={getAvatarUrl()!} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span>{profileData.firstName[0]}{profileData.lastName[0]}</span>
            )}
            
            {isOwnProfile && (
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-[10px] font-bold text-slate-200">
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{uploading ? 'Uploading...' : 'Change'}</span>
              </div>
            )}
          </div>
          {isOwnProfile && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">{profileData.firstName} {profileData.lastName}</h1>
            <p className="text-indigo-400 font-semibold mt-0.5 text-sm">{profileData.designation} &bull; {profileData.department}</p>
            <p className="text-slate-500 text-xs mt-1">Status: <strong className="text-emerald-400">Active</strong></p>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-slate-800 overflow-x-auto space-x-6 pb-px">
          {tabs.map(tab => (
            <button
              key={tab.type}
              type="button"
              onClick={() => setActiveTab(tab.type)}
              className={`py-3 text-sm font-semibold border-b-2 outline-none transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.type
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          
          {/* Tab 1: Resume */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 pb-2 border-b border-slate-800">Professional Qualifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Highest Degree</label>
                  <input
                    type="text"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    placeholder="e.g. B.Tech / M.B.A"
                    {...register('degree')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Institution Name</label>
                  <input
                    type="text"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    placeholder="e.g. Stanford University"
                    {...register('institution')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Passing Year</label>
                  <input
                    type="number"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    placeholder="e.g. 2022"
                    {...register('passingYear')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Skills (Comma Separated)</label>
                  <input
                    type="text"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    placeholder="React, Node, Sales"
                    {...register('skills')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Work Experience Summary</label>
                <textarea
                  disabled={!isOwnProfile}
                  rows={4}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50 resize-none"
                  placeholder="Details of previous organizations, projects..."
                  {...register('experience')}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Private Info */}
          {activeTab === 'private' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 pb-2 border-b border-slate-800">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    {...register('gender')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="date"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    {...register('dateOfBirth')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Number</label>
                  <input
                    type="tel"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    {...register('phone')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address</label>
                  <input
                    type="text"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    {...register('address')}
                  />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-300 pt-2 pb-1.5 border-b border-slate-800/60">Emergency Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Contact Name</label>
                  <input
                    type="text"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    {...register('emergencyName')}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Relationship</label>
                  <input
                    type="text"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    {...register('emergencyRelationship')}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    disabled={!isOwnProfile}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                    {...register('emergencyPhone')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Salary Info */}
          {activeTab === 'salary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-lg font-bold text-slate-200">Employment & Salary Ledger</h3>
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 rounded-md border border-indigo-500/10 uppercase tracking-wide">
                  Locked View
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Designation</label>
                  <input
                    type="text"
                    disabled={true}
                    className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-400 rounded-xl px-4 py-2.5 outline-none text-sm cursor-not-allowed"
                    {...register('designation')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    disabled={true}
                    className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-400 rounded-xl px-4 py-2.5 outline-none text-sm cursor-not-allowed"
                    {...register('department')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date of Joining</label>
                  <input
                    type="date"
                    disabled={true}
                    className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-400 rounded-xl px-4 py-2.5 outline-none text-sm cursor-not-allowed"
                    {...register('dateOfJoining')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Basic Salary ($)</label>
                  <input
                    type="number"
                    disabled={true}
                    className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-400 rounded-xl px-4 py-2.5 outline-none text-sm cursor-not-allowed"
                    {...register('basicSalary')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Allowances ($)</label>
                  <input
                    type="number"
                    disabled={true}
                    className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-400 rounded-xl px-4 py-2.5 outline-none text-sm cursor-not-allowed"
                    {...register('allowances')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deductions ($)</label>
                  <input
                    type="number"
                    disabled={true}
                    className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-400 rounded-xl px-4 py-2.5 outline-none text-sm cursor-not-allowed"
                    {...register('deductions')}
                  />
                </div>
              </div>

              {/* Dynamically computed Net Salary widget */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between mt-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Calculated Net Payout</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Formula: Basic + Allowances - Deductions</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-400">${netSalary}</span>
                  <span className="text-[10px] text-slate-500 font-bold block">USD / Month</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 pb-2 border-b border-slate-800">Security Credentials</h3>
              
              {isOwnProfile ? (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Password Change Request Submitted!')}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors mt-2"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-850 p-6 rounded-2xl text-center">
                  <svg className="w-8 h-8 mx-auto text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-400">Security View Locked</p>
                  <p className="text-xs text-slate-600 mt-1">Credentials can only be managed by the account owner.</p>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          {isOwnProfile && activeTab !== 'security' && (
            <div className="pt-6 border-t border-slate-800/60 flex justify-end">
              <button
                type="submit"
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 active:scale-[0.98] text-xs uppercase tracking-wider"
              >
                Save Profile Changes
              </button>
            </div>
          )}
        </form>
    </div>
  );
};

export default ProfilePage;
