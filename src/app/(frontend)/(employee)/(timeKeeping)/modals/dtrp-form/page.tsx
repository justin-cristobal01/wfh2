"use client";

import { useEffect, useState } from "react";

type DTRPModalProps = {
  isOpen: boolean;
  onClose: () => void;
  record?: any;
  refresh: () => void;
  setMessage: (message: string) => void; // Add this prop to update the parent message
};

const DTRPModal: React.FC<DTRPModalProps> = ({ isOpen, onClose, record, refresh, setMessage }) => {
  const [type, setType] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const today = new Date().toISOString().slice(0, 10);
  const dateInUTC = new Date(today);  // Parse the record.date to a Date object
  const hongKongTime = new Date(dateInUTC.getTime() + (8 * 60 * 60 * 1000));

  const formatDate = (date) => {
    const dateInUTC = new Date(date);  // Parse the date to a Date object
    // Add 8 hours (in milliseconds) to the UTC time to convert to Hong Kong Time (UTC +8)
    const hongKongTime = new Date(dateInUTC.getTime() + (8 * 60 * 60 * 1000));
    // Return the formatted date-time string in ISO format up to minutes (YYYY-MM-DDTHH:MM)
    return hongKongTime.toISOString().slice(0, 16);
  };
  
  
  useEffect(() => {
    if (record) {
      setType(record.type);
      setDateTime(record.date? formatDate(record.date) : "");
      setRemarks(record.remarks || "")
      setAlertMessage(record.reason || "");
    } else {
      setType("");
      setDateTime("");
      setRemarks("");
      setAlertMessage("");
    }
  }, [record]);

  

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if(type==="" || remarks ===""){
      return;
    }
    e.preventDefault();
  
      if (new Date(today) <= new Date(dateTime)) {
      setMessage("Date time cannot be earlier than today date!");
      setError("error");
      return;
    }
  
    setLoading(true);
    setError("");

    const authToken = localStorage.getItem("authToken");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const employeeId = storedUser?.employeeId;
    const payload = record ? { id: record.id, type, dateTime, remarks } : { employeeId, dateTime, type, remarks };

    try {
      const res = await fetch(`/employeeAPI/dtrp?employeeId=${employeeId}`, {
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
        <h2 className="text-xl font-semibold mb-4">Daily Time Record Problem</h2>

        {alertMessage && <div className="text-red-500 mb-2">{alertMessage}</div>}

        <label className="block mb-2 font-medium">Select Type</label>
        <select
          className="w-full px-4 py-2 border rounded-md mb-4 bg-white"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
        <option value="">Select</option>
          <option value="time-in">Time In</option>
          <option value="time-out">Time Out</option>
        </select>

        {/* Date & Time Input */}
        <label className="block mb-2 font-medium">Date & Time</label>
        <input
          type="datetime-local"
          className="w-full px-4 py-2 border rounded-md mb-4 bg-white"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />

        {/* Remarks Text Area */}
        <label className="block mb-2 font-medium">Remarks</label>
        <textarea
          className="w-full px-4 py-2 border rounded-md mb-4 bg-white"
          rows={3}
          placeholder="Enter remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        ></textarea>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded-md">
            Close
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md">
            {loading ? "Submitting..." : record ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DTRPModal;
