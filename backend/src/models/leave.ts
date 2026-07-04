import { Schema, model, Types } from 'mongoose';

export interface ILeave {
  employee: Types.ObjectId;
  leaveType: 'Sick' | 'Casual' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Annual';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: ['Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid', 'Annual'],
        message: '{VALUE} is not a valid leave type',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (this: any, value: Date) {
          // If this.startDate is defined, validate that endDate >= startDate
          return !this.startDate || value >= this.startDate;
        },
        message: 'End date must be greater than or equal to start date',
      },
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid leave status',
      },
      default: 'Pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Leave = model<ILeave>('Leave', leaveSchema);
export default Leave;
