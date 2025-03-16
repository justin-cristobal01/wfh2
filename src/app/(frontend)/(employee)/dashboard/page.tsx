"use client";

import Navbar from "@/app/navbar/page";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useRouter } from "next/navigation";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [activityStatus, setActivityStatus] = useState("ACTIVE");
  const [wakefulnessStatus, setWakefulnessStatus] = useState("Idle");
  const [productivityPercentage, setProductivityPercentage] = useState(0); 
  const [latestRequests, setLatestRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const router = useRouter();
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const employeeId = user?.employeeId;
  const [idle, SetIdle] = useState(0);
  const [sleep, SetSleep] = useState(0);
  const [totaltime, SetTotalTime] = useState(0);
  const [dateRange, setDateRange] = useState("Daily");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      router.push("/"); // Redirect if not logged in
    } else {
      fetchNotificationLogs();
    }
  }, []);

  const fetchNotificationLogs = async () => {
    try {
      if (!employeeId) return;
      const response = await fetch(`/employeeAPI/notifications?employeeId=${employeeId}`);
      const data = await response.json();

      setLatestRequests(data.latest || []);
      setPendingRequests(data.pending || []);
    } catch (error) {
      console.error("Error fetching notification logs:", error);
      setLatestRequests([]);
      setPendingRequests([]);
    }
  };

  useEffect(() => {
    if (!employeeId) return;

    // Use SSE to listen for real-time updates of activity chart data
    const eventSource = new EventSource(`/employeeAPI/dashboard?employeeId=${employeeId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (!data || Object.keys(data).length === 0) {
          console.warn("No data received from SSE connection.");
          SetIdle(0);
          SetSleep(0);
          SetTotalTime(0);
          setActivityStatus("ACTIVE");
          setWakefulnessStatus("Idle");
          setProductivityPercentage(0);
        } else {
          SetIdle(data.idleTime || 0);
          SetSleep(data.sleepingTime || 0);
          SetTotalTime(data.totaltime || 0);
          setActivityStatus(data.employeeStatus || "ACTIVE");
          setWakefulnessStatus(data.wakefulnessStatus || "Idle");
          setProductivityPercentage(data.productivityPercentage || 100);
        }
      } catch (error) {
        setActivityStatus("ACTIVE");
        setWakefulnessStatus("Idle");
        setProductivityPercentage(0);
        SetIdle(0);
        SetSleep(0);
        SetTotalTime(0);
      }
    };

    eventSource.onerror = (error) => {
      setActivityStatus("ACTIVE");
      setWakefulnessStatus("Idle");
      setProductivityPercentage(0);
      SetIdle(0);
      SetSleep(0);
      SetTotalTime(0);

      eventSource.close(); // Close the connection gracefully
    };

    return () => {
      eventSource.close(); // Clean up when component unmounts
    };
  }, [employeeId]);

  const handleNavigation = (type: string) => {
    if (type === "DTRP") router.push("/dtr-problem");
    else if (type === "Overtime") router.push("/overtime");
    else if (type === "Leave") router.push("/leaves");
  };

  const donutData = () => {
    if (totaltime === 0) {
      return {
        labels: ["No Data"],
        datasets: [{
          data: [1, 1, 1],
          backgroundColor: ["#e0e0e0"],
        }]
      };
    }
    const idleTimePercentage = (idle / totaltime) * 100;
    const sleepingTimePercentage = (sleep / totaltime) * 100;
    const productiveTimePercentage = 100 - idleTimePercentage - sleepingTimePercentage;

    return {
      labels: ["Productive Tasks", "Idle Time", "Sleeping"],
      datasets: [
        {
          data: [productiveTimePercentage, idleTimePercentage, sleepingTimePercentage],
          backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
          hoverBackgroundColor: ["#45a049", "#ffca2c", "#e53935"],
        },
      ],
    };
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);

    if (e.target.value === "Date Range") {
      setStartDate("2025-01-01");
      setEndDate("2025-01-31");
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen shadow-md bg-white">
      <Navbar />
      <div className="container mx-auto p-2 mt-2">
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Activity Card */}
            <div className="flex-1 bg-white shadow-lg rounded-lg p-4 text-gray-700">
              <h2 className="text-xl font-bold mb-4">Employee Activity & Productivity</h2>
              <p>
                <strong>Activity:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-white text-xs ${
                    activityStatus === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {activityStatus}
                </span>
              </p>
              <p>
                <strong>Productivity:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-white text-xs ${
                    productivityPercentage <= 50 ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {productivityPercentage}%
                </span>
              </p>
              <p>
                <strong>Wakefulness:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-white text-xs ${
                    wakefulnessStatus === "Awake"
                      ? "bg-green-500"
                      : wakefulnessStatus === "Idle"
                      ? "bg-yellow-500"
                      : wakefulnessStatus === "Sleeping"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                >
                  {wakefulnessStatus}
                </span>
              </p>
            </div>

            {/* Quick Access */}
            <div className="card bg-white shadow-md text-black p-10">
              <h2 className="text-lg font-semibold">Quick Access</h2>
              <ul className="space-y-2">
                <li><a href="/dtr-problem" className="text-blue-500 hover:underline">Daily Time Record Problems</a></li>
                <li><a href="/leaves" className="text-blue-500 hover:underline">Leaves</a></li>
                <li><a href="/overtime" className="text-blue-500 hover:underline">Overtime</a></li>
              </ul>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
            {/* Notification Logs Card */}
            <div className="card bg-white shadow-md text-black p-10">
              <h1 className="text-xl font-bold mb-4">NOTIFICATION LOGS</h1>

              {/* Latest Requests */}
              <h2 className="font-semibold text-lg ">Latest Requests</h2>

              <hr className="my-2 border-gray-300" />
              {latestRequests.length > 0 ? (
                <div className="mb-4">
                  {["Leave", "Overtime", "DTRP"].map((type) => {
                    const filteredRequests = latestRequests
                      .filter((req) => req.type === type)
                      .slice(0, 2); // Show only the two most recent requests

                    return (
                      <div key={type} className="mb-3">
                        <h4 className="font-semibold text-[12px]">{type}</h4>
                        {filteredRequests.length > 0 ? (
                          <ul>
                            {filteredRequests.map((req, index) => (
                              <li
                                key={index}
                                onClick={() => handleNavigation(req.type)}
                                className="text-blue-600 border-b py-2 cursor-pointer hover:text-blue-300 text-[10px]"
                              >
                                {req.status} ({new Date(req.createdAt).toLocaleString()})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No recent {type.toLowerCase()} requests</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No recent requests</p>
              )}

              {/* Pending Requests */}
              <h3 className="font-semibold text-lg ">Pending Requests</h3>

              <hr className="my-2 border-gray-300" />
              {pendingRequests.length > 0 ? (
                <div>
                  {["Leave", "Overtime", "DTRP"].map((type) => {
                    const filteredRequests = pendingRequests
                    .filter((req) => req.type === type)
                    .slice(0, 2); // Show only the two most recent requests


                    return (
                      <div key={type} className="mb-3">
                        <h4 className="font-semibold text-[12px]">{type}</h4>
                        {filteredRequests.length > 0 ? (
                          <ul>
                            {filteredRequests.map((req, index) => (
                              <li
                                key={index}
                                onClick={() => handleNavigation(req.type)}
                                className="text-blue-600 border-b py-2 cursor-pointer hover:text-blue-300 text-[10px]"
                              >
                                {req.status} ({new Date(req.createdAt).toLocaleString()})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No pending {type.toLowerCase()} requests</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No pending requests</p>
              )}
            </div>

            {/* Productivity vs Idle Time Card */}
            <div className="card bg-white shadow-md text-black p-10">
              <h2 className="text-xl font-bold mb-4">Productivity vs Idle Time vs Sleeping Time</h2>

              {/* Date Range Selector inside the card */}
              <div className="mb-4">
                <label htmlFor="dateRange" className="text-sm font-medium">Filter by: </label>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  className="mt-2 border p-2 rounded"
                >
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Date Range">Date Range</option>
                </select>
              </div>

              <div className="flex justify-center items-center w-full h-full">
                <div className="w-80 h-80">
                  <Doughnut data={donutData()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Date Range */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-94">
            <h3 className="text-lg font-semibold mb-4">Selected Date Range</h3>

            {/* Display Date Range details with Date Picker */}
            <div className="space-y-4 mb-4">
              <div className="flex justify-between space-x-2">
                <div className="flex-1">
                  <label htmlFor="startDate" className="text-sm font-medium">Date From:</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2 border p-2 rounded w-full"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="endDate" className="text-sm font-medium">Date To:</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2 border p-2 rounded w-full"
                  />
                </div>
              </div>
            </div>

            {/* Buttons aligned in one line */}
            <div className="flex space-x-4 mt-4">
              <button
                onClick={closeModal}
                className="px-8 py-2 bg-red-500 text-white rounded w-full sm:w-auto ml-60"
              >
                Exit
              </button>
              <button
                onClick={closeModal}
                className="px-8 py-2 bg-blue-500 text-white rounded w-full sm:w-auto ml-auto"
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
