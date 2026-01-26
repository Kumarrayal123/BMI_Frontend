import axios from "axios";
import {
    Search,
    UserCog,
    Mail,
    Phone,
    Building2,
    Calendar,
    Eye,
    Edit,
    MessageCircle,
    MapPin
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

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
        <div className="min-h-screen p-0 space-y-6 bg-gray-50/50 animate-fade-in">
            {/* Header with Search */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Registered Partners</h1>
                    <p className="mt-1 text-gray-500">Manage and view all registered healthcare partners</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-80">
                        <Search
                            size={18}
                            className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                        />
                        <input
                            type="text"
                            placeholder="Search partners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                        />
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-xl whitespace-nowrap">
                        <UserCog size={18} className="text-violet-600" />
                        <span className="text-sm font-medium text-gray-700">
                            {partners.length} Total
                        </span>
                    </div>
                </div>
            </div>

            {/* Partners Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                    <div className="w-12 h-12 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
                    <p className="text-gray-500">Loading partners...</p>
                </div>
            ) : filteredPartners.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPartners.map((partner) => (
                        <div
                            key={partner._id}
                            className="relative p-6 transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-lg hover:scale-[1.02] group"
                        >
                            {/* Avatar and Name */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 text-xl font-bold text-violet-700 rounded-full bg-gradient-to-br from-violet-100 to-purple-100">
                                    {partner.name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">
                                        {partner.name || 'N/A'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {partner.specialization || 'Healthcare Professional'}
                                    </p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Mail size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 break-all">
                                        {partner.email || 'N/A'}
                                    </span>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Building2 size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                                    <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                        {partner.clinicName || 'N/A'}
                                    </span>
                                </div>

                                {partner.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400 flex-shrink-0" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {partner.phone}
                                        </span>
                                    </div>
                                )}

                                {partner.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600 line-clamp-2">
                                            {partner.address}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-500">
                                        Joined {formatDate(partner.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {/* <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={() => alert(`View details for ${partner.name}`)}
                                    className="flex items-center justify-center flex-1 gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                >
                                    <Eye size={14} /> View
                                </button>
                                <button
                                    onClick={() => alert(`Edit ${partner.name}`)}
                                    className="flex items-center justify-center flex-1 gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                {partner.phone && (
                                    <button
                                        onClick={() => window.open(`https://wa.me/${partner.phone.replace(/\D/g, '')}`, '_blank')}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                                    >
                                        <MessageCircle size={14} />
                                    </button>
                                )}
                            </div> */}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                    <UserCog size={64} className="text-gray-300" />
                    <p className="text-lg font-medium text-gray-400">No partners found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search query</p>
                </div>
            )}
        </div>
    );
};

export default Partners;
