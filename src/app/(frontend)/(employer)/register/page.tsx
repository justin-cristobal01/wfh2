"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ToastMessage from "@/app/components/toastMessage";
import html2canvas from "html2canvas-pro";

const RegisterEmployee = ( ) => {
  const [alertMessage, setAlertMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage,setToastMessage] = useState("");
  const [toastStatus,setToastStatus] = useState("");
  const [scheduleTimein, setScheduleTimein] = useState("");
  const [scheduleTimeout, setScheduleTimeout] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    
    name: "",
    email: "",
    position: "",
    department: "",
    contactNumber: "",
    address: "",
    scheduleTimein:"",
    scheduleTimeout:"",
  });

  const router = useRouter();
  const [newUser, setNewUser] = useState({
    password: "",
    status: "Active",
    name: "",
    email: "",
    role: "",
  });

  const handleCancel = async ()=>{
    router.push("/")
  }


  // const captureAndSendScreenshot = async () => {
  //   try {
  //     // Temporarily override unsupported CSS colors
  //     document.body.style.color = "#000"; // Ensure text is visible
  //     document.body.style.backgroundColor = "#fff"; // Set a standard background
  
  //     const screenshotTarget = document.body; // Capture the entire webpage
  
  //     const canvas = await html2canvas(screenshotTarget, {
  //       backgroundColor: null, // Prevent forced white backgrounds
  //       useCORS: true, // Enable cross-origin images
  //     });
  
  //     const screenshot = canvas.toDataURL("image/png"); // Convert to Base64
  
  //     // Send to API
  //     const response = await fetch("/employerAPI/screenShot", { // Updated path
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         employeeId: "some-employee-id",
  //         screenCapture: screenshot,
  //       }),
  //     });
  
  //     const data = await response.json();
  //     console.log(data.message);
  //   } catch (error) {
  //     console.error("Error capturing or sending screenshot:", error);
  //   }
  // };


  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log("Capturing and sending screenshot...");
  //     captureAndSendScreenshot();
  //   }, 5000);
  
  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, []);


  const handleRegister = async () => {
    try {
      const response = await fetch("/employerAPI/register");
      if (!response.ok) {
        throw new Error("Failed to fetch employee ID");
      }
      const data = await response.json();
      const employeeId = data.employeeId;
      console.log(employeeId)

      if (!newEmployee.name || !newEmployee.email || !newEmployee.position || !newUser.password || !newUser.role) {
        setAlertMessage("⚠️ Please fill in all required fields.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmployee.email)) {
        setAlertMessage("⚠️ Invalid email address!");
        return;
      }

      setAlertMessage("");

      const userData = {
        ...newUser,
        employeeId,
        name: newEmployee.name,
        email: newEmployee.email,
        status: "Active",
      };

      const userResponse = await fetch("/employerAPI/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!userResponse.ok) {
        throw new Error("Failed to create user");
      }

      const employeeData = {
        ...newEmployee,
        employeeId,
      };

      const employeeResponse = await fetch("/employerAPI/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });

      if (!employeeResponse.ok) {
        throw new Error("Failed to register employee");
      }
      setToastMessage("Registered Succesfully")
      setToastStatus("alert-success")
      setShowToast(true); // Show toast message
      setNewEmployee({ name: "", email: "", position: "", department: "", contactNumber: "", address: "" ,scheduleTimein:"",scheduleTimeout:""});
      setNewUser({ password: "", status: "Active", name: "", email: "", role: "" });
      setTimeout(() => {
        router.push("/"); 
      }, 2000);

    } catch (error) {
      setAlertMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Register Employee</h2>
        {alertMessage && <div className="text-red-500 mb-2">{alertMessage}</div>}

        <select
          className="border p-2 rounded w-full mb-2 bg-white text-gray-700"
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="">Select Role</option>
          <option value="EMPLOYEE">Employee</option>
          <option value="ADMIN">Admin</option>
        </select>

        <input type="text" placeholder="Name" className="border p-2 rounded w-full mb-2" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} />
        <input type="email" placeholder="Email" className="border p-2 rounded w-full mb-2" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />
        <input type="password" placeholder="Password" className="border p-2 rounded w-full mb-2" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
        <input type="text" placeholder="Position" className="border p-2 rounded w-full mb-2" value={newEmployee.position} onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })} />
        <input type="text" placeholder="Department" className="border p-2 rounded w-full mb-2" value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} />
        <input type="text" placeholder="Contact no." className="border p-2 rounded w-full mb-2" value={newEmployee.contactNumber} onChange={(e) => setNewEmployee({ ...newEmployee, contactNumber: e.target.value })} />
        <input type="text" placeholder="Address" className="border p-2 rounded w-full mb-2" value={newEmployee.address} onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })} />
        {/* <fieldset className="mb-2">
          <legend className="text-gray-500 text-sm">Profile Picture</legend>
          <label className="border p-2 rounded w-full flex items-center bg-white text-gray-700 cursor-pointer">
            <span className="flex-1">{newEmployee.picture ? newEmployee.picture.name : "Choose a file"}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setNewEmployee({ ...newEmployee, picture: e.target.files[0] })}
            />
          </label>
        </fieldset> */}
       <div className="flex justify-between mb-2">
          <div className="w-1/2 pr-1">
            <label className="block text-sm font-medium text-gray-600">Schedule Check-in</label>
            <input
              className="border p-2 rounded w-full"
              type="time"
              value={newEmployee.scheduleTimein}
              onChange={(e) => setNewEmployee({ ...newEmployee, scheduleTimein: e.target.value })} />
          </div>
          <div className="w-1/2 pl-1">
            <label className="block text-sm font-medium text-gray-600">Schedule Timeout</label>
            <input
              className="border p-2 rounded w-full"
              type="time"
              value={newEmployee.scheduleTimeout}
              onChange={(e) => setNewEmployee({ ...newEmployee, scheduleTimeout: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2"  onClick={handleCancel}>Cancel</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleRegister}>Register</button>
        </div>
      </div>
      {showToast && (
      <ToastMessage toastMessage={toastMessage} toastStatus={toastStatus}/>
      )}
      

    </div>
    
  );
};

export default RegisterEmployee;
