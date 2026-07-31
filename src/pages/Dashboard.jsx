
// import axios from "axios";
// import {
//   Activity,
//   Calendar,
//   CheckCircle,
//   ChevronRight,
//   Clock,
//   Eye,
//   FileSpreadsheet,
//   MapPin,
//   PenTool,
//   Search,
//   Trash2,
//   Users,
//   X
// } from "lucide-react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { Link } from "react-router-dom";
// import PartnerDisplay from "../components/PartnerDisplay";
// import VolunteerDisplay from "../components/VolunteerDisplay";
// import config from "../config";
// import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";
// import "./Dashboard.css";

// const Dashboard = () => {

//   // Helper Functions
//   const calculateBMI = (weight, heightCm) => {
//     if (!weight || !heightCm) return null;
//     const h = heightCm / 100;
//     return +(weight / (h * h)).toFixed(1);
//   };

//   const getBMICategory = (bmi) => {
//     if (!bmi) return "-";
//     if (bmi < 18.5) return "Underweight";
//     if (bmi < 25) return "Healthy";
//     if (bmi < 30) return "Overweight";
//     return "Obese";
//   };

//   const extractLatestVitals = (tests = []) => {
//     const r = {};
//     if (!tests) return r;

//     tests.forEach(t => {
//       r.date = t.date;
//       if (t.type === "weight") r.weight = t.value;
//       if (t.type === "height") r.height = t.value;
//       if (t.type === "sugar") r.sugar = t.value;
//       if (t.type === "sugarType") r.sugarType = t.value;
//       if (t.type === "bp") {
//         r.systolic = t.value;
//         r.diastolic = t.value2;
//       }
//     });
//     return r;
//   };
//   const [patients, setPatients] = useState([]);
//   const [camps, setCamps] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [selectedCampId, setSelectedCampId] = useState("all");
//   const [activeToday, setActiveToday] = useState(0);
//   const [viewCamp, setViewCamp] = useState(null);

//   const campsSectionRef = useRef(null);
//   const patientsSectionRef = useRef(null);
//   const esignSectionRef = useRef(null);

//   const scrollToSection = (ref) => {
//     if (ref.current) {
//       ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   /* ================= FETCH ================= */

//   const fetchPatients = async () => {
//     try {
//       const res = await axios.get(
//         `${config.API_BASE_URL}/patients`
//       );
//       setPatients(res.data);

