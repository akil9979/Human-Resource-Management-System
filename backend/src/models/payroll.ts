import { Schema, model, Types } from 'mongoose';

export interface IPayroll {
  employee: Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Pending' | 'Processed' | 'Paid';
  paymentDate?: Date;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash';
  createdAt?: Date;
  updatedAt?: Date;
}

const payrollSchema = new Schema<IPayroll>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    month: {
      type: Number,
      required: [true, 'Payroll month is required'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },
    year: {
      type: Number,
      required: [true, 'Payroll year is required'],
      min: [2000, 'Year must be greater than or equal to 2000'],
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: [0, 'Basic salary cannot be negative'],
    },
    allowances: {
      type: Number,
      default: 0,
      min: [0, 'Allowances cannot be negative'],
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, 'Deductions cannot be negative'],
    },
    netSalary: {
      type: Number,
      required: [true, 'Net salary is required'],
      min: [0, 'Net salary cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Processed', 'Paid'],
        message: '{VALUE} is not a valid payroll status',
      },
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['Bank Transfer', 'Cheque', 'Cash'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'Bank Transfer',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate to automatically compute netSalary if not explicitly provided
payrollSchema.pre('validate', function (next) {
  const basic = this.basicSalary || 0;
  const allow = this.allowances || 0;
  const deduct = this.deductions || 0;
  this.netSalary = Math.max(0, basic + allow - deduct);
  next();
});

// Ensure a single payroll run per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export const Payroll = model<IPayroll>('Payroll', payrollSchema);
export default Payroll;
