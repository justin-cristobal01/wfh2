"use client";

import Navbar from "@/app/navbar/page";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation'; // Import the annotation plugin

// Register the Chart.js components and the annotation plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin // Register the annotation plugin
);

const ActivityMonitoring = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<{ activity: string; start: string; end: string,empId:string }[]>([]);
  const [activityChart, setActivityChart] = useState<{ activity: string; start: string; end: string }[]>([]);
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const employeeId = user?.employeeId;
  const [schedule, setSchedule] = useState(null); // Store schedule data


  const findSchedule = async (employeeId) => {
    try {
      const fetchEmployees = await fetch("/employerAPI/employee");

      if (!fetchEmployees.ok) {
        throw new Error("Failed to fetch employees");
      }

      const employees = await fetchEmployees.json();
      const employee = employees.find(emp => emp.employeeId === employeeId);


      if (!employee) {
        console.log("Employee not found");
        return null;
      }

      return {
        timeIn: employee.scheduleTimeIn || "07:00",
        timeOut: employee.scheduleTimeOut || "17:00",
      };
    } catch (error) {
      console.error("Error fetching employee schedule:", error);
      return null;
    }
  };

  const parseTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    return { hour, minute };
  };
  
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/"); // testing
    } else {
      setLoading(false);
    }
  }, []);

    // Fetch employee schedule when employeeId is available
    useEffect(() => {
      if (!employeeId) return;
  
      const fetchSchedule = async () => {
        const result = await findSchedule(employeeId);
        setSchedule(result);
      };
  
      fetchSchedule();
    }, [employeeId]);

  useEffect(() => {
    if (!employeeId) return;

    console.log(schedule,'schedule here')
    // Use SSE to listen for real-time updates of activity chart data
    const eventSource = new EventSource(`/employeeAPI/humanActivityGraph?employeeId=${employeeId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setActivityChart(data);
      } catch (error) {
        console.error("❌ Error parsing activity logs:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("❌ SSE connection error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [employeeId]);

  useEffect(() => {
    if (!employeeId) return;

    // Use SSE to listen for real-time updates of activity logs
    const eventSource = new EventSource(`/employeeAPI/humanActivityLog?employeeId=${employeeId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setActivityLogs(data); // Update UI with latest logs
      } catch (error) {
        console.error("❌ Error parsing activity logs:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("❌ SSE connection error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [employeeId]);

  const getChartData = () => {
    if (!schedule) return { labels: [], datasets: [] };
  
    const { hour: startHour, minute: startMinute } = parseTime(schedule.timeIn);
    const { hour: endHour, minute: endMinute } = parseTime(schedule.timeOut);
  
    // Generate labels dynamically based on the schedule time range
    const labels = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
  
    while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
      labels.push(`${currentHour}:${currentMinute < 10 ? "0" + currentMinute : currentMinute}`);
      currentMinute += 5;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }
  
    // Initialize activityData with zeros
    const activityData = {
      total: Array(labels.length).fill(0),
    };
  
    // Populate activity data dynamically based on logs
    activityLogs.forEach((log) => {
      const startTime = new Date(log.start);
      const endTime = new Date(log.end);
      const logStartHour = startTime.getHours();
      const logStartMinute = startTime.getMinutes();
      const logEndHour = endTime.getHours();
      const logEndMinute = endTime.getMinutes();

      const activity = log.activity;
  
      // Ensure the activity falls within the schedule range
      if (startHour >= startHour && startHour <= endHour) {
        let startIndex = Math.floor(((logStartHour - startHour) * 60 + logStartMinute) / 5);
        let endIndex = Math.floor(((logEndHour - startHour) * 60 + logEndMinute) / 5);
        
        if (endHour > endHour || (endHour === endHour && endMinute > endMinute)) {
          endIndex = labels.length - 1; // Trim activity to the schedule end time
        }
  
        const activityIndex = ["Active", "Idle", "Sleeping"].indexOf(activity);
        for (let i = startIndex; i <= endIndex; i++) {
          activityData.total[i] = activityIndex;
        }
      }
    });
  
    return {
      labels,                        
      datasets: [
        {
          label: "Activity (Total)",
          data: activityData.total,
          borderColor: "green",
          backgroundColor: "rgba(0, 128, 0, 0.2)",
          fill: false,
          tension: 0.1,
        },
      ],
    };
  };
  

  const formatDateToPHT = (dateString) => {
    const options = { timeZone: "Asia/Manila", hour12: false };
    return new Date(new Date(dateString).toLocaleString("en-US", options)).toLocaleString("en-US", options);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto p-2 mt-2">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
            <div className="bg-white shadow-xl text-black p-6 rounded-lg">
              <div className="mt-4 p-3 bg-gray-100 rounded-lg h-80">
                <Line
                  data={getChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false, // Disable the legend
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          callback: function (value) {
                            const activities = ["Active", "Idle", "Sleeping"];  // Updated order: Active, Idle, Sleeping
                            return activities[Number(value)] || (value < 3 ? value : ''); // Removes '3' value from display
                          },
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: `Time (${schedule?.timeIn || "07:00"} AM to ${schedule?.timeOut || "05:00"} PM)`,
                        },
                        ticks: {
                          autoSkip: true,
                          maxRotation: 90,
                          minRotation: 45,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
            <div className="bg-white shadow-xl text-black p-6 rounded-lg">
              <h2 className="text-xl font-semibold">HUMAN ACTIVITY RECOGNITION</h2>
              <p className="mt-2 text-sm text-gray-500">Alertness Report & Real-Time Alert Log.</p>
              <div className="mt-4 p-3 bg-gray-100 rounded-lg h-80 overflow-auto text-sm">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Real-Time Log:</h3>
                <ul className="space-y-2">
                  {activityLogs.length > 0 ? (
                    activityLogs.map((log, index) => (
                      <li key={index}>
                        <span className="font-medium">{log.activity}</span>
                        <span className="text-gray-500 text-xs ml-2">
                          {formatDateToPHT(log.start)} -{" "}
                          {log.end ? formatDateToPHT(log.end) : "Ongoing"}
                        </span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No logs available.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitoring;
