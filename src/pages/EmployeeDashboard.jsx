import React, { useEffect, useState, useMemo } from "react";
import { LayoutDashboard, Clock, Calendar, ShieldCheck, MapPin, Users, Activity, Eye, X, FileSpreadsheet, CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import config from "../config";
import { CampStatusBadge } from "../utils/campStatus";
import VolunteerDisplay from "../components/VolunteerDisplay";
import PartnerDisplay from "../components/PartnerDisplay";

const EmployeeDashboard = () => {
    const [employee, setEmployee] = useState(null);
    const [assignedCamps, setAssignedCamps] = useState([]);
    const [loadingCamps, setLoadingCamps] = useState(true);
    const [patients, setPatients] = useState([]);
    const [viewCamp, setViewCamp] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem("employeeData");
        if (data) {
            const parsedEmployee = JSON.parse(data);
            setEmployee(parsedEmployee);
            fetchCamps(parsedEmployee);
        } else {
            // If no data, redirect back to login
            navigate("/");
        }
    }, [navigate]);

    const fetchCamps = async (empData) => {
        try {
            setLoadingCamps(true);
            const [campsRes, patientsRes] = await Promise.all([
                axios.get(`${config.API_BASE_URL}/camps/allcamps`),
                axios.get(`${config.API_BASE_URL}/patients`)
            ]);

            const allCamps = campsRes.data || [];
            setPatients(patientsRes.data || []);

            // Filter camps where this employee is assigned (by Name or ID)
            const empId = empData._id;
            const employeeName = empData.name;

            const assigned = allCamps.filter(camp =>
                (camp.volunteers || []).some(v =>
                    v.toLowerCase() === employeeName.toLowerCase() ||
                    (empId && v === empId)
                )
            );

            setAssignedCamps(assigned);
        } catch (err) {
            console.error("Error fetching camps:", err);
        } finally {
            setLoadingCamps(false);
        }
    };

    // View modal helper - filter patients for selected camp
    const viewCampPatients = useMemo(() => {
        if (!viewCamp) return [];
        return patients.filter(p => String(p.campId?._id || p.campId) === String(viewCamp._id));
    }, [viewCamp, patients]);

    const handleDownloadCampCSV = () => {
        if (!viewCamp || viewCampPatients.length === 0) {
            alert("No data to download");
            return;
        }

        const headers = ["Patient Name", "Age", "Gender", "Contact", "Camp Name", "Date", "Location", "BMI", "BP (Sys/Dia)", "Sugar"];
        const rows = viewCampPatients.map(p => {
            let bmi = "-", bp = "-", sugar = "-";
            if (p.tests && p.tests.length > 0) {
                const weight = p.tests.find(t => t.type === 'weight')?.value;
                const height = p.tests.find(t => t.type === 'height')?.value;
                if (weight && height) {
                    const hM = height / 100;
                    bmi = (weight / (hM * hM)).toFixed(1);
                }

                const bpTest = p.tests.find(t => t.type === 'bp');
                if (bpTest) bp = `${bpTest.value}/${bpTest.value2}`;

                const sugarTest = p.tests.find(t => t.type === 'sugar');
                if (sugarTest) sugar = `${sugarTest.value} (${sugarTest.type || 'Random'})`;
            }

            return [
                p.name,
                p.age,
                p.gender,
                p.contact,
                viewCamp.name,
                viewCamp.date,
                viewCamp.location,
                bmi,
                bp,
                sugar
            ].map(v => `"${v || '-'}"`).join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Camp_Report_${viewCamp.name.replace(/\s+/g, '_')}_${viewCamp.date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
            <div className="w-full mx-auto">
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

                {/* Assigned Camps Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="text-indigo-600" size={24} />
                            My Assigned Camps
                        </h3>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                            {assignedCamps.length} Camps
                        </span>
                    </div>

                    {loadingCamps ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse h-40"></div>
                            ))}
                        </div>
                    ) : assignedCamps.length === 0 ? (
                        <div className="bg-white p-10 rounded-3xl border border-dashed border-gray-200 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="text-gray-300" size={32} />
                            </div>
                            <h4 className="text-gray-900 font-bold mb-1">No Camps Assigned</h4>
                            <p className="text-gray-500 text-sm">You haven't been assigned to any upcoming medical camps yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assignedCamps.map((camp) => (
                                <div key={camp._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <MapPin size={24} />
                                        </div>
                                        <CampStatusBadge date={camp.date} time={camp.time} />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2 truncate" title={camp.name}>
                                        {camp.name}
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <MapPin size={14} className="text-gray-400" />
                                            <span className="truncate">{camp.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span>{camp.date || "Date TBD"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock size={14} className="text-gray-400" />
                                            <span>{camp.time || "Time TBD"}</span>
                                        </div>
                                    </div>
                                    <VolunteerDisplay volunteers={camp.volunteers} isSelected={false} />
                                    <PartnerDisplay partners={camp.partners} isSelected={false} />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setViewCamp(camp);
                                        }}
                                        className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        <Eye size={12} /> View Patients
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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

            {/* VIEW CAMP MODAL */}
            {viewCamp && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-indigo-500" />
                                        <span>{viewCamp.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-indigo-500" />
                                        <span>{viewCamp.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-indigo-500" />
                                        <span>{viewCamp.time}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewCamp(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Toolbar */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                    {viewCampPatients.length} Participants
                                </span>
                                <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
                            </div>

                            <button
                                onClick={handleDownloadCampCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
                            >
                                <FileSpreadsheet size={16} />
                                Download Report
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-auto flex-1 p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Patient Name</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contact</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Age / Gender</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Health Check</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {viewCampPatients.length > 0 ? (
                                        viewCampPatients.map(patient => (
                                            <tr key={patient._id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                                                            {patient.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-gray-900">{patient.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 font-medium font-mono">{patient.contact}</td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {patient.age} Y <span className="mx-1">•</span> {patient.gender}
                                                </td>
                                                <td className="p-4">
                                                    {patient.tests && patient.tests.length > 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                                            <CheckCircle size={12} /> Screened
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-400 text-xs font-bold border border-gray-200">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/patient/${patient._id}`)}
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                                                    >
                                                        View Details <ChevronRight size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                                                <Users size={32} className="opacity-20" />
                                                <span className="text-sm font-medium">No patients found in this camp yet.</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setViewCamp(null)}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default EmployeeDashboard;
