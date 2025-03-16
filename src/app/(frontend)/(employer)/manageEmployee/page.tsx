"use client";

import NavbarEmployer from "@/app/navbarEmployer/page";
import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import ViewAttendanceModal from "@/app/components/viewAttendanceModal";
import EditEmployeeModal from "@/app/components/editEmployeeModal"; // Import the modal
import DeleteEmployeeModal from "@/app/components/deleteEmployeeModal";
import ToastMessage from "@/app/components/toastMessage";



const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const itemsPerPage = 5; // Limit to 2 employees per page
  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal state
  const dropdownRef = useRef(null);
  const [editingEmployee, setEditingEmployee] = useState(null);  
  const [isEditing, setIsEditing] = useState(false); 
  const [isDeleting,setIsDeleting] = useState(false);
  const [deletingEmployee,setDeleteEmployee] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastStatus,setToastStatus] = useState("");

  
  

  const handleMouseLeave = () => {
    setDropdownOpen(null); // Close dropdown when mouse leaves
  };

  const openModal = (employee) => {
    setSelectedEmployee(employee); // Set the selected employee
    setIsModalOpen(true);  // Open the modal
  };
  

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

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

  const [newUser, setNewUser] = useState({
    password: "",
    status: "Active",
    name: "",
    email: "",
    role: "",
  });

  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/");
    } else {
      fetchEmployees();
    }
  }, []);

 


  const handleUpdate = () => {
    console.log("Toast should appear now!"); // Debugging
    setToastMessage("User Update Successfully")
    setToastStatus("alert-success");
    
    setShowToast(true); // Show toast message

    fetchEmployees();
    setEditingEmployee(null); 

    setTimeout(() => {
        console.log("Hiding toast now...");
        setShowToast(false);
    }, 3000);
};


 

  const fetchEmployees = async () => {
    try {
      // Fetch employee data
      const employeeResponse = await fetch("/employerAPI/employee");
      if (!employeeResponse.ok) {
        throw new Error("Failed to fetch employees");
      }
      const employeesData = await employeeResponse.json();
  
      // Fetch user data (including passwords)
      const userResponse = await fetch("/employerAPI/user");
      if (!userResponse.ok) {
        throw new Error("Failed to fetch users");
      }
      const usersData = await userResponse.json();
  
      const employeesWithStatus = employeesData.map((employee) => {
        const user = usersData.find((user) => user.email === employee.email);
        if (user) {
          return {
            ...employee,
            status: user.status,
            password: user.password, 
            role:user.role,// Ensure password is included
          };
        }
        return employee;
      });
  
      setEmployees(employeesWithStatus);
    } catch (error) {
      console.error("Error fetching employees or users:", error);
    }
  };
  
  


  const handleDropdownToggle = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id); // Toggle dropdown
  };

  const handleAdd = async () => {
    try {
      // Step 1: Fetch the new employee ID from the server-side API
      const response = await fetch('/employerAPI/register');
      if (!response.ok) {
        throw new Error('Failed to fetch employee ID');
      }
      const data = await response.json();
      const employeeId = data.employeeId; // Use the generated employee ID
  
      // Step 2: Validate required fields
      if (
        !newEmployee.name ||
        !newEmployee.email ||
        !newEmployee.position ||
        !newUser.password ||
        !newUser.role
      ) {
        setAlertMessage(
          "⚠️ Please fill in all required fields (Name, Email, Position, Password, Role)."
        );
        return;
      }
  
      // Step 3: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmployee.email)) {
        setAlertMessage("⚠️ Warning: Invalid email address!");
        return;
      }
  
      setAlertMessage(""); // Clear alert if validation passes
  
      // Step 4: Prepare user data with the generated employeeId
      const userData = {
        ...newUser,
        employeeId: employeeId, // Use the generated employeeId here
        name: newEmployee.name,
        email: newEmployee.email,
        status: "Active",
      };
  
      // Step 5: Create the user in the database
      const userResponse = await fetch("/employerAPI/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
  
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || "Failed to register employee");
      }
  
      const createdUser = await userResponse.json(); // Get the created user data
  
      // Step 6: Prepare employee data with the generated employeeId
      const employeeData = {
        ...newEmployee,
        email: newEmployee.email,
        employeeId: employeeId, 
      };
  
      // Step 7: Create the employee in the database
      const employeeResponse = await fetch("/employerAPI/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
  
      if (!employeeResponse.ok) {
        const errorData = await employeeResponse.json();
        throw new Error(errorData.error || "Failed to register employee");
      }


  
      // Step 8: Success message and reset form
      setIsAdding(false);
      setNewEmployee({
        name: "",
        email: "",
        position: "",
        department: "",
        contactNumber: "",
        address: "",
      });
      setNewUser({ password: "", status: "Active", name: "", email: "", role: "" });
      setShowToast(true);
      setToastMessage("User Registered Successfully")
      setToastStatus("alert-success");
      setTimeout(() => {
        console.log("Hiding toast now...");
        setShowToast(false);
    }, 3000);
      fetchEmployees();
    } catch (error) {
      setAlertMessage(`❌ Error: ${error.message}`);
    }

  };
  
  
  

  // Filter employees based on search query
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total pages dynamically
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Slice the data for current page
  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavbarEmployer />
      <div className="container mx-auto p-4">
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search employees..."
            className="border p-2 rounded w-1/3 bg-white text-black"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Reset to first page when filtering
              setCurrentPage(1);
            }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setIsAdding(true)}
          >
            Add Employee
          </button>
        </div>

        <div className="grid grid-cols-1">
          <div className="card bg-white shadow-xl text-black p-10 ">
            <h2 className="text-xl font-semibold mb-4">Employee List</h2>
                {showToast && (
                <ToastMessage toastMessage={toastMessage} toastStatus={toastStatus}/>
                )}
            <div className="overflow-x-auto min-h-[450px]">
              <table className="table table-xs">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 border-b text-black text-center">Name</th>
                    <th className="px-4 py-2 border-b text-black text-center">Employee ID</th>
                    <th className="px-4 py-2 border-b text-black text-center">Email</th>
                    <th className="px-4 py-2 border-b text-black text-center">Position</th>
                    <th className="px-4 py-2 border-b text-black text-center">Status</th>
                    <th className="px-4 py-2 border-b text-black text-center">Department</th>
                    <th className="px-4 py-2 border-b text-black text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.name}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.employeeId}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.email}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.position}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.status}</td>
                        <td className="px-4 py-2 border-b text-black text-center">{emp.department}</td>
                        <td className="px-4 py-2 border-b text-black text-center relative">
                        <div className="relative inline-block" ref={dropdownRef} onMouseLeave={handleMouseLeave}>
                          <button
                            className="p-2 rounded-md hover:bg-gray-200"
                            onClick={() => handleDropdownToggle(emp.id)}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {dropdownOpen === emp.id && (
                            <div className="absolute right-0 w-32 bg-white border rounded-md shadow-md z-10">
                              <button
                                className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                                onClick={() => {
                                  setEditingEmployee(emp);  
                                  setIsEditing(true); 
                                }}
                              >
                                Edit
                              </button>
                              <button className="block px-4 py-2 w-full text-left hover:bg-gray-100"  onClick={() => {
                                  setDeleteEmployee(emp);  
                                  setIsDeleting(true); 
                                }}>Delete</button>
                              <button
                              className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                              onClick={() => {
                                openModal(emp);
                              }}
                            >
                              View Attendance
                            </button>
                            </div>
                          )}
                        </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-gray-500">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <ViewAttendanceModal isModalOpen={isModalOpen} closeModal={closeModal} employee={selectedEmployee}  />
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="text-center text-black">
                Page {currentPage} of {totalPages}
              </div>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAdding && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">"Add Employee"</h2>
              {alertMessage && (
                <div
                  role="alert"
                  className="alert alert-warning flex items-center gap-2 p-3 rounded bg-yellow-100 text-yellow-700 border border-yellow-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{alertMessage}</span>
                </div>
              )}

              <select
                className="border p-2 rounded w-full mb-2 mt-5 bg-white text-gray-600"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>

              <input
                type="text"
                placeholder="Name"
                className="border p-2 rounded w-full mb-2 custom-input-bg"
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded w-full mb-2 custom-input-bg"
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded w-full mb-2 custom-input-bg"
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <input
                type="text"
                placeholder="Position"
                className="border p-2 rounded w-full mb-2 custom-input-bg"
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              />
              <input
                type="text"
                placeholder="Department"
                className="border p-2 rounded w-full mb-2 custom-input-bg"
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
              />
              <input
                type="text"
                placeholder="Contact no."
                className="border p-2 rounded w-full mb-2 custom-input-bg"
                onChange={(e) => setNewEmployee({ ...newEmployee, contactNumber: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address"
                className="border p-2 rounded w-full mb-2 custom-input-bg"
                onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
              />

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
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false); // Close the modal
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick= {handleAdd} // Determine whether to add or edit
                >
                   "Add"
                </button>
              </div>
            </div>
        

          </div>
        )}


              <EditEmployeeModal
                isOpen={isEditing}
                onClose={() => { setIsEditing(false); fetchEmployees() }}
                employee={editingEmployee}
                onUpdate={handleUpdate}
                alertMessage={alertMessage}
                setAlertMessage={setAlertMessage}
                setNewEmployee={setNewEmployee}
                newEmployee={newEmployee}
                setNewUser={setNewUser}
                newUser={newUser}
              />


                <DeleteEmployeeModal 
                      isOpen={isDeleting}
                      onClose={() => {setIsDeleting(false); fetchEmployees();}}
                      employee={deletingEmployee}
                      alertMessage={alertMessage}
                    />
          

    </div>
  );
};

export default ManageEmployees;
