import axios from "axios";
import {
    Activity,
    MapPin,
    Phone,
    Search,
    Trash2,
    Users,
    Calendar,
    Clock,
    Settings,
    UserCog,
    BarChart3,
    Download,
    Eye,
    X,
    FileSpreadsheet,
    FileText,
    CheckCircle,
    ChevronRight,
    Edit,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import React from "react";
import config from "../config";
import { Link } from "react-router-dom";
import { CampStatusBadge, getCampStatus } from "../utils/campStatus";
import {
    CampPieChart,
    CampParticipationChart,
    CampBMIChart,
    HealthMetricChart
} from "../components/DashboardCharts";
import StatsCard from "../components/StatsCard";
import AdminFeatureCard from "../components/AdminFeatureCard";
import VolunteerDisplay from "../components/VolunteerDisplay";
import PartnerDisplay from "../components/PartnerDisplay";


const AdminDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [camps, setCamps] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedCampId, setSelectedCampId] = useState("all");
    const [activeToday, setActiveToday] = useState(0);
    const [healthMetric, setHealthMetric] = useState("bp"); // 'bp' or 'sugar'
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Modal State
    const [viewCamp, setViewCamp] = useState(null);

    // Partners State
    const [partners, setPartners] = useState([]);
    const [partnerSearch, setPartnerSearch] = useState("");

    const campsSectionRef = useRef(null);
    const patientsSectionRef = useRef(null);
    const partnersSectionRef = useRef(null);

    const scrollToSection = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    /* ================= FETCH ================= */

    const fetchPatients = async () => {
        try {
            const res = await axios.get(
                `${config.API_BASE_URL}/patients`
            );
            setPatients(res.data);

            const today = new Date().toDateString();
            setActiveToday(
                res.data.filter(
                    (p) => new Date(p.createdAt).toDateString() === today
                ).length
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCamps = async () => {
        try {
            const res = await axios.get(
                `${config.API_BASE_URL}/camps/allcamps`
            );
            setCamps(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPartners = async () => {
        try {
            const res = await axios.get(
                `${config.API_BASE_URL}/auth/partners`
            );
            setPartners(res.data || []);
        } catch (err) {
            console.error("Failed to fetch partners:", err);
        }
    };

    useEffect(() => {
        fetchPatients();
        fetchCamps();
        fetchPartners();
    }, []);

    /* ================= DELETE ================= */

    const deletePatient = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        await axios.delete(
            `${config.API_BASE_URL}/patients/${id}`
        );
        fetchPatients();
    };

    /* ================= FILTER ================= */

    const campOnlyFilteredPatients = patients.filter((p) => {
        return selectedCampId === "all"
            ? true
            : (p.campId?._id || p.campId) === selectedCampId;
    });

    const filteredPatients = campOnlyFilteredPatients.filter((p) => {
        return p.name.toLowerCase().includes(search.toLowerCase());
    });

    const filteredPartners = partners.filter((p) => {
        const searchLower = partnerSearch.toLowerCase();
        return (
            p.name?.toLowerCase().includes(searchLower) ||
            p.email?.toLowerCase().includes(searchLower) ||
            p.clinicName?.toLowerCase().includes(searchLower)
        );
    });

    /* ================= STATS ================= */

    const filteredCamps = useMemo(() => {
        return camps.filter(camp => {
            if (!camp.date) return true;
            const campDate = new Date(camp.date);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from && campDate < from) return false;
            if (to && campDate > to) return false;
            return true;
        });
    }, [camps, dateFrom, dateTo]);

    const totalCamps = filteredCamps.length;

    // Filtered patients for charts (must belong to filtered camps)
    const chartFilteredPatients = useMemo(() => {
        const filteredCampIds = filteredCamps.map(c => String(c._id));
        return patients.filter(p => {
            const campId = String(p.campId?._id || p.campId);
            return filteredCampIds.includes(campId);
        });
    }, [patients, filteredCamps]);

    const totalPatients = chartFilteredPatients.length;

    // Calculate statuses using centralized logic
    const campStats = filteredCamps.reduce((acc, camp) => {
        const { status } = getCampStatus(camp.date, camp.time);
        if (status === 'live') acc.live++;
        else if (status === 'today') acc.today++;
        else if (status === 'upcoming') acc.upcoming++;
        else if (status === 'completed') acc.completed++;
        return acc;
    }, { live: 0, today: 0, upcoming: 0, completed: 0 });

    const activeCampsCount = campStats.live + campStats.today; // For StatsCard legacy compatibility
    const liveCampsCount = campStats.live;
    const todayCampsCount = campStats.today;
    const upcomingCampsCount = campStats.upcoming;
    const completedCampsCount = campStats.completed;

    /* ================= VIEW MODAL HELPERS ================= */

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
            // Find latest vitals if tests exist
            let bmi = "-", bp = "-", sugar = "-";
            if (p.tests && p.tests.length > 0) {
                // Sort by date desc
                const sortedTests = [...p.tests].sort((a, b) => new Date(b.date) - new Date(a.date));
                const latest = sortedTests[0]; // simplistic approach, potentially refine to find specific test types

                // Or better, iterate to find specific values
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

    return (
        <div>
            <div className="space-y-10">

                {/* ================= ADMIN HEADER ================= */}
                {/* <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Settings size={28} />
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                </div>
                <p className="text-indigo-100">Complete system overview and management</p>
            </div> */}

                {/* ================= ANALYTICS ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Camps"
                        value={totalCamps}
                        icon={MapPin}
                        iconBg="bg-gradient-to-br from-purple-500 to-indigo-500"
                        onClick={() => scrollToSection(campsSectionRef)}
                    />
                    <StatsCard
                        title="Active Camps"
                        value={activeCampsCount}
                        icon={Activity}
                        iconBg="bg-gradient-to-br from-indigo-500 to-blue-500"
                        onClick={() => scrollToSection(campsSectionRef)}
                    />
                    <StatsCard
                        title="Upcoming Camps"
                        value={upcomingCampsCount}
                        icon={Activity}
                        iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
                        onClick={() => scrollToSection(campsSectionRef)}
                    />
                    <StatsCard
                        title="Total Partners"
                        value={partners.length}
                        icon={UserCog}
                        iconBg="bg-gradient-to-br from-violet-500 to-purple-500"
                        onClick={() => scrollToSection(partnersSectionRef)}
                    />
                </div>

                {/* ================= DATE FILTER ================= */}
                <div style={{ marginTop: '10px' }} className="bg-white  rounded-2xl border shadow-sm w-full p-2">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">Filter Analytics</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select Date Range</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border flex-1 md:flex-none">
                                <span className="text-[10px] font-black text-gray-400 uppercase">From</span>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="bg-transparent text-sm font-bold outline-none text-gray-700"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border flex-1 md:flex-none">
                                <span className="text-[10px] font-black text-gray-400 uppercase">To</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="bg-transparent text-sm font-bold outline-none text-gray-700"
                                />
                            </div>
                            <button
                                onClick={() => { setDateFrom(""); setDateTo(""); }}
                                className="px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>



                {/* ================= CHARTS SECTION ================= */}
                <div style={{ marginTop: '10px' }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    <CampPieChart
                        camps={filteredCamps}
                        patients={chartFilteredPatients}
                        totalCamps={totalCamps}
                        liveCamps={liveCampsCount}
                        todayCamps={todayCampsCount}
                        upcomingCamps={upcomingCampsCount}
                        completedCamps={completedCampsCount}
                    />

                    <CampParticipationChart camps={filteredCamps} patients={chartFilteredPatients} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-6">
                    <CampBMIChart camps={filteredCamps} patients={chartFilteredPatients} />

                    <HealthMetricChart
                        type={healthMetric}
                        patients={chartFilteredPatients}
                        selectedCampName={null}
                        onToggle={(v) => setHealthMetric(v)}
                        currentMetric={healthMetric}
                    />
                </div>


                {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    <AdminFeatureCard
                        title="User Management"
                        description="Manage users, roles, and permissions"
                        icon={UserCog}
                        onClick={() => console.log("Navigate to User Management")}
                    />
                    <AdminFeatureCard
                        title="System Settings"
                        description="Configure system preferences and settings"
                        icon={Settings}
                        onClick={() => console.log("Navigate to Settings")}
                    />
                    <AdminFeatureCard
                        title="Advanced Analytics"
                        description="View detailed reports and analytics"
                        icon={BarChart3}
                        onClick={() => console.log("Navigate to Analytics")}
                    />
                </div> */}

                {/* ================= CAMPS SECTION ================= */}
                <div ref={campsSectionRef}>
                    <h3 className="text-lg font-semibold mb-4">All Camps</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {camps.map((camp) => (
                            <div
                                key={camp._id}
                                onClick={() => setSelectedCampId(camp._id)}
                                className={`cursor-pointer p-4 rounded-2xl border transition-all
          ${selectedCampId === camp._id
                                        ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                                        : "bg-white hover:border-indigo-300 hover:shadow-md"
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="font-bold truncate">{camp.name}</h4>
                                    <CampStatusBadge date={camp.date} time={camp.time} />
                                </div>

                                <div className={`mt-2 flex items-center gap-2 text-sm
                ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                    <MapPin size={14} />
                                    <span className="truncate">{camp.location}</span>
                                </div>

                                <div className={`mt-1 flex items-center gap-2 text-sm
                ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                    <Calendar size={14} />
                                    <span>{camp.date || "No date"}</span>
                                </div>

                                <div className={`mt-1 flex items-center gap-2 text-sm
                ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                    <Clock size={14} />
                                    <span>{camp.time || "No time"}</span>
                                </div>

                                <VolunteerDisplay
                                    volunteers={camp.volunteers}
                                    isSelected={selectedCampId === camp._id}
                                />

                                <PartnerDisplay
                                    partners={camp.partners}
                                    isSelected={selectedCampId === camp._id}
                                />
                                <span className={`inline-block mt-3 text-xs font-bold px-2 py-1 rounded-lg
                ${selectedCampId === camp._id
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {patients.filter((p) => p.campId?._id === camp._id).length} Patients
                                </span>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setViewCamp(camp);
                                    }}
                                    className="float-right mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    <Eye size={12} /> View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= PATIENTS ================= */}
                {
                    loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : (
                        <div ref={patientsSectionRef}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <h3 className="text-lg font-semibold">Patients</h3>

                                <div className="relative w-full sm:w-72">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search patients by name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none
                focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            {/* Table Container */}
                            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
                                                <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
                                                <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
                                                <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredPatients.length > 0 ? (
                                                filteredPatients.map((patient) => (
                                                    <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                                                                    {patient.name?.charAt(0)?.toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{patient.name}</p>
                                                                    <p className="text-xs text-gray-500">{patient.age || 'N/A'} Y • {patient.gender || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-sm font-medium text-gray-700">{patient.contact || "N/A"}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
                                                                {patient.campId?.name || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    to={`/patient/${patient._id}`}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                                >
                                                                    <Edit size={14} /> Edit
                                                                </Link>
                                                                <button
                                                                    onClick={() => deletePatient(patient._id)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                                                >
                                                                    <Trash2 size={14} /> Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-12 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                                            <Users size={48} className="opacity-20" />
                                                            <p className="text-lg font-medium">No patients found</p>
                                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* ================= PARTNERS ================= */}
                <div ref={partnersSectionRef} className="mt-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold">Registered Partners</h3>

                        <div className="relative w-full sm:w-72">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search partners by name, email, or clinic..."
                                value={partnerSearch}
                                onChange={(e) => setPartnerSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none
                focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    {/* Partners Table */}
                    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Email</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Clinic</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
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
                                                            <p className="text-xs text-gray-500">{partner.specialization || 'Doctor'}</p>
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
                                                    <span className="text-sm font-medium text-gray-700">{partner.mobile || "N/A"}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => alert(`View partner: ${partner.name}`)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                        <button
                                                            onClick={() => alert(`Edit partner: ${partner.name}`)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                        >
                                                            <Edit size={14} /> Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                                    <UserCog size={48} className="opacity-20" />
                                                    <p className="text-lg font-medium">No partners found</p>
                                                    <p className="text-sm">Try adjusting your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= VIEW CAMP MODAL ================= */}
            {
                viewCamp && createPortal(
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
                                                        <Link
                                                            to={`/patient/${patient._id}`}
                                                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                                                        >
                                                            View Details <ChevronRight size={12} />
                                                        </Link>
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
                )
            }
        </div >
    );
};

export default AdminDashboard;
