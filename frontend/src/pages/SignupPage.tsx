import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.js';

export const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const password = watch('password');

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setValue('companyLogo', file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setValue('companyLogo', null);
  };

  const onSubmit = (data: any) => {
    console.log('Signup submitted with:', {
      ...data,
      companyLogo: data.companyLogo ? data.companyLogo.name : null
    });
    alert('Dummy Registration Success! (Check console for data)');
  };

  return (
    <AuthLayout title="Create Account" subtitle="Register your organization to get started">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="companyName">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              className={`w-full bg-slate-950/80 border ${errors.companyName ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 outline-none transition-all duration-200 focus:ring-1 text-sm`}
              placeholder="Acme Corp"
              {...register('companyName', { required: 'Company name is required' })}
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.companyName.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="employeeName">
              Employee Name
            </label>
            <input
              id="employeeName"
              type="text"
              className={`w-full bg-slate-950/80 border ${errors.employeeName ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 outline-none transition-all duration-200 focus:ring-1 text-sm`}
              placeholder="John Doe"
              {...register('employeeName', { required: 'Employee name is required' })}
            />
            {errors.employeeName && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.employeeName.message as string}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="text"
              className={`w-full bg-slate-950/80 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 outline-none transition-all duration-200 focus:ring-1 text-sm`}
              placeholder="john@company.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className={`w-full bg-slate-950/80 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 outline-none transition-all duration-200 focus:ring-1 text-sm`}
              placeholder="+1 (555) 000-0000"
              {...register('phone', {
                required: 'Phone number is required',
              })}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.phone.message as string}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`w-full bg-slate-950/80 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl pl-4 pr-10 py-2.5 outline-none transition-all duration-200 focus:ring-1 text-sm`}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'At least 6 characters long',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full bg-slate-950/80 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl pl-4 pr-10 py-2.5 outline-none transition-all duration-200 focus:ring-1 text-sm`}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.confirmPassword.message as string}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Company Logo
          </label>
          {logoPreview ? (
            <div className="flex items-center space-x-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 object-contain rounded-lg bg-slate-900 border border-slate-800" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 truncate">Selected Logo Preview</p>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="mt-1 text-xs text-red-400 hover:text-red-300 font-medium underline"
                >
                  Remove Image
                </button>
              </div>
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-950/40 hover:bg-slate-950/60 rounded-xl p-4 transition-all duration-200 group">
              <input
                type="file"
                accept="image/*"
                onChange={onLogoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <svg className="w-6 h-6 mx-auto text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-xs text-slate-400">
                  <span className="font-semibold text-indigo-400 group-hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">PNG, JPG, SVG up to 2MB</p>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 active:scale-[0.99]"
        >
          Register Organization
        </button>

        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
