"use client";

import { useEffect, useState } from "react";

type LeaveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leave?: any;
  refresh: () => void;
  setMessage: (message: string) => void; // Add this prop to update the parent message
};

const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, leave, refresh, setMessage }) => {
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (leave) {
      setLeaveType(leave.leaveType || "");
      setStartDate(leave.startDate ? new Date(leave.startDate).toISOString().slice(0, 10) : "");
      setEndDate(leave.endDate ? new Date(leave.endDate).toISOString().slice(0, 10) : "");
      setReason(leave.reason || "");
    } else {
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
    }
  }, [leave]);

  const today = new Date().toISOString().slice(0, 10);
  const isFutureDateNotAllowed = (leaveType === "Sick Leave" || leaveType === "Emergency Leave") && (startDate > today || endDate > today);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFutureDateNotAllowed) {
      setError("Future dates are not allowed for Sick Leave and Emergency Leave.");
      return;
    }
    setLoading(true);
    setError("");

    const authToken = localStorage.getItem("authToken");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const employeeId = storedUser?.employeeId;
    const payload = leave ? { id: leave.id, leaveType, startDate, endDate, reason } : { employeeId, leaveType, startDate, endDate, reason };

    try {
      const res = await fetch(`/employeeAPI/leave`, {
        method: leave ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(leave ? { ...payload, id: leave.id } : payload),
      });

      if (!res.ok) throw new Error("Failed to submit leave");
      if(payload.id != undefined){
        setMessage("Leave Updated Successfully!"); 
      }
      else{
        setMessage("Leave Added Successfully!"); 
      }
      refresh();
      onClose();
    } catch (error) {
      console.error("Error submitting leave:", error);
      setMessage("Failed to submit leave."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-black">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-semibold mb-4">
          {leave ? "Edit Leave" : "File a Leave"}
        </h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              required
              className="mt-1 block w-full p-2 border rounded-md  bg-white"
            >
              <option value="">Select Leave Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation Leave">Vacation Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="mt-1 block w-full p-2 border rounded-md bg-white"
              max={(leaveType === "Sick Leave" || leaveType === "Emergency Leave") ? today : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="mt-1 block w-full p-2 border rounded-md bg-white"
              max={(leaveType === "Sick Leave" || leaveType === "Emergency Leave") ? today : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="mt-1 block w-full p-2 border rounded-md resize-none  bg-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => { onClose(); }} // Close modal and reset inputs
              className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading || isFutureDateNotAllowed}
            >
              {loading ? "Submitting..." : leave ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveModal;
