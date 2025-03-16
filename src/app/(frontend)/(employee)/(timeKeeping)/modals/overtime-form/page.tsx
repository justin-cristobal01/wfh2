"use client";

import { useState, useEffect } from "react";

type OvertimeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  overtime?: any;
  refresh: () => void;
  setMessage: (message: string) => void;
  setError: (message: string) => void;
};

const OvertimeModal: React.FC<OvertimeModalProps> = ({
  isOpen,
  onClose,
  overtime,
  refresh,
  setMessage,
  setError
}) => {

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Current date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);
  const dateInUTC = new Date(today);  // Parse the record.date to a Date object
  const hongKongTime = new Date(dateInUTC.getTime() + (8 * 60 * 60 * 1000));
       
  // Check if the provided date is in the future
 

  const formatDate = (date) => {
    const dateInUTC = new Date(date);  // Parse the date to a Date object
    // Add 8 hours (in milliseconds) to the UTC time to convert to Hong Kong Time (UTC +8)
    const hongKongTime = new Date(dateInUTC.getTime() + (8 * 60 * 60 * 1000));
    // Return the formatted date-time string in ISO format up to minutes (YYYY-MM-DDTHH:MM)
    return hongKongTime.toISOString().slice(0, 16);
  };
  
  useEffect(() => {
    if (overtime) {
      setStartDate(overtime.startDate ? formatDate(overtime.startDate) : "");
      setEndDate(overtime.endDate ? formatDate(overtime.endDate) : "");
      setReason(overtime.reason || "");
    } else {
      setStartDate("");
      setEndDate("");
      setReason("");
    }
  }, [overtime]);
  
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isFutureDateNotAllowed =
  (startDate && new Date(startDate) > new Date(hongKongTime)) ||
  (endDate && new Date(endDate) > new Date(hongKongTime));


    if (new Date(endDate) < new Date(startDate)) {
    setMessage("End date cannot be earlier than start date!");
    setError("error");
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDifferenceInMs = end.getTime() - start.getTime(); // in milliseconds
  const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60); // convert to hours

  // Check if the time difference is exactly 1 hour
  if (timeDifferenceInHours < 1) {
    setMessage("Minimum to file overtime is 1 hour.");
    setError("error");
    return;
  }

    if (isFutureDateNotAllowed) {
      setMessage("Future dates are not allowed for Overtime!");
      setError("error");
      return;
    }
    setLoading(true);
    setMessage("");

    const authToken = localStorage.getItem("authToken");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const employeeId = storedUser?.employeeId;

    // Use the PH time converted dates
    const payload = overtime
      ? { id: overtime.id, startDate, endDate, reason }
      : { employeeId, startDate, endDate, reason };

    try {
      const res = await fetch(`/employeeAPI/overtime`, {
        method: overtime ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(overtime ? { ...payload, id: overtime.id } : payload),
      });

      if (!res.ok) throw new Error("Failed to submit overtime");

      if (payload.id !== undefined) {
        setMessage("Overtime Updated Successfully!");
        setError("success");
      } else {
        setMessage("Overtime Added Successfully!");
        setError("success");
      }

      refresh();
      onClose();
    } catch (error) {
      setMessage(`${error}`);
      setError("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-black">
        <h2 className="text-lg font-semibold mb-4">File Overtime</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Time From */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Date & Time From</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded-md"
              required
              min={today}
            />
          </div>

          {/* Date & Time To */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Date & Time To</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded-md"
              required
              min={today}
            />
          </div>

          {/* Reason for Overtime */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Reason for Overtime</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border p-2 rounded-md bg-white"
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