//       const today = new Date().toDateString();
//       setActiveToday(
//         res.data.filter(
//           (p) => new Date(p.createdAt).toDateString() === today
//         ).length
//       );
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCamps = async () => {
//     try {
//       const role = localStorage.getItem("role");
//       const partnerId = localStorage.getItem("userId") || (localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).id : null);

//       let res;
//       if (role === "partner" && partnerId) {
//         res = await axios.get(`${config.API_BASE_URL}/camps/assigned-camps/${partnerId}`);
//       } else {
//         res = await axios.get(`${config.API_BASE_URL}/camps/allcamps`);
//       }
//       setCamps(sortCampsByStatus(res.data || []));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchPatients();
//     fetchCamps();
//   }, []);

//   // Role detection
//   const role = localStorage.getItem("role");

//   // Filter for My Assigned Camps (Employee or Partner)
//   const employeeName = localStorage.getItem("employeeName");
//   const employeeId = localStorage.getItem("employeeId");
//   const partnerId = localStorage.getItem("userId") || (localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).id : null);

//   const myAssignedCamps = (role === "partner" && partnerId)
//     ? camps // Already filtered by API in fetchCamps
//     : camps.filter(camp =>
//       (camp.volunteers || []).some(v =>
//         (employeeName && v.toLowerCase() === employeeName.toLowerCase()) ||
//         (employeeId && v === employeeId)
//       )
//     );

//   /* ================= DELETE ================= */

//   const deletePatient = async (id) => {
//     if (!window.confirm("Are you sure?")) return;
//     await axios.delete(
//       `${config.API_BASE_URL}/patients/${id}`
//     );
//     fetchPatients();
//   };

//   /* ================= FILTER ================= */

//   const filteredPatients = patients.filter((p) => {
//     const matchSearch = p.name
//       .toLowerCase()
//       .includes(search.toLowerCase());

//     const matchCamp =
//       selectedCampId === "all"
//         ? (role === "employee" || role === "partner" ? myAssignedCamps.some(c => c._id === p.campId?._id) : true)
//         : p.campId?._id === selectedCampId;

//     return matchSearch && matchCamp;
//   });

//   /* ================= STATS ================= */

//   const totalCamps = camps.length;
//   const totalPatients = patients.length;
//   // const recentPatients = activeToday;

//   // Calculate Active and Upcoming Camps using centralized logic
//   const activeCampsCount = camps.filter(c => {
//     const { status } = getCampStatus(c.date, c.time);
//     return status === 'live' || status === 'today';
//   }).length;

//   const upcomingCampsCount = camps.filter(c => {
//     const { status } = getCampStatus(c.date, c.time);
//     return status === 'upcoming';
//   }).length;

//   const esignCount = patients.filter(p => p.tests && p.tests.length > 0).length;

//   /* ================= VIEW MODAL HELPERS ================= */

//   // Filter patients for selected camp in modal
//   const viewCampPatients = useMemo(() => {
//     if (!viewCamp) return [];
//     return patients.filter(p => p.campId?._id === viewCamp._id);
//   }, [viewCamp, patients]);

//   const handleDownloadCampCSV = () => {
//     if (!viewCamp || viewCampPatients.length === 0) {
//       alert("No data to download");
//       return;
//     }

//     const headers = ["Patient Name", "Age", "Gender", "Contact", "Camp Name", "Date", "Location", "BMI", "BP (Sys/Dia)", "Sugar"];
//     const rows = viewCampPatients.map(p => {
//       let bmi = "-", bp = "-", sugar = "-";
//       if (p.tests && p.tests.length > 0) {
//         const test = extractLatestVitals(p.tests);
//         const bmiValue = calculateBMI(test.weight, test.height);
//         if (bmiValue) bmi = bmiValue;

//         if (test.systolic && test.diastolic) bp = `${test.systolic}/${test.diastolic}`;
//         if (test.sugar) sugar = `${test.sugar} (${test.sugarType || 'Random'})`;
//       }

//       return [
//         p.name,
//         p.age,
//         p.gender,
//         p.contact,
//         viewCamp.name,
//         viewCamp.date,
//         viewCamp.location,
//         bmi,
//         bp,
//         sugar
//       ].map(v => `"${v || '-'}"`).join(",");
//     });

//     const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `Camp_Report_${viewCamp.name.replace(/\s+/g, '_')}_${viewCamp.date}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="admin-dash">
//       <div className="admin-dash__wrapper">
//       {/* Header */}
//       <div className="admin-dash__header">
//         <div>
//           <h1 className="admin-dash__greeting">
//             Health Camp <span>Dashboard</span>
//           </h1>
//           <p className="admin-dash__subtitle">
//             Manage camps, patients, and health analytics in one place.
//           </p>
//         </div>
//         <div className="admin-dash__date-pill">
//           <Calendar />
//           <span>
//             {new Date().toLocaleDateString("en-US", {
//               weekday: "short",
//               year: "numeric",
//               month: "short",
//               day: "numeric",
//             })}
//           </span>
//         </div>
//       </div>

//       <div className="space-y-10">

//       {/* ================= ANALYTICS ================= */}
//       <div className="admin-dash__stats">
//         <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Total Camps</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
//               <MapPin />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">{role === "employee" ? myAssignedCamps.length : totalCamps}</div>
//           <div className="admin-dash__stat-meta">health camps</div>
//         </div>

//         <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Active Camps</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
//               <Activity />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">
//             {
//               role === "employee"
//                 ? myAssignedCamps.filter(c => {
//                     if (!c.date) return false;
//                     let campDate = new Date(c.date);
//                     if (isNaN(campDate.getTime())) {
//                       const parts = c.date.split('-');
//                       if (parts.length === 3) {
//                         campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
//                       }
//                     }
//                     if (isNaN(campDate.getTime())) return false;
//                     const today = new Date();
//                     today.setHours(0,0,0,0);
//                     campDate.setHours(0,0,0,0);
//                     return campDate.getTime() === today.getTime();
//                   }).length
//                 : activeCampsCount
//             }
//           </div>
//           <div className="admin-dash__stat-meta">currently running</div>
//         </div>

//         <div className="admin-dash__stat" onClick={() => scrollToSection(patientsSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Patients</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
//               <Users />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">
//             {
//               role === "employee"
//                 ? patients.filter(p =>
//                     myAssignedCamps.some(c => c._id === p.campId?._id)
//                   ).length
//                 : totalPatients
//             }
//           </div>
//           <div className="admin-dash__stat-meta">total patients</div>
//         </div>

//         <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Upcoming</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
//               <Calendar />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">
//             {
//               role === "employee"
//                 ? myAssignedCamps.filter(c => {
//                     if (!c.date) return false;
//                     let campDate = new Date(c.date);
//                     if (isNaN(campDate.getTime())) {
//                       const parts = c.date.split('-');
//                       if (parts.length === 3) {
//                         campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
//                       }
//                     }
//                     if (isNaN(campDate.getTime())) return false;
//                     const today = new Date();
//                     today.setHours(0,0,0,0);
//                     campDate.setHours(0,0,0,0);
//                     return campDate.getTime() > today.getTime();
//                   }).length
//                 : upcomingCampsCount
//             }
//           </div>
//           <div className="admin-dash__stat-meta">scheduled camps</div>
//         </div>

//         <div className="admin-dash__stat" onClick={() => scrollToSection(esignSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">eSign</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
//               <PenTool />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">{esignCount}</div>
//           <div className="admin-dash__stat-meta">screened patients</div>
//         </div>
//       </div>

//       {/* ================= CAMPS SECTION ================= */}
//       <div ref={campsSectionRef} className="admin-dash__card">
//         <div className="admin-dash__card-header">
//           <h3 className="admin-dash__card-title">
//             {role === "employee" && myAssignedCamps.length > 0 ? "My Assigned Camps" : "All Camps"}
//           </h3>
//         </div>
//         <div className="admin-dash__card-body">
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//             {(role === "employee" && myAssignedCamps.length > 0 ? myAssignedCamps : camps).map((camp) => (
//                 <div
//                   key={camp._id}
//                   onClick={() => setSelectedCampId(camp._id)}
//                   className={`cursor-pointer p-5 rounded-2xl border transition-all group
//                   ${selectedCampId === camp._id
//                       ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
//                       : "bg-white hover:border-indigo-300 hover:shadow-md"
//                     }`}
//                 >
//                   <div className="flex items-start justify-between gap-2 mb-4">
//                     <h4 className={`font-bold truncate ${selectedCampId === camp._id ? "text-white" : "text-gray-900 group-hover:text-indigo-600 transition-colors"}`}>{camp.name}</h4>
//                     <CampStatusBadge date={camp.date} time={camp.time} />
//                   </div>

//                   <div className="space-y-2 text-sm font-medium">
//                     <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                       <MapPin size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-500"} />
//                       <span className="truncate">{camp.location}</span>
//                     </div>

//                     <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                       <Calendar size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-400"} />
//                       <span>{camp.date || "No date"}</span>
//                     </div>

//                     <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                       <Clock size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-500"} />
//                       <span>{camp.time || "No time"}</span>
//                     </div>

//                     <VolunteerDisplay volunteers={camp.volunteers} isSelected={selectedCampId === camp._id} />
//                     <PartnerDisplay partners={camp.partners} isSelected={selectedCampId === camp._id} />
//                   </div>

//                   <div className={`mt-5 pt-4 border-t flex items-center justify-between ${selectedCampId === camp._id ? "border-white/20" : "border-gray-50"}`}>
//                     <div className={`flex items-center gap-2 text-xs font-bold ${selectedCampId === camp._id ? "text-indigo-200" : "text-gray-400"}`}>
//                       <Users size={14} />
//                       <span>{patients.filter((p) => String(p.campId?._id || p.campId) === String(camp._id)).length} Patients</span>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setViewCamp(camp);
//                         }}
//                         className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all
//                             ${selectedCampId === camp._id
//                             ? "bg-white/20 text-white hover:bg-white/30"
//                             : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
//                       >
//                         <Eye size={12} className="inline mr-1" /> View
//                       </button>
//                       <div className={`${selectedCampId === camp._id ? "text-white" : "text-indigo-600"} opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
//                         <ChevronRight size={18} />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ================= PATIENTS ================= */}
//       {loading ? (
//         <p className="text-center text-gray-500">Loading...</p>
//       ) : (
//         <div ref={patientsSectionRef} className="admin-dash__card">
//           <div className="admin-dash__card-header">
//             <h3 className="admin-dash__card-title">Patients</h3>
//             <div className="relative w-full sm:w-72">
//               <Search
//                 size={18}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               />
//               <input
//                 type="text"
//                 placeholder="Search patients by name..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
//               />
//             </div>
//           </div>

//           <div className="admin-dash__card-body p-0">

//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="border-b border-gray-100 bg-gray-50/50">
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {filteredPatients.length > 0 ? (
//                     filteredPatients.map((patient) => (
//                       <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
//                               {patient.name?.charAt(0)?.toUpperCase()}
//                             </div>
//                             <div>
//                               <p className="font-semibold text-gray-900">{patient.name}</p>
//                               <p className="text-xs text-gray-500">{patient.age || 'N/A'} Y • {patient.gender || 'N/A'}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <span className="text-sm font-medium text-gray-700">{patient.contact || "N/A"}</span>
//                         </td>
//                         <td className="p-4">
//                           <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
//                             {patient.campId?.name || "N/A"}
//                           </span>
//                         </td>
//                         <td className="p-4">
//                           <div className="flex items-center gap-2">
//                             <Link
//                               to={`/patient/${patient._id}`}
//                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
//                             >
//                               <Eye size={14} /> View
//                             </Link>

//                             <button
//                               onClick={() => deletePatient(patient._id)}
//                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
//                             >
//                               <Trash2 size={14} /> Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={4} className="p-12 text-center text-gray-400">
//                         <div className="flex flex-col items-center justify-center gap-3">
//                           <Users size={48} className="opacity-20" />
//                           <p className="text-lg font-medium">No patients found</p>
//                           <p className="text-sm">Try adjusting your search or filters.</p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= VIEW CAMP MODAL ================= */}
//       {viewCamp && createPortal(
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
//             {/* Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
//               <div>
//                 <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
//                 <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
//                   <div className="flex items-center gap-1.5">
//                     <MapPin size={14} className="text-indigo-500" />
//                     <span>{viewCamp.location}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <Calendar size={14} className="text-indigo-500" />
//                     <span>{viewCamp.date}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <Clock size={14} className="text-indigo-500" />
//                     <span>{viewCamp.time}</span>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setViewCamp(null)}
//                 className="flex items-center justify-center w-8 h-8 text-gray-400 transition bg-white border border-gray-200 rounded-full shadow-sm hover:text-gray-600 hover:bg-gray-100"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             {/* Toolbar */}
//             <div className="flex items-center justify-between gap-4 p-4 bg-white border-b border-gray-100">
//               <div className="flex items-center gap-2">
//                 <span className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-full">
//                   {viewCampPatients.length} Participants
//                 </span>
//                 <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
//               </div>

//               <button
//                 onClick={handleDownloadCampCSV}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition shadow-lg bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-emerald-100 active:scale-95"
//               >
//                 <FileSpreadsheet size={16} />
//                 Download Report
//               </button>
//             </div>

//             {/* Table */}
//             <div className="flex-1 p-0 overflow-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead className="sticky top-0 z-10 bg-gray-50">
//                   <tr>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">Patient Name</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">Contact</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">Age / Gender</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">Health Check</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-right text-gray-400 uppercase border-b border-gray-100">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50">
//                   {viewCampPatients.length > 0 ? (
//                     viewCampPatients.map(patient => (
//                       <tr key={patient._id} className="transition-colors hover:bg-gray-50/80">
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-indigo-600 border border-indigo-100 rounded-full bg-indigo-50">
//                               {patient.name.charAt(0).toUpperCase()}
//                             </div>
//                             <span className="font-semibold text-gray-900">{patient.name}</span>
//                           </div>
//                         </td>
//                         <td className="p-4 font-mono text-sm font-medium text-gray-600">{patient.contact}</td>
//                         <td className="p-4 text-sm text-gray-500">
//                           {patient.age} Y <span className="mx-1">•</span> {patient.gender}
//                         </td>
//                         <td className="p-4">
//                           {patient.tests && patient.tests.length > 0 ? (
//                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
//                               <CheckCircle size={12} /> Screened
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-400 text-xs font-bold border border-gray-200">
//                               Pending
//                             </span>
//                           )}
//                         </td>
//                         <td className="p-4 text-right">
//                           <Link
//                             to={`/patient/${patient._id}`}
//                             className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
//                           >
//                             View Details <ChevronRight size={12} />
//                           </Link>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={5} className="flex flex-col items-center gap-3 p-12 text-center text-gray-400">
//                         <Users size={32} className="opacity-20" />
//                         <span className="text-sm font-medium">No patients found in this camp yet.</span>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Footer */}
//             <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50">
//               <button
//                 onClick={() => setViewCamp(null)}
//                 className="px-6 py-2 text-sm font-bold text-gray-600 transition bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-100 hover:text-gray-800"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>,
//         document.body
//       )}

//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import axios from "axios";
import {
    FiActivity,
    FiCalendar,
    FiMapPin,
    FiUsers,
    FiClock,
    FiSearch,
    FiChevronRight,
    FiX,
    FiFileText,
    FiCheckCircle,
    FiEdit,
    FiEye,
    FiUser,
    FiFilter,
    FiBarChart,
    FiTrendingUp,
    FiMessageCircle,
    FiCopy,
    FiDownload,
    FiTrash2,
    FiAlertTriangle
} from "react-icons/fi";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import config from "../config";
import { CampStatusBadge, getCampStatus } from "../utils/campStatus";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
import {
    CampPieChart,
    CampParticipationChart,
    CampBMIChart,
    HealthMetricChart
} from "../components/DashboardCharts";
import VolunteerDisplay from "../components/VolunteerDisplay";
import PartnerDisplay from "../components/PartnerDisplay";
import "./Dashboard.css";

const API_BASE = config.API_BASE_URL;

// 🔥 Helper functions
const calculateBMI = (weight, heightCm) => {
    if (!weight || !heightCm) return null;
    const h = heightCm / 100;
    return +(weight / (h * h)).toFixed(1);
};

const getBMICategory = (bmi) => {
    if (!bmi) return "-";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Healthy";
    if (bmi < 30) return "Overweight";
    return "Obese";
};

const extractLatestVitals = (tests = []) => {
    const r = {};
    if (!tests || tests.length === 0) return r;

    tests.forEach(t => {
        r.date = t.date;
        if (t.type === "weight") r.weight = t.value;
        if (t.type === "height") r.height = t.value;
        if (t.type === "sugar") {
            r.sugar = t.value;
            r.sugarType = t.sugarType || t.type || "Random";
        }
        if (t.type === "bp") {
            r.systolic = t.value;
            r.diastolic = t.value2;
        }
    });
    return r;
};

const VolunteerDashboard = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [camps, setCamps] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedCampId, setSelectedCampId] = useState("all");
    const [healthMetric, setHealthMetric] = useState("bp");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // 🔥 Stats Modal State
    const [statsModal, setStatsModal] = useState({
        show: false,
        title: "",
        data: [],
        type: ""
    });

    const [viewCamp, setViewCamp] = useState(null);
    const [partners, setPartners] = useState([]);
    const [partnerMap, setPartnerMap] = useState({});
    const [volunteerMap, setVolunteerMap] = useState({});

    // 🔥 Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [downloadLink, setDownloadLink] = useState("");
    const [copied, setCopied] = useState(false);

    // 🔥 Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Refs for scrolling
    const campsSectionRef = useRef(null);
    const patientsSectionRef = useRef(null);

    // Get volunteer info from localStorage
    const volunteerName = localStorage.getItem("employeeName") || localStorage.getItem("name") || "Volunteer";
    const volunteerId = localStorage.getItem("userId") || null;

    const scrollToSection = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // 🔥 Stats Modal Handlers
    const openStatsModal = (type, title, data) => {
        setStatsModal({
            show: true,
            title: title,
            data: data || [],
            type: type
        });
    };

    const closeStatsModal = () => {
        setStatsModal({
            show: false,
            title: "",
            data: [],
            type: ""
        });
    };

    // Helper function to get partner name
    const getPartnerName = (id) => {
        if (!id) return 'Unknown';
        if (typeof id === 'object') {
            if (id.name) return id.name;
            if (id.clinicName) return id.clinicName;
            return id.name || 'Unknown';
        }
        const idStr = String(id);
        return partnerMap[idStr] || idStr;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch employees for volunteer map
            const employeesRes = await axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
            const empData = employeesRes.data || [];
            const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
            
            // Fetch volunteers
            const volRes = await axios.get(`${API_BASE}/volunteers/all-volunteers`).catch(() => ({ data: [] }));
            const volData = volRes.data?.volunteers || volRes.data || [];
            
            const volMap = {};
            allEmployees.forEach(emp => { volMap[emp._id] = emp.name; });
            volData.forEach(vol => { volMap[vol._id] = vol.name; });
            setVolunteerMap(volMap);

            // Fetch all camps
            const campsRes = await axios.get(`${API_BASE}/camps/allcamps`);
            let allCamps = campsRes.data || [];
            if (!Array.isArray(allCamps)) {
                allCamps = allCamps.data || allCamps.camps || [];
                if (!Array.isArray(allCamps)) allCamps = [];
            }

            // Filter camps where volunteer is assigned
            const volunteerCamps = allCamps.filter(camp => {
                if (!camp.volunteers || camp.volunteers.length === 0) return false;
                return camp.volunteers.some(v => {
                    if (!v) return false;
                    if (typeof v === 'object') {
                        if (v.$oid) {
                            return String(v.$oid).toLowerCase().trim() === String(volunteerId).toLowerCase().trim();
                        }
                        const idStr = String(v._id || v.id || '').toLowerCase().trim();
                        if (volunteerId && idStr && idStr === String(volunteerId).toLowerCase().trim()) return true;
                        const nameStr = String(v.name || '').toLowerCase().trim();
                        if (volunteerName && nameStr && nameStr === String(volunteerName).toLowerCase().trim()) return true;
                        const emailStr = String(v.email || '').toLowerCase().trim();
                        const volunteerEmail = localStorage.getItem("employeeEmail") || localStorage.getItem("email") || "";
                        if (volunteerEmail && emailStr && emailStr === String(volunteerEmail).toLowerCase().trim()) return true;
                        return false;
                    }
                    const valStr = String(v).toLowerCase().trim();
                    if (volunteerId && valStr === String(volunteerId).toLowerCase().trim()) return true;
                    if (volunteerName && valStr === String(volunteerName).toLowerCase().trim()) return true;
                    return false;
                });
            });
            setCamps(volunteerCamps);

            // Fetch partners for display
            const partnersRes = await axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }));
            let partnerData = partnersRes.data || [];
            if (!Array.isArray(partnerData)) {
                partnerData = partnerData.data || partnerData.partners || [];
                if (!Array.isArray(partnerData)) partnerData = [];
            }
            setPartners(partnerData);
            const pMap = {};
            partnerData.forEach(p => { pMap[p._id] = p.name; });
            setPartnerMap(pMap);

            // Fetch patients
            const patientsRes = await axios.get(`${API_BASE}/patients`);
            let patientData = [];
            if (patientsRes.data) {
                if (Array.isArray(patientsRes.data)) patientData = patientsRes.data;
                else if (patientsRes.data.data && Array.isArray(patientsRes.data.data)) patientData = patientsRes.data.data;
                else if (patientsRes.data.patients && Array.isArray(patientsRes.data.patients)) patientData = patientsRes.data.patients;
            }

            // Filter patients to only those from volunteer's camps
            const campIds = volunteerCamps.map(c => String(c._id));
            const filteredPatients = patientData.filter(p =>
                p.campId && campIds.includes(String(p.campId?._id || p.campId))
            );
            setPatients(filteredPatients);

        } catch (err) {
            console.error("Error fetching data:", err);
            setCamps([]);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Delete Patient Handler
    const handleDeletePatient = async () => {
        if (!patientToDelete) return;
        
        try {
            setDeleting(true);
            await axios.delete(`${API_BASE}/patients/${patientToDelete._id}`);
            
            // Remove from local state
            setPatients(prev => prev.filter(p => p._id !== patientToDelete._id));
            
            // Close modal
            setShowDeleteModal(false);
            setPatientToDelete(null);
            
            // Show success message
            alert(`Patient ${patientToDelete.name} deleted successfully.`);
            
            // Refresh data
            await fetchData();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete patient. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    // 🔥 Prepare report data for view/download
    const prepareReportData = async (patientId) => {
        try {
            const res = await axios.get(`${API_BASE}/patients/${patientId}`);
            const fullPatient = res.data;

            if (!fullPatient?.tests?.length) {
                alert("No test data available for this patient.");
                return null;
            }

            const test = extractLatestVitals(fullPatient.tests);
            const bmiValue = calculateBMI(test.weight, test.height);

            const patientData = {
                name: fullPatient.name,
                age: fullPatient.age,
                gender: fullPatient.gender,
                id: fullPatient._id.slice(-6).toUpperCase(),
                date: new Date(test.date || Date.now()).toLocaleDateString(),
                phone: fullPatient.contact,
                address: fullPatient.address,
            };

            const testsData = {
                weight: test.weight || "-",
                height: test.height || "-",
                sugar: test.sugar || "-",
                sugarType: test.sugarType || "Random",
                systolic: test.systolic || "-",
                diastolic: test.diastolic || "-",
                heartRate: "-",
            };

            const bmiData = {
                bmi: bmiValue || "-",
                category: bmiValue ? getBMICategory(bmiValue) : "-",
            };

            return { patientData, testsData, bmiData };
        } catch (err) {
            console.error(err);
            alert("Failed to fetch report data.");
            return null;
        }
    };

    const uploadPdfToServer = async (patientData, testsData, bmiData) => {
        const rawPdf = await generateMedicalReportFile(patientData, testsData, bmiData);
        const pdfBlob = new Blob([rawPdf], { type: "application/pdf" });
        const formData = new FormData();
        formData.append("file", pdfBlob, "health-report.pdf");
        const res = await axios.post(`${API_BASE}/reports/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        return res.data.downloadLink;
    };

    const viewReport = async (patient) => {
        const data = await prepareReportData(patient._id);
        if (!data) return;
        navigate('/health-report', { state: { patient: data.patientData, tests: data.testsData } });
    };

    const downloadPDF = async (patient) => {
        const data = await prepareReportData(patient._id);
        if (!data) return;
        generateMedicalReport(data.patientData, data.testsData, data.bmiData);
    };

    const shareReport = async (patient) => {
        try {
            setCurrentPatient(patient);
            const data = await prepareReportData(patient._id);
            if (!data) return;
            const publicLink = await uploadPdfToServer(data.patientData, data.testsData, data.bmiData);
            const message = `*Health Checkup Report* 🩺\n\nHello ${patient.name},\nYour medical health report is ready.\n\n📄 Download Report:\n${publicLink}\n\n(Generated by BIM Medical)`;
            setDownloadLink(message);
            setShowShareModal(true);
        } catch (err) {
            console.error("UPLOAD ERROR", err);
            alert("Failed to generate sharing link");
        }
    };

    const handleWhatsAppShare = () => {
        if (!currentPatient || !downloadLink) return;
        const phone = currentPatient.contact ? currentPatient.contact.replace(/\D/g, '') : '';
        if (!phone) { alert("Phone number required"); return; }
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(downloadLink)}`, "_blank");
        setShowShareModal(false);
    };

    const handleCopyMessage = () => {
        navigator.clipboard.writeText(downloadLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter camps by date range for charts
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

    const chartFilteredPatients = useMemo(() => {
        const filteredCampIds = filteredCamps.map(c => String(c._id));
        return patients.filter(p => {
            const campId = String(p.campId?._id || p.campId);
            return filteredCampIds.includes(campId);
        });
    }, [patients, filteredCamps]);

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
    const totalCamps = filteredCamps.length;

    const filteredPatients = useMemo(() => {
        return patients.filter(p => {
            if (selectedCampId !== "all" && String(p.campId?._id) !== String(selectedCampId)) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesName = p.name?.toLowerCase().includes(q);
                const matchesPhone = p.contact?.includes(q);
                if (!matchesName && !matchesPhone) return false;
            }
            return true;
        });
    }, [patients, selectedCampId, searchQuery]);

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
                p.name, p.age, p.gender, p.contact,
                viewCamp.name, viewCamp.date, viewCamp.location,
                bmi, bp, sugar
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

    // Calculate stats
    const totalPatients = patients.length;
    const esignCount = patients.filter(p => p.tests && p.tests.length > 0).length;

    // 🔥 Stats Modal Component
    const StatsModal = () => {
        if (!statsModal.show) return null;

        return (
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        closeStatsModal();
                    }
                }}
            >
                <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
                        <div>
                            <h3 className="text-xl font-bold text-white">{statsModal.title}</h3>
                            <p className="text-sm text-indigo-100">
                                Total: {statsModal.data.length} items
                            </p>
                        </div>
                        <button
                            onClick={closeStatsModal}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-auto flex-1 p-0">
                        {statsModal.data.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 font-medium">No data found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">#</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Name</th>
                                        {statsModal.type === "patients" && (
                                            <>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Contact</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Age</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Gender</th>
                                            </>
                                        )}
                                        {(statsModal.type === "camps" || statsModal.type === "active" || statsModal.type === "upcoming") && (
                                            <>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Location</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Date</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Created</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Status</th>
                                            </>
                                        )}
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {statsModal.data.map((item, index) => (
                                        <tr key={item._id || index} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                                                        {(item.name || item.patientName || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{item.name || item.patientName || 'N/A'}</span>
                                                </div>
                                            </td>
                                            {statsModal.type === "patients" && (
                                                <>
                                                    <td className="p-4 text-sm text-gray-600">{item.contact || 'N/A'}</td>
                                                    <td className="p-4 text-sm text-gray-600">{item.age || 'N/A'}</td>
                                                    <td className="p-4 text-sm text-gray-600">{item.gender || 'N/A'}</td>
                                                </>
                                            )}
                                            {(statsModal.type === "camps" || statsModal.type === "active" || statsModal.type === "upcoming") && (
                                                <>
                                                    <td className="p-4 text-sm text-gray-600">{item.location || 'N/A'}</td>
                                                    <td className="p-4 text-sm text-gray-600">{item.date || 'N/A'}</td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-gray-600">
                                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                        {item.createdAt && (
                                                            <span className="block text-xs text-gray-400">
                                                                {Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24))} days old
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            statsModal.type === "active" 
                                                                ? "bg-green-100 text-green-700"
                                                                : statsModal.type === "upcoming"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                            {statsModal.type === "active" ? "Active" :
                                                             statsModal.type === "upcoming" ? "Upcoming" : "Active"}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            <td className="p-4">
                                                <button
                                                    onClick={() => {
                                                        closeStatsModal();
                                                        if (item._id) {
                                                            setViewCamp(item);
                                                        }
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                >
                                                    <FiEye size={14} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
                        <button
                            onClick={closeStatsModal}
                            className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="admin-dash">
            <div className="admin-dash__wrapper">
                <div className="admin-dash__header">
                    <div>
                        <h1 className="admin-dash__greeting">
                            Volunteer <span>Dashboard</span>
                        </h1>
                        <p className="admin-dash__subtitle">
                            Welcome, {volunteerName}! Manage your assigned camps and patients.
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

                <div className="space-y-6">
                    {/* Stats - Clickable */}
                    <div className="admin-dash__stats">
                        <div 
                            className="admin-dash__stat cursor-pointer" 
                            onClick={() => openStatsModal("camps", "Total Camps", camps)}
                        >
                            <div className="admin-dash__stat-top">
                                <span className="admin-dash__stat-label">Total Camps</span>
                                <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                                    <FiMapPin />
                                </div>
                            </div>
                            <div className="admin-dash__stat-value">{camps.length}</div>
                            <div className="admin-dash__stat-meta">assigned camps</div>
                        </div>
                        <div 
                            className="admin-dash__stat cursor-pointer" 
                            onClick={() => openStatsModal("active", "Active Camps", camps.filter(c => {
                                const { status } = getCampStatus(c.date, c.time);
                                return status === 'live' || status === 'today';
                            }))}
                        >
                            <div className="admin-dash__stat-top">
                                <span className="admin-dash__stat-label">Active Camps</span>
                                <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                                    <FiActivity />
                                </div>
                            </div>
                            <div className="admin-dash__stat-value">
                                {camps.filter(c => {
                                    const { status } = getCampStatus(c.date, c.time);
                                    return status === 'live' || status === 'today';
                                }).length}
                            </div>
                            <div className="admin-dash__stat-meta">currently running</div>
                        </div>
                        <div 
                            className="admin-dash__stat cursor-pointer" 
                            onClick={() => openStatsModal("patients", "All Patients", patients)}
                        >
                            <div className="admin-dash__stat-top">
                                <span className="admin-dash__stat-label">Patients</span>
                                <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                                    <FiUsers />
                                </div>
                            </div>
                            <div className="admin-dash__stat-value">{totalPatients}</div>
                            <div className="admin-dash__stat-meta">total patients</div>
                        </div>
                        <div 
                            className="admin-dash__stat cursor-pointer" 
                            onClick={() => openStatsModal("upcoming", "Upcoming Camps", camps.filter(c => {
                                const { status } = getCampStatus(c.date, c.time);
                                return status === 'upcoming';
                            }))}
                        >
                            <div className="admin-dash__stat-top">
                                <span className="admin-dash__stat-label">Upcoming</span>
                                <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                                    <FiCalendar />
                                </div>
                            </div>
                            <div className="admin-dash__stat-value">
                                {camps.filter(c => {
                                    const { status } = getCampStatus(c.date, c.time);
                                    return status === 'upcoming';
                                }).length}
                            </div>
                            <div className="admin-dash__stat-meta">scheduled camps</div>
                        </div>
                        <div 
                            className="admin-dash__stat cursor-pointer" 
                            onClick={() => openStatsModal("patients", "Screened Patients", patients.filter(p => p.tests && p.tests.length > 0))}
                        >
                            <div className="admin-dash__stat-top">
                                <span className="admin-dash__stat-label">Screened</span>
                                <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                                    <FiCheckCircle />
                                </div>
                            </div>
                            <div className="admin-dash__stat-value">{esignCount}</div>
                            <div className="admin-dash__stat-meta">screened patients</div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    {camps.length > 0 && (
                        <div className="admin-dash__card">
                            <div className="admin-dash__card-body py-3">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                            <FiCalendar size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-800">Filter Analytics</h4>
                                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Select Date Range</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border flex-1 md:flex-none">
                                            <span className="text-[8px] font-black text-gray-400 uppercase">From</span>
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="bg-transparent text-xs font-bold outline-none text-gray-700"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border flex-1 md:flex-none">
                                            <span className="text-[8px] font-black text-gray-400 uppercase">To</span>
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="bg-transparent text-xs font-bold outline-none text-gray-700"
                                            />
                                        </div>
                                        <button
                                            onClick={() => { setDateFrom(""); setDateTo(""); }}
                                            className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Charts Section */}
                    {camps.length > 0 && (
                        <>
                            <div className="admin-dash__charts-grid">
                                <div className="admin-dash__card admin-dash__chart-wrap">
                                    <div className="admin-dash__card-header py-3 px-4">
                                        <h3 className="admin-dash__card-title text-sm">Camp Status Overview</h3>
                                    </div>
                                    <div className="admin-dash__card-body flex-1 p-3">
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
                                    <div className="admin-dash__card-header py-3 px-4">
                                        <h3 className="admin-dash__card-title text-sm">Camp Participation</h3>
                                    </div>
                                    <div className="admin-dash__card-body flex-1 p-3">
                                        <CampParticipationChart camps={filteredCamps} patients={chartFilteredPatients} />
                                    </div>
                                </div>
                            </div>

                            <div className="admin-dash__charts-grid">
                                <div className="admin-dash__card admin-dash__chart-wrap">
                                    <div className="admin-dash__card-header py-3 px-4">
                                        <h3 className="admin-dash__card-title text-sm">BMI Distribution</h3>
                                    </div>
                                    <div className="admin-dash__card-body flex-1 p-3">
                                        <CampBMIChart camps={filteredCamps} patients={chartFilteredPatients} />
                                    </div>
                                </div>
                                <div className="admin-dash__card admin-dash__chart-wrap">
                                    <div className="admin-dash__card-header py-3 px-4">
                                        <h3 className="admin-dash__card-title text-sm">Health Metrics</h3>
                                    </div>
                                    <div className="admin-dash__card-body flex-1 p-3">
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
                        </>
                    )}

                    {/* My Assigned Camps Section */}
                    <div ref={campsSectionRef} className="admin-dash__card">
                        <div className="admin-dash__card-header py-3 px-4">
                            <h3 className="admin-dash__card-title text-sm">My Assigned Camps</h3>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                                    {activeCampsCount} Active
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-gray-100 rounded-full">
                                    {camps.length} Total
                                </span>
                            </div>
                        </div>
                        <div className="admin-dash__card-body p-3">
                            {camps.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <FiMapPin size={36} className="mx-auto text-gray-200 mb-3" />
                                    <p className="font-medium text-sm">No camps assigned to you yet.</p>
                                    <p className="text-xs text-gray-400 mt-1">Contact your admin for camp assignments.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {camps.map(camp => {
                                        const isSelected = selectedCampId === camp._id;
                                        return (
                                            <div
                                                key={camp._id}
                                                onClick={() => setSelectedCampId(camp._id)}
                                                className={`cursor-pointer p-3 rounded-xl border transition-all relative
                                                    ${isSelected
                                                        ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                                                        : "bg-white hover:border-indigo-300 hover:shadow-md text-gray-700"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className={`font-bold text-sm truncate ${isSelected ? "text-white" : "text-gray-900"}`}>{camp.name}</h4>
                                                    <CampStatusBadge date={camp.date} time={camp.time} />
                                                </div>
                                                <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                                    <FiMapPin size={12} />
                                                    <span className="truncate">{camp.location}</span>
                                                </div>
                                                <div className={`mt-0.5 flex items-center gap-1.5 text-xs ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                                    <FiCalendar size={12} />
                                                    <span>{camp.date || "No date"}</span>
                                                </div>
                                                <div className={`mt-0.5 flex items-center gap-1.5 text-xs ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                                    <FiClock size={12} />
                                                    <span>{camp.time || "No time"}</span>
                                                </div>

                                                {/* Creator Info */}
                                                <div className={`text-[8px] font-semibold mt-1.5 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                                    <span className="opacity-75">Created by: </span>
                                                    <span className="font-bold">
                                                        {camp.creatorRole === "admin"
                                                            ? (typeof camp.createdBy === 'object' && camp.createdBy ? (camp.createdBy.name || camp.createdBy.email) : (getPartnerName(camp.createdBy) !== camp.createdBy ? getPartnerName(camp.createdBy) : "Admin"))
                                                            : (typeof camp.createdBy === 'object' && camp.createdBy ? (camp.createdBy.name || camp.createdBy.clinicName) : (getPartnerName(camp.createdBy) || "Partner"))
                                                        }
                                                    </span>
                                                </div>

                                                {/* Assigned Partner Info */}
                                                {camp.assignedPartner && (
                                                    <div className={`text-[8px] font-semibold mt-0.5 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                                        <span className="opacity-75">Assigned Partner: </span>
                                                        <span className="font-bold">
                                                            {typeof camp.assignedPartner === 'object' && camp.assignedPartner
                                                                ? (camp.assignedPartner.name || camp.assignedPartner.clinicName)
                                                                : (getPartnerName(camp.assignedPartner) || "Partner")
                                                            }
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Using PartnerDisplay component */}
                                                {camp.partners && camp.partners.length > 0 && (
                                                    <div className="mt-1">
                                                        <PartnerDisplay 
                                                            partners={camp.partners} 
                                                            isSelected={isSelected} 
                                                            partnersList={partners}
                                                        />
                                                    </div>
                                                )}

                                                {/* Using VolunteerDisplay component */}
                                                {camp.volunteers && camp.volunteers.length > 0 && (
                                                    <div className="mt-1">
                                                        <VolunteerDisplay 
                                                            volunteers={camp.volunteers} 
                                                            isSelected={isSelected} 
                                                            employeeMap={volunteerMap}
                                                        />
                                                    </div>
                                                )}

                                                <div className={`mt-2 pt-2 border-t flex items-center justify-between ${isSelected ? "border-white/20" : "border-gray-50"}`}>
                                                    <span className={`text-[10px] font-bold ${isSelected ? "text-indigo-200" : "text-gray-500"}`}>
                                                        <FiUsers size={10} className="inline mr-0.5" />
                                                        {patients.filter(p => String(p.campId?._id || p.campId) === String(camp._id)).length} Patients
                                                    </span>
                                                    <div className="flex items-center gap-0.5">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setViewCamp(camp);
                                                            }}
                                                            className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase transition-all
                                                                ${isSelected
                                                                    ? "bg-white/20 text-white hover:bg-white/30"
                                                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                                                }`}
                                                        >
                                                            <FiEye size={10} className="inline mr-0.5" /> View
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Patients Section */}
                    <div ref={patientsSectionRef} className="admin-dash__card">
                        <div className="admin-dash__card-header py-3 px-4">
                            <h3 className="admin-dash__card-title text-sm">Patients</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={selectedCampId}
                                    onChange={(e) => setSelectedCampId(e.target.value)}
                                    className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-700 shadow-sm"
                                >
                                    <option value="all">All Camps</option>
                                    {camps.map(camp => (
                                        <option key={camp._id} value={camp._id}>{camp.name}</option>
                                    ))}
                                </select>
                                <div className="relative w-full sm:w-56">
                                    <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search patients..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="admin-dash__card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="p-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase">Name</th>
                                            <th className="p-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase">Phone</th>
                                            <th className="p-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase">Camp</th>
                                            <th className="p-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase">Health Status</th>
                                            <th className="p-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map((patient) => (
                                                <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                                                                {patient.name?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm text-gray-900">{patient.name}</p>
                                                                <p className="text-[10px] text-gray-500">{patient.age || 'N/A'} Y • {patient.gender || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="text-xs font-medium text-gray-700">{patient.contact || "N/A"}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 text-xs text-green-700 bg-green-100 rounded-full">
                                                            {patient.campId?.name || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        {patient.tests && patient.tests.length > 0 ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                                                                <FiCheckCircle size={10} /> Screened
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 text-gray-400 text-[10px] font-bold border border-gray-200">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {/* View Report button */}
                                                            <button
                                                                onClick={() => viewReport(patient)}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                            >
                                                                <FiEye size={12} /> View
                                                            </button>
                                                            {/* Edit button */}
                                                            <Link
                                                                to={`/patient/${patient._id}`}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                            >
                                                                <FiEdit size={12} /> Edit
                                                            </Link>
                                                            {/* Download button */}
                                                            <button
                                                                onClick={() => downloadPDF(patient)}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                            >
                                                                <FiDownload size={12} /> Download
                                                            </button>
                                                            {/* WhatsApp button */}
                                                            <button
                                                                onClick={() => shareReport(patient)}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                                            >
                                                                <FiMessageCircle size={12} /> WhatsApp
                                                            </button>
                                                            {/* Delete button */}
                                                            <button
                                                                onClick={() => {
                                                                    setPatientToDelete(patient);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            >
                                                                <FiTrash2 size={12} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <FiUsers size={36} className="opacity-20" />
                                                        <p className="text-sm font-medium">No patients found</p>
                                                        <p className="text-xs">Try adjusting your search or filters.</p>
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

                {/* View Camp Modal - FIXED WITH PROPER BUTTON POSITIONING */}
                {viewCamp && createPortal(
                    <div 
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setViewCamp(null);
                            }
                        }}
                    >
                        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                            {/* Header - Camp Info */}
                            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white flex-shrink-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
                                            <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <FiMapPin size={15} className="text-indigo-500" />
                                                <span className="font-medium">{viewCamp.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <FiCalendar size={15} className="text-indigo-500" />
                                                <span className="font-medium">{viewCamp.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <FiClock size={15} className="text-indigo-500" />
                                                <span className="font-medium">{viewCamp.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <FiUsers size={15} className="text-indigo-500" />
                                                <span className="font-medium">{viewCampPatients.length} Participants</span>
                                            </div>
                                        </div>

                                        {/* Creator & Assigned Partner Info */}
                                        <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                                            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                                <span className="font-medium">Created by:</span>
                                                <span className="font-bold text-gray-800">
                                                    {viewCamp.creatorRole === "admin"
                                                        ? (typeof viewCamp.createdBy === 'object' && viewCamp.createdBy ? (viewCamp.createdBy.name || viewCamp.createdBy.email) : (getPartnerName(viewCamp.createdBy) !== viewCamp.createdBy ? getPartnerName(viewCamp.createdBy) : "Admin"))
                                                        : (typeof viewCamp.createdBy === 'object' && viewCamp.createdBy ? (viewCamp.createdBy.name || viewCamp.createdBy.clinicName) : (getPartnerName(viewCamp.createdBy) || "Partner"))
                                                    }
                                                </span>
                                            </div>
                                            {viewCamp.assignedPartner && (
                                                <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                                    <span className="font-medium">Assigned Partner:</span>
                                                    <span className="font-bold">
                                                        {typeof viewCamp.assignedPartner === 'object' && viewCamp.assignedPartner
                                                            ? (viewCamp.assignedPartner.name || viewCamp.assignedPartner.clinicName)
                                                            : (getPartnerName(viewCamp.assignedPartner) || "Partner")
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <PartnerDisplay partners={viewCamp.partners} isSelected={false} partnersList={partners} />
                                        <VolunteerDisplay volunteers={viewCamp.volunteers} isSelected={false} employeeMap={volunteerMap} />
                                    </div>
                                    <button 
                                        onClick={() => setViewCamp(null)} 
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm flex-shrink-0"
                                    >
                                        <FiX size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Table Area - Scrollable */}
                            <div className="flex-1 overflow-auto p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Patient Name</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Contact</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Age / Gender</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Health Check</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {viewCampPatients.length > 0 ? (
                                            viewCampPatients.map(patient => (
                                                <tr key={patient._id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 flex-shrink-0">
                                                                {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                                                            </div>
                                                            <span className="font-semibold text-sm text-gray-900">{patient.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-medium font-mono">{patient.contact}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {patient.age || 'N/A'} Y <span className="mx-1">•</span> {patient.gender || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {patient.tests && patient.tests.length > 0 ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                                                                <FiCheckCircle size={12} /> Screened
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 text-xs font-semibold border border-gray-200">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button 
                                                            onClick={() => viewReport(patient)} 
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            View Report <FiChevronRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FiUsers size={40} className="opacity-20" />
                                                        <span className="text-sm font-medium">No patients found in this camp yet.</span>
                                                        <span className="text-xs text-gray-400">Patients will appear here once they are added to the camp.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer - Action Buttons (Fixed at Bottom) */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">
                                        <span className="font-bold text-gray-700">{viewCampPatients.length}</span> participants found
                                    </span>
                                    {viewCampPatients.length > 0 && (
                                        <span className="text-xs text-emerald-600 font-medium">
                                            {viewCampPatients.filter(p => p.tests && p.tests.length > 0).length} screened
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {viewCampPatients.length > 0 && (
                                        <button 
                                            onClick={handleDownloadCampCSV} 
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
                                        >
                                            <FiFileText size={16} />
                                            Download Report
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setViewCamp(null)} 
                                        className="flex-1 sm:flex-none px-6 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition shadow-sm active:scale-95"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && patientToDelete && createPortal(
                    <div 
                        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowDeleteModal(false);
                                setPatientToDelete(null);
                            }
                        }}
                    >
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <FiAlertTriangle size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Patient</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Are you sure you want to delete <span className="font-bold text-gray-700">{patientToDelete.name}</span>? 
                                        This action cannot be undone and will remove all associated test data.
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg mx-6 mb-4 border border-gray-200">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Contact:</span>
                                        <span className="font-medium text-gray-700">{patientToDelete.contact || 'N/A'}</span>
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Camp:</span>
                                        <span className="font-medium text-gray-700">{patientToDelete.campId?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {patientToDelete.tests?.length || 0} test records will be deleted
                                </div>
                            </div>
                            <div className="p-6 flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setPatientToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition shadow-sm"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeletePatient}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-100 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <FiTrash2 size={16} />
                                            Delete Patient
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Share Modal - FIXED POSITION */}
                {showShareModal && currentPatient && createPortal(
                    <div 
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowShareModal(false);
                            }
                        }}
                    >
                        <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white text-center">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FiMessageCircle size={28} />
                                </div>
                                <h3 className="text-lg font-bold">Share Report Link</h3>
                                <p className="text-xs text-green-100 mt-0.5">WhatsApp message generated successfully!</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-base">
                                        {currentPatient?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{currentPatient?.name}</p>
                                        <p className="text-[10px] text-gray-500">{currentPatient?.contact || "No Number"}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-50/50 border-2 border-green-200 border-dashed rounded-xl">
                                    <p className="text-[8px] font-bold text-green-800 uppercase tracking-widest mb-1.5">Message Preview</p>
                                    <div className="bg-white p-2.5 rounded-lg border border-green-100 max-h-28 overflow-y-auto text-[10px] text-gray-600 break-words">
                                        {downloadLink}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <button 
                                        onClick={handleWhatsAppShare} 
                                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                                    >
                                        <FiMessageCircle size={16} /> Open WhatsApp
                                    </button>
                                    <button 
                                        onClick={handleCopyMessage} 
                                        className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 flex items-center justify-center gap-2 transition-all"
                                    >
                                        {copied ? <FiCheckCircle size={16} /> : <FiCopy size={16} />}
                                        {copied ? "Copied!" : "Copy Link"}
                                    </button>
                                    <button 
                                        onClick={() => setShowShareModal(false)} 
                                        className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Stats Modal */}
                <StatsModal />
            </div>
        </div>
    );
};

export default VolunteerDashboard;