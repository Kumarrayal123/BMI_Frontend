import React, { useEffect, useState } from "react";
import { LayoutDashboard, Clock, Calendar, ShieldCheck, LogOut } from "lucide-react";
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
            navigate("/");
        }
    }, [navigate]);

    if (!employee) return null;

    return (
        <div className="min-h-screen bg-transparent">
            {/* Header (Simplified since Layout handles main nav) */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back, {employee.name}!</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border shadow-sm">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{employee.designation || 'Staff'}</p>
                    </div>
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                        {employee.name.charAt(0)}
                    </div>
                </div>
            </div>

            {/* Dashboard Body */}
            <div className="max-w-5xl mx-auto">
                {/* Welcome Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <LayoutDashboard size={160} />
                    </div>

                    <div className="relative">
                        <div className="flex items-center space-x-4 mb-6">
                            <span className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                <ShieldCheck size={24} />
                            </span>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Good Day, {employee.name.split(' ')[0]}!</h3>
                                <p className="text-gray-500 mt-1">You are logged in as <strong>{employee.designation || 'Staff'}</strong>.</p>
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

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Attendance Widget */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                            Today's Attendance
                        </h4>
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                            <Clock className="text-gray-300 mb-2" size={24} />
                            <p className="text-gray-400 text-sm italic">Attendance tracking coming soon...</p>
                        </div>
                    </div>

                    {/* Announcements Widget */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                            Latest Announcements
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-gray-900">General Staff Meeting</p>
                                    <span className="px-2 py-0.5 bg-white text-xs font-semibold text-indigo-600 rounded-md border border-indigo-100">New</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Tomorrow at 10:00 AM • Conference Room A</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm font-bold text-gray-700">System Maintenance</p>
                                <p className="text-xs text-gray-500 mt-1">Friday Night • 2:00 AM - 4:00 AM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
