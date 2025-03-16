import React, { useEffect, useState } from "react";

const ViewAttendanceModal = ({ isModalOpen, closeModal, employee }) => {
  const [attendance, setAttendance] = useState([]); 
  const [filteredAttendance, setFilteredAttendance] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState(""); 
  const itemsPerPage = 5;

  useEffect(() => {
    if (!employee) return;

    const fetchAttendance = async () => {
      try {
        const empResponse = await fetch(`/employerAPI/checkAttendance?employeeId=${employee.employeeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await empResponse.json();

        if (data && Array.isArray(data.employees)) {
          setAttendance(data.employees);
          setFilteredAttendance(data.employees); // Initialize filtered list
        } else {
          setAttendance([]);
          setFilteredAttendance([]);
        }

        console.log("Employee Attendance:", data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setAttendance([]);
        setFilteredAttendance([]);
      }
    };

    fetchAttendance();
  }, [employee]);

  // Filter attendance records by selected date range
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredAttendance(attendance);
      return;
    }

    const filtered = attendance.filter((att) => {
      const attDate = new Date(att.date);
      return attDate >= new Date(startDate) && attDate <= new Date(endDate);
    });

    setFilteredAttendance(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [startDate, endDate, attendance]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAttendance.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

  return (
    <div>
      {/* Modal Dialog */}
      <dialog id="attendance_modal" className="modal" open={isModalOpen}>
        <div className="modal-box w-11/12 max-w-5xl bg-white">
          <h3 className="font-bold text-lg">View Attendance</h3>
          {employee ? (
            <p className="py-4">Name: {employee.name}</p>
          ) : (
            <p className="py-4">No employee selected.</p>
          )}

          {/* Date Range Filter */}
          <div className="flex gap-4 mb-4">
            <label className="text-black">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-1"
            />

            <label className="text-black">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-1"
            />

            <button
              className="btn btn-sm bg-gray-500 text-white"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setFilteredAttendance(attendance);
              }}
            >
              Reset
            </button>
          </div>

          <div className="overflow-x-auto min-h-[450px]">
            <table className="table table-xs">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border-b text-black text-center">Date</th>
                  <th className="px-4 py-2 border-b text-black text-center">Time in</th>
                  <th className="px-4 py-2 border-b text-black text-center">Time out</th>
                  <th className="px-4 py-2 border-b text-black text-center">Hours Rendered</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((att) => {
                    const formattedDate = new Date(att.date).toLocaleDateString();
                    const formattedTimeIn = att.timeIn
                      ? new Date(att.timeIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "N/A";
                    const formattedTimeOut = att.timeOut
                      ? new Date(att.timeOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "N/A";

                    return (
                      <tr key={att.id}>
                        <td className="px-4 py-2 border-b text-black text-center">{formattedDate}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{formattedTimeIn}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{formattedTimeOut}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{att.duration ? `${att.duration} mins` : "N/A"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-500">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              className={`btn ${currentPage === 1 ? "btn-disabled" : ""}`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span className="text-black">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={`btn ${currentPage === totalPages || filteredAttendance.length === 0 ? "btn-disabled" : ""}`}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn"
                onClick={() => {
                  document.getElementById("attendance_modal").close();
                  closeModal();
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ViewAttendanceModal;
