import React, { useEffect, useState } from "react";
import { User, LogOut, LayoutDashboard, Clock, Calendar, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
    const [employee, setEmployee] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem("employeeData");
        if (data) {
            setEmployee(JSON.parse(data));
        } else {
            // If no data, redirect back to login
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (!employee) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <div className="hidden md:flex w-64 bg-indigo-900 text-white flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-bold border-b border-indigo-800 pb-4">Staff Panel</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <div className="flex items-center p-3 bg-indigo-800 rounded-xl cursor-default">
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        <span>Dashboard</span>
                    </div>
                    <div className="flex items-center p-3 hover:bg-indigo-800/50 rounded-xl cursor-pointer transition-colors">
                        <Clock className="h-5 w-5 mr-3 text-indigo-300" />
                        <span>Attendance</span>
                    </div>
                    <div className="flex items-center p-3 hover:bg-indigo-800/50 rounded-xl cursor-pointer transition-colors">
                        <Calendar className="h-5 w-5 mr-3 text-indigo-300" />
                        <span>Schedules</span>
                    </div>
                </nav>
                <div className="p-4 border-t border-indigo-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 text-red-300 hover:bg-red-900/30 rounded-xl transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
                    <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{employee.designation || 'Staff'}</p>
                        </div>
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                            {employee.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <main className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <LayoutDashboard size={160} />
                            </div>

                            <div className="relative">
                                <div className="flex items-center space-x-4 mb-6">
                                    <span className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                        <ShieldCheck size={24} />
                                    </span>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Welcome back, {employee.name}!</h3>
                                        <p className="text-gray-500 mt-1">Successfully logged in to your professional workspace.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <p className="text-sm text-indigo-600 font-semibold mb-1 uppercase tracking-wider">Employee ID</p>
                                        <p className="text-xl font-bold text-gray-900">#{employee._id.slice(-6)}</p>
                                    </div>
                                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                        <p className="text-sm text-purple-600 font-semibold mb-1 uppercase tracking-wider">Department</p>
                                        <p className="text-xl font-bold text-gray-900">{employee.department || 'General'}</p>
                                    </div>
                                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                        <p className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wider">Role</p>
                                        <p className="text-xl font-bold text-gray-900">{employee.designation || employee.role || 'Volunteer'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                                    Today's Attendance
                                </h4>
                                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                                    <p className="text-gray-400 text-sm italic">Attendance tracking coming soon...</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                                    Latest Announcements
                                </h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-bold text-gray-900">General Meeting</p>
                                        <p className="text-xs text-gray-500 mt-1">Tomorrow at 10:00 AM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
