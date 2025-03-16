"use client";

import Navbar from "@/app/navbar/page";
import { MoreVertical, Plus } from "lucide-react";
import OvertimeModal from "../modals/overtime-form/page"; 
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DeleteOvertimeModal from "@/app/components/deleteOvertime"; 

const Overtime = () => {  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overtimes, setOvertimes] = useState([]);  
  const [selectedOvertime, setSelectedOvertime] = useState(null);  
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingOvertime, setDeletingOvertime] = useState(null);  // Renamed from deletingLeave to deletingOvertime
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetchOvertimes(); 

    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 2000);
  
      return () => clearTimeout(timer); 
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
  }, [currentPage, rowsPerPage, message]); 

  const fetchOvertimes = async () => {  
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

      if (status) queryParams.append("status", status);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const res = await fetch(`/employeeAPI/overtime?${queryParams.toString()}`, {  
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const data = await res.json();
      setOvertimes(data.overtimes || []);  
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      setMessage("Error fetching overtimes");  
      setMessageType("error");
      setLoading(false);
    }
  };

  const handleEdit = (overtime: any) => {  
    setSelectedOvertime(overtime);  
    setIsModalOpen(true);
    setDropdownOpen(null);
  };

  const handleMessageUpdate = (newMessage: string) => {
    setMessage(newMessage);
  };
  const handleMessageError = (newMessage: string) => {
    setMessageType(newMessage);
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
      <div className="container mx-auto p-2 mt-2 text-black">
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
                <option value="dateRange">Date Range</option>
                <option value="status">Status</option>
              </select>

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
                onClick={fetchOvertimes}  // Renamed from fetchLeaves to fetchOvertimes
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
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>No. of Hours</th> 
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overtimes.map((overtime: any) => (  
                  <tr key={overtime.id}>
                    <td>{new Date(overtime.startDate).toLocaleDateString()} {new Date(overtime.startDate).toLocaleTimeString('en-GB', { hour12: true })}</td>
                    <td>{new Date(overtime.endDate).toLocaleDateString()} {new Date(overtime.endDate).toLocaleTimeString('en-GB', { hour12: true })}</td>
                    <td>
                      {overtime.startDate === overtime.endDate
                        ? 1
                        : Math.ceil(
                            (new Date(overtime.endDate) - new Date(overtime.startDate)) / 
                              (1000 * 60 * 60)
                          )}
                    </td>
                    {
                        overtime.status === "PENDING" ? (
                          <td><div className="text-warning">PENDING</div></td>
                        ) : overtime.status === "APPROVED" ? (
                          <td><div className="text-success">APPROVED</div></td>
                        ) : (
                          <td><div className="text-error">REJECTED</div></td>
                        )
                      }
                    <td className="relative">
                      {overtime.status === "PENDING" && (
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[overtime.id] = el)}
                        >
                          <button
                            onClick={() =>
                              setDropdownOpen(dropdownOpen === overtime.id ? null : overtime.id)
                            }
                          >
                            <MoreVertical />
                          </button>

                          {dropdownOpen === overtime.id && (
                            <div className="absolute left-0 mt-2 bg-white shadow-lg rounded-md border w-32 z-50">
                              <button
                                onClick={() => handleEdit(overtime)}  
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                              >
                                Edit
                              </button>
                              <button
                               onClick={() => {
                                setDeletingOvertime(overtime);  
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
           <OvertimeModal  
                      isOpen={isModalOpen} 
                      onClose={() => {
                        setIsModalOpen(false);
                        setSelectedOvertime(null);
                      }} 
                      overtime={selectedOvertime}  
                      refresh={fetchOvertimes}  
                      setMessage={handleMessageUpdate} 
                      setError={handleMessageError}   
                    />
                    <DeleteOvertimeModal 
                          isOpen={isDeleting}
                          onClose={() => {setIsDeleting(false); fetchOvertimes();}} 
                          overtime={deletingOvertime}  
                          alertMessage={alertMessage}
                        />
    </div>
  );
};

export default Overtime;