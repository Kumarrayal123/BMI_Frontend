import axios from "axios";
import { CheckCircle, Clock, Mail, Phone, User, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/applications");
            setApplications(res.data);
        } catch (err) {
            console.error("Error fetching applications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-xl flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <User size={32} className="text-cyan-300" />
                        Applications
                    </h1>
                    <p className="text-indigo-100 mt-2">
                        Review requests to join as Volunteers or Camp Organizers.
                    </p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center min-w-[150px]">
                    <div className="text-3xl font-bold">{applications.length}</div>
                    <div className="text-xs text-indigo-100 uppercase tracking-widest">
                        Total Requests
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading requests...</div>
            ) : applications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border shadow-sm">
                    <h3 className="text-xl font-bold text-gray-700">No Applications</h3>
                    <p className="text-gray-500">New requests will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div
                            key={app._id}
                            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-all"
                        >
                            {/* Type Badge */}
                            <div className="flex-shrink-0">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${app.type === "camp"
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "bg-sky-100 text-sky-600"
                                        }`}
                                >
                                    {app.type === "camp" ? "C" : "V"}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md uppercase font-semibold">
                                        {app.type === "camp" ? "Organizer" : "Volunteer"}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                    <span className="flex items-center gap-1">
                                        <Phone size={14} /> {app.mobile}
                                    </span>
                                    {app.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail size={14} /> {app.email}
                                        </span>
                                    )}
                                </div>

                                {app.message && (
                                    <p className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        "{app.message}"
                                    </p>
                                )}
                            </div>

                            {/* Actions (Placeholder for now) */}
                            <div className="flex gap-2">
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                                    <CheckCircle size={20} />
                                </button>
                                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Reject">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminApplications;
