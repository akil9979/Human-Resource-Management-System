import User from '../models/user.js';
import EmployeeProfile from '../models/employeeProfile.js';

export const bootstrapAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      console.log('[BOOTSTRAP]: No Admin account found. Creating default system administrator...');

      const email = 'admin@company.com';
      const password = 'Admin@123'; // Note: User Schema pre-save hook will hash this automatically
      const role = 'Admin';
      const loginId = 'SYSADMIN';

      const user = new User({
        email,
        password,
        role,
        loginId,
      });

      await user.save();

      const profile = new EmployeeProfile({
        user: user._id,
        employeeId: loginId,
        firstName: 'System',
        lastName: 'Admin',
        gender: 'Other',
        dateOfBirth: new Date('1990-01-01T00:00:00.000Z'),
        contactNumber: '0000000000',
        emergencyContact: {
          name: 'System Default',
          relationship: 'System Default',
          phone: '0000000000',
        },
        address: 'System Address',
        department: 'HR',
        designation: 'Administrator',
        dateOfJoining: new Date(),
        salary: 0,
        status: 'Active',
      });

      await profile.save();
      console.log('[BOOTSTRAP]: Default Admin account (admin@company.com / Admin@123) initialized successfully.');
    } else {
      console.log('[BOOTSTRAP]: Admin account exists. Skipping bootstrap.');
    }
  } catch (error) {
    console.error('[BOOTSTRAP ERROR]: Failed to bootstrap default Admin user:', error);
  }
};
