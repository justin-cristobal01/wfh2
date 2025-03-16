export type Employee = {
  id: number;
  name: string;
  status: string;
  activeness: {
    blinkRate: string;
    duration: string;
    yawningFrequency: string;
    nodMotions: string;
    drowsinessDetection: string;
  };
  activityLog: { date: string; log: string; status: string }[];
  attendance: { date: string; loginTime: string; logoutTime: string; hoursWorked: string }[];
  productivity: { productive: number; idle: number };
};

export const employees: Employee[] = [
  {
    id: 1,
    name: "Jaykko",
    status: "Idle",
    activeness: {
      blinkRate: "18 blinks/min",
      duration: "2 hours",
      yawningFrequency: "3 yawns in 10 mins",
      nodMotions: "Occasional nodding detected",
      drowsinessDetection: "Wakefulness dropped at 7:45 AM",
    },
    activityLog: [
      { date: "2024-02-18", log: "Logged in at 7:00 AM", status: "Active" },
      { date: "2024-02-18", log: "No motion detected at 7:01 AM", status: "Idle" },
    ],
    attendance: [
      { date: "2024-02-18", loginTime: "07:00 AM", logoutTime: "04:00 PM", hoursWorked: "9 hours" },
      { date: "2024-02-19", loginTime: "08:00 AM", logoutTime: "05:00 PM", hoursWorked: "9 hours" },
    ],
    productivity: { productive: 70, idle: 30 },
  },
  {
    id: 2,
    name: "Justin",
    status: "Active",
    activeness: {
      blinkRate: "20 blinks/min",
      duration: "3 hours",
      yawningFrequency: "1 yawn in 15 mins",
      nodMotions: "No nodding detected",
      drowsinessDetection: "Wakefulness stable",
    },
    activityLog: [
      { date: "2024-02-18", log: "Logged in at 8:00 AM", status: "Active" },
    ],
    attendance: [
      { date: "2024-02-18", loginTime: "08:00 AM", logoutTime: "05:00 PM", hoursWorked: "9 hours" },
      { date: "2024-02-19", loginTime: "09:00 AM", logoutTime: "06:00 PM", hoursWorked: "9 hours" },
    ],
    productivity: { productive: 80, idle: 20 },
  },
  {
    id: 3,
    name: "Jp",
    status: "On Meeting",
    activeness: {
      blinkRate: "16 blinks/min",
      duration: "1.5 hours",
      yawningFrequency: "2 yawns in 10 mins",
      nodMotions: "Mild nodding detected",
      drowsinessDetection: "Wakefulness dropped at 9:30 AM",
    },
    activityLog: [
      { date: "2024-02-19", log: "Joined a meeting at 9:00 AM", status: "On Meeting" },
    ],
    attendance: [
      { date: "2024-02-18", loginTime: "08:30 AM", logoutTime: "04:30 PM", hoursWorked: "8 hours" },
      { date: "2024-02-19", loginTime: "09:00 AM", logoutTime: "05:00 PM", hoursWorked: "8 hours" },
    ],
    productivity: { productive: 60, idle: 40 },
  },
];
