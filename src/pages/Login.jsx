import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // ✅ Yeh URL aapke backend ke hisaab se set karein
      const API_URL = "http://localhost:5000/api/auth/unified-login";
      
      console.log("🌐 Sending request to:", API_URL);
      console.log("📧 Email:", email);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Response Status:", response.status);

      // ✅ Response ko JSON mein parse karein
      const result = await response.json();
      console.log("📦 Response Data:", result);

      // ✅ Agar response 401 ya koi error hai toh
      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // ✅ Agar response mein type nahi hai toh error
      if (!result.type) {
        throw new Error("Invalid response from server");
      }

      const { type, data } = result;

      // 🔹 ADMIN LOGIN
      if (type === "admin") {
        // Admin data ko properly extract karein
        const adminData = data.admin || data;
        localStorage.setItem("adminData", JSON.stringify(adminData));
        localStorage.setItem("role", "admin");
        localStorage.setItem("token", data.token || "");
        navigate("/admin/dashboard");
        return;
      }

      // 🔹 EMPLOYEE LOGIN
      if (type === "employee") {
        // Employee data ko extract karein
        const employeeData = data.employee || data;
        localStorage.setItem("employeeData", JSON.stringify(employeeData));
        localStorage.setItem("employeeId", employeeData._id || employeeData.id || employeeData.employeeId);
        localStorage.setItem("employeeEmail", employeeData.email);
        localStorage.setItem("employeeName", employeeData.name);
        localStorage.setItem("role", "employee");
        localStorage.setItem("token", data.token || "");
        navigate("/dashboard");
        return;
      }

      // 🔹 PARTNER LOGIN
      if (type === "partner") {
        // Partner data ko extract karein
        const userData = data.user || data;
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("userId", userData._id || userData.id);
        localStorage.setItem("role", userData.role || "partner");
        localStorage.setItem("token", data.token || "");
        navigate("/doctor");
        return;
      }

      throw new Error("Unknown user type");

    } catch (error) {
      console.error("❌ Error:", error);
      
      // ✅ Error handling properly
      if (error.message.includes("Failed to fetch")) {
        setError("❌ Backend server not running. Please start the backend server on port 5000");
      } else if (error.message.includes("Invalid Email")) {
        setError("❌ Invalid email or password. Please check your credentials.");
      } else if (error.message.includes("401")) {
        setError("❌ Invalid email or password. Please check your credentials.");
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Login</h2>
          <p className="mt-2 text-sm text-gray-600">Welcome! Please login to your account.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              New User?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Create an Account
              </button>
            </p>
          </div>

          {/* ✅ Test Credentials (Optional) */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              <span className="font-semibold">Demo Credentials:</span><br />
              Partner: partner@test.com / password123<br />
              Employee: employee@company.com / emp123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;