import axios from "axios";
import {
    FiSearch,
    FiUserCheck,
    FiMail,
    FiPhone,
    FiBuilding,
    FiCalendar,
    FiEye,
    FiEdit,
    FiMessageCircle,
    FiMapPin
} from "react-icons/fi";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "./Dashboard.css";

const Partners = () => {
    const navigate = useNavigate();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${config.API_BASE_URL}/auth/partners`);
            setPartners(res.data || []);
        } catch (err) {
            console.error("Failed to fetch partners:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPartners = useMemo(() => {
        return partners.filter((p) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                p.name?.toLowerCase().includes(searchLower) ||
                p.email?.toLowerCase().includes(searchLower) ||
                p.clinicName?.toLowerCase().includes(searchLower) ||
                p.phone?.includes(searchLower)
            );
        });
    }, [partners, searchQuery]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="admin-dash">
            {/* Header */}
            <div className="admin-dash__header">
                <div>
                    <h1 className="admin-dash__greeting">
                        Partners <span>Dashboard</span>
                    </h1>
                    <p className="admin-dash__subtitle">
                        Manage and view all registered healthcare partners.
                    </p>
                </div>
                <div className="admin-dash__date-pill">
                    <FiCalendar />
                    <span>
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                </div>
            </div>

            <div className="space-y-10">

            {/* Partners Table Section */}
            <div className="admin-dash__card">
                <div className="admin-dash__card-header">
                    <h3 className="admin-dash__card-title">Registered Partners</h3>
                    <div className="relative w-full sm:w-72">
                        <FiSearch
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search partners by name, email, or clinic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="admin-dash__card-body p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-20">
                            <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            <p className="text-gray-500">Loading partners...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Email</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Clinic</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Joined</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPartners.length > 0 ? (
                                        filteredPartners.map((partner) => (
                                            <tr key={partner._id} className="transition-colors group hover:bg-gray-50/80">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-violet-700 rounded-full bg-gradient-to-br from-violet-100 to-purple-100">
                                                            {partner.name?.charAt(0)?.toUpperCase() || 'P'}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{partner.name || 'N/A'}</p>
                                                            <p className="text-xs text-gray-500">{partner.specialization || 'Healthcare Professional'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-medium text-gray-700">{partner.email || "N/A"}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">
                                                        {partner.clinicName || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-medium text-gray-700">{partner.phone || "N/A"}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm text-gray-500">{formatDate(partner.createdAt)}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => alert(`View partner: ${partner.name}`)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <FiEye size={14} /> View
                                                        </button>
                                                        <button
                                                            onClick={() => alert(`Edit partner: ${partner.name}`)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                        >
                                                            <FiEdit size={14} /> Edit
                                                        </button>
                                                        {partner.phone && (
                                                            <button
                                                                onClick={() => window.open(`https://wa.me/${partner.phone.replace(/\D/g, '')}`, '_blank')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                                            >
                                                                <FiMessageCircle size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                                    <FiUserCheck size={48} className="opacity-20" />
                                                    <p className="text-lg font-medium">No partners found</p>
                                                    <p className="text-sm">Try adjusting your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default Partners;
