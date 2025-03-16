"use client";
import Link from "next/link";
import { useState, useEffect, useContext,useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, UserCircle, LogOut, CheckCircle, Play, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { CameraContext } from "../(frontend)/(employee)/context/CameraContext";
import  TakeScreenShot from "@/app/components/takeScreenShot";
import userLogo from "@/app/img/user-icon.png"
import Image from "next/image";


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [timezone, setTimezone] = useState("");
    const [timekeepingOpen, setTimekeepingOpen] = useState(false);
    const [formsDropdownOpen, setFormsDropdownOpen] = useState(false); 
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null); 
    const cameraContext = useContext(CameraContext);
    const [selectedAction, setSelectedAction] = useState("Time In"); // Default option
    const [DropdownOpen, setDropdownOpen] = useState(false); 
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [takeScreenshot,setTakeScreenshot] = useState(false)

  
    const pageTitles: { [key: string]: string } = {
        "/dashboard": "Dashboard",
        "/activityMonitoring": "Activity Monitoring",
        "/dtr": "Daily Time Record",
        "/leaves": "Leaves",
        "/dtr-problem": "Daily Time Record Problem",
        "/overtime": "Overtime",
    };

   

    useEffect(() => {
    const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        const fetchLastDTR = async () => {
            try {
              
                if (!storedUser) {
                    console.error("User not found in localStorage.");
                    return;
                }
    
                const user = JSON.parse(storedUser);
                const employeeId = user.employeeId;
    
                const response = await fetch(`/employeeAPI/dtr?employeeId=${employeeId}`);
    
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
    
                const lastDTR = await response.json();
    
                console.log("Fetched last DTR:", lastDTR);
    
                if (lastDTR && lastDTR.timeOut === null) {
                    setSelectedAction("Time Out");
                    setIsCameraOn(true);
                } else {
                    setSelectedAction("Time In");
                    setIsCameraOn(false);
                }
            } catch (error) {
                console.error("Error fetching last DTR:", error);
            }
        };
    
        fetchLastDTR();
    }, []);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const handleBeforeUnload = async () => {
            if (selectedAction === "Time Out" && storedUser) { 
                const user = JSON.parse(storedUser);
                const employeeId = user.employeeId;
                const timestamp = new Date();
    
                await fetch("/employeeAPI/dtr", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        employeeId: employeeId,
                        timeOut: timestamp,
                        remarks: "Auto clock-out due to page close",
                    }),
                });
            }
        };
    
        window.addEventListener("beforeunload", handleBeforeUnload);
    
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [selectedAction]);
    

    const handlePlayPause = async () => {
            // setTakeScreenshot(false)
        try {
            // if(!takeScreenshot){
            //     setTakeScreenshot(true);
            //     }
         
            const storedUser = localStorage.getItem("user");
            // const storedPermission = localStorage.getItem("permissionToShare");
            if (!storedUser) {
                router.push("/");
                return;
            }
            
            const user = JSON.parse(storedUser);
            const employeeId = user.employeeId;  
            const timestamp = new Date();

            console.log(employeeId+"employee ID hereeeeee")
            
    
            let requestBody;
            if (selectedAction === "Time In") {
                // if (!storedPermission) {
                //     return;
                // }
                // console.log(storedPermission);
                if (cameraContext) {
                    await cameraContext.startCamera(); // ✅ Start camera when clocking in
                    setIsCameraOn(true);
                    requestBody = {
                        employeeId: employeeId,
                        timeIn: timestamp,
                        timeOut: null,
                        remarks: "",
                    };
                } else {
                    // Handle the case where cameraContext or permission is invalid
                    console.log("Camera permission not granted or camera context unavailable.");
                    return;
                }
                
            } else if (selectedAction === "Time Out"){
                if (cameraContext) {
                    await cameraContext.stopCamera(); // ✅ Stop camera when clocking out
                    setTakeScreenshot(false);
                    setIsCameraOn(false);
                }
                requestBody = {
                    employeeId: employeeId,
                    timeOut: timestamp,
                    remarks: "Clocked out",
                };
            }
    
            const response = await fetch("/employeeAPI/dtr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
    
            if (response.ok) {
                setSelectedAction(selectedAction === "Time In" ? "Time Out" : "Time In"); 
            } else {
                console.error("Failed to log action");
            }
        } catch (error) {
            console.error("Error logging action:", error);
        }
    };
    
    
    

    const handleLogout = async () => {
        const storedUser = localStorage.getItem("user");
        setProfileOpen(false);
        setLogoutMessage(true);
    
        if (selectedAction === "Time Out" && storedUser) {
            const user = JSON.parse(storedUser);
            const employeeId = user.employeeId;
            const timestamp = new Date();
    
            await fetch("/employeeAPI/dtr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: employeeId,
                    timeOut: timestamp,
                    remarks: "Auto clock-out due to logout",
                }),
            });
    
            setSelectedAction("Time In"); // Reset button after logout
        }
    
        setTimeout(() => {
            setLogoutMessage(false);
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
    
            if (cameraContext) {
                cameraContext.stopCamera();
            }
    
            router.push("/");
        }, 2000);
    };
    

 

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = -now.getTimezoneOffset() / 60;
        setTimezone(`GMT ${offset >= 0 ? "+" : ""}${offset}:00 ${timeZone}`);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest(".dropdown-container")) {
                setTimekeepingOpen(false);
                setFormsDropdownOpen(false);
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const activePage = pageTitles[pathname] || "Dashboard";

    return (
        <>
          
            <nav className="bg-white shadow-md text-gray-600 relative z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <button className="md:hidden text-gray-600 mr-3" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <div className="hidden md:flex space-x-6">
                            {Object.keys(pageTitles).map((path) => (
                                path !== "/dtr" && path !== "/leaves" && path !== "/dtr-problem" && path !== "/overtime" ? (
                                    <Link
                                        key={path}
                                        href={path}
                                        className={`${pathname === path ? "text-black" : "text-gray-600"} hover:text-black px-3 py-2 rounded`}
                                    >
                                        {pageTitles[path]}
                                    </Link>
                                ) : null
                            ))}

                            {/* Time Keeping Dropdown */}
                            <div className="relative dropdown-container">
                                <button
                                    onClick={() => setTimekeepingOpen(!timekeepingOpen)}
                                    className={`text-gray-600 hover:text-black px-3 py-2 rounded flex items-center space-x-1 ${pathname === "/dtr" || pathname === "/leaves" || timekeepingOpen ? "text-black" : ""}`}
                                >
                                    <span>Time Keeping</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {timekeepingOpen && (
                                    <div className="absolute left-24 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                                        <Link href="/dtr" className="block px-4 py-2 hover:bg-gray-200">
                                            Daily Time Record
                                        </Link>
                                        <Link href="/leaves" className="block px-4 py-2 hover:bg-gray-200">
                                            Leaves
                                        </Link>

                                        {/* Forms Dropdown (appears under Time Keeping) */}
                                        <div className="relative">
                                        <button
                                            onClick={() => setFormsDropdownOpen(!formsDropdownOpen)}
                                            className="block hover:bg-gray-200 px-3 py-2 rounded flex items-center space-x-1 w-full"
                                        >
                                            <span>Forms</span>
                                            <ChevronDown className="w-4 h-4" />
                                        </button>

                                            {formsDropdownOpen && (
                                                <div className="absolute left-24 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                                                    {/* New Dropdown Options */}
                                                    <Link href="/dtr-problem" className="block px-4 py-2 hover:bg-gray-200">
                                                        Daily Time Record Problem
                                                    </Link>
                                                    <Link href="/overtime" className="block px-4 py-2 hover:bg-gray-200">
                                                        Over Time
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
    
                    <div className="relative">
                        <button className="flex items-center space-x-2 text-gray-600" onClick={() => setProfileOpen(!profileOpen)}>
                        <div className="avatar avatar-online">
                                <div className="w-9 h-9 rounded-full ring ">
                                    <Image
                                        src="/img/user-icon.png"
                                        alt="User Icon"
                                        width={60} 
                                        height={60} 
                                        className="w-14 h-14 mr-4"
                                        />
                                 </div>
                                </div>
                            <span>{user?.name || "Guest"}</span>
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                                <div className="p-2 border-b">
                                    <p className="text-xs text-gray-500">{user ? user.email : "Guest"}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`${isOpen ? "block" : "hidden"} md:hidden bg-[#135D66] py-2 bg-white shadow-md text-gray-600`}>
                    {Object.keys(pageTitles).map((path) => (
                        path !== "/dtr" && path !== "/leaves" && path !== "/dtr-problem" && path !== "/overtime" ? (
                            <Link
                                key={path}
                                href={path}
                                className={`${pathname === path ? "text-black" : "text-gray-600"} block px-4 py-2 hover:text-black`}
                            >
                                {pageTitles[path]}
                            </Link>
                        ) : null
                    ))}

                    {/* Mobile Time Keeping Dropdown */}
                    <div className="border-t bg-white shadow-md text-gray-600 mt-2">
                        <p className={`px-4 py-2 font-semibold ${pathname === "/dtr" || pathname === "/leaves" || timekeepingOpen ? "text-black" : "text-gray-600"}`}>Time Keeping</p>
                        <Link href="/dtr" className="block px-4 py-2 hover:text-black">
                            Daily Time Record
                        </Link>
                        <Link href="/leaves" className="block px-4 py-2 hover:text-black">
                            Leaves
                        </Link>
                        <div className="border-t bg-white shadow-md text-gray-600 mt-2">
                            <p className="px-4 py-2 text-gray-600 font-semibold">Forms</p>
                            <Link href="/dtr-problem" className="block px-4 py-2 text-gray-600 hover:text-black">
                                Daily Time Record Problem
                            </Link>
                            <Link href="/overtime" className="block px-4 py-2 text-gray-600 hover:text-black">
                                Over Time
                            </Link>
                        </div>
                    </div>
                </div>

                {logoutMessage && (
                    <div className="absolute top-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Logging out
                    </div>
                )}
            </nav>
        

            {/* Card Below Navbar */}
            <div className="container mx-auto mt-6 p-6 bg-gray-700 shadow-xl flex justify-between items-center">
                <h1 className="text-xl font-semibold text-white">{activePage}</h1>
                <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-300">{timezone}</span>
                    <button
                        onClick={handlePlayPause}
                        className={`${
                            selectedAction === "Time Out" ? "bg-red-600" : "bg-purple-600"
                        } text-white px-4 py-1 rounded-full flex items-center`}
                    >
                        {selectedAction}
                    </button>
                    <span className="text-gray-300">{currentTime}</span>
                </div>
            </div>
            {takeScreenshot && (
                <TakeScreenShot />
        
            )}  
        </>
     
    );
           
};

export default Navbar;
