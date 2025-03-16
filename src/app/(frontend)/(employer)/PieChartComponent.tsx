"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Employee } from "./dummyData"; // Import Employee type

interface Props {
  employee: Employee | null;
}

const CustomPieChart: React.FC<Props> = ({ employee }) => {
  if (!employee) return <p className="text-gray-400">Select an employee to view activity.</p>;

  // Count occurrences of statuses
  const statusCounts = employee.activityLog.reduce<Record<string, number>>((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {});

  // Define chart data
  const data = [
    { name: "Work", value: statusCounts["Active"] || 0, color: "#4CAF50" }, // Green
    { name: "Break", value: statusCounts["On Meeting"] || 0, color: "#FFC107" }, // Yellow
    { name: "Idle", value: statusCounts["Idle"] || 0, color: "#F44336" }, // Red
  ];

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-primary mb-4">Employee Activity</h2>
      
      <PieChart width={300} height={300}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default CustomPieChart;
