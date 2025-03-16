"use client";

import { useState, useEffect } from "react";

type OvertimeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const OvertimeModal: React.FC<OvertimeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Ensure modal only renders when isOpen is true

  const [dateTimeFrom, setDateTimeFrom] = useState<string>("");
  const [dateTimeTo, setDateTimeTo] = useState<string>("");
  const [overtimeHours, setOvertimeHours] = useState<string>("0");
  const [reason, setReason] = useState<string>("");

  // Function to calculate overtime hours automatically
  useEffect(() => {
    if (dateTimeFrom && dateTimeTo) {
      const fromTime = new Date(dateTimeFrom);
      const toTime = new Date(dateTimeTo);

      if (toTime > fromTime) {
        const diffMs = toTime.getTime() - fromTime.getTime(); // Get difference in milliseconds
        const diffHours = diffMs / (1000 * 60 * 60); // Convert to hours
        setOvertimeHours(diffHours.toFixed(2));
      } else {
        setOvertimeHours("0");
      }
    }
  }, [dateTimeFrom, dateTimeTo]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({
      dateTimeFrom,
      dateTimeTo,
      overtimeHours,
      reason,
    });
    onClose(); // Close modal after submission
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">File Overtime</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Time From */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Date & Time From</label>
            <input
              type="datetime-local"
              value={dateTimeFrom}
              onChange={(e) => setDateTimeFrom(e.target.value)}
              className="border p-2 rounded-md"
              required
            />
          </div>

          {/* Date & Time To */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Date & Time To</label>
            <input
              type="datetime-local"
              value={dateTimeTo}
              onChange={(e) => setDateTimeTo(e.target.value)}
              className="border p-2 rounded-md"
              required
            />
          </div>

          {/* Overtime Hours (Auto-Computed) */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Total Overtime Hours</label>
            <input
              type="text"
              value={overtimeHours}
              readOnly
              className="border p-2 rounded-md bg-gray-100"
            />
          </div>

          {/* Reason for Overtime */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Reason for Overtime</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border p-2 rounded-md"
              rows={3}
              required
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-400 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OvertimeModal;
