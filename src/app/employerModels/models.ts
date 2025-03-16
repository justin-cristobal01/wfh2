export enum Role {
  EMPLOYEE = "EMPLOYEE",
  ADMIN = "ADMIN",
}

export enum DTRProblemStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DISAPPROVED = "DISAPPROVED",
}

export enum Status{
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// User Model
export interface User {
  id: string;
  name: string;
  email: string;
  status: Status;
  password: string;
  employeeId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  employeeDetails?: EmployeeDetails; // One-to-One Relationship
  dailyTimeRecordProblems?: DailyTimeRecordProblem[];
  overtimes?: Overtime[];
  leaves?: Leave[];
}

// Employee Details Model
export interface EmployeeDetails {
  id: string;
  email: string;
  position: string;
  department: string;
  contactNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Daily Time Record Model
export interface DailyTimeRecord {
  id: string;
  userId: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Daily Time Record Problem Model
export interface DailyTimeRecordProblem {
  id: string;
  userId: string;
  date: string;
  type: string;
  remarks: string;
  status: DTRProblemStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Leave Model
export interface Leave {
  id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Overtime Model
export interface Overtime {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string;
  status: RequestStatus;
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}
