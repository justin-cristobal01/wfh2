"use client";

import { useEffect, useState } from "react";

type ApprovalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  record?: any;
  refresh: () => void;
  setMessage: (message: string) => void; // Add this prop to update the parent message
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose, record, refresh, setMessage }) => {
  const [type, setType] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (record) {
      setType(record.file_type === 'DTRP' ? record.type : record.leaveType);
      setDateTime(record.date ? new Date(record.date).toISOString().slice(0, 16) : "");
      setRemarks(record.file_type === 'DTRP' ? record.remarks : record.reason)
      setAlertMessage(record.reason || "");
    } else {
      setType("");
      setDateTime("");
      setRemarks("");
      setAlertMessage("");
    }
  }, [record]);

  

  if (!isOpen) return null;

  const handleApproved = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    setLoading(true);
    setError("");

    const authToken = localStorage.getItem("authToken");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const employeeId = record.employeeId;
    const payload = record ? { id: record.id, type, dateTime, remarks,file_type:record.file_type,employeeId ,reason:record.reason ,approval:'APPROVED',leaveStart:record.startDate,leaveEnd:record.endDate} : { employeeId, type, dateTime, remarks };

    try {
      const res = await fetch(`/employerAPI/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(record ? { ...payload, id: record.id } : payload),
      });

      if (!res.ok) throw new Error("Failed to submit Record");
      if(payload.id != undefined){
        setMessage("Record Updated Successfully!"); 
      }
      else{
        setMessage("Record Added Successfully!"); 
      }
      refresh();
      onClose();
    } catch (error) {
      console.error("Error submitting Record:", error);
      setMessage("Failed to submit Record."); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    setLoading(true);
    setError("");

    const authToken = localStorage.getItem("authToken");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const employeeId = storedUser?.employeeId;
    const payload = record ? { id: record.id, type, dateTime, remarks } : { employeeId, type, dateTime, remarks };

    try {
      const res = await fetch(`/employeeAPI/dtrp`, {
        method: record ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(record ? { ...payload, id: record.id } : payload),
      });

      if (!res.ok) throw new Error("Failed to submit Record");
      if(payload.id != undefined){
        setMessage("Record Updated Successfully!"); 
      }
      else{
        setMessage("Record Added Successfully!"); 
      }
      refresh();
      onClose();
    } catch (error) {
      console.error("Error submitting Record:", error);
      setMessage("Failed to submit Record."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-black">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">{record.file_type == 'DTRP' ? "Daily Time Record Problem": "Leave2 "}</h2>


        <label className="block mb-2 font-medium"> Type</label>
        {record.file_type === 'DTRP' ? (
          <select
            className="w-full px-4 py-2 border rounded-md mb-4 bg-gray-200 cursor-not-allowed"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled
          >
            <option value="time-in">Time In</option>
            <option value="time-out">Time Out</option>
          </select>
        ) : (
          <input
          type="text"
          className="w-full px-4 py-2 border rounded-md mb-4 bg-gray-200 cursor-not-allowed"
          value={record.leaveType}
          disabled
        />
        )}


        {/* Date & Time Input */}
        <label className="block mb-2 font-medium">
          {record.file_type === 'DTRP' ? 'Date & Time' : 'Date Covered'}
        </label>
        {record.file_type === 'DTRP' ? (
          <input
            type="datetime-local"
            className="w-full px-4 py-2 border rounded-md mb-4 bg-white"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            disabled
          />
        ) : (
          <div>
            <label className="block mb-2 font-medium">Start Date</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md mb-4 bg-gray-200 cursor-not-allowed"
              value={record.startDate}
              disabled
            />

            <label className="block mb-2 font-medium">End Date</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md mb-4 bg-gray-200 cursor-not-allowed"
              value={record.endDate}
              disabled
            />
          </div>
        )}


        {/* Remarks Text Area */}
        <label className="block mb-2 font-medium">Remarks</label>
        <textarea
          className="w-full px-4 py-2 border rounded-md mb-4 bg-white"
          rows={3}
          placeholder="Enter remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled
        ></textarea>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Close
          </button>
          <button onClick={handleApproved} className="px-4 py-2 bg-green-500 text-white rounded-md">
            {loading ? "Submitting..." : record ? "Approved" : "Submit"}
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-red-500 text-white rounded-md">
            {loading ? "Submitting..." : record ? "Disapproved" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
