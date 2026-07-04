import { Schema, model, Types } from 'mongoose';

export interface IAttendance {
  employee: Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  location: 'Office' | 'Remote';
  workHours?: number;
  extraHours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in time is required'],
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'],
        message: '{VALUE} is not a valid attendance status',
      },
      default: 'Present',
    },
    location: {
      type: String,
      enum: {
        values: ['Office', 'Remote'],
        message: '{VALUE} is not a valid location type',
      },
      default: 'Office',
    },
    workHours: {
      type: Number,
      default: 0,
      min: [0, 'Work hours cannot be negative'],
    },
    extraHours: {
      type: Number,
      default: 0,
      min: [0, 'Extra hours cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index on employee and date to prevent double entry for the same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Pre-save hook to normalize date to midnight for consistent daily query lookups
attendanceSchema.pre('save', function (next) {
  if (this.isModified('date')) {
    const d = new Date(this.date);
    d.setUTCHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;
