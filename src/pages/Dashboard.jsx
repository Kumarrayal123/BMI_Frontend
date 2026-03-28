


// import axios from "axios";
// import {
//   Activity,
//   MapPin,
//   Phone,
//   Search,
//   Trash2,

//   Users,
//   Calendar,
//   Clock,
//   Eye,
//   X,
//   FileSpreadsheet,
//   CheckCircle,
//   ChevronRight
// } from "lucide-react";
// import { createPortal } from "react-dom";
// import JSZip from "jszip";
// import { useEffect, useRef, useState, useMemo } from "react";
// import config from "../config";
// import { Link } from "react-router-dom";
// import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";
// import VolunteerDisplay from "../components/VolunteerDisplay";
// import PartnerDisplay from "../components/PartnerDisplay";






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
//     <div className="space-y-10">

//       {/* ================= HEADER ================= */}
//       {/* <div className="flex flex-col justify-between gap-4 p-4 bg-white border shadow-sm sm:flex-row rounded-xl">
//         <h2 className="text-xl font-semibold">Dashboard</h2>

//         <div className="flex w-full gap-3 sm:w-auto">
//           <div className="relative w-full sm:w-72">
//             <Search
//               size={18}
//               className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
//             />
//             <input
//               type="text"
//               placeholder="Search patients"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none // focus:ring-2 focus:ring-blue-500/20"
//             />
//           </div>

//           <button
//             onClick={() => setSelectedCampId("all")}
//             className={`px-4 py-2 rounded-lg border text-sm font-semibold
//               ${selectedCampId === "all"
//                 ? "bg-blue-600 text-white"
//                 : "bg-white hover:bg-gray-50"
//               }`}
//           >
//             All Camps
//           </button>
//         </div>
//       </div> */}

//       {/* ================= STATS ================= */}
//       {/* ================= ANALYTICS ================= */}
//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         <StatsCard
//           title="Total Camps"
//           value={role === "employee" ? myAssignedCamps.length : totalCamps}
//           icon={MapPin}
//           iconBg="bg-gradient-to-br from-purple-500 to-indigo-500"
//           onClick={() => scrollToSection(campsSectionRef)}
//         />
//         <StatsCard
//           title="Active Camps"
//           value={role === "employee" ? myAssignedCamps.filter(c => {
//             if (!c.date) return false;
//             let campDate = new Date(c.date);
//             if (isNaN(campDate.getTime())) {
//               const parts = c.date.split('-');
//               if (parts.length === 3) {
//                 campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
//               }
//             }
//             if (isNaN(campDate.getTime())) return false;
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);
//             campDate.setHours(0, 0, 0, 0);
//             return campDate.getTime() === today.getTime();
//           }).length : activeCampsCount}
//           icon={Activity}
//           iconBg="bg-gradient-to-br from-indigo-500 to-blue-500"
//           onClick={() => scrollToSection(campsSectionRef)}
//         />
//         <StatsCard
//           title="Total Patients"
//           value={role === "employee" ? patients.filter(p => myAssignedCamps.some(c => c._id === p.campId?._id)).length : totalPatients}
//           icon={Users}
//           iconBg="bg-gradient-to-br from-sky-500 to-cyan-500"
//           onClick={() => scrollToSection(patientsSectionRef)}
//         />
//         <StatsCard
//           title="Upcoming Camps"
//           value={role === "employee" ? myAssignedCamps.filter(c => {
//             if (!c.date) return false;
//             let campDate = new Date(c.date);
//             if (isNaN(campDate.getTime())) {
//               const parts = c.date.split('-');
//               if (parts.length === 3) {
//                 campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
//               }
//             }
//             if (isNaN(campDate.getTime())) return false;
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);
//             campDate.setHours(0, 0, 0, 0);
//             return campDate.getTime() > today.getTime();
//           }).length : upcomingCampsCount}
//           icon={Activity}
//           iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
//           onClick={() => scrollToSection(campsSectionRef)}
//         />
//       </div>

//       {/* ================= CAMPS SECTION ================= */}
//       <div ref={campsSectionRef}>

//         {/* MY ASSIGNED CAMPS SECTION */}
//         {role === "employee" && myAssignedCamps.length > 0 && (
//           <div className="mb-10">
//             <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-indigo-700">
//               <span className="p-1 bg-indigo-100 rounded-lg"><Users size={18} /></span>
//               My Assigned Camps
//             </h3>
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//               {myAssignedCamps.map((camp) => (
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
//         )}

//         {role !== "employee" && (
//           <>
//             <h3 className="mb-4 text-lg font-semibold">All Camps</h3>

