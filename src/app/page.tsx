"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Email and password cannot be empty!");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch(`/employeeAPI/user?email=${email}&password=${password}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage("Login successful!");
      setMessageType("success");

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          employeeId: data.user.employeeId,
        })
      );
      localStorage.setItem("authToken", data.token);

      setTimeout(() => {
        setMessage("");
        if (data.user.role === "ADMIN") {
          router.push("/employerDashboard");
        } else if (data.user.role === "EMPLOYEE") {
          router.push("/dashboard");
        } else {
          router.push("/employerDashboard");
        }
      }, 2000);
    } catch (error: any) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-teal-600 p-4">
      {/* Welcome Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Welcome to Employee Monitoring</h1>

      {/* Message Box */}
      {message && (
        <div
          className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-lg text-white text-sm transition-transform ${
            messageType === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Login Card */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Login</h2>
        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-teal-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-teal-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-teal-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-teal-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-teal-700 transition"
          >
            Login
          </button>

          {/* Register Link
          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <button onClick={() => router.push("/register")} className="text-teal-500 hover:underline">
              Register here
            </button>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
