"use client";

import Navbar from "@/app/navbar/page";
import { MoreVertical, Plus, Edit, Trash } from "lucide-react";
import DTRPModal from "../modals/dtrp-form/page";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DeleteDTRPModal from "@/app/components/deleteDTRP";

const DailyTimeRecord = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [selectedRecord, setSelectedRecord] = useState(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const router = useRouter();
  const [records, setRecords] = useState([]); 
  const [isDeleting,setIsDeleting] = useState(false);
  const [deletingRecord,setDeletingRecord] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");


  useEffect(() => {
    fetchRecords();

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

  const handleMessageUpdate = (newMessage: string) => {
    setMessage(newMessage);
      // Automatically clear the message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const employeeId = storedUser?.employeeId;
      const response = await fetch(`/employeeAPI/dtrp?employeeId=${employeeId}`);
      if (!response.ok) {
        // 🚀 Handle different error types
        if (response.status === 400) throw new Error("User ID is required");
        if (response.status === 404) throw new Error("No records found for this user");
        throw new Error("Failed to fetch records");
      }
      const data = await response.json();
      console.log("Fetched Data:", data); 
      setRecords(data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
    setLoading(false);
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setDropdownOpen(null);
  };

  const handleAddEditRecord = async (record) => {
    try {
      const method = record.id ? "PUT" : "POST";
      await fetch(`/employeeAPI/dtrp${record.id ? `/${record.id}` : ""}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      setMessage(record.id ? "Record updated successfully" : "Record added successfully");
      setMessageType("success");
      fetchRecords();
    } catch (error) {
      setMessage("Error saving record");
      setMessageType("error");
    }
    setIsModalOpen(false);
  };

  // const handleDelete = async (id) => {
  //   setIsDeleting(false);
  //   if (!confirm("Are you sure you want to delete this record?")) return;
  //   try {
  //     await fetch(`/employeeAPI/dtrp/${id}`, { method: "DELETE" });
  //     setMessage("Record deleted successfully");
  //     setMessageType("success");
  //     fetchRecords();
  //   } catch (error) {
  //     setMessage("Error deleting record");
  //     setMessageType("error");
  //   }
  // };

  return (
    <div className="min-h-screen shadow-md bg-white">
      <Navbar />
      {message && (
        <div className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg border ${messageType === "error" ? "bg-red-600 border-red-800" : "bg-green-600 border-green-800"} text-white z-50`}>
          {message}
        </div>
      )}
      <div className="container mx-auto p-2 mt-2 text-black">
      <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h1>Filter By:</h1>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border rounded-md bg-white">
                <option value="">Select Filter</option>
                <option value="type">Type</option>
                <option value="dateRange">Date Range</option>
                <option value="status">Status</option>
              </select>
              {filterType === "dateRange" && (
                <>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border rounded-md bg-white" />
                  <span>to</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border rounded-md bg-white" />
                </>
              )}
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Filter</button>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md">
              <Plus className="w-5 h-5 mr-2" /> Add
            </button>
          </div>

        <div className="overflow-x-auto h-[420px]">
          <table className="table table-xs w-full">
            <thead>
              <tr className="bg-gray-200 sticky top-0">
                <th>Date Time</th>
                <th>Type</th>
                <th>Remarks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records?.length > 0 ? (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString('en-GB', { hour12: true })}</td>
                    {
                        record.type === "time-in" ? (
                          <td><div className="text-primary">Time in</div></td>
                        ) : (
                          <td><div className="text-primary">Time out</div></td>
                        )
                      }

                    <td>{record.remarks}</td>
                    {
                        record.status === "PENDING" ? (
                          <td><div className="text-warning">PENDING</div></td>
                        ) : record.status === "APPROVED" ? (
                          <td><div className="text-success">APPROVED</div></td>
                        ) : (
                          <td><div className="text-error">REJECTED</div></td>
                        )
                      }
                    <td className="relative">
                      {record.status === "PENDING" && (
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[record.id] = el)}
                        >
                          <button
                            onClick={() =>
                              setDropdownOpen(dropdownOpen === record.id ? null : record.id)
                            }
                          >
                            <MoreVertical />
                          </button>

                          {dropdownOpen === record.id && (
                            <div className="absolute left-0 mt-2 bg-white shadow-lg rounded-md border w-32 z-50">
                              <button
                                onClick={() => handleEdit(record)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                              >
                                Edit
                              </button>
                              <button
                               onClick={() => {
                                setDeletingRecord(record);  
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">No records found</td>
                </tr>
              )}
            </tbody>


          </table>
        </div>
      </div>
      <DTRPModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedRecord(null); }}refresh={fetchRecords}  record={selectedRecord} setMessage={handleMessageUpdate}   />
      <DeleteDTRPModal 
                      isOpen={isDeleting}
                      onClose={() => {setIsDeleting(false); fetchRecords();}}
                      record={deletingRecord}
                      alertMessage={alertMessage}
                    />
    </div>
  );
};

export default DailyTimeRecord;