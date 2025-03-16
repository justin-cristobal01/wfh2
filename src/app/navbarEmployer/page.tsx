"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, UserCircle, LogOut, CheckCircle } from "lucide-react";
import Image from "next/image";
import userLogo from "@/app/img/user-icon.png"

const NavbarEmployer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [approvalRequestOpen, setApprovalRequestOpen] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    // Page Titles Mapping
    const pageTitles: { [key: string]: string } = {
        "/employerDashboard": "Dashboard",
        "/employeeMonitoring": "Employee Monitoring",
        "/approvalRequest": "Approval Request",
        "/manageEmployee": "Manage Employee",
        "/employerReports": "Reports",
        "/screenCaptureMonitoring": "Screen Capture",
    };

    const activePage = pageTitles[pathname] || "Dashboard";

    // Fetch user data from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Logout Function
    const handleLogout = () => {
        setProfileOpen(false);
        setLogoutMessage(true);

        setTimeout(() => {
            setLogoutMessage(false);
            localStorage.removeItem("user"); // Clear user data
            localStorage.removeItem("authToken");
            router.push("/");
        }, 2000);
    };

    return (
        <>
            <nav className="bg-white shadow-md text-gray-600 relative z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    {/* Menu Button for Mobile */}
                    <div className="flex items-center">
                        <button className="md:hidden text-red mr-3" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        {/* Navbar Links */}
                        <div className="hidden md:flex space-x-6">
                            {Object.keys(pageTitles).map((path) => (
                                <Link
                                    key={path}
                                    href={path}
                                    className={`${pathname === path ? "bg-[#FFFFFF] text-gray-700 font-semibold text-lg" : "text-gray-400 text-base"} hover:bg-[#FFFFFF] hover:text-black px-2 py-2 rounded`}
                                >
                                    {pageTitles[path]}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button className="flex items-center space-x-2 text-black" onClick={() => setProfileOpen(!profileOpen)}>
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
                            <span className="text-gray-600">{user ? user.name : "Loading..."}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                                <div className="p-2 border-b">
                                    <p className="text-sm font-semibold">{user ? user.name : "Unknown"}</p>
                                    <p className="text-xs text-gray-500">{user ? user.email : "No Email"}</p>
                                </div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center">
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`${isOpen ? "block" : "hidden"} md:hidden bg-[#135D66] py-2`}>
                    {Object.keys(pageTitles).map((path) => (
                        <Link
                            key={path}
                            href={path}
                            className={`${pathname === path ? "bg-[#0F4A55]" : ""} block px-4 py-2 text-white hover:bg-[#0F4A55]`}
                        >
                            {pageTitles[path]}
                        </Link>
                    ))}
                </div>

                {/* Logout Message */}
                {logoutMessage && (
                    <div className="absolute top-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Logging out...
                    </div>
                )}
            </nav>

            {/* Page Title Section */}
            <div className="container mx-auto mt-6 p-6 bg-gray-700 shadow-xl flex justify-between items-center">
                <h1 className="text-xl font-semibold text-white">{activePage}</h1>
            </div>
        </>
    );
};

export default NavbarEmployer;
