import axios from "axios";
import { Building2, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import React, { useEffect, useState } from "react";

const DoctorDashboard = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPartners = async () => {
        try {
            // Fetch from LOCAL backend (where partners are stored)
            const res = await axios.get("http://localhost:5000/api/auth/partners");
            setPartners(res.data);
        } catch (err) {
            console.error("Error fetching partners:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* HEADER */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-xl flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldCheck className="text-cyan-300" size={32} />
                        Partner Network
                    </h1>
                    <p className="text-indigo-100 mt-2">
                        Verified healthcare partners and clinics.
                    </p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center min-w-[150px]">
                    <div className="text-3xl font-bold">{partners.length}</div>
                    <div className="text-xs text-indigo-100 uppercase tracking-widest">
                        Active Partners
                    </div>
                </div>
            </div>

            {/* BODY */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading partners...</div>
            ) : partners.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border shadow-sm">
                    <h3 className="text-xl font-bold text-gray-700">No Partners Found</h3>
                    <p className="text-gray-500">Registered partners will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partners.map((partner) => (
                        <div
                            key={partner._id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-[#2563EB]/10 rounded-xl group-hover:bg-[#2563EB]/20 transition-colors">
                                    <Building2 className="text-[#2563EB]" size={24} />
                                </div>
                                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase">
                                    Verified
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {partner.clinicName}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                                <User size={14} /> {partner.name}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail size={16} className="text-gray-400" />
                                    {partner.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone size={16} className="text-gray-400" />
                                    {partner.mobile}
                                </div>
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                                    <span className="flex-1">{partner.address}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
