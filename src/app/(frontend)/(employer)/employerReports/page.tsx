"use client";

import NavbarEmployer from "@/app/navbarEmployer/page";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Chart from "chart.js/auto";

const Reports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [attendance,setAttendance] = useState([]);
  const router = useRouter();

  const itemsPerPage = 5;
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedEmployees = employees.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]); // Deselect all
    } else {
      setSelectedEmployees(employees.map((emp) => emp.employeeId)); // Select all employees
    }
    setSelectAll(!selectAll);
  };
  

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleSelectEmployee = (id) => {
    setSelectedEmployees((prevSelected) => {
      const updatedSelection = prevSelected.includes(id)
        ? prevSelected.filter((empId) => empId !== id)
        : [...prevSelected, id];
  
      // Check if all employees are now selected
      setSelectAll(updatedSelection.length === employees.length);
  
      return updatedSelection;
    });
  };
  

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/employerAPI/employee");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const employeesData = await response.json();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/");
    } else {
      fetchEmployees();
    }
  }, []);

  const fetchAttendance = async (employeeId, startDate, endDate) => {
    try {
      const response = await fetch(
        `/employerAPI/checkAttendance?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance data");
  
      const data = await response.json();
      const attendanceArray = data.employees || [];
  
      if (!Array.isArray(attendanceArray)) {
        console.warn(`Unexpected attendance data format for Employee ID: ${employeeId}`, data);
        return [];
      }
  
      return attendanceArray;
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      return [];
    }
  };
  
  
  
  const generateReport = async () => {
    console.log("Generate report clicked");
  
    if (selectedEmployees.length === 0) {
      alert("No employees selected.");
      return;
    }
  
    const zip = new JSZip();
    let fileCount = 0;
  
    for (const employeeId of selectedEmployees) {
      console.log(`Fetching attendance for Employee ID: ${employeeId}`);
  
      const employee = employees.find((emp) => emp.employeeId === employeeId);
      if (!employee) {
        console.warn(`Employee not found for ID: ${employeeId}`);
        continue;
      }
  
      const attendanceData = await fetchAttendance(employeeId, startDate, endDate);
  
      if (!attendanceData || attendanceData.length === 0) {
        console.warn(`No attendance data found for ${employee.name}`);
        continue;
      }

   
      const ActivityLogResponse = await fetch("/employerAPI/humanActivityLog");
      if (!ActivityLogResponse.ok) {
        throw new Error("Failed to fetch employees");
      }
      const ActivityLogData = await ActivityLogResponse.json();

      const totalDurations = ActivityLogData.reduce(
        (acc, log) => {
          if (log.activity === "Idle") {
            acc.idle += log.duration;
          } else if (log.activity === "Sleeping") {
            acc.sleeping += log.duration;
          }
          return acc;
        },
        { idle: 0, sleeping: 0 } // Initial state
      );
  
      console.log(`Generating PDF for ${employee.name}`);
  
      const doc = new jsPDF();
  
      let totalHours = 0; // Initialize total hours for the employee
  
      const tableData = attendanceData.map((record) => {
        const checkIn = record.timeIn ? new Date(record.timeIn) : null;
        const checkOut = record.timeOut ? new Date(record.timeOut) : null;
        const status = record.remarks || "N/A";
  
        let renderedHours = 0;
  
        // If employee is on leave, set rendered hours to 0
        if (status !== "On Leave" && checkIn && checkOut) {
          renderedHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert ms to hours
          totalHours += renderedHours; // Accumulate total hours
        }
  
        return [
          new Date(record.date).toLocaleDateString(), // Date
          checkIn ? checkIn.toLocaleString("en-US", { hour12: true }) : "N/A", // Check-In with Date & Time
          checkOut ? checkOut.toLocaleString("en-US", { hour12: true }) : "N/A", // Check-Out with Date & Time
          status, // Status
          renderedHours.toFixed(2), // Rendered Hours
        ];
      });
  
      // Add table with date included in check-in & check-out
      autoTable(doc, {
        startY: 80,
        head: [["Date", "Check-In", "Check-Out", "Status", "Rendered Hours"]],
        body: tableData,
      });
  
      // Add total rendered hours at the bottom
     // Set title
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(`Attendance Report`, 105, 15, { align: "center" });

        // Employee Name
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${employee.name}`, 105, 25, { align: "center" });

         // Draw a horizontal line
        doc.setLineWidth(0.5); // Set line thickness
        doc.line(14, 35, 196, 35); // (startX, startY, endX, endY)


        // Rendered Hours Breakdown
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Total Rendered Hours:", 14, 40);
        doc.setFont("helvetica", "normal");
        doc.text(`${totalHours.toFixed(2)} hrs`, 70, 40);

        doc.setFont("helvetica", "bold");
        doc.text("Total Sleep Hours:", 14, 50);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 102, 204); // Blue
        doc.text(`${totalDurations.sleeping.toFixed(2)} hrs`, 70, 50);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.text("Total Idle Hours:", 14, 60);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(255, 51, 51); // Red
        doc.text(`${totalDurations.idle.toFixed(2)} hrs`, 70, 60);

        // Reset text color to black for further content
        doc.setTextColor(0, 0, 0);

  
      console.log(`Saving PDF for ${employee.name}`);
  
      const sanitizedFileName = `${employee.name.replace(/[^a-zA-Z0-9_ ]/g, "")}_${startDate.replace(/[:]/g, "-")}_${endDate.replace(/[:]/g, "-")}.pdf`;
  
      const pdfBlob = await doc.output("blob");
      zip.file(sanitizedFileName, pdfBlob);
      fileCount++;
    }
  
    if (fileCount > 0) {
      console.log(`Generating ZIP file with ${fileCount} PDFs...`);
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "Employee_Attendance_Reports.zip");
        console.log("ZIP file downloaded!");
      });
    } else {
      console.log("No PDFs were generated.");
    }
  };
  

  
  
  
  
  

  return (
    <div className="min-h-screen shadow-md bg-white">
      <NavbarEmployer />
      <div className="container mx-auto p-4 mt-4">
        <div className="space-y-4">
          <div className="custom-card-bg shadow-md text-white shadow-xl p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">EMPLOYEE ATTENDANCE</h2>
            <div className="mb-4 flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full p-2 border bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full p-2 border bg-white text-black"
              />
            </div>
            </div>
            <div className="overflow-x-auto min-h-[450px]">
              <table className="table table-xs">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 border-b text-black text-center">
                      <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
                    </th>
                    <th className="px-4 py-2 border-b text-black text-center">Name</th>
                    <th className="px-4 py-2 border-b text-black text-center">Employee ID</th>
                    <th className="px-4 py-2 border-b text-black text-center">Email</th>
                    <th className="px-4 py-2 border-b text-black text-center">Position</th>
                    <th className="px-4 py-2 border-b text-black text-center">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEmployees.length > 0 ? (
                    displayedEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td className="px-4 py-2 border-b text-black text-center">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(emp.employeeId)}
                            onChange={() => toggleSelectEmployee(emp.employeeId)}
                          />
                        </td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.name}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.employeeId}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.email}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.position}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.department}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center p-4 text-gray-500">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className=" text-center">
              <button onClick={generateReport} className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold">
                Generate Reports
              </button>

              <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Reports;
