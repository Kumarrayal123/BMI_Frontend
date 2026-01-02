// import axios from "axios";
// import {
//   Activity,
//   Calendar,
//   CheckCircle,
//   ChevronRight,
//   Copy,
//   Eye,
//   FileText,
//   Filter,
//   Link,
//   MapPin,
//   MessageCircle,
//   Search,
//   Users
// } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";

// const API_BASE = "https://bim-backend-4i12.onrender.com/api";

// /* ================= UTILS ================= */

// const calculateBMI = (weight, heightCm) => {
//   if (!weight || !heightCm) return null;
//   const h = heightCm / 100;
//   return +(weight / (h * h)).toFixed(1);
// };

// const getBMICategory = (bmi) => {
//   if (!bmi) return "-";
//   if (bmi < 18.5) return "Underweight";
//   if (bmi < 25) return "Healthy";
//   if (bmi < 30) return "Overweight";
//   return "Obese";
// };

// const extractLatestVitals = (tests = []) => {
//   const r = {};
//   if (!tests) return r;

//   tests.forEach(t => {
//     r.date = t.date;
//     if (t.type === "weight") r.weight = t.value;
//     if (t.type === "height") r.height = t.value;
//     if (t.type === "sugar") r.sugar = t.value;
//     if (t.type === "bp") {
//       r.systolic = t.value;
//       r.diastolic = t.value2;
//     }
//   });
//   return r;
// };

// /* ================= COMPONENTS ================= */

// const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
//   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
//     <div className={`p-4 rounded-xl ${colorClass}`}>
//       <Icon size={24} className="text-white" />
//     </div>
//     <div>
//       <p className="text-sm font-medium text-gray-500">{title}</p>
//       <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
//     </div>
//   </div>
// );

// export default function CampDashboard() {
//   const navigate = useNavigate();
//   const [camps, setCamps] = useState([]);
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Filters
//   const [selectedCampId, setSelectedCampId] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [currentPatient, setCurrentPatient] = useState(null);
//   const [copied, setCopied] = useState(false);
//   const [downloadLink, setDownloadLink] = useState("");
//   const [generatedReportFile, setGeneratedReportFile] = useState(null);

