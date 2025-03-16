"use client";

import Navbar from "@/app/navbar/page";
import { MoreVertical, Plus } from "lucide-react";
import LeaveModal from "../modals/leave-form/page";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DeleteLeaveModal from "@/app/components/deleteLeave";

const Leaves = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const router = useRouter();
  const [isDeleting,setIsDeleting] = useState(false);
  const [deletingLeave,setdeletingLeave] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetchLeaves();

    if (message) {
      const timer = setTimeout(() => {
        setMessage(""); // Clear the message after 2 seconds
      }, 2000);
  
      return () => clearTimeout(timer); // Cleanup the timer when the component is unmounted or when the message changes
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        Object.values(dropdownRefs.current).some(
          (ref) => ref && ref.contains(event.target as Node)
        )
      ) {
        return;
      }
      setDropdownOpen(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currentPage, rowsPerPage,message]); // Include rowsPerPage in the dependency array

  const fetchLeaves = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        router.push("/");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const employeeId = storedUser?.employeeId;

      if (!employeeId) {
        setMessage("User ID not found");
        setMessageType("error");
        return;
      }

      const queryParams = new URLSearchParams({ employeeId, page: String(currentPage), pageSize: String(rowsPerPage) });

      if (leaveType) queryParams.append("leaveType", leaveType);
      if (status) queryParams.append("status", status);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const res = await fetch(`/employeeAPI/leave?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const data = await res.json();
      setLeaves(data.leaves || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      setMessage("Error fetching leaves");
      setMessageType("error");
      setLoading(false);
    }
  };

  const handleEdit = (leave: any) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
    setDropdownOpen(null);
  };

  // const handleDelete = async (leaveId: string) => {
  //   if (!confirm("Are you sure you want to delete this leave request?")) return;

  //   try {
  //     const authToken = localStorage.getItem("authToken");
  //     if (!authToken) {
  //       alert("Authentication failed. Please log in again.");
  //       router.push("/");
  //       return;
  //     }

  //     const res = await fetch(`/employeeAPI/leave`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //       body: JSON.stringify({ id: leaveId }), // ✅ Send ID in the request body
  //     });

  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData.error || "Failed to delete leave");
  //     }
  //     setMessage("Leave request deleted successfully.");
  //     setMessageType("success");
  //     fetchLeaves(); // Refresh the list after successful deletion
  //   } catch (error) {
  //     console.error("Error deleting leave:", error);
  //     setMessage("An error occurred while deleting the leave request.");
  //     setMessageType("error");
  //   }

  //   setDropdownOpen(null);
  // };
  const handleMessageUpdate = (newMessage: string) => {
    setMessage(newMessage);
  };
  return (
    <div className="min-h-screen shadow-md bg-white">
      <Navbar />
      {message && (
        <div
          className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg border ${
            messageType === "error"
              ? "bg-red-600 border-red-800"
              : "bg-green-600 border-green-800"
          } text-white z-50`}
        >
          {message}
        </div>
      )}
      <div className="container mx-auto p-2 mt-2  text-black">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h1>Filter By:</h1>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-md bg-white"
              >
                <option value="">Select Filter</option>
                <option value="leaveType">Leave Type</option>
                <option value="dateRange">Date Range</option>
                <option value="status">Status</option>
              </select>

              {filterType === "leaveType" && (
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white"
                >
                  <option value="">Select Leave Type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation Leave">Vacation Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              )}

              {filterType === "dateRange" && (
                <>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 border rounded-md bg-white"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 border rounded-md bg-white"
                  />
                </>
              )}

              {filterType === "status" && (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white"
                >
                  <option value="">Select Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Disapproved">Disapproved</option>
                </select>
              )}

              <button
                onClick={fetchLeaves}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Filter
              </button>
              
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              <Plus className="w-5 h-5 mr-2" /> Add
            </button>
          </div>
          {/* Rows per page */}
          <div className="flex items-center space-x-2">
              <label>Rows</label>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-4 py-2 border rounded-md bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
          </div>
            
          <div className="overflow-x-auto h-[420px]">
            <table className="table table-xs w-full">
              <thead>
                <tr className="bg-gray-200 sticky top-0">
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>No. of Days</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave: any) => (
                  <tr key={leave.id}>
                    <td>{leave.leaveType}</td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td>
                      {leave.startDate === leave.endDate
                        ? 1
                        : Math.ceil(
                            (new Date(leave.endDate) - new Date(leave.startDate)) /
                              (1000 * 60 * 60 * 24)
                          )}
                    </td>
                    {
                        leave.status === "PENDING" ? (
                          <td><div className="text-warning">PENDING</div></td>
                        ) : leave.status === "APPROVED" ? (
                          <td><div className="text-success">APPROVED</div></td>
                        ) : (
                          <td><div className="text-error">REJECTED</div></td>
                        )
                      }
                    <td className="relative">
                      {leave.status === "PENDING" && (
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[leave.id] = el)}
                        >
                          <button
                            onClick={() =>
                              setDropdownOpen(dropdownOpen === leave.id ? null : leave.id)
                            }
                          >
                            <MoreVertical />
                          </button>

                          {dropdownOpen === leave.id && (
                            <div className="absolute left-0 mt-2 bg-white shadow-lg rounded-md border w-32 z-50">
                              <button
                                onClick={() => handleEdit(leave)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                              >
                                Edit
                              </button>
                              <button
                               onClick={() => {
                                setdeletingLeave(leave);  
                                setIsDeleting(true); setDropdownOpen(null)}}
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 ml-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>

            
          </div>
        </div>
      </div>
           <LeaveModal 
                  isOpen={isModalOpen} 
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLeave(null); 
                  }} 
                  leave={selectedLeave} 
                  refresh={fetchLeaves} 
                  setMessage={handleMessageUpdate}  
                />
                <DeleteLeaveModal 
                      isOpen={isDeleting}
                      onClose={() => {setIsDeleting(false); fetchLeaves();}}
                      leave={deletingLeave}
                      alertMessage={alertMessage}
                    />
    </div>
  );
};

export default Leaves;
