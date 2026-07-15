// import axios from "axios";
// import {
//     FiActivity,
//     FiMapPin,
//     FiPhone,
//     FiSearch,
//     FiTrash2,
//     FiUsers,
//     FiCalendar,
//     FiClock,
//     FiSettings,
//     FiUserCheck,
//     FiBarChart,
//     FiDownload,
//     FiEye,
//     FiX,
//     FiFileText,
//     FiCheckCircle,
//     FiChevronRight,
//     FiEdit,
//     FiTrendingUp,
// } from "react-icons/fi";
// import { useEffect, useRef, useState, useMemo } from "react";
// import { createPortal } from "react-dom";
// import React from "react";
// import config from "../config";
// import { Link } from "react-router-dom";
// import "./Dashboard.css";
// import {
//     CampPieChart,
//     CampParticipationChart,
//     CampBMIChart,
//     HealthMetricChart
// } from "../components/DashboardCharts";
// import StatsCard from "../components/StatsCard";
// import AdminFeatureCard from "../components/AdminFeatureCard";
// import VolunteerDisplay from "../components/VolunteerDisplay";
// import PartnerDisplay from "../components/PartnerDisplay";


// const AdminDashboard = () => {
//     const [patients, setPatients] = useState([]);
//     const [camps, setCamps] = useState([]);
//     const [search, setSearch] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [selectedCampId, setSelectedCampId] = useState("all");
//     const [activeToday, setActiveToday] = useState(0);
//     const [healthMetric, setHealthMetric] = useState("bp"); // 'bp' or 'sugar'
//     const [dateFrom, setDateFrom] = useState("");
//     const [dateTo, setDateTo] = useState("");

//     // Modal State
//     const [viewCamp, setViewCamp] = useState(null);

//     // Partners State
//     const [partners, setPartners] = useState([]);
//     const [partnerSearch, setPartnerSearch] = useState("");

//     const campsSectionRef = useRef(null);
//     const patientsSectionRef = useRef(null);
//     const partnersSectionRef = useRef(null);

//     const scrollToSection = (ref) => {
//         if (ref.current) {
//             ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
//         }
//     };

//     /* ================= FETCH ================= */

//     const fetchPatients = async () => {
//         try {
//             const res = await axios.get(
//                 `${config.API_BASE_URL}/patients`
//             );
//             setPatients(res.data);