//   /* -------- FETCH DATA -------- */
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [campsRes, patientsRes] = await Promise.all([
//           axios.get(`${API_BASE}/camps/allcamps`).catch(() => ({ data: [] })),
//           axios.get(`${API_BASE}/patients`).catch(() => ({ data: [] }))
//         ]);

//         setCamps(campsRes.data || []);
//         setPatients(patientsRes.data || []);
//       } catch (err) {
//         console.error("Failed to fetch data", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   /* -------- DERIVED DATA -------- */
//   const filteredPatients = useMemo(() => {
//     return patients.filter(p => {
//       // 1. Filter by Camp
//       if (selectedCampId !== "all") {
//         if (p.campId?._id !== selectedCampId) return false;
//       }

//       // 2. Filter by Search
//       if (searchQuery) {
//         const q = searchQuery.toLowerCase();
//         const matchesName = p.name?.toLowerCase().includes(q);
//         const matchesPhone = p.contact?.includes(q);
//         const matchesCamp = p.campId?.name?.toLowerCase().includes(q);
//         if (!matchesName && !matchesPhone && !matchesCamp) return false;
//       }

//       return true;
//     });
//   }, [patients, selectedCampId, searchQuery]);

//   const totalCamps = camps.length;
//   const totalPatients = patients.length;
//   const recentPatients = patients.filter(p => {
//     const d = new Date(p.createdAt);
//     const now = new Date();
//     return (now - d) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
//   }).length;

//   const campsWithCount = useMemo(() => {
//     return camps.map(c => {
//       const count = patients.filter(p => p.campId?._id === c._id).length;
//       return { ...c, count };
//     });
//   }, [camps, patients]);

//   /* -------- HELPER: PREPARE REPORT DATA -------- */
//   const prepareReportData = async (patientId) => {
//     try {
//       const res = await axios.get(`${API_BASE}/patients/${patientId}`);
//       const fullPatient = res.data;

//       if (!fullPatient?.tests?.length) {
//         alert("No test data available for this patient.");
//         return null;
//       }

//       const test = extractLatestVitals(fullPatient.tests);
//       const bmiValue = calculateBMI(test.weight, test.height);

//       const patientData = {
//         name: fullPatient.name,
//         age: fullPatient.age,
//         gender: fullPatient.gender,
//         id: fullPatient._id.slice(-6).toUpperCase(),
//         date: new Date(test.date || Date.now()).toLocaleDateString(),
//         phone: fullPatient.contact,
//         address: fullPatient.address,
//       };

//       const testsData = {
//         weight: test.weight,
//         height: test.height,
//         sugar: test.sugar,
//         sugarType: test.sugarType || "Random",
//         systolic: test.systolic,
//         diastolic: test.diastolic,
//         heartRate: "-",
//       };

//       const bmiData = {
//         bmi: bmiValue,
//         category: getBMICategory(bmiValue),
//       };

//       return { patientData, testsData, bmiData };

//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch report data.");
//       return null;
//     }
//   };

//   /* -------- GENERATE DOWNLOAD LINK -------- */
//   const generateDownloadLink = async (patientData, testsData, bmiData) => {
//     try {
//       // Generate PDF file using existing function
//       const pdfFile = generateMedicalReportFile(patientData, testsData, bmiData);

//       // Create a blob URL for the PDF
//       const blob = new Blob([pdfFile], { type: 'application/pdf' });
//       const blobUrl = URL.createObjectURL(blob);

//       // Generate a unique download link
//       const timestamp = Date.now();
//       const fileName = `Health_Report_${patientData.name.replace(/\s+/g, '_')}_${timestamp}.pdf`;

//       // Create a download link element
//       const link = document.createElement('a');
//       link.href = blobUrl;
//       link.download = fileName;

//       // Store for later cleanup
//       setGeneratedReportFile({
//         blobUrl,
//         fileName,
//         link
//       });

//       // Return the blob URL for sharing
//       return blobUrl;

//     } catch (error) {
//       console.error("Error generating download link:", error);
//       throw error;
//     }
//   };

//   /* -------- HANDLERS -------- */
//   const downloadPDF = async (patient) => {
//     const data = await prepareReportData(patient._id);
//     if (!data) return;
//     generateMedicalReport(data.patientData, data.testsData, data.bmiData);
//   };

//   const viewReport = async (patient) => {
//     const data = await prepareReportData(patient._id);
//     if (!data) return;
//     navigate('/health-report', {
//       state: {
//         patient: data.patientData,
//         tests: data.testsData
//       }
//     });
//   };

//   const shareReport = async (patient) => {
//     try {
//       setCurrentPatient(patient);

//       // Prepare report data
//       const data = await prepareReportData(patient._id);
//       if (!data) return;

//       // Generate download link
//       const downloadUrl = await generateDownloadLink(data.patientData, data.testsData, data.bmiData);

//       // Create a shareable message with link
//       const shareMessage = `*Health Checkup Report* 🏥\n\nHello ${patient.name},\nYour medical health report is ready.\n\n📄 *Click to Download Report:* ${downloadUrl}\n\n⚠️ *Note:* This link will work for 24 hours only.\n\n(Generated by Timely Health)`;

//       setDownloadLink(shareMessage);
//       setShowShareModal(true);

//     } catch (err) {
//       console.error("Failed to generate share link", err);
//       alert("Failed to generate sharing link. Please try standard download instead.");
//     }
//   };

//   const handleWhatsAppShare = () => {
//     if (!currentPatient || !downloadLink) return;

//     const phone = currentPatient.contact ? currentPatient.contact.replace(/\D/g, '') : '';

//     if (!phone) {
//       alert("Patient phone number is required for WhatsApp sharing");
//       return;
//     }

//     const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(downloadLink)}`;
//     window.open(whatsappUrl, "_blank");
//     setShowShareModal(false);
//   };

//   const handleCopyMessage = () => {
//     if (!downloadLink) return;

//     navigator.clipboard.writeText(downloadLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleCopyLinkOnly = () => {
//     if (!downloadLink) return;

//     // Extract just the URL from the message
//     const urlMatch = downloadLink.match(/https?:\/\/[^\s]+/);
//     if (urlMatch) {
//       navigator.clipboard.writeText(urlMatch[0]);
//       alert("Download link copied to clipboard!");
//     }
//   };

//   // Cleanup blob URLs when component unmounts or modal closes
//   const cleanupGeneratedFiles = () => {
//     if (generatedReportFile) {
//       URL.revokeObjectURL(generatedReportFile.blobUrl);
//       setGeneratedReportFile(null);
//     }
//   };

//   useEffect(() => {
//     return () => {
//       cleanupGeneratedFiles();
//     };
//   }, []);

//   return (
//     <div className="min-h-screen p-6 space-y-8 bg-gray-50/50 md:p-8 animate-fade-in">

//       {/* HEADER Section */}
//       <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight text-gray-900">Camp Dashboard</h1>
//           <p className="mt-1 text-gray-500">Manage health camps, participants, and reports.</p>
//         </div>
//         <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-xl">
//           <Calendar size={18} className="text-indigo-600" />
//           <span className="text-sm font-medium text-gray-700">
//             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
//           </span>
//         </div>
//       </div>

//       {/* STATS Section */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//         <StatsCard
//           title="Total Camps"
//           value={totalCamps}
//           icon={MapPin}
//           colorClass="bg-gradient-to-br from-indigo-500 to-purple-600"
//         />
//         <StatsCard
//           title="Total Patients"
//           value={totalPatients}
//           icon={Users}
//           colorClass="bg-gradient-to-br from-blue-500 to-cyan-500"
//         />
//         <StatsCard
//           title="Recent Additions"
//           value={recentPatients}
//           icon={Activity}
//           colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
//         />
//       </div>

//       <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-4">

//         {/* LEFT SIDEBAR - CAMP LIST */}
//         <div className="space-y-6 lg:col-span-1">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-bold text-gray-800">Camps</h3>
//             <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
//               {camps.length} Active
//             </span>
//           </div>

//           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
//             {/* 'ALL' Card */}
//             <div
//               onClick={() => setSelectedCampId("all")}
//               className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 group ${selectedCampId === "all"
//                 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-[1.02]"
//                 : "bg-white hover:border-indigo-300 hover:shadow-md text-gray-600"
//                 }`}
//             >
//               <div className="flex items-center justify-between">
//                 <span className="text-lg font-semibold">All Camps</span>
//                 {selectedCampId === "all" && <ChevronRight size={20} />}
//               </div>
//               <p className={`text-sm mt-1 ${selectedCampId === "all" ? "text-indigo-100" : "text-gray-500"}`}>
//                 View all participants
//               </p>
//             </div>

//             {/* Camp Cards */}
//             {campsWithCount.map(camp => (
//               <div
//                 key={camp._id}
//                 onClick={() => setSelectedCampId(camp._id)}
//                 className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 group ${selectedCampId === camp._id
//                   ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-[1.02]"
//                   : "bg-white hover:border-indigo-300 hover:shadow-md"
//                   }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <h4 className={`font-bold ${selectedCampId === camp._id ? "text-white" : "text-gray-800"}`}>
//                       {camp.name}
//                     </h4>
//                     <div className={`mt-2 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                       <MapPin size={14} />
//                       <span className="truncate max-w-[150px]">{camp.location}</span>
//                     </div>
//                     <div className={`mt-1 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                       <Calendar size={14} />
//                       <span>{camp.date || "No date"}</span>
//                     </div>
//                   </div>
//                   <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedCampId === camp._id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
//                     }`}>
//                     {camp.count}
//                   </span>
//                 </div>
//               </div>
//             ))}
//             {camps.length === 0 && !loading && (
//               <div className="p-6 text-center bg-white border border-dashed rounded-2xl">
//                 <p className="text-sm text-gray-500">No camps found.</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT SIDE - PARTICIPANTS TABLE */}
//         <div className="space-y-6 lg:col-span-3">

//           {/* Controls */}
//           <div className="flex flex-col items-center justify-between gap-4 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:flex-row">
//             <div className="relative w-full sm:max-w-md">
//               <Search className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search by name, phone or camp..."
//                 className="w-full py-2 pl-10 pr-4 transition-all border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <Filter size={16} />
//               <span>Showing {filteredPatients.length} participants</span>
//             </div>
//           </div>

//           {/* Table Container */}
//           <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="border-b border-gray-100 bg-gray-50/50">
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
//                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Reports</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {loading ? (
//                     <tr>
//                       <td colSpan={3} className="p-8 text-center text-gray-500">
//                         <div className="flex flex-col items-center gap-2">
//                           <div className="w-6 h-6 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
//                           <span>Loading participants...</span>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : filteredPatients.length > 0 ? (
//                     filteredPatients.map((patient) => (
//                       <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
//                         {/* NAME Column */}
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
//                               {patient.name.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                               <p className="font-semibold text-gray-900">{patient.name}</p>
//                               <p className="text-xs text-gray-500">{patient.age} Y • {patient.gender}</p>
//                             </div>
//                           </div>
//                         </td>

//                         {/* PHONE Column */}
//                         <td className="p-4">
//                           <span className="text-sm font-medium text-gray-700">
//                             {patient.contact || "N/A"}
//                           </span>
//                         </td>

//                         {/* REPORTS Column (View, Download, Share) */}
//                         <td className="p-4">
//                           <div className="flex items-center gap-2">

//                             {/* VIEW Button */}
//                             <button
//                               onClick={() => viewReport(patient)}
//                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
//                             >
//                               <Eye size={14} />
//                               View
//                             </button>

//                             {/* DOWNLOAD Button */}
//                             <button
//                               onClick={() => downloadPDF(patient)}
//                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
//                             >
//                               <FileText size={14} />
//                               Download
//                             </button>

//                             {/* WHATSAPP/SHARE Button */}
//                             <button
//                               onClick={() => shareReport(patient)}
//                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
//                             >
//                               <MessageCircle size={14} />
//                               WhatsApp
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={3} className="p-12 text-center">
//                         <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
//                           <Users size={48} className="opacity-20" />
//                           <p className="text-lg font-medium">No participants found</p>
//                           <p className="text-sm">Try adjusting your search or filters.</p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* --- SHARE MODAL --- */}
//           {showShareModal && currentPatient && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
//               <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl animate-scale-in">
//                 <div className="p-6 text-center text-white bg-green-600">
//                   <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
//                     <MessageCircle size={32} />
//                   </div>
//                   <h3 className="text-xl font-bold">Share Report on WhatsApp</h3>
//                   <p className="mt-1 text-sm text-green-100">Download link generated successfully!</p>
//                 </div>
//                 <div className="p-6 space-y-6">

//                   {/* Patient Info */}
//                   <div className="p-4 bg-gray-50 rounded-2xl">
//                     <div className="flex items-center gap-3">
//                       <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-green-700 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
//                         {currentPatient.name.charAt(0).toUpperCase()}
//                       </div>
//                       <div>
//                         <p className="font-bold text-gray-900">{currentPatient.name}</p>
//                         <p className="text-sm text-gray-600">
//                           {currentPatient.contact || "No phone number"} • {currentPatient.age} Y
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Message Preview */}
//                   <div className="p-4 border-2 border-green-200 border-dashed rounded-2xl bg-green-50/50">
//                     <p className="mb-2 text-sm font-bold text-green-800">📄 WhatsApp Message Preview:</p>
//                     <div className="p-3 overflow-y-auto bg-white border border-green-100 rounded-lg max-h-40">
//                       <pre className="text-xs text-gray-700 whitespace-pre-wrap">
//                         {downloadLink}
//                       </pre>
//                     </div>
//                     <p className="mt-2 text-xs text-gray-500">
//                       Patient will receive this message with a clickable download link.
//                     </p>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="space-y-3">
//                     <button
//                       onClick={handleWhatsAppShare}
//                       className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
//                     >
//                       <MessageCircle size={18} />
//                       Open WhatsApp with Message
//                     </button>

//                     <button
//                       onClick={handleCopyMessage}
//                       className="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
//                     >
//                       {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
//                       {copied ? "Copied!" : "Copy Full Message"}
//                     </button>

//                     <button
//                       onClick={handleCopyLinkOnly}
//                       className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Link size={16} />
//                       Copy Download Link Only
//                     </button>

//                     <button
//                       onClick={() => {
//                         setShowShareModal(false);
//                         cleanupGeneratedFiles();
//                       }}
//                       className="w-full py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }


import axios from "axios";
import {
  Activity,
  Calendar,
  CheckCircle,
  Copy,
  Eye,
  FileText,
  Filter,
  Link,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";

const API_BASE = "https://bim-backend-4i12.onrender.com/api";



/* ================= UTILS ================= */

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
    if (t.type === "bp") {
      r.systolic = t.value;
      r.diastolic = t.value2;
    }
  });
  return r;
};