//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//               {camps.map((camp) => (
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
//           </>
//         )}
//       </div>

//       {/* ================= PATIENTS ================= */}
//       {loading ? (
//         <p className="text-center text-gray-500">Loading...</p>
//       ) : (
//         <div ref={patientsSectionRef}>
//           <div className="flex flex-col items-start justify-between gap-4 mb-4 sm:flex-row sm:items-center">
//             <h3 className="text-lg font-semibold">Patients</h3>

//             <div className="relative w-full sm:w-72">
//               <Search
//                 size={18}
//                 className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
//               />
//               <input
//                 type="text"
//                 placeholder="Search patients by name..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none // focus:ring-2 focus:ring-indigo-500/20"
//               />
//             </div>
//           </div>

//           <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
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

//     </div>
//   );
// };




// /* ================= STATS CARD ================= */

// const StatsCard = ({ title, value, icon: Icon, iconBg, onClick }) => {
//   return (
//     <div
//       onClick={onClick}
//       className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 ${onClick ? "cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]" : ""}`}
//     >
//       <div
//         className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
//       >
//         <Icon size={22} className="text-white" />
//       </div>

//       <div>
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         <p className="text-2xl font-bold text-gray-900">{value}</p>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;






import axios from "axios";
import {
  Activity,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  FileSpreadsheet,
  MapPin,
  Search,
  Trash2,

  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import PartnerDisplay from "../components/PartnerDisplay";
import VolunteerDisplay from "../components/VolunteerDisplay";
import config from "../config";
import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";

const Dashboard = () => {

  // Helper Functions
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
    if (!tests) return r;

    tests.forEach(t => {
      r.date = t.date;
      if (t.type === "weight") r.weight = t.value;
      if (t.type === "height") r.height = t.value;
      if (t.type === "sugar") r.sugar = t.value;
      if (t.type === "sugarType") r.sugarType = t.value;
      if (t.type === "bp") {
        r.systolic = t.value;
        r.diastolic = t.value2;
      }
    });
    return r;
  };
  const [patients, setPatients] = useState([]);
  const [camps, setCamps] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCampId, setSelectedCampId] = useState("all");
  const [activeToday, setActiveToday] = useState(0);
  const [viewCamp, setViewCamp] = useState(null);

  const campsSectionRef = useRef(null);
  const patientsSectionRef = useRef(null);

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
      const role = localStorage.getItem("role");
      const partnerId = localStorage.getItem("userId") || (localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).id : null);

      let res;
      if (role === "partner" && partnerId) {
        res = await axios.get(`${config.API_BASE_URL}/camps/assigned-camps/${partnerId}`);
      } else {
        res = await axios.get(`${config.API_BASE_URL}/camps/allcamps`);
      }
      setCamps(sortCampsByStatus(res.data || []));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchCamps();
  }, []);

  // Role detection
  const role = localStorage.getItem("role");

  // Filter for My Assigned Camps (Employee or Partner)
  const employeeName = localStorage.getItem("employeeName");
  const employeeId = localStorage.getItem("employeeId");
  const partnerId = localStorage.getItem("userId") || (localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).id : null);

  const myAssignedCamps = (role === "partner" && partnerId)
    ? camps // Already filtered by API in fetchCamps
    : camps.filter(camp =>
      (camp.volunteers || []).some(v =>
        (employeeName && v.toLowerCase() === employeeName.toLowerCase()) ||
        (employeeId && v === employeeId)
      )
    );

  /* ================= DELETE ================= */

  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await axios.delete(
      `${config.API_BASE_URL}/patients/${id}`
    );
    fetchPatients();
  };

  /* ================= FILTER ================= */

  const filteredPatients = patients.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCamp =
      selectedCampId === "all"
        ? (role === "employee" || role === "partner" ? myAssignedCamps.some(c => c._id === p.campId?._id) : true)
        : p.campId?._id === selectedCampId;

    return matchSearch && matchCamp;
  });

  /* ================= STATS ================= */

  const totalCamps = camps.length;
  const totalPatients = patients.length;
  // const recentPatients = activeToday;

  // Calculate Active and Upcoming Camps using centralized logic
  const activeCampsCount = camps.filter(c => {
    const { status } = getCampStatus(c.date, c.time);
    return status === 'live' || status === 'today';
  }).length;

  const upcomingCampsCount = camps.filter(c => {
    const { status } = getCampStatus(c.date, c.time);
    return status === 'upcoming';
  }).length;

  /* ================= VIEW MODAL HELPERS ================= */

  // Filter patients for selected camp in modal
  const viewCampPatients = useMemo(() => {
    if (!viewCamp) return [];
    return patients.filter(p => p.campId?._id === viewCamp._id);
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
        const test = extractLatestVitals(p.tests);
        const bmiValue = calculateBMI(test.weight, test.height);
        if (bmiValue) bmi = bmiValue;

        if (test.systolic && test.diastolic) bp = `${test.systolic}/${test.diastolic}`;
        if (test.sugar) sugar = `${test.sugar} (${test.sugarType || 'Random'})`;
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
    <div className="space-y-10">

      {/* ================= ANALYTICS ================= */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

  <StatsCard
    title="Total Camps"
    value={role === "employee" ? myAssignedCamps.length : totalCamps}
    icon={MapPin}
    color="border-purple-500"
    onClick={() => scrollToSection(campsSectionRef)}
  />

  <StatsCard
    title="Active Camps"
    value={
      role === "employee"
        ? myAssignedCamps.filter(c => {
            if (!c.date) return false;
            let campDate = new Date(c.date);
            if (isNaN(campDate.getTime())) {
              const parts = c.date.split('-');
              if (parts.length === 3) {
                campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              }
            }
            if (isNaN(campDate.getTime())) return false;
            const today = new Date();
            today.setHours(0,0,0,0);
            campDate.setHours(0,0,0,0);
            return campDate.getTime() === today.getTime();
          }).length
        : activeCampsCount
    }
    icon={Activity}
    color="border-green-500"
    onClick={() => scrollToSection(campsSectionRef)}
  />

  <StatsCard
    title="Total Patients"
    value={
      role === "employee"
        ? patients.filter(p =>
            myAssignedCamps.some(c => c._id === p.campId?._id)
          ).length
        : totalPatients
    }
    icon={Users}
    color="border-cyan-500"
    onClick={() => scrollToSection(patientsSectionRef)}
  />

  <StatsCard
    title="Upcoming Camps"
    value={
      role === "employee"
        ? myAssignedCamps.filter(c => {
            if (!c.date) return false;
            let campDate = new Date(c.date);
            if (isNaN(campDate.getTime())) {
              const parts = c.date.split('-');
              if (parts.length === 3) {
                campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              }
            }
            if (isNaN(campDate.getTime())) return false;
            const today = new Date();
            today.setHours(0,0,0,0);
            campDate.setHours(0,0,0,0);
            return campDate.getTime() > today.getTime();
          }).length
        : upcomingCampsCount
    }
    icon={Calendar}
    color="border-orange-500"
    onClick={() => scrollToSection(campsSectionRef)}
  />

  <StatsCard
    title="eSign"
    value={esignCount}
    icon={PenTool}
    color="border-pink-500"
    onClick={() => scrollToSection(esignSectionRef)}
  />

</div>

      {/* ================= CAMPS SECTION ================= */}
      <div ref={campsSectionRef}>

        {/* MY ASSIGNED CAMPS SECTION */}
        {role === "employee" && myAssignedCamps.length > 0 && (
          <div className="mb-10">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-indigo-700">
              <span className="p-1 bg-indigo-100 rounded-lg"><Users size={18} /></span>
              My Assigned Camps
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {myAssignedCamps.map((camp) => (
                <div
                  key={camp._id}
                  onClick={() => setSelectedCampId(camp._id)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all group
                  ${selectedCampId === camp._id
                      ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                      : "bg-white hover:border-indigo-300 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <h4 className={`font-bold truncate ${selectedCampId === camp._id ? "text-white" : "text-gray-900 group-hover:text-indigo-600 transition-colors"}`}>{camp.name}</h4>
                    <CampStatusBadge date={camp.date} time={camp.time} />
                  </div>

                  <div className="space-y-2 text-sm font-medium">
                    <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                      <MapPin size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-500"} />
                      <span className="truncate">{camp.location}</span>
                    </div>

                    <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                      <Calendar size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-400"} />
                      <span>{camp.date || "No date"}</span>
                    </div>

                    <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                      <Clock size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-500"} />
                      <span>{camp.time || "No time"}</span>
                    </div>

                    <VolunteerDisplay volunteers={camp.volunteers} isSelected={selectedCampId === camp._id} />
                    <PartnerDisplay partners={camp.partners} isSelected={selectedCampId === camp._id} />
                  </div>

                  <div className={`mt-5 pt-4 border-t flex items-center justify-between ${selectedCampId === camp._id ? "border-white/20" : "border-gray-50"}`}>
                    <div className={`flex items-center gap-2 text-xs font-bold ${selectedCampId === camp._id ? "text-indigo-200" : "text-gray-400"}`}>
                      <Users size={14} />
                      <span>{patients.filter((p) => String(p.campId?._id || p.campId) === String(camp._id)).length} Patients</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewCamp(camp);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all
                            ${selectedCampId === camp._id
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                      >
                        <Eye size={12} className="inline mr-1" /> View
                      </button>
                      <div className={`${selectedCampId === camp._id ? "text-white" : "text-indigo-600"} opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {role !== "employee" && (
          <>
            <h3 className="mb-4 text-lg font-semibold">All Camps</h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {camps.map((camp) => (
                <div
                  key={camp._id}
                  onClick={() => setSelectedCampId(camp._id)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all group
                  ${selectedCampId === camp._id
                      ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                      : "bg-white hover:border-indigo-300 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <h4 className={`font-bold truncate ${selectedCampId === camp._id ? "text-white" : "text-gray-900 group-hover:text-indigo-600 transition-colors"}`}>{camp.name}</h4>
                    <CampStatusBadge date={camp.date} time={camp.time} />
                  </div>

                  <div className="space-y-2 text-sm font-medium">
                    <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                      <MapPin size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-500"} />
                      <span className="truncate">{camp.location}</span>
                    </div>

                    <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                      <Calendar size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-400"} />
                      <span>{camp.date || "No date"}</span>
                    </div>

                    <div className={`flex items-center gap-2 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                      <Clock size={14} className={selectedCampId === camp._id ? "text-indigo-200" : "text-indigo-500"} />
                      <span>{camp.time || "No time"}</span>
                    </div>

                    <VolunteerDisplay volunteers={camp.volunteers} isSelected={selectedCampId === camp._id} />
                    <PartnerDisplay partners={camp.partners} isSelected={selectedCampId === camp._id} />
                  </div>

                  <div className={`mt-5 pt-4 border-t flex items-center justify-between ${selectedCampId === camp._id ? "border-white/20" : "border-gray-50"}`}>
                    <div className={`flex items-center gap-2 text-xs font-bold ${selectedCampId === camp._id ? "text-indigo-200" : "text-gray-400"}`}>
                      <Users size={14} />
                      <span>{patients.filter((p) => String(p.campId?._id || p.campId) === String(camp._id)).length} Patients</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewCamp(camp);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all
                            ${selectedCampId === camp._id
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                      >
                        <Eye size={12} className="inline mr-1" /> View
                      </button>
                      <div className={`${selectedCampId === camp._id ? "text-white" : "text-indigo-600"} opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ================= PATIENTS ================= */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div ref={patientsSectionRef}>
          <div className="flex flex-col items-start justify-between gap-4 mb-4 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold">Patients</h3>

            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              />
              <input
                type="text"
                placeholder="Search patients by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

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
                              <Eye size={14} /> View
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
                      <td colSpan={4} className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-3">
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
      )}

      {/* ================= VIEW CAMP MODAL ================= */}
      {viewCamp && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
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
                className="flex items-center justify-center w-8 h-8 text-gray-400 transition bg-white border border-gray-200 rounded-full shadow-sm hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 p-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-full">
                  {viewCampPatients.length} Participants
                </span>
                <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
              </div>

              <button
                onClick={handleDownloadCampCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition shadow-lg bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-emerald-100 active:scale-95"
              >
                <FileSpreadsheet size={16} />
                Download Report
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 p-0 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    <th className="p-4 text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">Patient Name</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">Contact</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">Age / Gender</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">Health Check</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-right text-gray-400 uppercase border-b border-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewCampPatients.length > 0 ? (
                    viewCampPatients.map(patient => (
                      <tr key={patient._id} className="transition-colors hover:bg-gray-50/80">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-indigo-600 border border-indigo-100 rounded-full bg-indigo-50">
                              {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900">{patient.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm font-medium text-gray-600">{patient.contact}</td>
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
                      <td colSpan={5} className="flex flex-col items-center gap-3 p-12 text-center text-gray-400">
                        <Users size={32} className="opacity-20" />
                        <span className="text-sm font-medium">No patients found in this camp yet.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setViewCamp(null)}
                className="px-6 py-2 text-sm font-bold text-gray-600 transition bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-100 hover:text-gray-800"
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

/* ================= STATS CARD (REDESIGNED) ================= */
const StatsCard = ({ title, value, icon: Icon, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 bg-gray-100 rounded-xl shadow-sm border-t-4 ${color} cursor-pointer hover:shadow-md transition`}
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {title}
        </span>
      </div>

      {/* Right */}
      <span className="text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
};

export default Dashboard;


