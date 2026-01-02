import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("employee"); // 'employee' | 'admin' | 'partner'
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let url = "";

      if (loginType === "admin") {
        url = "https://attendancebackend-5cgn.onrender.com/api/admin/login";
      } else if (loginType === "employee") {
        url = "https://attendancebackend-5cgn.onrender.com/api/employees/login";
      } else {
        // Partner / User (Local Backend)
        url = "http://localhost:5000/api/auth/login";
      }

      console.log(`Logging in as ${loginType} to ${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      if (loginType === "admin") {
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        localStorage.setItem("role", "admin");
        navigate("/dashboard");
      } else if (loginType === "employee") {
        localStorage.setItem("employeeData", JSON.stringify(data.employee));
        localStorage.setItem("employeeId", data.employee._id);
        localStorage.setItem("employeeEmail", data.employee.email);
        localStorage.setItem("employeeName", data.employee.name);
        localStorage.setItem("role", "employee"); // It's good practice to store the role
        localStorage.setItem("loginMessage", data.message || "Login successful");
        navigate("/dashboard", { state: { email: data.employee.email } });
      } else {
        // Partner / User
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role || "user");
        localStorage.setItem("token", data.token);

        // Redirect: Partners might go to a different dashboard? 
        // For now, same dashboard or maybe '/camp' for partners?
        // navigate("/dashboard"); 
        // User requested "Partner / Normal User" login. 
        // Let's send them to Dashboard for now.
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4 transform hover:scale-105 transition-transform duration-300">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {loginType === "admin" ? "Admin Login" : loginType === "employee" ? "Login" : "Partner Login"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome! Please login to your account.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-indigo-50/50 backdrop-blur-sm">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center animate-shake">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2 ml-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  placeholder={loginType === "admin" ? "admin@example.com" : "name@company.com"}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2 ml-1"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-indigo-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLoginType("employee")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${loginType === "employee" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setLoginType("partner")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${loginType === "partner" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Partner/User
              </button>
              <button
                type="button"
                onClick={() => setLoginType("admin")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${loginType === "admin" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="mt-2 pt-6 border-t border-gray-100">
           
            <div className=" mb-10 text-center">
              <p className="text-sm text-gray-600">
                New User or Partner?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Create an Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