/* ================= COMPONENTS ================= */

const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export default function CampDashboard() {
  const navigate = useNavigate();
  // ✅ MOVE THESE HERE
  const [showCampModal, setShowCampModal] = useState(false);
  const [campForm, setCampForm] = useState({
    name: "",
    location: "",
    address: "",
    date: "",
    time: ""
  });
  const [camps, setCamps] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  // 🔒 Lock body scroll when Create Camp modal is open
useEffect(() => {
  if (showCampModal) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [showCampModal]);


  // Filters
  const [selectedCampId, setSelectedCampId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [generatedReportFile, setGeneratedReportFile] = useState(null);

  /* -------- FETCH DATA -------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [campsRes, patientsRes] = await Promise.all([
          axios.get(`${API_BASE}/camps/allcamps`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/patients`).catch(() => ({ data: [] }))
        ]);

        setCamps(campsRes.data || []);
        setPatients(patientsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* -------- DERIVED DATA -------- */
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // 1. Filter by Camp
      if (selectedCampId !== "all") {
  if (String(p.campId?._id) !== String(selectedCampId)) return false;
}


      // 2. Filter by Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesPhone = p.contact?.includes(q);
        const matchesCamp = p.campId?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCamp) return false;
      }

      return true;
    });
  }, [patients, selectedCampId, searchQuery]);

  const totalCamps = camps.length;
  const totalPatients = patients.length;
  const recentPatients = patients.filter(p => {
    const d = new Date(p.createdAt);
    const now = new Date();
    return (now - d) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
  }).length;

  const campsWithCount = useMemo(() => {
    return camps.map(c => {
     const count = patients.filter(
  p => String(p.campId?._id) === String(c._id)
).length;
      return { ...c, count };
    });
  }, [camps, patients]);

  /* -------- HELPER: PREPARE REPORT DATA -------- */
  
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
        weight: test.weight,
        height: test.height,
        sugar: test.sugar,
        sugarType: test.sugarType || "Random",
        systolic: test.systolic,
        diastolic: test.diastolic,
        heartRate: "-",
      };

      const bmiData = {
        bmi: bmiValue,
        category: getBMICategory(bmiValue),
      };

      return { patientData, testsData, bmiData };

    } catch (err) {
      console.error(err);
      alert("Failed to fetch report data.");
      return null;
    }
  };


  const uploadPdfToServer = async (patientData, testsData, bmiData) => {
    // 1️⃣ Generate raw PDF
    const rawPdf = await generateMedicalReportFile(
      patientData,
      testsData,
      bmiData
    );

    // 2️⃣ Convert to proper PDF Blob
    const pdfBlob = new Blob([rawPdf], {
      type: "application/pdf"
    });

    // 3️⃣ Upload
    const formData = new FormData();
    formData.append("file", pdfBlob, "health-report.pdf");

    const res = await axios.post(
      "https://bim-backend-4i12.onrender.com/api/reports/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data.downloadLink;
  };


  // /* -------- GENERATE DOWNLOAD LINK -------- */
  // const generateDownloadLink = async (patientData, testsData, bmiData) => {
  //   try {
  //     // Generate PDF file using existing function
  //     const pdfFile = generateMedicalReportFile(patientData, testsData, bmiData);

  //     // Create a blob URL for the PDF
  //     const blob = new Blob([pdfFile], { type: 'application/pdf' });
  //     const blobUrl = URL.createObjectURL(blob);

  //     // Generate a unique download link
  //     const timestamp = Date.now();
  //     const fileName = `Health_Report_${patientData.name.replace(/\s+/g, '_')}_${timestamp}.pdf`;

  //     // Create a download link element
  //     const link = document.createElement('a');
  //     link.href = blobUrl;
  //     link.download = fileName;

  //     // Store for later cleanup
  //     setGeneratedReportFile({
  //       blobUrl,
  //       fileName,
  //       link
  //     });

  //     // Return the blob URL for sharing
  //     return blobUrl;

  //   } catch (error) {
  //     console.error("Error generating download link:", error);
  //     throw error;
  //   }
  // };

  /* -------- HANDLERS -------- */
  const downloadPDF = async (patient) => {
    const data = await prepareReportData(patient._id);
    if (!data) return;
    generateMedicalReport(data.patientData, data.testsData, data.bmiData);
  };

  const viewReport = async (patient) => {
    const data = await prepareReportData(patient._id);
    if (!data) return;
    navigate('/health-report', {
      state: {
        patient: data.patientData,
        tests: data.testsData
      }
    });
  };

  const shareReport = async (patient) => {
    try {
      setCurrentPatient(patient);

      const data = await prepareReportData(patient._id);
      if (!data) return;

      const publicLink = await uploadPdfToServer(
        data.patientData,
        data.testsData,
        data.bmiData
      );

      const message = `*Health Checkup Report* 🩺

Hello ${patient.name},
Your medical health report is ready.

📄 Download Report:
${publicLink}

(Generated by BIM Medical)`;

      setDownloadLink(message);
      setShowShareModal(true);

    } catch (err) {
      console.error("UPLOAD ERROR 👉", err.response?.data || err.message);
      alert("Failed to generate sharing link");
    }
  };


  const handleWhatsAppShare = () => {
    if (!currentPatient || !downloadLink) return;

    const phone = currentPatient.contact ? currentPatient.contact.replace(/\D/g, '') : '';

    if (!phone) {
      alert("Patient phone number is required for WhatsApp sharing");
      return;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(downloadLink)}`;
    window.open(whatsappUrl, "_blank");
    setShowShareModal(false);
  };

  const handleCopyMessage = () => {
    if (!downloadLink) return;

    navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLinkOnly = () => {
    if (!downloadLink) return;

    // Extract just the URL from the message
    const urlMatch = downloadLink.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      navigator.clipboard.writeText(urlMatch[0]);
      alert("Download link copied to clipboard!");
    }
  };

const handleCreateCamp = async () => {
  try {
    await axios.post(`${API_BASE}/camps/addcamp`, campForm);

    alert("✅ Camp created successfully");

    setShowCampModal(false);
    setCampForm({
      name: "",
      location: "",
      address: "",
      date: "",
      time: ""
    });

    // camps list refresh
    const res = await axios.get(`${API_BASE}/camps/allcamps`);
    setCamps(res.data);

  } catch (err) {
    console.error("CREATE CAMP ERROR", err);
    alert("❌ Failed to create camp");
  }
};

  return (
    <div className="min-h-screen p-0 space-y-1 bg-gray-50/50 md:p-0 animate-fade-in">

      {/* HEADER Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Camp Deatils</h1>
          <p className="mt-1 text-gray-500">Manage health camps, participants, and reports.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-xl">
          <Calendar size={18} className="text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* STATS Section */}
<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
  <StatsCard
    title="Total Camps"
    value={totalCamps}
    icon={MapPin}
    colorClass="bg-gradient-to-br from-indigo-500 to-purple-600"
  />

  {/* NEW CARD — Active Camps */}
  <StatsCard
    title="Active Camps"
    value={camps.length}
    icon={Activity}
    colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600"
  />

  <StatsCard
    title="Total Patients"
    value={totalPatients}
    icon={Users}
    colorClass="bg-gradient-to-br from-blue-500 to-cyan-500"
  />

  <StatsCard
    title="Recent Additions"
    value={recentPatients}
    icon={Activity}
    colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
  />

</div>


      {/* <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-4"> */}

        {/* ===== CAMPS ROW (Below Stats) ===== */}
<div className="space-y-4">

 <div className="flex items-center justify-between">
  <h3 className="text-lg font-bold text-gray-800">Camps</h3>

  <div className="flex items-center gap-3">
    {/* Active Badge */}
    {/* <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
      {camps.length} Active
    </span> */}

     {/* All Camp Button */}
   <button
  onClick={() => setSelectedCampId("all")}
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold
             hover:bg-blue-700 transition"
>
  All Camps Data
</button>
    {/* Create Camp Button */}
    <button
      onClick={() => setShowCampModal(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                 bg-green-600 text-white text-xs font-semibold
                 hover:bg-green-700 transition"
    >
      <Calendar size={14} />
      Create Camp
    </button>
   


  </div>
</div>


  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    
    {/* ALL CAMPS CARD */}
    {/* <div
      onClick={() => setSelectedCampId("all")}
      className={`cursor-pointer p-4 rounded-2xl border transition-all
        ${selectedCampId === "all"
          ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
          : "bg-white hover:border-indigo-300 hover:shadow-md text-gray-700"
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">All Camps</span>
        {selectedCampId === "all" && <ChevronRight size={18} />}
      </div>
      <p className={`text-sm mt-1 ${selectedCampId === "all" ? "text-indigo-100" : "text-gray-500"}`}>
        View all participants
      </p>
    </div> */}

    {/* CAMP CARDS */}
    {campsWithCount.map(camp => (
      <div
        key={camp._id}
        onClick={() => setSelectedCampId(camp._id)}
        className={`cursor-pointer p-4 rounded-2xl border transition-all
          ${selectedCampId === camp._id
            ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
            : "bg-white hover:border-indigo-300 hover:shadow-md"
          }`}
      >
        <h4 className="font-bold truncate">{camp.name}</h4>

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

        <span className={`inline-block mt-3 text-xs font-bold px-2 py-1 rounded-lg
          ${selectedCampId === camp._id
            ? "bg-white/20 text-white"
            : "bg-gray-100 text-gray-600"
          }`}>
          {camp.count} Patients
        </span>
      </div>
    ))}
  </div>
{/* </div> */}


        {/* RIGHT SIDE - PARTICIPANTS TABLE */}
        <div className="space-y-6 lg:col-span-3">

        {/* Controls */}
<div className="flex flex-col items-center justify-between gap-4 p-2 bg-white border border-gray-100 shadow-sm rounded-2xl lg:flex-row">

  {/* Search */}
  <div className="relative w-full lg:max-w-md">
    <Search
      className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2"
      size={18}
    />
    <input
      type="text"
      placeholder="Search by name, phone or camp..."
      className="w-full pl-11 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  {/* Right Section */}
  <div className="flex flex-wrap items-center gap-3">

    {/* Count */}
    <div className="flex items-center gap-2 mr-2 text-sm text-gray-500">
      <Filter size={16} />
      <span>Showing {filteredPatients.length} participants</span>
    </div>

    {/* Buttons Row */}
    <div className="flex items-center gap-3">
      {/* Create Camp */}
      {/* <button
  onClick={() => setShowCampModal(true)}
  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-green-600 rounded-xl hover:bg-green-700"
>
  <Calendar size={16} />
  Create Camp
</button> */}


      {/* Add Patient */}
      <button
        onClick={() => navigate("/add-patient", {
        state: {
            campId: selectedCampId
          }
        })}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700"
      >
        <Plus size={16} />
        Add Patient
      </button>
    </div>

  </div>
</div>



         {/* Table Container */}
<div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      
      {/* TABLE HEAD */}
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/50">
          <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
            Name
          </th>
          <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
            Phone
          </th>
          <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
            Camp
          </th>
          <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
            Reports
          </th>
        </tr>
      </thead>

      {/* TABLE BODY */}
      <tbody className="divide-y divide-gray-100">
        {loading ? (
          <tr>
            <td colSpan={4} className="p-8 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <span>Loading participants...</span>
              </div>
            </td>
          </tr>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <tr
              key={patient._id}
              className="transition-colors group hover:bg-gray-50/80"
            >

              {/* NAME COLUMN */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                    {patient.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {patient.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {patient.age} Y • {patient.gender}
                    </p>
                  </div>
                </div>
              </td>

              {/* PHONE COLUMN */}
              <td className="p-4">
                <span className="text-sm font-medium text-gray-700">
                  {patient.contact || "N/A"}
                </span>
              </td>

             <td className="p-4">
 <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
  {patient.campId?.name || "N/A"}
</span>


</td>




              {/* REPORTS COLUMN */}
              <td className="p-4">
                <div className="flex items-center gap-2">

                  {/* VIEW */}
                  <button
                    onClick={() => viewReport(patient)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </button>

                  {/* DOWNLOAD */}
                  <button
                    onClick={() => downloadPDF(patient)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <FileText size={14} />
                    Download
                  </button>

                  {/* WHATSAPP */}
                  <button
                    onClick={() => shareReport(patient)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
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
                <p className="text-lg font-medium">No participants found</p>
                <p className="text-sm">
                  Try adjusting your search or filters.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>

    </table>
  </div>
</div>


          {/* --- SHARE MODAL --- */}
          {showShareModal && currentPatient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl animate-scale-in">
                <div className="p-6 text-center text-white bg-green-600">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
                    <MessageCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Share Report on WhatsApp</h3>
                  <p className="mt-1 text-sm text-green-100">Download link generated successfully!</p>
                </div>
                <div className="p-6 space-y-6">

                  {/* Patient Info */}
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-green-700 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
                        {currentPatient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{currentPatient.name}</p>
                        <p className="text-sm text-gray-600">
                          {currentPatient.contact || "No phone number"} • {currentPatient.age} Y
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="p-4 border-2 border-green-200 border-dashed rounded-2xl bg-green-50/50">
                    <p className="mb-2 text-sm font-bold text-green-800">📄 WhatsApp Message Preview:</p>
                    <div className="p-3 overflow-y-auto bg-white border border-green-100 rounded-lg max-h-40">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {downloadLink}
                      </pre>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Patient will receive this message with a clickable download link.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Open WhatsApp with Message
                    </button>

                    <button
                      onClick={handleCopyMessage}
                      className="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                      {copied ? "Copied!" : "Copy Full Message"}
                    </button>

                    <button
                      onClick={handleCopyLinkOnly}
                      className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Link size={16} />
                      Copy Download Link Only
                    </button>

                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        cleanupGeneratedFiles();
                      }}
                      className="w-full py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- CREATE CAMP MODAL --- */}
{showCampModal &&
  createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60">

      <div
        className="fixed w-full max-w-lg px-4 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
      >
        <div className="p-6 space-y-5 bg-white shadow-2xl rounded-2xl">

          <h2 className="text-xl font-bold text-gray-800">
            Create New Camp
          </h2>

          <input
            className="w-full px-4 py-2 border rounded-xl"
            placeholder="Camp Name"
            value={campForm.name}
            onChange={(e) =>
              setCampForm({ ...campForm, name: e.target.value })
            }
          />

          <input
            className="w-full px-4 py-2 border rounded-xl"
            placeholder="Location"
            value={campForm.location}
            onChange={(e) =>
              setCampForm({ ...campForm, location: e.target.value })
            }
          />

          <textarea
            className="w-full px-4 py-2 border rounded-xl"
            placeholder="Address"
            value={campForm.address}
            onChange={(e) =>
              setCampForm({ ...campForm, address: e.target.value })
            }
          />

          <input
            type="date"
            className="w-full px-4 py-2 border rounded-xl"
            value={campForm.date}
            onChange={(e) =>
              setCampForm({ ...campForm, date: e.target.value })
            }
          />

          <input
            className="w-full px-4 py-2 border rounded-xl"
            placeholder="Time"
            value={campForm.time}
            onChange={(e) =>
              setCampForm({ ...campForm, time: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowCampModal(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateCamp}
              className="px-4 py-2 text-white bg-green-600 rounded-xl"
            >
              Create Camp
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  )}




    </div>

    
  );
}     