//             const today = new Date().toDateString();
//             setActiveToday(
//                 res.data.filter(
//                     (p) => new Date(p.createdAt).toDateString() === today
//                 ).length
//             );
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchCamps = async () => {
//         try {
//             const res = await axios.get(
//                 `${config.API_BASE_URL}/camps/allcamps`
//             );
//             setCamps(res.data || []);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const fetchPartners = async () => {
//         try {
//             const res = await axios.get(
//                 `${config.API_BASE_URL}/auth/partners`
//             );
//             setPartners(res.data || []);
//         } catch (err) {
//             console.error("Failed to fetch partners:", err);
//         }
//     };

//     useEffect(() => {
//         fetchPatients();
//         fetchCamps();
//         fetchPartners();
//     }, []);

//     /* ================= DELETE ================= */

//     const deletePatient = async (id) => {
//         if (!window.confirm("Are you sure?")) return;
//         await axios.delete(
//             `${config.API_BASE_URL}/patients/${id}`
//         );
//         fetchPatients();
//     };

//     /* ================= FILTER ================= */

//     const campOnlyFilteredPatients = patients.filter((p) => {
//         return selectedCampId === "all"
//             ? true
//             : (p.campId?._id || p.campId) === selectedCampId;
//     });

//     const filteredPatients = campOnlyFilteredPatients.filter((p) => {
//         return p.name.toLowerCase().includes(search.toLowerCase());
//     });

//     const filteredPartners = partners.filter((p) => {
//         const searchLower = partnerSearch.toLowerCase();
//         return (
//             p.name?.toLowerCase().includes(searchLower) ||
//             p.email?.toLowerCase().includes(searchLower) ||
//             p.clinicName?.toLowerCase().includes(searchLower)
//         );
//     });

//     /* ================= STATS ================= */

//     const filteredCamps = useMemo(() => {
//         return camps.filter(camp => {
//             if (!camp.date) return true;
//             const campDate = new Date(camp.date);
//             const from = dateFrom ? new Date(dateFrom) : null;
//             const to = dateTo ? new Date(dateTo) : null;
//             if (from && campDate < from) return false;
//             if (to && campDate > to) return false;
//             return true;
//         });
//     }, [camps, dateFrom, dateTo]);

//     const totalCamps = filteredCamps.length;

//     // Filtered patients for charts (must belong to filtered camps)
//     const chartFilteredPatients = useMemo(() => {
//         const filteredCampIds = filteredCamps.map(c => String(c._id));
//         return patients.filter(p => {
//             const campId = String(p.campId?._id || p.campId);
//             return filteredCampIds.includes(campId);
//         });
//     }, [patients, filteredCamps]);

//     const totalPatients = chartFilteredPatients.length;

//     // Calculate statuses using centralized logic
//     const campStats = filteredCamps.reduce((acc, camp) => {
//         const { status } = getCampStatus(camp.date, camp.time);
//         if (status === 'live') acc.live++;
//         else if (status === 'today') acc.today++;
//         else if (status === 'upcoming') acc.upcoming++;
//         else if (status === 'completed') acc.completed++;
//         return acc;
//     }, { live: 0, today: 0, upcoming: 0, completed: 0 });

//     const activeCampsCount = campStats.live + campStats.today; // For StatsCard legacy compatibility
//     const liveCampsCount = campStats.live;
//     const todayCampsCount = campStats.today;
//     const upcomingCampsCount = campStats.upcoming;
//     const completedCampsCount = campStats.completed;

//     /* ================= VIEW MODAL HELPERS ================= */

//     const viewCampPatients = useMemo(() => {
//         if (!viewCamp) return [];
//         return patients.filter(p => String(p.campId?._id || p.campId) === String(viewCamp._id));
//     }, [viewCamp, patients]);

//     const handleDownloadCampCSV = () => {
//         if (!viewCamp || viewCampPatients.length === 0) {
//             alert("No data to download");
//             return;
//         }

//         const headers = ["Patient Name", "Age", "Gender", "Contact", "Camp Name", "Date", "Location", "BMI", "BP (Sys/Dia)", "Sugar"];
//         const rows = viewCampPatients.map(p => {
//             // Find latest vitals if tests exist
//             let bmi = "-", bp = "-", sugar = "-";
//             if (p.tests && p.tests.length > 0) {
//                 // Sort by date desc
//                 const sortedTests = [...p.tests].sort((a, b) => new Date(b.date) - new Date(a.date));
//                 const latest = sortedTests[0]; // simplistic approach, potentially refine to find specific test types

//                 // Or better, iterate to find specific values
//                 const weight = p.tests.find(t => t.type === 'weight')?.value;
//                 const height = p.tests.find(t => t.type === 'height')?.value;
//                 if (weight && height) {
//                     const hM = height / 100;
//                     bmi = (weight / (hM * hM)).toFixed(1);
//                 }

//                 const bpTest = p.tests.find(t => t.type === 'bp');
//                 if (bpTest) bp = `${bpTest.value}/${bpTest.value2}`;

//                 const sugarTest = p.tests.find(t => t.type === 'sugar');
//                 if (sugarTest) sugar = `${sugarTest.value} (${sugarTest.type || 'Random'})`;
//             }

//             return [
//                 p.name,
//                 p.age,
//                 p.gender,
//                 p.contact,
//                 viewCamp.name,
//                 viewCamp.date,
//                 viewCamp.location,
//                 bmi,
//                 bp,
//                 sugar
//             ].map(v => `"${v || '-'}"`).join(",");
//         });

//         const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
//         const encodedUri = encodeURI(csvContent);
//         const link = document.createElement("a");
//         link.setAttribute("href", encodedUri);
//         link.setAttribute("download", `Camp_Report_${viewCamp.name.replace(/\s+/g, '_')}_${viewCamp.date}.csv`);
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     return (
//         <div className="admin-dash">
            
//                 {/* Header */}
//                 <div className="admin-dash__header">
//                     <div>
//                         <h1 className="admin-dash__greeting">
//                             Health Camp <span>Dashboard</span>
//                         </h1>
//                         <p className="admin-dash__subtitle">
//                             Manage camps, patients, and health analytics in one place.
//                         </p>
//                     </div>
//                     <div className="admin-dash__date-pill">
//                         <FiCalendar />
//                         <span>
//                             {new Date().toLocaleDateString("en-US", {
//                                 weekday: "short",
//                                 year: "numeric",
//                                 month: "short",
//                                 day: "numeric",
//                             })}
//                         </span>
//                     </div>
//                 </div>

//                 <div className="space-y-10">

//                 {/* Top Summary Stats */}
//                 <div className="admin-dash__stats">
//                     <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Total Camps</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
//                                 <FiMapPin />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{totalCamps}</div>
//                         <div className="admin-dash__stat-meta">health camps</div>
//                     </div>
//                     <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Active Camps</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
//                                 <FiActivity />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{activeCampsCount}</div>
//                         <div className="admin-dash__stat-meta">currently running</div>
//                     </div>
//                     <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Upcoming</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
//                                 <FiCalendar />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{upcomingCampsCount}</div>
//                         <div className="admin-dash__stat-meta">scheduled camps</div>
//                     </div>
//                     <div className="admin-dash__stat" onClick={() => scrollToSection(partnersSectionRef)}>
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Partners</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
//                                 <FiUserCheck />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{partners.length}</div>
//                         <div className="admin-dash__stat-meta">registered partners</div>
//                     </div>
//                     <div className="admin-dash__stat" onClick={() => scrollToSection(patientsSectionRef)}>
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Patients</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
//                                 <FiUsers />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{totalPatients}</div>
//                         <div className="admin-dash__stat-meta">total patients</div>
//                     </div>
//                 </div>

//                 {/* Date Filter */}
//                 <div className="admin-dash__card">
//                     <div className="admin-dash__card-body">
//                         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
//                                     <FiCalendar size={20} />
//                                 </div>
//                                 <div>
//                                     <h4 className="text-sm font-bold text-gray-800">Filter Analytics</h4>
//                                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select Date Range</p>
//                                 </div>
//                             </div>

//                         <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
//                             <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border flex-1 md:flex-none">
//                                 <span className="text-[10px] font-black text-gray-400 uppercase">From</span>
//                                 <input
//                                     type="date"
//                                     value={dateFrom}
//                                     onChange={(e) => setDateFrom(e.target.value)}
//                                     className="bg-transparent text-sm font-bold outline-none text-gray-700"
//                                 />
//                             </div>
//                             <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border flex-1 md:flex-none">
//                                 <span className="text-[10px] font-black text-gray-400 uppercase">To</span>
//                                 <input
//                                     type="date"
//                                     value={dateTo}
//                                     onChange={(e) => setDateTo(e.target.value)}
//                                     className="bg-transparent text-sm font-bold outline-none text-gray-700"
//                                 />
//                             </div>
//                             <button
//                                 onClick={() => { setDateFrom(""); setDateTo(""); }}
//                                 className="px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
//                             >
//                                 Reset
//                             </button>
//                         </div>
//                     </div>
//                 </div>



//                 {/* Charts Section */}
//                 <div className="admin-dash__charts-grid">
//                     <div className="admin-dash__card admin-dash__chart-wrap">
//                         <div className="admin-dash__card-header">
//                             <h3 className="admin-dash__card-title">Camp Status Overview</h3>
//                         </div>
//                         <div className="admin-dash__card-body flex-1">
//                             <CampPieChart
//                                 camps={filteredCamps}
//                                 patients={chartFilteredPatients}
//                                 totalCamps={totalCamps}
//                                 liveCamps={liveCampsCount}
//                                 todayCamps={todayCampsCount}
//                                 upcomingCamps={upcomingCampsCount}
//                                 completedCamps={completedCampsCount}
//                             />
//                         </div>
//                     </div>

//                     <div className="admin-dash__card admin-dash__chart-wrap">
//                         <div className="admin-dash__card-header">
//                             <h3 className="admin-dash__card-title">Camp Participation</h3>
//                         </div>
//                         <div className="admin-dash__card-body flex-1">
//                             <CampParticipationChart camps={filteredCamps} patients={chartFilteredPatients} />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="admin-dash__charts-grid">
//                     <div className="admin-dash__card admin-dash__chart-wrap">
//                         <div className="admin-dash__card-header">
//                             <h3 className="admin-dash__card-title">BMI Distribution</h3>
//                         </div>
//                         <div className="admin-dash__card-body flex-1">
//                             <CampBMIChart camps={filteredCamps} patients={chartFilteredPatients} />
//                         </div>
//                     </div>

//                     <div className="admin-dash__card admin-dash__chart-wrap">
//                         <div className="admin-dash__card-header">
//                             <h3 className="admin-dash__card-title">Health Metrics</h3>
//                         </div>
//                         <div className="admin-dash__card-body flex-1">
//                             <HealthMetricChart
//                                 type={healthMetric}
//                                 patients={chartFilteredPatients}
//                                 selectedCampName={null}
//                                 onToggle={(v) => setHealthMetric(v)}
//                                 currentMetric={healthMetric}
//                             />
//                         </div>
//                     </div>
//                 </div>


//                 {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
//                     <AdminFeatureCard
//                         title="User Management"
//                         description="Manage users, roles, and permissions"
//                         icon={UserCog}
//                         onClick={() => console.log("Navigate to User Management")}
//                     />
//                     <AdminFeatureCard
//                         title="System Settings"
//                         description="Configure system preferences and settings"
//                         icon={Settings}
//                         onClick={() => console.log("Navigate to Settings")}
//                     />
//                     <AdminFeatureCard
//                         title="Advanced Analytics"
//                         description="View detailed reports and analytics"
//                         icon={BarChart3}
//                         onClick={() => console.log("Navigate to Analytics")}
//                     />
//                 </div> */}

//                 {/* Camps Section */}
//                 <div ref={campsSectionRef} className="admin-dash__card">
//                     <div className="admin-dash__card-header">
//                         <h3 className="admin-dash__card-title">All Camps</h3>
//                     </div>
//                     <div className="admin-dash__card-body">
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {camps.map((camp) => (
//                             <div
//                                 key={camp._id}
//                                 onClick={() => setSelectedCampId(camp._id)}
//                                 className={`cursor-pointer p-4 rounded-2xl border transition-all
//           ${selectedCampId === camp._id
//                                         ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
//                                         : "bg-white hover:border-indigo-300 hover:shadow-md"
//                                     }`}
//                             >
//                                 <div className="flex items-center justify-between gap-2 mb-1">
//                                     <h4 className="font-bold truncate">{camp.name}</h4>
//                                     <CampStatusBadge date={camp.date} time={camp.time} />
//                                 </div>

//                                 <div className={`mt-2 flex items-center gap-2 text-sm
//                 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                                     <FiMapPin size={14} />
//                                     <span className="truncate">{camp.location}</span>
//                                 </div>

//                                 <div className={`mt-1 flex items-center gap-2 text-sm
//                 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                                     <FiCalendar size={14} />
//                                     <span>{camp.date || "No date"}</span>
//                                 </div>

//                                 <div className={`mt-1 flex items-center gap-2 text-sm
//                 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                                     <FiClock size={14} />
//                                     <span>{camp.time || "No time"}</span>
//                                 </div>

//                                 <VolunteerDisplay
//                                     volunteers={camp.volunteers}
//                                     isSelected={selectedCampId === camp._id}
//                                 />

//                                 <PartnerDisplay
//                                     partners={camp.partners}
//                                     isSelected={selectedCampId === camp._id}
//                                 />
//                                 <span className={`inline-block mt-3 text-xs font-bold px-2 py-1 rounded-lg
//                 ${selectedCampId === camp._id
//                                         ? "bg-white/20 text-white"
//                                         : "bg-gray-100 text-gray-600"
//                                     }`}>
//                                     {patients.filter((p) => p.campId?._id === camp._id).length} Patients
//                                 </span>

//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         setViewCamp(camp);
//                                     }}
//                                     className="float-right mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
//                                 >
//                                     <FiEye size={12} /> View
//                                 </button>
//                             </div>
//                         ))}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Patients Section */}
//                 {
//                     loading ? (
//                         <p className="text-center text-gray-500">Loading...</p>
//                     ) : (
//                         <div ref={patientsSectionRef} className="admin-dash__card">
//                             <div className="admin-dash__card-header">
//                                 <h3 className="admin-dash__card-title">Patients</h3>
//                                 <div className="relative w-full sm:w-72">
//                                     <FiSearch
//                                         size={18}
//                                         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                                     />
//                                     <input
//                                         type="text"
//                                         placeholder="Search patients by name..."
//                                         value={search}
//                                         onChange={(e) => setSearch(e.target.value)}
//                                         className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none
//                 focus:ring-2 focus:ring-indigo-500/20"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Table Container */}
//                             <div className="admin-dash__card-body p-0">
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full text-left">
//                                         <thead>
//                                             <tr className="border-b border-gray-100 bg-gray-50/50">
//                                                 <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
//                                                 <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
//                                                 <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
//                                                 <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="divide-y divide-gray-100">
//                                             {filteredPatients.length > 0 ? (
//                                                 filteredPatients.map((patient) => (
//                                                     <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
//                                                         <td className="p-4">
//                                                             <div className="flex items-center gap-3">
//                                                                 <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
//                                                                     {patient.name?.charAt(0)?.toUpperCase()}
//                                                                 </div>
//                                                                 <div>
//                                                                     <p className="font-semibold text-gray-900">{patient.name}</p>
//                                                                     <p className="text-xs text-gray-500">{patient.age || 'N/A'} Y • {patient.gender || 'N/A'}</p>
//                                                                 </div>
//                                                             </div>
//                                                         </td>
//                                                         <td className="p-4">
//                                                             <span className="text-sm font-medium text-gray-700">{patient.contact || "N/A"}</span>
//                                                         </td>
//                                                         <td className="p-4">
//                                                             <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
//                                                                 {patient.campId?.name || "N/A"}
//                                                             </span>
//                                                         </td>
//                                                         <td className="p-4">
//                                                             <div className="flex items-center gap-2">
//                                                                 <Link
//                                                                     to={`/patient/${patient._id}`}
//                                                                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
//                                                                 >
//                                                                     <FiEdit size={14} /> Edit
//                                                                 </Link>
//                                                                 <button
//                                                                     onClick={() => deletePatient(patient._id)}
//                                                                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
//                                                                 >
//                                                                     <FiTrash2 size={14} /> Delete
//                                                                 </button>
//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))
//                                             ) : (
//                                                 <tr>
//                                                     <td colSpan={4} className="p-12 text-center">
//                                                         <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
//                                                             <FiUsers size={48} className="opacity-20" />
//                                                             <p className="text-lg font-medium">No patients found</p>
//                                                             <p className="text-sm">Try adjusting your search or filters.</p>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             )}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         </div>
//                     )
//                 }

//                 {/* Partners Section */}
//                 <div ref={partnersSectionRef} className="admin-dash__card">
//                     <div className="admin-dash__card-header">
//                         <h3 className="admin-dash__card-title">Registered Partners</h3>
//                         <div className="relative w-full sm:w-72">
//                             <FiSearch
//                                 size={18}
//                                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                             />
//                             <input
//                                 type="text"
//                                 placeholder="Search partners by name, email, or clinic..."
//                                 value={partnerSearch}
//                                 onChange={(e) => setPartnerSearch(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none
//                 focus:ring-2 focus:ring-indigo-500/20"
//                             />
//                         </div>
//                     </div>

//                     {/* Partners Table */}
//                     <div className="admin-dash__card-body p-0">
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left">
//                                 <thead>
//                                     <tr className="border-b border-gray-100 bg-gray-50/50">
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Email</th>
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Clinic</th>
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-100">
//                                     {filteredPartners.length > 0 ? (
//                                         filteredPartners.map((partner) => (
//                                             <tr key={partner._id} className="transition-colors group hover:bg-gray-50/80">
//                                                 <td className="p-4">
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-violet-700 rounded-full bg-gradient-to-br from-violet-100 to-purple-100">
//                                                             {partner.name?.charAt(0)?.toUpperCase() || 'P'}
//                                                         </div>
//                                                         <div>
//                                                             <p className="font-semibold text-gray-900">{partner.name || 'N/A'}</p>
//                                                             <p className="text-xs text-gray-500">{partner.specialization || 'Doctor'}</p>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <span className="text-sm font-medium text-gray-700">{partner.email || "N/A"}</span>
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">
//                                                         {partner.clinicName || "N/A"}
//                                                     </span>
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <span className="text-sm font-medium text-gray-700">{partner.mobile || "N/A"}</span>
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <div className="flex items-center gap-2">
//                                                         <button
//                                                             onClick={() => alert(`View partner: ${partner.name}`)}
//                                                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
//                                                         >
//                                                             <FiEye size={14} /> View
//                                                         </button>
//                                                         <button
//                                                             onClick={() => alert(`Edit partner: ${partner.name}`)}
//                                                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
//                                                         >
//                                                             <FiEdit size={14} /> Edit
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={5} className="p-12 text-center">
//                                                 <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
//                                                     <FiUserCheck size={48} className="opacity-20" />
//                                                     <p className="text-lg font-medium">No partners found</p>
//                                                     <p className="text-sm">Try adjusting your search.</p>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
            

//             {/* View Camp Modal */}
//             {
//                 viewCamp && createPortal(
//                     <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
//                         <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
//                             {/* Header */}
//                             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//                                 <div>
//                                     <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
//                                     <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
//                                         <div className="flex items-center gap-1.5">
//                                             <FiMapPin size={14} className="text-indigo-500" />
//                                             <span>{viewCamp.location}</span>
//                                         </div>
//                                         <div className="flex items-center gap-1.5">
//                                             <FiCalendar size={14} className="text-indigo-500" />
//                                             <span>{viewCamp.date}</span>
//                                         </div>
//                                         <div className="flex items-center gap-1.5">
//                                             <FiClock size={14} className="text-indigo-500" />
//                                             <span>{viewCamp.time}</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <button
//                                     onClick={() => setViewCamp(null)}
//                                     className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm"
//                                 >
//                                     <FiX size={16} />
//                                 </button>
//                             </div>

//                             {/* Toolbar */}
//                             <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
//                                 <div className="flex items-center gap-2">
//                                     <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
//                                         {viewCampPatients.length} Participants
//                                     </span>
//                                     <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
//                                 </div>

//                                 <button
//                                     onClick={handleDownloadCampCSV}
//                                     className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
//                                 >
//                                     <FiFileText size={16} />
//                                     Download Report
//                                 </button>
//                             </div>

//                             {/* Table */}
//                             <div className="overflow-auto flex-1 p-0">
//                                 <table className="w-full text-left border-collapse">
//                                     <thead className="bg-gray-50 sticky top-0 z-10">
//                                         <tr>
//                                             <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Patient Name</th>
//                                             <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contact</th>
//                                             <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Age / Gender</th>
//                                             <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Health Check</th>
//                                             <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-50">
//                                         {viewCampPatients.length > 0 ? (
//                                             viewCampPatients.map(patient => (
//                                                 <tr key={patient._id} className="hover:bg-gray-50/80 transition-colors">
//                                                     <td className="p-4">
//                                                         <div className="flex items-center gap-3">
//                                                             <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
//                                                                 {patient.name.charAt(0).toUpperCase()}
//                                                             </div>
//                                                             <span className="font-semibold text-gray-900">{patient.name}</span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-4 text-sm text-gray-600 font-medium font-mono">{patient.contact}</td>
//                                                     <td className="p-4 text-sm text-gray-500">
//                                                         {patient.age} Y <span className="mx-1">•</span> {patient.gender}
//                                                     </td>
//                                                     <td className="p-4">
//                                                         {patient.tests && patient.tests.length > 0 ? (
//                                                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
//                                                                 <FiCheckCircle size={12} /> Screened
//                                                             </span>
//                                                         ) : (
//                                                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-400 text-xs font-bold border border-gray-200">
//                                                                 Pending
//                                                             </span>
//                                                         )}
//                                                     </td>
//                                                     <td className="p-4 text-right">
//                                                         <Link
//                                                             to={`/patient/${patient._id}`}
//                                                             className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
//                                                         >
//                                                             View Details <FiChevronRight size={12} />
//                                                         </Link>
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan={5} className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
//                                                     <FiUsers size={32} className="opacity-20" />
//                                                     <span className="text-sm font-medium">No patients found in this camp yet.</span>
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {/* Footer */}
//                             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
//                                 <button
//                                     onClick={() => setViewCamp(null)}
//                                     className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm"
//                                 >
//                                     Close
//                                 </button>
//                             </div>
//                         </div>
//                     </div>,
//                     document.body
//                 )
//             }
//         </div>
//          </div>
//          </div>
//     );
// };

// export default AdminDashboard;


import axios from "axios";
import {
    FiActivity,
    FiMapPin,
    FiPhone,
    FiSearch,
    FiTrash2,
    FiUsers,
    FiCalendar,
    FiClock,
    FiSettings,
    FiUserCheck,
    FiBarChart,
    FiDownload,
    FiEye,
    FiX,
    FiFileText,
    FiCheckCircle,
    FiChevronRight,
    FiEdit,
    FiTrendingUp,
    FiPlus,
    FiUser,
    FiBriefcase,
    FiInfo,
    FiFilter,
    FiPlusCircle
} from "react-icons/fi";
import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import React from "react";
import config from "../config";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { CampStatusBadge, getCampStatus } from "../utils/campStatus";
import {
    CampPieChart,
    CampParticipationChart,
    CampBMIChart,
    HealthMetricChart
} from "../components/DashboardCharts";
import VolunteerDisplay from "../components/VolunteerDisplay";
import PartnerDisplay from "../components/PartnerDisplay";

const AdminDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [camps, setCamps] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedCampId, setSelectedCampId] = useState("all");
    const [activeToday, setActiveToday] = useState(0);
    const [healthMetric, setHealthMetric] = useState("bp");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [viewCamp, setViewCamp] = useState(null);
    const [showCampModal, setShowCampModal] = useState(false);
    const [campForm, setCampForm] = useState({
        name: "",
        location: "",
        address: "",
        date: "",
        time: "",
        volunteers: [],
        partners: []
    });

    const [partners, setPartners] = useState([]);
    const [partnerSearch, setPartnerSearch] = useState("");
    const [volunteers, setVolunteers] = useState([]);
    const [employeeMap, setEmployeeMap] = useState({});
    
    // 🔥 Admin name from localStorage
    const adminName = localStorage.getItem("name") || "Admin";

    // 🔥 Edit Modal State
    const [showEditCampModal, setShowEditCampModal] = useState(false);
    const [editingCamp, setEditingCamp] = useState(null);
    const [editCampForm, setEditCampForm] = useState({
        name: "",
        location: "",
        address: "",
        date: "",
        time: "",
        volunteers: [],
        partners: []
    });

    const campsSectionRef = useRef(null);
    const patientsSectionRef = useRef(null);
    const partnersSectionRef = useRef(null);

    const scrollToSection = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await axios.get(`${config.API_BASE_URL}/patients`);
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
            const res = await axios.get(`${config.API_BASE_URL}/camps/allcamps`);
            let campsData = [];
            if (res.data) {
                if (Array.isArray(res.data)) {
                    campsData = res.data;
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    campsData = res.data.data;
                } else if (res.data.camps && Array.isArray(res.data.camps)) {
                    campsData = res.data.camps;
                }
            }
            setCamps(campsData);
        } catch (err) {
            console.error("Error fetching camps:", err);
            setCamps([]);
        }
    };

    const fetchPartners = async () => {
        try {
            const res = await axios.get(`${config.API_BASE_URL}/auth/partners`);
            let partnerData = res.data || [];
            if (!Array.isArray(partnerData)) {
                partnerData = partnerData.data || partnerData.partners || [];
                if (!Array.isArray(partnerData)) partnerData = [];
            }
            setPartners(partnerData);
        } catch (err) {
            console.error("Failed to fetch partners:", err);
            setPartners([]);
        }
    };

    const fetchVolunteers = async () => {
        try {
            const res = await axios.get(`${config.API_BASE_URL}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
            const empData = res.data || [];
            const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
            
            const empMap = {};
            allEmployees.forEach(emp => {
                empMap[String(emp._id)] = emp.name;
            });
            setEmployeeMap(empMap);

            const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
            const filteredVolunteers = allEmployees.filter(emp => {
                const dept = (emp.department || "").trim();
                return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
            });
            setVolunteers(filteredVolunteers);
        } catch (err) {
            console.error("Failed to fetch volunteers:", err);
            setVolunteers([]);
        }
    };

    useEffect(() => {
        fetchPatients();
        fetchCamps();
        fetchPartners();
        fetchVolunteers();
    }, []);

    const deletePatient = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        await axios.delete(`${config.API_BASE_URL}/patients/${id}`);
        fetchPatients();
    };

    // 🔥 Delete Camp by Admin
    const handleDeleteCamp = async (campId) => {
        if (!window.confirm("Are you sure you want to delete this camp?")) return;
        try {
            await axios.delete(`${config.API_BASE_URL}/camps/delete-camp/${campId}`);
            alert("✅ Camp deleted successfully");
            fetchCamps();
        } catch (err) {
            console.error("Delete camp error:", err);
            alert("❌ Failed to delete camp: " + (err.response?.data?.message || err.message));
        }
    };

    // 🔥 Edit Camp
    const handleEditCamp = (camp) => {
        setEditingCamp(camp);
        setEditCampForm({
            name: camp.name || "",
            location: camp.location || "",
            address: camp.address || "",
            date: camp.date || "",
            time: camp.time || "",
            volunteers: camp.volunteers || [],
            partners: camp.partners || []
        });
        setShowEditCampModal(true);
    };

    const handleUpdateCamp = async () => {
        try {
            if (!editingCamp) return;
            
            const formData = {
                name: editCampForm.name,
                location: editCampForm.location,
                address: editCampForm.address || "",
                date: editCampForm.date,
                time: editCampForm.time,
                assignedPartner: editCampForm.partners && editCampForm.partners.length > 0 ? editCampForm.partners[0] : null,
                volunteers: editCampForm.volunteers || []
            };
            
            await axios.put(`${config.API_BASE_URL}/camps/update-camp/${editingCamp._id}`, formData);
            alert("✅ Camp updated successfully");
            setShowEditCampModal(false);
            setEditingCamp(null);
            setEditCampForm({
                name: "",
                location: "",
                address: "",
                date: "",
                time: "",
                volunteers: [],
                partners: []
            });
            fetchCamps();
        } catch (err) {
            console.error("Update camp error:", err);
            alert("❌ Failed to update camp: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEditAddVolunteer = (e) => {
        const val = e.target.value;
        if (!val) return;
        if (!editCampForm.volunteers.includes(val)) {
            setEditCampForm({
                ...editCampForm,
                volunteers: [...editCampForm.volunteers, val]
            });
        }
        e.target.value = "";
    };

    const handleEditRemoveVolunteer = (name) => {
        setEditCampForm({
            ...editCampForm,
            volunteers: editCampForm.volunteers.filter(v => v !== name)
        });
    };

    const handleEditAddPartner = (e) => {
        const partnerId = e.target.value;
        if (!partnerId) return;
        if (!editCampForm.partners.includes(partnerId)) {
            setEditCampForm({
                ...editCampForm,
                partners: [...editCampForm.partners, partnerId]
            });
        }
        e.target.value = "";
    };

    const handleEditRemovePartner = (id) => {
        setEditCampForm({
            ...editCampForm,
            partners: editCampForm.partners.filter(p => p !== id)
        });
    };

    const handleAddVolunteer = (e) => {
        const val = e.target.value;
        if (!val) return;
        if (!campForm.volunteers.includes(val)) {
            setCampForm({
                ...campForm,
                volunteers: [...campForm.volunteers, val]
            });
        }
        e.target.value = "";
    };

    const handleRemoveVolunteer = (name) => {
        setCampForm({
            ...campForm,
            volunteers: campForm.volunteers.filter(v => v !== name)
        });
    };

    const handleAddPartner = (e) => {
        const partnerId = e.target.value;
        if (!partnerId) return;
        if (!campForm.partners.includes(partnerId)) {
            setCampForm({
                ...campForm,
                partners: [...campForm.partners, partnerId]
            });
        }
        e.target.value = "";
    };

    const handleRemovePartner = (id) => {
        setCampForm({
            ...campForm,
            partners: campForm.partners.filter(p => p !== id)
        });
    };

    // 🔥 FIX: Admin create camp - send admin name as string
    const handleCreateCamp = async () => {
        try {
            if (!campForm.name || !campForm.location || !campForm.date || !campForm.time) {
                alert("Please fill all required fields (Name, Location, Date, Time)");
                return;
            }

            const adminName = localStorage.getItem("name") || "Admin";

            const formData = {
                name: campForm.name,
                location: campForm.location,
                address: campForm.address || "",
                date: campForm.date,
                time: campForm.time,
                createdBy: adminName,  // ✅ Admin name as string
                creatorRole: "admin",
                assignedPartner: campForm.partners && campForm.partners.length > 0 ? campForm.partners[0] : null,
                volunteers: campForm.volunteers || []
            };

            await axios.post(`${config.API_BASE_URL}/camps/addcamp`, formData);
            alert("✅ Camp created successfully");
            setShowCampModal(false);
            setCampForm({
                name: "",
                location: "",
                address: "",
                date: "",
                time: "",
                volunteers: [],
                partners: []
            });
            fetchCamps();
        } catch (err) {
            console.error("CREATE CAMP ERROR", err);
            alert("❌ Failed to create camp: " + (err.response?.data?.message || err.message));
        }
    };

    const filteredCamps = useMemo(() => {
        if (!Array.isArray(camps)) return [];
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

    const chartFilteredPatients = useMemo(() => {
        const filteredCampIds = filteredCamps.map(c => String(c._id));
        return patients.filter(p => {
            const campId = String(p.campId?._id || p.campId);
            return filteredCampIds.includes(campId);
        });
    }, [patients, filteredCamps]);

    const totalPatients = chartFilteredPatients.length;

    const campStats = filteredCamps.reduce((acc, camp) => {
        const { status } = getCampStatus(camp.date, camp.time);
        if (status === 'live') acc.live++;
        else if (status === 'today') acc.today++;
        else if (status === 'upcoming') acc.upcoming++;
        else if (status === 'completed') acc.completed++;
        return acc;
    }, { live: 0, today: 0, upcoming: 0, completed: 0 });

    const activeCampsCount = campStats.live + campStats.today;
    const liveCampsCount = campStats.live;
    const todayCampsCount = campStats.today;
    const upcomingCampsCount = campStats.upcoming;
    const completedCampsCount = campStats.completed;

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

    const getPartnerName = (partnerId) => {
        const partner = partners.find(p => p._id === partnerId);
        return partner ? partner.name || partner.clinicName || "Unknown Partner" : "Unknown Partner";
    };

    // 🔥 FIX: Get creator info with proper names
    const getCreatorInfo = (camp) => {
        if (camp.creatorRole === "admin") {
            return { 
                label: `Created by Admin: ${camp.createdBy || adminName}`, 
                color: "bg-blue-100 text-blue-700" 
            };
        } else if (camp.creatorRole === "partner") {
            let partnerName = "Unknown Partner";
            
            // Check if createdBy is populated as an object
            if (camp.createdBy && typeof camp.createdBy === "object") {
                partnerName = camp.createdBy.name || camp.createdBy.clinicName || "Unknown Partner";
            } else if (camp.createdBy && String(camp.createdBy).match(/^[0-9a-fA-F]{24}$/)) {
                const partner = partners.find(p => String(p._id) === String(camp.createdBy));
                if (partner) {
                    partnerName = partner.name || partner.clinicName || "Unknown Partner";
                }
            } else {
                // Agar string hai toh directly use karo
                partnerName = camp.createdBy || "Unknown Partner";
            }
            
            return { 
                label: `Created by Partner: ${partnerName}`,
                color: "bg-emerald-100 text-emerald-700"
            };
        }
        return { label: "Unknown", color: "bg-gray-100 text-gray-700" };
    };

    return (
        <div className="admin-dash">
            <div className="admin-dash__header">
                <div>
                    <h1 className="admin-dash__greeting">
                        Health Camp <span>Dashboard</span>
                    </h1>
                    <p className="admin-dash__subtitle">
                        Manage camps, patients, and health analytics in one place.
                    </p>
                </div>
                <div className="flex items-center gap-4">
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
                    <button
                        onClick={() => setShowCampModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg shadow-green-100"
                    >
                        <FiPlus size={18} />
                        Create Camp
                    </button>
                </div>
            </div>

            <div className="space-y-10">
                <div className="admin-dash__stats">
                    <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Total Camps</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                                <FiMapPin />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{totalCamps}</div>
                        <div className="admin-dash__stat-meta">health camps</div>
                    </div>
                    <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Active Camps</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                                <FiActivity />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{activeCampsCount}</div>
                        <div className="admin-dash__stat-meta">currently running</div>
                    </div>
                    <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Upcoming</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                                <FiCalendar />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{upcomingCampsCount}</div>
                        <div className="admin-dash__stat-meta">scheduled camps</div>
                    </div>
                    <div className="admin-dash__stat" onClick={() => scrollToSection(partnersSectionRef)}>
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Partners</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                                <FiUserCheck />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{partners.length}</div>
                        <div className="admin-dash__stat-meta">registered partners</div>
                    </div>
                    <div className="admin-dash__stat" onClick={() => scrollToSection(patientsSectionRef)}>
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Patients</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                                <FiUsers />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{totalPatients}</div>
                        <div className="admin-dash__stat-meta">total patients</div>
                    </div>
                </div>

                <div className="admin-dash__card">
                    <div className="admin-dash__card-body">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <FiCalendar size={20} />
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
                </div>

                <div className="admin-dash__charts-grid">
                    <div className="admin-dash__card admin-dash__chart-wrap">
                        <div className="admin-dash__card-header">
                            <h3 className="admin-dash__card-title">Camp Status Overview</h3>
                        </div>
                        <div className="admin-dash__card-body flex-1">
                            <CampPieChart
                                camps={filteredCamps}
                                patients={chartFilteredPatients}
                                totalCamps={totalCamps}
                                liveCamps={liveCampsCount}
                                todayCamps={todayCampsCount}
                                upcomingCamps={upcomingCampsCount}
                                completedCamps={completedCampsCount}
                            />
                        </div>
                    </div>
                    <div className="admin-dash__card admin-dash__chart-wrap">
                        <div className="admin-dash__card-header">
                            <h3 className="admin-dash__card-title">Camp Participation</h3>
                        </div>
                        <div className="admin-dash__card-body flex-1">
                            <CampParticipationChart camps={filteredCamps} patients={chartFilteredPatients} />
                        </div>
                    </div>
                </div>

                <div className="admin-dash__charts-grid">
                    <div className="admin-dash__card admin-dash__chart-wrap">
                        <div className="admin-dash__card-header">
                            <h3 className="admin-dash__card-title">BMI Distribution</h3>
                        </div>
                        <div className="admin-dash__card-body flex-1">
                            <CampBMIChart camps={filteredCamps} patients={chartFilteredPatients} />
                        </div>
                    </div>
                    <div className="admin-dash__card admin-dash__chart-wrap">
                        <div className="admin-dash__card-header">
                            <h3 className="admin-dash__card-title">Health Metrics</h3>
                        </div>
                        <div className="admin-dash__card-body flex-1">
                            <HealthMetricChart
                                type={healthMetric}
                                patients={chartFilteredPatients}
                                selectedCampName={null}
                                onToggle={(v) => setHealthMetric(v)}
                                currentMetric={healthMetric}
                            />
                        </div>
                    </div>
                </div>

                <div ref={campsSectionRef} className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">All Camps</h3>
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                                {activeCampsCount} Active
                            </span>
                            <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                                {totalCamps} Total
                            </span>
                        </div>
                    </div>
                    <div className="admin-dash__card-body">
                        {camps.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <FiMapPin size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="font-medium">No camps found</p>
                                <p className="text-sm text-gray-400 mt-1">Create a new camp to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {camps.map((camp) => {
                                    const creatorInfo = getCreatorInfo(camp);
                                    return (
                                        <div
                                            key={camp._id}
                                            onClick={() => setSelectedCampId(camp._id)}
                                            className={`cursor-pointer p-4 rounded-2xl border transition-all relative
                                                ${selectedCampId === camp._id
                                                    ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                                                    : "bg-white hover:border-indigo-300 hover:shadow-md"
                                                }`}
                                        >
                                            {/* 🔥 Creator Badge with Name */}
                                            <div className={`absolute top-2 left-2 text-[8px] font-bold px-2 py-0.5 rounded-full ${creatorInfo.color}`}>
                                                {creatorInfo.label}
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mb-1 mt-4">
                                                <h4 className="font-bold truncate">{camp.name}</h4>
                                                <CampStatusBadge date={camp.date} time={camp.time} />
                                            </div>
                                            <div className={`mt-2 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                                <FiMapPin size={14} />
                                                <span className="truncate">{camp.location}</span>
                                            </div>
                                            <div className={`mt-1 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                                <FiCalendar size={14} />
                                                <span>{camp.date || "No date"}</span>
                                            </div>
                                            <div className={`mt-1 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                                <FiClock size={14} />
                                                <span>{camp.time || "No time"}</span>
                                            </div>
                                            {camp.partners && camp.partners.length > 0 && (
                                                <div className="mt-2">
                                                    <div className={`text-xs font-semibold mb-1 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-600"}`}>
                                                        <FiUserCheck size={12} className="inline mr-1" />
                                                        Assigned Partners:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {camp.partners.map(partnerId => {
                                                            const partner = partners.find(p => p._id === partnerId);
                                                            return partner ? (
                                                                <span key={partnerId} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                                                    selectedCampId === camp._id 
                                                                        ? "bg-white/20 text-white border-white/30" 
                                                                        : "bg-purple-50 text-purple-700 border-purple-200"
                                                                }`}>
                                                                    {partner.name || partner.clinicName}
                                                                </span>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            {camp.volunteers && camp.volunteers.length > 0 && (
                                                <div className="mt-2">
                                                    <div className={`text-xs font-semibold mb-1 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-600"}`}>
                                                        <FiUser size={12} className="inline mr-1" />
                                                        Volunteers:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {camp.volunteers.map((vol, index) => {
                                                            let volunteerName = vol;
                                                            if (typeof vol === 'object' && vol !== null) {
                                                                volunteerName = vol.name || vol._id || `Volunteer ${index + 1}`;
                                                            } else if (typeof vol === 'string') {
                                                                volunteerName = employeeMap[vol] || vol;
                                                            }
                                                            return (
                                                                <span key={index} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                                                    selectedCampId === camp._id 
                                                                        ? "bg-white/20 text-white border-white/30" 
                                                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                                                }`}>
                                                                    {volunteerName}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            <span className={`inline-block mt-3 text-xs font-bold px-2 py-1 rounded-lg ${selectedCampId === camp._id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                                                {patients.filter((p) => String(p.campId?._id) === String(camp._id)).length} Patients
                                            </span>
                                            <div className="float-right mt-3 flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditCamp(camp);
                                                    }}
                                                    className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
                                                >
                                                    <FiEdit size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCamp(camp._id);
                                                    }}
                                                    className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <FiTrash2 size={12} /> Delete
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewCamp(camp);
                                                    }}
                                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                                >
                                                    <FiEye size={12} /> View
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div ref={patientsSectionRef} className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">Patients</h3>
                        <div className="relative w-full sm:w-72">
                            <FiSearch
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search patients by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                    <div className="admin-dash__card-body p-0">
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
                                                            <FiEdit size={14} /> Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => deletePatient(patient._id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                                        >
                                                            <FiTrash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                                    <FiUsers size={48} className="opacity-20" />
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

                <div ref={partnersSectionRef} className="admin-dash__card">
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
                                value={partnerSearch}
                                onChange={(e) => setPartnerSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                    <div className="admin-dash__card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Email</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Clinic</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Assigned Camps</th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Created Camps</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPartners.length > 0 ? (
                                        filteredPartners.map((partner) => {
                                            const assignedCamps = camps.filter(camp => 
                                                camp.partners && camp.partners.includes(partner._id)
                                            );
                                            const createdCamps = camps.filter(camp => 
                                                camp.createdBy === partner._id && camp.creatorRole === "partner"
                                            );
                                            return (
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
                                                        {assignedCamps.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {assignedCamps.slice(0, 2).map(camp => (
                                                                    <span key={camp._id} className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                                                                        {camp.name}
                                                                    </span>
                                                                ))}
                                                                {assignedCamps.length > 2 && (
                                                                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                                        +{assignedCamps.length - 2} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No camps assigned</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {createdCamps.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {createdCamps.slice(0, 2).map(camp => (
                                                                    <span key={camp._id} className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                                                                        {camp.name}
                                                                    </span>
                                                                ))}
                                                                {createdCamps.length > 2 && (
                                                                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                                        +{createdCamps.length - 2} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No camps created</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
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
                    </div>
                </div>

                {/* Create Camp Modal */}
                {showCampModal && createPortal(
                    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-bold text-gray-800">Create New Camp</h2>
                                    <button onClick={() => setShowCampModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <FiX size={20} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">Fill in the details to create a new health camp</p>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Camp Name *</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        placeholder="Enter camp name" 
                                        value={campForm.name} 
                                        onChange={e => setCampForm({ ...campForm, name: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        placeholder="Enter location" 
                                        value={campForm.location} 
                                        onChange={e => setCampForm({ ...campForm, location: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        placeholder="Enter full address" 
                                        value={campForm.address} 
                                        onChange={e => setCampForm({ ...campForm, address: e.target.value })} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                        <input 
                                            type="date" 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                            value={campForm.date} 
                                            onChange={e => setCampForm({ ...campForm, date: e.target.value })} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                                        <input 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                            placeholder="e.g., 9:00 AM - 5:00 PM" 
                                            value={campForm.time} 
                                            onChange={e => setCampForm({ ...campForm, time: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Select Volunteers</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {campForm.volunteers.map((vol, idx) => (
                                            <span key={idx} className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-700 bg-indigo-100 rounded-full">
                                                {vol} 
                                                <button onClick={() => handleRemoveVolunteer(vol)} className="ml-1 text-indigo-500 hover:text-indigo-900">&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500" 
                                        onChange={handleAddVolunteer}
                                        defaultValue=""
                                    >
                                        <option value="">+ Add Volunteer</option>
                                        {volunteers.map(vol => (
                                            <option key={vol._id} value={vol.name}>{vol.name} ({vol.designation || vol.role || "Staff"})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Assign Partners (Doctors)</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {campForm.partners.map(partnerId => {
                                            const partner = partners.find(p => p._id === partnerId);
                                            return partner ? (
                                                <span key={partnerId} className="flex items-center gap-1 px-3 py-1 text-sm text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
                                                    {partner.name || partner.clinicName} 
                                                    <button onClick={() => handleRemovePartner(partnerId)} className="ml-1 text-emerald-500 hover:text-emerald-900">&times;</button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500" 
                                        onChange={handleAddPartner}
                                        defaultValue=""
                                    >
                                        <option value="">+ Assign Partner</option>
                                        {partners.map(partner => (
                                            <option key={partner._id} value={partner._id}>
                                                {partner.name || partner.clinicName} ({partner.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                                <button onClick={() => setShowCampModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleCreateCamp} className="px-6 py-2 text-white bg-green-600 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100">
                                    <FiPlus className="inline mr-2" size={16} />
                                    Create Camp
                                </button>
                            </div>
                        </div>
                    </div>, document.body
                )}

                {/* Edit Camp Modal */}
                {showEditCampModal && editingCamp && createPortal(
                    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-bold text-gray-800">Edit Camp</h2>
                                    <button onClick={() => { setShowEditCampModal(false); setEditingCamp(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <FiX size={20} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">Update camp details</p>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Camp Name</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        placeholder="Enter camp name" 
                                        value={editCampForm.name} 
                                        onChange={e => setEditCampForm({ ...editCampForm, name: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        placeholder="Enter location" 
                                        value={editCampForm.location} 
                                        onChange={e => setEditCampForm({ ...editCampForm, location: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        placeholder="Enter full address" 
                                        value={editCampForm.address} 
                                        onChange={e => setEditCampForm({ ...editCampForm, address: e.target.value })} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                            value={editCampForm.date} 
                                            onChange={e => setEditCampForm({ ...editCampForm, date: e.target.value })} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                            placeholder="e.g., 9:00 AM - 5:00 PM" 
                                            value={editCampForm.time} 
                                            onChange={e => setEditCampForm({ ...editCampForm, time: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Select Volunteers</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {editCampForm.volunteers.map((vol, idx) => (
                                            <span key={idx} className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-700 bg-indigo-100 rounded-full">
                                                {vol} 
                                                <button onClick={() => handleEditRemoveVolunteer(vol)} className="ml-1 text-indigo-500 hover:text-indigo-900">&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500" 
                                        onChange={handleEditAddVolunteer}
                                        defaultValue=""
                                    >
                                        <option value="">+ Add Volunteer</option>
                                        {volunteers.map(vol => (
                                            <option key={vol._id} value={vol.name}>{vol.name} ({vol.designation || vol.role || "Staff"})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Assign Partners (Doctors)</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {editCampForm.partners.map(partnerId => {
                                            const partner = partners.find(p => p._id === partnerId);
                                            return partner ? (
                                                <span key={partnerId} className="flex items-center gap-1 px-3 py-1 text-sm text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
                                                    {partner.name || partner.clinicName} 
                                                    <button onClick={() => handleEditRemovePartner(partnerId)} className="ml-1 text-emerald-500 hover:text-emerald-900">&times;</button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500" 
                                        onChange={handleEditAddPartner}
                                        defaultValue=""
                                    >
                                        <option value="">+ Assign Partner</option>
                                        {partners.map(partner => (
                                            <option key={partner._id} value={partner._id}>
                                                {partner.name || partner.clinicName} ({partner.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                                <button onClick={() => { setShowEditCampModal(false); setEditingCamp(null); }} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleUpdateCamp} className="px-6 py-2 text-white bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                                    Update Camp
                                </button>
                            </div>
                        </div>
                    </div>, document.body
                )}

                {/* View Camp Modal */}
                {viewCamp && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <FiMapPin size={14} className="text-indigo-500" />
                                            <span>{viewCamp.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FiCalendar size={14} className="text-indigo-500" />
                                            <span>{viewCamp.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FiClock size={14} className="text-indigo-500" />
                                            <span>{viewCamp.time}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-semibold text-gray-600">Created by:</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            viewCamp.creatorRole === "admin" 
                                                ? "bg-blue-100 text-blue-700" 
                                                : "bg-emerald-100 text-emerald-700"
                                        }`}>
                                            {viewCamp.creatorRole === "admin" 
                                                ? (viewCamp.createdBy || adminName)
                                                : (() => {
                                                    let partnerName = "Unknown Partner";
                                                    if (viewCamp.createdBy) {
                                                        if (String(viewCamp.createdBy).match(/^[0-9a-fA-F]{24}$/)) {
                                                            const partner = partners.find(p => String(p._id) === String(viewCamp.createdBy));
                                                            if (partner) {
                                                                partnerName = partner.name || partner.clinicName || "Unknown Partner";
                                                            }
                                                        } else {
                                                            partnerName = viewCamp.createdBy;
                                                        }
                                                    }
                                                    return partnerName;
                                                })()
                                            }
                                        </span>
                                    </div>
                                    {viewCamp.partners && viewCamp.partners.length > 0 && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-semibold text-gray-600">Partners:</span>
                                            {viewCamp.partners.map(partnerId => {
                                                const partner = partners.find(p => p._id === partnerId);
                                                return partner ? (
                                                    <span key={partnerId} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                                        {partner.name || partner.clinicName}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                    {viewCamp.volunteers && viewCamp.volunteers.length > 0 && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-semibold text-gray-600">Volunteers:</span>
                                            {viewCamp.volunteers.map((vol, index) => {
                                                let volunteerName = vol;
                                                if (typeof vol === 'object' && vol !== null) {
                                                    volunteerName = vol.name || vol._id || `Volunteer ${index + 1}`;
                                                } else if (typeof vol === 'string') {
                                                    volunteerName = employeeMap[vol] || vol;
                                                }
                                                return (
                                                    <span key={index} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                        {volunteerName}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setViewCamp(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>
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
                                    <FiFileText size={16} />
                                    Download Report
                                </button>
                            </div>
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
                                                                <FiCheckCircle size={12} /> Screened
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
                                                            View Details <FiChevronRight size={12} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                                                    <FiUsers size={32} className="opacity-20" />
                                                    <span className="text-sm font-medium">No patients found in this camp yet.</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
        </div>
    );
};

export default AdminDashboard;