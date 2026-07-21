import axios from "axios";
import {
    FiSearch,
    FiUser,
    FiCalendar,
    FiEye,
    FiFilter,
    FiX,
    FiMapPin,
    FiPhone,
    FiFileText,
    FiClock,
    FiUserCheck,
    FiAlertCircle,
    FiPlus,
    FiEdit,
    FiCheckCircle
} from "react-icons/fi";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "./Dashboard.css";

const PendingReports = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🔥 Filter States
    const [filterType, setFilterType] = useState("name");
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    
    // 🔥 Selected Patient
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    // 🔒 SCROLL LOCK FUNCTION
    const lockScroll = () => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    };

    const unlockScroll = () => {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.width = 'auto';
    };

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${config.API_BASE_URL}/patients`);
            console.log("Fetched patients:", res.data);
            setPatients(res.data || []);
        } catch (err) {
            console.error("Failed to fetch patients:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Filter only patients without reports (no tests)
    const patientsWithoutReports = useMemo(() => {
        return patients.filter(p => !p.tests || p.tests.length === 0);
    }, [patients]);

    // 🔥 Get unique values for dropdown
    const uniqueNames = useMemo(() => {
        return [...new Set(patientsWithoutReports.map(p => p.name).filter(Boolean))].sort();
    }, [patientsWithoutReports]);

    const uniqueCamps = useMemo(() => {
        return [...new Set(patientsWithoutReports.map(p => p.campId?.name).filter(Boolean))].sort();
    }, [patientsWithoutReports]);

    const uniquePhones = useMemo(() => {
        return [...new Set(patientsWithoutReports.map(p => p.contact).filter(Boolean))].sort();
    }, [patientsWithoutReports]);

    const uniqueAddresses = useMemo(() => {
        return [...new Set(patientsWithoutReports.map(p => p.address).filter(Boolean))].sort();
    }, [patientsWithoutReports]);

    // 🔥 Filter Options
    const filterOptions = [
        { value: "name", label: "Name" },
        { value: "camp", label: "Camp Name" },
        { value: "phone", label: "Phone Number" },
        { value: "address", label: "Address" }
    ];

    // 🔥 Get dropdown options based on selected filter
    const getDropdownOptions = () => {
        switch(filterType) {
            case "name": return uniqueNames;
            case "camp": return uniqueCamps;
            case "phone": return uniquePhones;
            case "address": return uniqueAddresses;
            default: return [];
        }
    };

    // 🔥 Filter dropdown options based on search
    const filteredDropdownOptions = getDropdownOptions().filter(option =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 🔥 Filter Patients
    const filteredPatients = useMemo(() => {
        if (!searchQuery.trim()) return patientsWithoutReports;
        const searchLower = searchQuery.toLowerCase();
        return patientsWithoutReports.filter((p) => {
            switch(filterType) {
                case "name":
                    return p.name?.toLowerCase().includes(searchLower);
                case "camp":
                    return p.campId?.name?.toLowerCase().includes(searchLower);
                case "phone":
                    return p.contact?.toLowerCase().includes(searchLower);
                case "address":
                    return p.address?.toLowerCase().includes(searchLower);
                default:
                    return p.name?.toLowerCase().includes(searchLower);
            }
        });
    }, [patientsWithoutReports, searchQuery, filterType]);

    // 🔥 Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.report-search-container')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // 🔥 View Patient Details
    const handleViewPatient = (patient) => {
        lockScroll();
        setSelectedPatient(patient);
        setShowViewModal(true);
    };

    // 🔥 Close View Modal
    const closeViewModal = () => {
        unlockScroll();
        setShowViewModal(false);
        setSelectedPatient(null);
    };

    // 🔥 Navigate to Add Test
    const handleAddTest = (patient) => {
        navigate(`/patient/${patient._id}`);
    };

    // View Modal Component
    const ViewPatientModal = () => {
        if (!showViewModal || !selectedPatient) return null;

        const patient = selectedPatient;

        return (
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        closeViewModal();
                    }
                }}
            >
                <div 
                    className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-amber-600 to-orange-600 text-white sticky top-0 z-10">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <FiUser size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Patient Details</h3>
                                    <p className="text-sm text-amber-100">
                                        {patient.name} • {patient.age} years • {patient.gender}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeViewModal}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</p>
                                <p className="mt-1 font-semibold text-gray-800">{patient.name}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age / Gender</p>
                                <p className="mt-1 font-semibold text-gray-800">{patient.age} Y • {patient.gender}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                                <p className="mt-1 font-semibold text-gray-800 flex items-center gap-2">
                                    <FiPhone className="text-gray-400" size={14} />
                                    {patient.contact || 'N/A'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camp</p>
                                <p className="mt-1 font-semibold text-gray-800">{patient.campId?.name || 'N/A'}</p>
                            </div>
                        </div>

                        {patient.address && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                <p className="mt-1 text-gray-700 flex items-start gap-2">
                                    <FiMapPin className="text-gray-400 flex-shrink-0 mt-1" size={16} />
                                    <span>{patient.address}</span>
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-2 text-amber-700">
                                <FiClock size={18} />
                                <p className="font-semibold">No tests recorded yet</p>
                            </div>
                            <p className="mt-1 text-sm text-amber-600">
                                This patient has no health tests or vitals recorded.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    closeViewModal();
                                    setTimeout(() => handleAddTest(patient), 100);
                                }}
                                className="flex-1 min-w-[120px] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm active:scale-[0.98] flex items-center justify-center"
                            >
                                <FiPlus size={16} className="mr-2" />
                                Add Tests
                            </button>
                            <button
                                onClick={() => {
                                    closeViewModal();
                                    navigate(`/patient/${patient._id}`);
                                }}
                                className="flex-1 min-w-[120px] py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-sm active:scale-[0.98] flex items-center justify-center"
                            >
                                <FiEdit size={16} className="mr-2" />
                                Edit Patient
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Stats
    const totalPending = patientsWithoutReports.length;
    const totalPatients = patients.length;
    const percentagePending = totalPatients > 0 ? ((totalPending / totalPatients) * 100).toFixed(1) : 0;

    return (
        <div className="admin-dash">
            {/* Header */}
            <div className="admin-dash__header">
                <div>
                    <h1 className="admin-dash__greeting">
                        Pending <span>Reports</span>
                    </h1>
                    <p className="admin-dash__subtitle">
                        View patients who need health reports to be created.
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
                {/* Stats Cards - Fixed with proper spacing */}
                <div className="admin-dash__stats" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '1.5rem',
                    marginBottom: '0'
                }}>
                    {/* Pending Reports Card */}
                    <div className="admin-dash__stat" style={{
                        padding: '1.5rem 1.5rem 1.25rem',
                        background: 'white',
                        borderRadius: '1rem',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}>
                        <div className="admin-dash__stat-top" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            <span className="admin-dash__stat-label" style={{
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>Pending Reports</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--amber" style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '0.5rem',
                                background: '#fef3c7',
                                color: '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem'
                            }}>
                                <FiClock size={16} />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value" style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: '#111827',
                            lineHeight: '1.2'
                        }}>{totalPending}</div>
                        <div className="admin-dash__stat-meta" style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            fontWeight: '500'
                        }}>need tests</div>
                    </div>

                    {/* Total Patients Card */}
                    <div className="admin-dash__stat" style={{
                        padding: '1.5rem 1.5rem 1.25rem',
                        background: 'white',
                        borderRadius: '1rem',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}>
                        <div className="admin-dash__stat-top" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            <span className="admin-dash__stat-label" style={{
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>Total Patients</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo" style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '0.5rem',
                                background: '#eef2ff',
                                color: '#4f46e5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem'
                            }}>
                                <FiUserCheck size={16} />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value" style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: '#111827',
                            lineHeight: '1.2'
                        }}>{totalPatients}</div>
                        <div className="admin-dash__stat-meta" style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            fontWeight: '500'
                        }}>registered</div>
                    </div>

                    {/* Pending Percentage Card */}
                    <div className="admin-dash__stat" style={{
                        padding: '1.5rem 1.5rem 1.25rem',
                        background: 'white',
                        borderRadius: '1rem',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}>
                        <div className="admin-dash__stat-top" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            <span className="admin-dash__stat-label" style={{
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>Pending %</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--rose" style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '0.5rem',
                                background: '#fce7f3',
                                color: '#db2777',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem'
                            }}>
                                <FiAlertCircle size={16} />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value" style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: '#111827',
                            lineHeight: '1.2'
                        }}>{percentagePending}%</div>
                        <div className="admin-dash__stat-meta" style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            fontWeight: '500'
                        }}>of total patients</div>
                    </div>
                </div>

                {/* Pending Reports Table */}
                <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">Patients Without Reports</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setSearchQuery("");
                                        setShowDropdown(false);
                                    }}
                                    className="px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                                >
                                    {filterOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative report-search-container w-full sm:w-64">
                                <FiSearch
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                                />
                                <input
                                    type="text"
                                    placeholder={`Search by ${filterOptions.find(o => o.value === filterType)?.label || 'Name'}...`}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {showDropdown && filteredDropdownOptions.length > 0 && searchQuery.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                        {filteredDropdownOptions.map((option, index) => (
                                            <div
                                                key={index}
                                                className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setSearchQuery(option);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="admin-dash__card-body p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                <p className="text-gray-500">Loading patients...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Patient</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Registered</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Status</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map((patient) => (
                                                <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-amber-700 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex-shrink-0">
                                                                {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{patient.name || 'N/A'}</p>
                                                                <p className="text-xs text-gray-500">{patient.age || 'N/A'} Y • {patient.gender || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full whitespace-nowrap">
                                                            {patient.campId?.name || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                            <FiPhone size={12} className="text-gray-400 flex-shrink-0" />
                                                            {patient.contact || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(patient.createdAt)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-3 py-1 text-sm font-semibold bg-amber-100 text-amber-700 rounded-full flex items-center gap-1 whitespace-nowrap">
                                                            <FiClock size={12} />
                                                            Pending
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <button
                                                                onClick={() => handleViewPatient(patient)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                                                            >
                                                                <FiEye size={14} /> View
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddTest(patient)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                                                            >
                                                                <FiPlus size={14} /> Add Tests
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                                        <FiCheckCircle size={48} className="opacity-20 text-emerald-500" />
                                                        <p className="text-lg font-medium text-emerald-600">All patients have reports!</p>
                                                        <p className="text-sm">No pending reports found.</p>
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

            {/* View Modal */}
            <ViewPatientModal />
        </div>
    );
};

export default PendingReports;