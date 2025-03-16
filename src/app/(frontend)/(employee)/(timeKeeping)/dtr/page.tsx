"use client";

import Navbar from "@/app/navbar/page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DTR = () => {
  const [dtrData, setDtrData] = useState<any[]>([]); // Ensuring dtrData is an array
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchDTR();
  }, [message]);

  const fetchDTR = async () => {
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

      const queryParams = new URLSearchParams({ employeeId });
      const res = await fetch(`/employeeAPI/dtr?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const data = await res.json();
      
      // Ensure data is in an array format
      setDtrData(Array.isArray(data) ? data : [data]); 
      setLoading(false);
    } catch (error) {
      setMessage("Error fetching DTR data");
      setMessageType("error");
      setLoading(false);
    }
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

          <div className="overflow-x-auto h-[420px]">
            <table className="table table-xs w-full">
              <thead>
                <tr className="bg-gray-200 sticky top-0">
                  <th>Date</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Hours Rendered</th>
                </tr>
              </thead>
              <tbody>
                {dtrData.length > 0 ? (
                  dtrData.map((record: any) => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{new Date(record.timeIn).toLocaleTimeString()}</td>
                      <td>{record.timeOut ? new Date(record.timeOut).toLocaleTimeString() : ''}</td>
                      <td>
                      {record.timeOut
                        ? (() => {
                            const timeIn = new Date(record.timeIn);
                            const timeOut = new Date(record.timeOut);
                            const diffMs = timeOut - timeIn; // Difference in milliseconds

                            const hours = Math.floor(diffMs / (1000 * 60 * 60)); // Convert ms to hours
                            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes

                            return `${hours}h ${minutes}m`;
                          })()
                        : ''}
                    </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No DTR records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DTR;
