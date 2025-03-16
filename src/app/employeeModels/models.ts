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
  
  // User Model
  export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    employeeId: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
    employees?: Employee[];
    dailyTimeRecordProblems?: DailyTimeRecordProblem[];
  }
  
  // Employee Model
  export interface Employee {
    id: string;
    userId: string;
    position: string;
    department: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
    dtr?: DailyTimeRecord[];
    overtimes?: Overtime[];
    leaves?: Leave[];
  }
  
  // Daily Time Record Model
  export interface DailyTimeRecord {
    id: number;
    employeeId: string;
    date: string;
    day: string;
    checkIn?: string;
    breakOut?: string;
    breakIn?: string;
    checkOut?: string;
    createdAt: string;
    updatedAt: string;
    employee?: Employee;
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
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: RequestStatus;
    createdAt: string;
    updatedAt: string;
    employee?: Employee;
  }
  
  // Overtime Model
  export interface Overtime {
    id: string;
    employeeId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    reason: string;
    status: RequestStatus;
    approvedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    employee?: Employee;
  }
  