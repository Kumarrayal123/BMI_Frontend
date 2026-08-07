// import axios from "axios";
// import JSZip from "jszip";
// import {
//   FiActivity,
//   FiCalendar,
//   FiClock,
//   FiCheckCircle,
//   FiCopy,
//   FiEye,
//   FiFileText,
//   FiFilter,
//   FiLink,
//   FiMapPin,
//   FiMessageCircle,
//   FiPlus,
//   FiSearch,
//   FiUsers,
//   FiEdit,
//   FiChevronRight,
//   FiX,
//   FiDownload,
//   FiUserCheck
// } from "react-icons/fi";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate } from "react-router-dom";
// import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
// import config from "../config";
// import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";
// import VolunteerDisplay from "../components/VolunteerDisplay";
// import PartnerDisplay from "../components/PartnerDisplay";
// import "./Dashboard.css";

// const API_BASE = config.API_BASE_URL;

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
//     if (t.type === "sugarType") r.sugarType = t.value;
//     if (t.type === "bp") {
//       r.systolic = t.value;
//       r.diastolic = t.value2;
//     }
//   });
//   return r;
// };

// /* ================= COMPONENTS ================= */


// export default function CampDashboard() {
//   const navigate = useNavigate();
//   const [camps, setCamps] = useState([]);
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [partnerList, setPartnerList] = useState([]);
//   const [volunteers, setVolunteers] = useState([]);

//   // Filters
//   const [selectedCampId, setSelectedCampId] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [currentPatient, setCurrentPatient] = useState(null);
//   const [copied, setCopied] = useState(false);
//   const [downloadLink, setDownloadLink] = useState("");
//   const [generatedReportFile, setGeneratedReportFile] = useState(null);



//   // Modal State
//   const [viewCamp, setViewCamp] = useState(null);
//   const [showCampModal, setShowCampModal] = useState(false);
//   const [campForm, setCampForm] = useState({
//     name: "",
//     location: "",
//     address: "",
//     date: "",
//     time: "",
//     volunteers: [],
//     partners: []
//   });

//   // Refs for scrolling
//   const campsSectionRef = useRef(null);
//   const patientsSectionRef = useRef(null);

//   const scrollToSection = (ref) => {
//     ref.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   /* -------- FETCH DATA -------- */
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const role = localStorage.getItem("role");
//         const userDataStr = localStorage.getItem("userData");
//         const partnerId = localStorage.getItem("userId") || (userDataStr ? JSON.parse(userDataStr).id : null);

//         const [campsRes, patientsRes, employeesRes, partnersRes] = await Promise.all([
//           role === "partner" && partnerId
//             ? axios.get(`${API_BASE}/camps/assigned-camps/${partnerId}`).catch(() => ({ data: [] }))
//             : axios.get(`${API_BASE}/camps/allcamps`).catch(() => ({ data: [] })),
//           axios.get(`${API_BASE}/patients`).catch(() => ({ data: [] })),
//           axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] })),
//           axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }))
//         ]);

//         let finalCamps = campsRes.data || [];
//         setCamps(sortCampsByStatus(finalCamps));

//         // If partner, further filter patients to only those in their assigned camps
//         let allPatients = patientsRes.data || [];
//         if (role === "partner" && partnerId) {
//           const assignedIds = finalCamps.map(c => String(c._id));
//           allPatients = allPatients.filter(p => p.campId && assignedIds.includes(String(p.campId?._id || p.campId)));
//         }
//         setPatients(allPatients);

//         // Filter volunteers from external backend
//         const empData = employeesRes.data || [];
//         const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];

//         // Filter by departments: Laboratory Medicine, Nursing, Medical
//         const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
//         const filteredVolunteers = allEmployees.filter(emp => {
//           const dept = (emp.department || "").trim();
//           return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
//         });

//         setVolunteers(filteredVolunteers);
//         setPartnerList(Array.isArray(partnersRes.data) ? partnersRes.data : []);
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
//         if (String(p.campId?._id) !== String(selectedCampId)) return false;
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

//   // Calculate Status Counts using centralized utility
//   const activeCampsCount = camps.filter(c => {
//     const { status } = getCampStatus(c.date, c.time);
//     return status === 'live' || status === 'today';
//   }).length;

//   const upcomingCampsCount = camps.filter(c => {
//     const { status } = getCampStatus(c.date, c.time);
//     return status === 'upcoming';
//   }).length;

//   const campsWithCount = useMemo(() => {
//     return camps.map(c => {
//       const count = patients.filter(
//         p => String(p.campId?._id) === String(c._id)
//       ).length;
//       return { ...c, count };
//     });
//   }, [camps, patients]);

//   /* -------- VIEW MODAL HELPERS -------- */

//   const viewCampPatients = useMemo(() => {
//     if (!viewCamp) return [];
//     return patients.filter(p => String(p.campId?._id || p.campId) === String(viewCamp._id));
//   }, [viewCamp, patients]);

//   const handleDownloadCampCSV = () => {
//     if (!viewCamp || viewCampPatients.length === 0) {
//       alert("No data to download");
//       return;
//     }

//     const headers = ["Patient Name", "Age", "Gender", "Contact", "Camp Name", "Date", "Location", "BMI", "BP (Sys/Dia)", "Sugar"];
//     const rows = viewCampPatients.map(p => {
//       // Find latest vitals if tests exist
//       let bmi = "-", bp = "-", sugar = "-";
//       if (p.tests && p.tests.length > 0) {
//         // Sort by date desc
//         const sortedTests = [...p.tests].sort((a, b) => new Date(b.date) - new Date(a.date));

//         // Iterate to find specific values
//         const weight = p.tests.find(t => t.type === 'weight')?.value;
//         const height = p.tests.find(t => t.type === 'height')?.value;
//         if (weight && height) {
//           const hM = height / 100;
//           bmi = (weight / (hM * hM)).toFixed(1);
//         }

//         const bpTest = p.tests.find(t => t.type === 'bp');
//         if (bpTest) bp = `${bpTest.value}/${bpTest.value2}`;

//         const sugarTest = p.tests.find(t => t.type === 'sugar');
//         if (sugarTest) sugar = `${sugarTest.value} (${sugarTest.type || 'Random'})`;
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

//   const uploadPdfToServer = async (patientData, testsData, bmiData) => {
//     // 1️⃣ Generate raw PDF
//     const rawPdf = await generateMedicalReportFile(
//       patientData,
//       testsData,
//       bmiData
//     );

//     // 2️⃣ Convert to proper PDF Blob
//     const pdfBlob = new Blob([rawPdf], {
//       type: "application/pdf"
//     });

//     // 3️⃣ Upload
//     const formData = new FormData();
//     formData.append("file", pdfBlob, "health-report.pdf");

//     const res = await axios.post(
//       `${config.API_BASE_URL}/reports/upload`,
//       formData,
//       { headers: { "Content-Type": "multipart/form-data" } }
//     );

//     return res.data.downloadLink;
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

//       const data = await prepareReportData(patient._id);
//       if (!data) return;

//       const publicLink = await uploadPdfToServer(
//         data.patientData,
//         data.testsData,
//         data.bmiData
//       );

//       const message = `*Health Checkup Report* 🩺\n\nHello ${patient.name},\nYour medical health report is ready.\n\n📄 Download Report:\n${publicLink}\n\n(Generated by BIM Medical)`;

//       setDownloadLink(message);
//       setShowShareModal(true);

//     } catch (err) {
//       console.error("UPLOAD ERROR 👉", err.response?.data || err.message);
//       alert("Failed to generate sharing link");
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
//     const urlMatch = downloadLink.match(/https?:\/\/[^\s]+/);
//     if (urlMatch) {
//       navigator.clipboard.writeText(urlMatch[0]);
//       alert("Download link copied to clipboard!");
//     }
//   };

//   /* -------- BULK ZIP DOWNLOAD -------- */
//   const handleBulkDownload = async () => {
//     if (selectedCampId === "all") {
//       alert("Please select a specific camp to download reports.");
//       return;
//     }

//     const campPatients = patients.filter(p => String(p.campId?._id) === String(selectedCampId));

//     if (campPatients.length === 0) {
//       alert("No patients found in this camp.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const zip = new JSZip();
//       const selectedCamp = camps.find(c => String(c._id) === String(selectedCampId));
//       const campName = selectedCamp?.name || "Camp";

//       // Generate PDFs for all patients
//       for (let i = 0; i < campPatients.length; i++) {
//         const patient = campPatients[i];

//         try {
//           const data = await prepareReportData(patient._id);
//           if (data) {
//             const pdfBlob = await generateMedicalReportFile(
//               data.patientData,
//               data.testsData,
//               data.bmiData
//             );

//             // Add PDF to ZIP with patient name and ID
//             const fileName = `${patient.name.replace(/[^a-z0-9]/gi, '_')}_${patient._id.slice(-6)}.pdf`;
//             zip.file(fileName, pdfBlob);
//           }
//         } catch (err) {
//           console.error(`Failed to generate report for ${patient.name}:`, err);
//         }
//       }

//       // Generate and download ZIP file
//       const zipBlob = await zip.generateAsync({ type: "blob" });
//       const url = URL.createObjectURL(zipBlob);
//       const link = document.createElement("a");
//       link.href = url;
//       const date = new Date().toISOString().split('T')[0];
//       link.download = `${campName.replace(/[^a-z0-9]/gi, '_')}_Reports_${date}.zip`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);

//       alert(`Successfully downloaded ${campPatients.length} patient reports!`);
//     } catch (err) {
//       console.error("Bulk download error:", err);
//       alert("Failed to generate ZIP file. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddVolunteer = (e) => {
//     const val = e.target.value;
//     if (!val) return;
//     if (!campForm.volunteers.includes(val)) {
//       setCampForm({
//         ...campForm,
//         volunteers: [...campForm.volunteers, val]
//       });
//     }
//   };

//   const handleRemoveVolunteer = (name) => {
//     setCampForm({
//       ...campForm,
//       volunteers: campForm.volunteers.filter(v => v !== name)
//     });
//   };

//   const handleAddPartner = (e) => {
//     const partnerId = e.target.value;
//     if (!partnerId) return;
//     if (!campForm.partners.includes(partnerId)) {
//       setCampForm({
//         ...campForm,
//         partners: [...campForm.partners, partnerId]
//       });
//     }
//   };

//   const handleRemovePartner = (id) => {
//     setCampForm({
//       ...campForm,
//       partners: campForm.partners.filter(p => p !== id)
//     });
//   };

//   const handleCreateCamp = async () => {
//     try {
//       await axios.post(`${API_BASE}/camps/addcamp`, campForm);
//       alert("✅ Camp created successfully");
//       setShowCampModal(false);
//       setCampForm({
//         name: "",
//         location: "",
//         address: "",
//         date: "",
//         time: "",
//         volunteers: [],
//         partners: []
//       });
//       // camps list refresh
//       const res = await axios.get(`${API_BASE}/camps/allcamps`);
//       setCamps(sortCampsByStatus(res.data)); // Apply sorting here too
//     } catch (err) {
//       console.error("CREATE CAMP ERROR", err);
//       alert("❌ Failed to create camp");
//     }
//   };

//   return (
//     <div className="admin-dash">
//       {/* Header */}
//       <div className="admin-dash__header">
//         <div>
//           <h1 className="admin-dash__greeting">
//             Camp <span>Dashboard</span>
//           </h1>
//           <p className="admin-dash__subtitle">
//             Manage health camps, participants, and reports in one place.
//           </p>
//         </div>
//         <div className="admin-dash__date-pill">
//           <FiCalendar />
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

//       {/* Top Summary Stats */}
//       <div className="admin-dash__stats">
//         <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Total Camps</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
//               <FiMapPin />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">{totalCamps}</div>
//           <div className="admin-dash__stat-meta">health camps</div>
//         </div>
//         <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Active Camps</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
//               <FiActivity />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">{activeCampsCount}</div>
//           <div className="admin-dash__stat-meta">currently running</div>
//         </div>
//         <div className="admin-dash__stat" onClick={() => scrollToSection(patientsSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Total Patients</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
//               <FiUsers />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">{totalPatients}</div>
//           <div className="admin-dash__stat-meta">total patients</div>
//         </div>
//         <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Upcoming</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
//               <FiCalendar />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">{upcomingCampsCount}</div>
//           <div className="admin-dash__stat-meta">scheduled camps</div>
//         </div>
//         <div className="admin-dash__stat">
//           <div className="admin-dash__stat-top">
//             <span className="admin-dash__stat-label">Partners</span>
//             <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
//               <FiUserCheck />
//             </div>
//           </div>
//           <div className="admin-dash__stat-value">{partnerList.length}</div>
//           <div className="admin-dash__stat-meta">registered partners</div>
//         </div>
//       </div>

//       {/* Camps Section */}
//       <div ref={campsSectionRef} className="admin-dash__card">
//         <div className="admin-dash__card-header">
//           <h3 className="admin-dash__card-title">All Camps</h3>
//           <div className="flex items-center gap-3">
//             <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
//               {activeCampsCount} Active
//             </span>
//             <button
//               onClick={() => setSelectedCampId("all")}
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
//             >
//               All Camps Data
//             </button>
//             <button
//               onClick={() => setShowCampModal(true)}
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
//             >
//               <FiCalendar size={14} />
//               Create Camp
//             </button>
//           </div>
//         </div>
//         <div className="admin-dash__card-body">
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//             {campsWithCount.map(camp => (
//               <div
//                 key={camp._id}
//                 onClick={() => {
//                   setSelectedCampId(camp._id);
//                   scrollToSection(patientsSectionRef);
//                 }}
//                 className={`cursor-pointer p-4 rounded-2xl border transition-all
//           ${selectedCampId === camp._id
//                   ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
//                   : "bg-white hover:border-indigo-300 hover:shadow-md"
//                 }`}
//               >
//                 <div className="flex items-center justify-between gap-2 mb-1">
//                   <h4 className="font-bold truncate">{camp.name}</h4>
//                   <CampStatusBadge date={camp.date} time={camp.time} />
//                 </div>

//                 <div className={`mt-2 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                   <FiMapPin size={14} />
//                   <span className="truncate">{camp.location}</span>
//                 </div>

//                 <div className={`mt-1 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                   <FiCalendar size={14} />
//                   <span>{camp.date || "No date"}</span>
//                 </div>

//                 <div className={`mt-1 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
//                   <FiClock size={14} />
//                   <span>{camp.time || "No time"}</span>
//                 </div>

//                 <VolunteerDisplay
//                   volunteers={camp.volunteers}
//                   isSelected={selectedCampId === camp._id}
//                 />

//                 <PartnerDisplay
//                   partners={camp.partners}
//                   isSelected={selectedCampId === camp._id}
//                 />

//                 <span className={`inline-block mt-3 text-xs font-bold px-2 py-1 rounded-lg ${selectedCampId === camp._id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
//                   {camp.count} Patients
//                 </span>

//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setViewCamp(camp);
//                   }}
//                   className="float-right mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
//                 >
//                   <FiEye size={12} /> View
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Patients Section */}
//       <div ref={patientsSectionRef} className="admin-dash__card">
//         <div className="admin-dash__card-header">
//           <h3 className="admin-dash__card-title">Participants</h3>
//           <div className="flex items-center gap-3">
//             <div className="relative w-full sm:w-72">
//               <FiSearch
//                 size={18}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               />
//               <input
//                 type="text"
//                 placeholder="Search by name, phone or camp..."
//                 className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <FiFilter size={16} />
//               <span>Showing {filteredPatients.length} participants</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => navigate("/add-patient", { state: { campId: selectedCampId } })}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700"
//               >
//                 <FiPlus size={16} />
//                 Add Patient
//               </button>
//               <button
//                 onClick={handleBulkDownload}
//                 disabled={selectedCampId === "all" || loading}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <FiDownload size={16} />
//                 {loading ? "Generating..." : "Download ZIP"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Table Container */}
//         <div className="admin-dash__card-body p-0">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead>
//                 <tr className="border-b border-gray-100 bg-gray-50/50">
//                   <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
//                   <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
//                   <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
//                   <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Reports</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {loading ? (
//                   <tr>
//                     <td colSpan={4} className="p-8 text-center text-gray-500">
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="w-6 h-6 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
//                         <span>Loading participants...</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : filteredPatients.length > 0 ? (
//                   filteredPatients.map((patient) => (
//                     <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
//                       <td className="p-4">
//                         <div className="flex items-center gap-3">
//                           <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
//                             {patient.name?.charAt(0)?.toUpperCase()}
//                           </div>
//                           <div>
//                             <p className="font-semibold text-gray-900">{patient.name}</p>
//                             <p className="text-xs text-gray-500">{patient.age} Y • {patient.gender}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <span className="text-sm font-medium text-gray-700">{patient.contact || "N/A"}</span>
//                       </td>
//                       <td className="p-4">
//                         <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
//                           {patient.campId?.name || "N/A"}
//                         </span>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <button onClick={() => viewReport(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
//                             <FiEye size={14} /> View
//                           </button>
//                           <button onClick={() => navigate(`/patient/${patient._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
//                             <FiEdit size={14} /> Edit
//                           </button>
//                           <button onClick={() => downloadPDF(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
//                             <FiFileText size={14} /> Download
//                           </button>
//                           <button onClick={() => shareReport(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
//                             <FiMessageCircle size={14} /> WhatsApp
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={4} className="p-12 text-center">
//                       <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
//                         <FiUsers size={48} className="opacity-20" />
//                         <p className="text-lg font-medium">No participants found</p>
//                         <p className="text-sm">Try adjusting your search or filters.</p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Share Modal */}
//       {showShareModal && currentPatient && (
//         createPortal(
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
//             <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl animate-scale-in">
//               <div className="p-6 text-center text-white bg-green-600">
//                 <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
//                   <FiMessageCircle size={32} />
//                 </div>
//                 <h3 className="text-xl font-bold">Share Report on WhatsApp</h3>
//                 <p className="mt-1 text-sm text-green-100">Download link generated successfully!</p>
//               </div>
//               <div className="p-6 space-y-6">
//                 <div className="p-4 bg-gray-50 rounded-2xl">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-green-700 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
//                       {currentPatient.name.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="font-bold text-gray-900">{currentPatient.name}</p>
//                       <p className="text-sm text-gray-600">{currentPatient.contact || "No phone number"} • {currentPatient.age} Y</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="p-4 border-2 border-green-200 border-dashed rounded-2xl bg-green-50/50">
//                   <p className="mb-2 text-sm font-bold text-green-800">📄 WhatsApp Message Preview:</p>
//                   <div className="p-3 overflow-y-auto bg-white border border-green-100 rounded-lg max-h-40">
//                     <pre className="text-xs text-gray-700 whitespace-pre-wrap">{downloadLink}</pre>
//                   </div>
//                   <p className="mt-2 text-xs text-gray-500">Patient will receive this message with a clickable download link.</p>
//                 </div>
//                 <div className="space-y-3">
//                   <button onClick={handleWhatsAppShare} className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
//                     <FiMessageCircle size={18} /> Open WhatsApp with Message
//                   </button>
//                   <button onClick={handleCopyMessage} className="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2">
//                     {copied ? <FiCheckCircle size={16} className="text-green-600" /> : <FiCopy size={16} />} {copied ? "Copied!" : "Copy Full Message"}
//                   </button>
//                   <button onClick={handleCopyLinkOnly} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
//                     <FiLink size={16} /> Copy Download Link Only
//                   </button>
//                   <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600">
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>, document.body)
//         )}

//       {/* Create Camp Modal */}
//       {showCampModal && createPortal(
//         <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
//           <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
//             <div className="p-6 border-b border-gray-100">
//               <div className="flex items-center justify-between mb-2">
//                 <h2 className="text-xl font-bold text-gray-800">Create New Camp</h2>
//                 <button onClick={() => setShowCampModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
//                   <FiX size={20} />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//               <input className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="Camp Name" value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} />
//               <input className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="Location" value={campForm.location} onChange={e => setCampForm({ ...campForm, location: e.target.value })} />
//               <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={campForm.date} onChange={e => setCampForm({ ...campForm, date: e.target.value })} />
//               <input className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="Time" value={campForm.time} onChange={e => setCampForm({ ...campForm, time: e.target.value })} />

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">Select Volunteers</label>
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {campForm.volunteers.map((vol, idx) => (
//                     <span key={idx} className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-700 bg-indigo-100 rounded-full">
//                       {vol} <button onClick={() => handleRemoveVolunteer(vol)} className="ml-1 text-indigo-500 hover:text-indigo-900">&times;</button>
//                     </span>
//                   ))}
//                 </div>
//                 <select className="w-full px-4 py-2 border rounded-xl bg-white" value="" onChange={handleAddVolunteer}>
//                   <option value="">+ Add Volunteer</option>
//                   {volunteers.map(vol => (
//                     <option key={vol._id} value={vol.name}>{vol.name} ({vol.designation || vol.role || "Staff"})</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">Assign Partners (Doctors)</label>
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {campForm.partners.map(partnerId => {
//                     const partner = partnerList.find(p => p._id === partnerId);
//                     return partner ? (
//                       <span key={partnerId} className="flex items-center gap-1 px-3 py-1 text-sm text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
//                         {partner.clinicName || partner.name} <button onClick={() => handleRemovePartner(partnerId)} className="ml-1 text-emerald-500 hover:text-emerald-900">&times;</button>
//                       </span>
//                     ) : null;
//                   })}
//                 </div>
//                 <select className="w-full px-4 py-2 border rounded-xl bg-white" value="" onChange={handleAddPartner}>
//                   <option value="">+ Assign Partner</option>
//                   {partnerList.map(partner => (
//                     <option key={partner._id} value={partner._id}>{partner.clinicName || partner.name} ({partner.email})</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
//               <button onClick={() => setShowCampModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
//               <button onClick={handleCreateCamp} className="px-4 py-2 text-white bg-green-600 rounded-xl font-bold hover:bg-green-700">Create Camp</button>
//             </div>
//           </div>
//         </div>, document.body
//       )}
//       {/* View Camp Modal */}
//       {viewCamp && createPortal(
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
//             {/* Header */}
//             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//               <div>
//                 <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
//                 <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
//                   <div className="flex items-center gap-1.5">
//                     <FiMapPin size={14} className="text-indigo-500" />
//                     <span>{viewCamp.location}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <FiCalendar size={14} className="text-indigo-500" />
//                     <span>{viewCamp.date}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <FiClock size={14} className="text-indigo-500" />
//                     <span>{viewCamp.time}</span>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setViewCamp(null)}
//                 className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm"
//               >
//                 <FiX size={16} />
//               </button>
//             </div>

//             {/* Toolbar */}
//             <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
//               <div className="flex items-center gap-2">
//                 <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
//                   {viewCampPatients.length} Participants
//                 </span>
//                 <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
//               </div>

//               <button
//                 onClick={handleDownloadCampCSV}
//                 className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
//               >
//                 <FiFileText size={16} />
//                 Download Report
//               </button>
//             </div>

//             {/* Table */}
//             <div className="overflow-auto flex-1 p-0">
//               <table className="w-full text-left border-collapse">
//                 <thead className="bg-gray-50 sticky top-0 z-10">
//                   <tr>
//                     <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Patient Name</th>
//                     <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contact</th>
//                     <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Age / Gender</th>
//                     <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Health Check</th>
//                     <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50">
//                   {viewCampPatients.length > 0 ? (
//                     viewCampPatients.map(patient => (
//                       <tr key={patient._id} className="hover:bg-gray-50/80 transition-colors">
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
//                               {patient.name.charAt(0).toUpperCase()}
//                             </div>
//                             <span className="font-semibold text-gray-900">{patient.name}</span>
//                           </div>
//                         </td>
//                         <td className="p-4 text-sm text-gray-600 font-medium font-mono">{patient.contact}</td>
//                         <td className="p-4 text-sm text-gray-500">
//                           {patient.age} Y <span className="mx-1">•</span> {patient.gender}
//                         </td>
//                         <td className="p-4">
//                           {patient.tests && patient.tests.length > 0 ? (
//                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
//                               <FiCheckCircle size={12} /> Screened
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-400 text-xs font-bold border border-gray-200">
//                               Pending
//                             </span>
//                           )}
//                         </td>
//                         <td className="p-4 text-right">
//                           <div className="flex items-center justify-end gap-2">
//                             <button
//                               onClick={() => navigate(`/patient/${patient._id}`)}
//                               className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
//                             >
//                               View Details <FiChevronRight size={12} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={5} className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
//                         <FiUsers size={32} className="opacity-20" />
//                         <span className="text-sm font-medium">No patients found in this camp yet.</span>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Footer */}
//             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
//               <button
//                 onClick={() => setViewCamp(null)}
//                 className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm"
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
// }


import axios from "axios";
import JSZip from "jszip";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiActivity,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiCopy,
  FiEye,
  FiFileText,
  FiFilter,
  FiLink,
  FiMapPin,
  FiMessageCircle,
  FiPlus,
  FiSearch,
  FiUsers,
  FiEdit,
  FiChevronRight,
  FiX,
  FiDownload,
  FiUserCheck,
  FiUser,
  FiBriefcase,
  FiInfo,
  FiPlusCircle,
  FiTrash2,
  FiEyeOff,
  FiEye as FiEyeShow,
  FiArchive,
  FiSave,
  FiArrowLeft
} from "react-icons/fi";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
import config from "../config";
import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";
import VolunteerDisplay from "../components/VolunteerDisplay";
import PartnerDisplay from "../components/PartnerDisplay";
import "./Dashboard.css";

const API_BASE = config.API_BASE_URL;

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

const salutationOptions = [
  { value: "", label: "Select Salutation" },
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Dr.", label: "Dr." },
  { value: "M/s", label: "M/s" },
  { value: "Mast.", label: "Mast." },
  { value: "Miss", label: "Miss" },
  { value: "N/A", label: "N/A" }
];

export default function CampDashboard() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [createdCamps, setCreatedCamps] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerList, setPartnerList] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const [hiddenCamps, setHiddenCamps] = useState([]);
  const [showHiddenModal, setShowHiddenModal] = useState(false);
  
  const [campViewFilter, setCampViewFilter] = useState("active");

  const [statsModal, setStatsModal] = useState({
    show: false,
    title: "",
    data: [],
    type: ""
  });

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [addPatientLoading, setAddPatientLoading] = useState(false);
  const [addPatientForm, setAddPatientForm] = useState({
    salutation: "",
    name: "",
    age: "",
    gender: "female",
    contact: "",
    address: "",
    campId: ""
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedCampId, setSelectedCampId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("assigned");
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [generatedReportFile, setGeneratedReportFile] = useState(null);

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
  const [editingCamp, setEditingCamp] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const campsSectionRef = useRef(null);
  const patientsSectionRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const role = localStorage.getItem("role");
        const userDataStr = localStorage.getItem("userData");
        const partnerId = localStorage.getItem("userId") || (userDataStr ? JSON.parse(userDataStr).id : null);
        
        setCurrentUserRole(role);
        setCurrentUserId(partnerId);

        console.log("🔍 Current User:", { role, partnerId });

        const allRes = await axios.get(`${API_BASE}/camps/allcamps`).catch(() => ({ data: [] }));
        let allCampsData = allRes.data || [];
        if (!Array.isArray(allCampsData)) {
          allCampsData = allCampsData.data || allCampsData.camps || [];
          if (!Array.isArray(allCampsData)) allCampsData = [];
        }
        console.log(`📦 Total Camps: ${allCampsData.length}`);

        let archivedCount = 0;
        const now = new Date();
        
        for (const camp of allCampsData) {
          if (camp.isHidden) continue;
          
          let campDate = camp.createdAt || camp.date;
          if (!campDate) continue;
          
          if (typeof campDate === 'object' && campDate.$date) {
            campDate = campDate.$date;
          }
          
          const created = new Date(campDate);
          if (isNaN(created.getTime())) continue;
          
          const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 10) {
            try {
              await axios.put(`${API_BASE}/camps/hide-camp/${camp._id}`, { isHidden: true });
              console.log(`🔒 AUTO-ARCHIVED: ${camp.name} (${diffDays} days old)`);
              archivedCount++;
            } catch (err) {
              console.error(`❌ Failed to auto-hide ${camp.name}:`, err.response?.data || err.message);
            }
          }
        }

        if (archivedCount > 0) {
          console.log(`✅ Auto-archived ${archivedCount} camps older than 10 days`);
        }

        const updatedRes = await axios.get(`${API_BASE}/camps/allcamps`).catch(() => ({ data: [] }));
        let updatedCampsData = updatedRes.data || [];
        if (!Array.isArray(updatedCampsData)) {
          updatedCampsData = updatedCampsData.data || updatedCampsData.camps || [];
          if (!Array.isArray(updatedCampsData)) updatedCampsData = [];
        }

        const finalHidden = updatedCampsData.filter(camp => camp.isHidden === true);
        const finalVisible = updatedCampsData.filter(camp => !camp.isHidden);

        console.log(`📊 Total: ${updatedCampsData.length}, Archived: ${finalHidden.length}, Active: ${finalVisible.length}`);
        setHiddenCamps(finalHidden);

        let assignedCampsData = [];
        let createdCampsData = [];
        
        if (role === "partner" && partnerId) {
          assignedCampsData = finalVisible.filter(camp => {
            const assignedPartnerId = camp.assignedPartner?._id || camp.assignedPartner;
            const isAssigned = assignedPartnerId && String(assignedPartnerId) === String(partnerId);
            const isInPartners = camp.partners && camp.partners.some(p => {
              const pId = p?._id || p?.partnerId?._id || p?.partnerId || p;
              return String(pId) === String(partnerId);
            });
            return isAssigned || isInPartners;
          });
          
          createdCampsData = finalVisible.filter(camp => {
            const campCreatedBy = camp.createdBy?._id || camp.createdBy;
            return String(campCreatedBy) === String(partnerId) && camp.creatorRole === "partner";
          });
        } else {
          assignedCampsData = finalVisible;
        }

        setCamps(sortCampsByStatus(assignedCampsData));
        setCreatedCamps(createdCampsData);

        const patientsRes = await axios.get(`${API_BASE}/patients`).catch(() => ({ data: [] }));
        let allPatients = patientsRes.data || [];
        if (!Array.isArray(allPatients)) {
          allPatients = allPatients.data || allPatients.patients || [];
          if (!Array.isArray(allPatients)) allPatients = [];
        }
        
        if (role === "partner" && partnerId) {
          const assignedIds = assignedCampsData.map(c => String(c._id));
          const createdIds = createdCampsData.map(c => String(c._id));
          const allIds = [...assignedIds, ...createdIds];
          allPatients = allPatients.filter(p => p.campId && allIds.includes(String(p.campId?._id || p.campId)));
        }
        setPatients(allPatients);

        const empMap = {};
        let allVolunteersList = [];

        const employeesRes = await axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
        const empData = employeesRes.data || [];
        const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
        
        allEmployees.forEach(emp => {
          empMap[String(emp._id)] = emp.name;
        });

        const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
        const filteredEmployees = allEmployees.filter(emp => {
          const dept = (emp.department || "").trim();
          return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
        });
        
        allVolunteersList = [...filteredEmployees];

        const partnersRes = await axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }));
        let partnersData = partnersRes.data || [];
        if (!Array.isArray(partnersData)) {
          partnersData = partnersData.data || partnersData.partners || [];
          if (!Array.isArray(partnersData)) partnersData = [];
        }
        setPartnerList(partnersData);

        for (const partner of partnersData) {
          try {
            const partnerVolRes = await axios.get(`${API_BASE}/volunteers/partner-volunteers/${partner._id}`).catch(() => ({ data: [] }));
            let pvData = partnerVolRes.data || [];
            if (!Array.isArray(pvData)) {
              pvData = pvData.volunteers || pvData.data || [];
              if (!Array.isArray(pvData)) pvData = [];
            }
            
            pvData.forEach(pv => {
              if (pv._id) {
                empMap[String(pv._id)] = pv.name || 'Unknown Volunteer';
              }
              const exists = allVolunteersList.some(v => String(v._id) === String(pv._id));
              if (!exists) {
                allVolunteersList.push({
                  _id: pv._id,
                  name: pv.name || 'Unknown Volunteer',
                  designation: pv.designation || 'Volunteer',
                  email: pv.email || '',
                  phone: pv.phone || '',
                  source: 'partner'
                });
              }
            });
            
            console.log(`✅ Partner volunteers for ${partner.name || partner.clinicName}: ${pvData.length}`);
          } catch (err) {
            console.log(`⚠️ No volunteers for partner ${partner._id}`);
          }
        }

        setEmployeeMap(empMap);
        setVolunteers(allVolunteersList);
        
        console.log(`✅ Total Volunteers (Employees + Partner): ${allVolunteersList.length}`);

      } catch (err) {
        console.error("Failed to fetch data", err);
        setCamps([]);
        setCreatedCamps([]);
        setPatients([]);
        setVolunteers([]);
        setPartnerList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHideCamp = async (campId) => {
    if (!window.confirm("Are you sure you want to hide this camp? It will be moved to hidden.")) return;
    try {
      await axios.put(`${API_BASE}/camps/hide-camp/${campId}`, { isHidden: true });
      alert("✅ Camp hidden successfully");
      window.location.reload();
    } catch (err) {
      console.error("Hide camp error:", err);
      alert("❌ Failed to hide camp: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUnhideCamp = async (campId) => {
    if (!window.confirm("Are you sure you want to restore this camp?")) return;
    try {
      await axios.put(`${API_BASE}/camps/unhide-camp/${campId}`, { isHidden: false });
      alert("✅ Camp restored successfully");
      setShowHiddenModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Restore camp error:", err);
      alert("❌ Failed to restore camp: " + (err.response?.data?.message || err.message));
    }
  };

  const handleManualArchive = async () => {
    if (!window.confirm("Are you sure you want to hide all camps older than 10 days?")) return;
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/camps/archive-old-camps`, { days: 10 });
      alert(`✅ ${response.data.message}`);
      window.location.reload();
    } catch (err) {
      console.error("Manual hide error:", err);
      alert("❌ Failed to hide old camps: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (target, type) => {
    setDeleteTarget(target);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleteType("");
    setIsDeleting(false);
  };

  const confirmDeletePatient = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/patients/${deleteTarget._id}`);
      alert("✅ Patient deleted successfully!");
      
      const patientsRes = await axios.get(`${API_BASE}/patients`).catch(() => ({ data: [] }));
      let allPatients = patientsRes.data || [];
      if (!Array.isArray(allPatients)) {
        allPatients = allPatients.data || allPatients.patients || [];
        if (!Array.isArray(allPatients)) allPatients = [];
      }
      
      if (currentUserRole === "partner" && currentUserId) {
        const allIds = camps.map(c => String(c._id));
        allPatients = allPatients.filter(p => p.campId && allIds.includes(String(p.campId?._id || p.campId)));
      }
      setPatients(allPatients);
      
      closeDeleteModal();
    } catch (err) {
      console.error("Delete patient error:", err);
      alert("❌ Failed to delete patient: " + (err.response?.data?.message || err.message));
      setIsDeleting(false);
    }
  };

  const confirmDeleteCamp = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      const endpoint = currentUserRole === "partner" 
        ? `${API_BASE}/camps/partner/delete-camp/${currentUserId}/${deleteTarget._id}`
        : `${API_BASE}/camps/delete-camp/${deleteTarget._id}`;
      
      await axios.delete(endpoint);
      alert("✅ Camp deleted successfully!");
      
      window.location.reload();
    } catch (err) {
      console.error("Delete camp error:", err);
      alert("❌ Failed to delete camp: " + (err.response?.data?.message || err.message));
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteType === "patient") {
      confirmDeletePatient();
    } else if (deleteType === "camp") {
      confirmDeleteCamp();
    }
  };

  const handleAddPatientChange = (e) => {
    const { name, value } = e.target;
    setAddPatientForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();

    if (!addPatientForm.campId) {
      alert("Please select a camp");
      return;
    }

    if (!addPatientForm.name) {
      alert("Please enter patient name");
      return;
    }

    if (!addPatientForm.contact) {
      alert("Please enter WhatsApp number");
      return;
    }

    if (!addPatientForm.age) {
      alert("Please enter age");
      return;
    }

    try {
      setAddPatientLoading(true);
      await axios.post(`${API_BASE}/patients`, addPatientForm);
      alert("✅ Patient added successfully!");
      setShowAddPatientModal(false);
      
      setAddPatientForm({
        salutation: "",
        name: "",
        age: "",
        gender: "female",
        contact: "",
        address: "",
        campId: ""
      });
      
      const patientsRes = await axios.get(`${API_BASE}/patients`).catch(() => ({ data: [] }));
      let allPatients = patientsRes.data || [];
      if (!Array.isArray(allPatients)) {
        allPatients = allPatients.data || allPatients.patients || [];
        if (!Array.isArray(allPatients)) allPatients = [];
      }
      
      if (currentUserRole === "partner" && currentUserId) {
        const allIds = camps.map(c => String(c._id));
        allPatients = allPatients.filter(p => p.campId && allIds.includes(String(p.campId?._id || p.campId)));
      }
      setPatients(allPatients);
      
    } catch (err) {
      console.error("Add patient error:", err);
      alert("❌ Failed to add patient: " + (err.response?.data?.message || err.message));
    } finally {
      setAddPatientLoading(false);
    }
  };

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

  const allCamps = useMemo(() => {
    if (currentUserRole === "partner") {
      const map = new Map();
      [...camps, ...createdCamps, ...hiddenCamps].forEach(camp => {
        if (camp && camp._id) {
          map.set(String(camp._id), camp);
        }
      });
      return Array.from(map.values());
    }
    return [...camps, ...hiddenCamps];
  }, [camps, createdCamps, hiddenCamps, currentUserRole]);

  const displayCamps = useMemo(() => {
    let baseCamps = [];
    
    if (currentUserRole === "partner") {
      baseCamps = activeTab === "assigned" ? camps : createdCamps;
    } else {
      baseCamps = camps;
    }

    if (campViewFilter === "active") {
      return baseCamps.filter(camp => !camp.isHidden);
    } else {
      return baseCamps.filter(camp => camp.isHidden === true);
    }
  }, [camps, createdCamps, activeTab, currentUserRole, campViewFilter]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (selectedCampId !== "all") {
        if (String(p.campId?._id) !== String(selectedCampId)) return false;
      }
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

  const totalCamps = allCamps.length;
  const totalPatients = patients.length;
  const totalHiddenCamps = hiddenCamps.length;

  const activeCampsCount = allCamps.filter(c => {
    if (c.isHidden) return false;
    const { status } = getCampStatus(c.date, c.time);
    return status === 'live' || status === 'today';
  }).length;

  const upcomingCampsCount = allCamps.filter(c => {
    if (c.isHidden) return false;
    const { status } = getCampStatus(c.date, c.time);
    return status === 'upcoming';
  }).length;

  const campsWithCount = useMemo(() => {
    return displayCamps.map(c => {
      const count = patients.filter(
        p => String(p.campId?._id) === String(c._id)
      ).length;
      return { ...c, count };
    });
  }, [displayCamps, patients]);

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
    const rawPdf = await generateMedicalReportFile(
      patientData,
      testsData,
      bmiData
    );

    const pdfBlob = new Blob([rawPdf], {
      type: "application/pdf"
    });

    const formData = new FormData();
    formData.append("file", pdfBlob, "health-report.pdf");

    const res = await axios.post(
      `${config.API_BASE_URL}/reports/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data.downloadLink;
  };

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

      const message = `*Health Checkup Report* 🩺\n\nHello ${patient.name},\nYour medical health report is ready.\n\n📄 Download Report:\n${publicLink}\n\n(Generated by BIM Medical)`;

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
    const urlMatch = downloadLink.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      navigator.clipboard.writeText(urlMatch[0]);
      alert("Download link copied to clipboard!");
    }
  };

  const handleBulkDownload = async () => {
    if (selectedCampId === "all") {
      alert("Please select a specific camp to download reports.");
      return;
    }

    const campPatients = patients.filter(p => String(p.campId?._id) === String(selectedCampId));

    if (campPatients.length === 0) {
      alert("No patients found in this camp.");
      return;
    }

    try {
      setLoading(true);
      const zip = new JSZip();
      const selectedCamp = allCamps.find(c => String(c._id) === String(selectedCampId));
      const campName = selectedCamp?.name || "Camp";

      for (let i = 0; i < campPatients.length; i++) {
        const patient = campPatients[i];

        try {
          const data = await prepareReportData(patient._id);
          if (data) {
            const pdfBlob = await generateMedicalReportFile(
              data.patientData,
              data.testsData,
              data.bmiData
            );
            const fileName = `${patient.name.replace(/[^a-z0-9]/gi, '_')}_${patient._id.slice(-6)}.pdf`;
            zip.file(fileName, pdfBlob);
          }
        } catch (err) {
          console.error(`Failed to generate report for ${patient.name}:`, err);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `${campName.replace(/[^a-z0-9]/gi, '_')}_Reports_${date}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`Successfully downloaded ${campPatients.length} patient reports!`);
    } catch (err) {
      console.error("Bulk download error:", err);
      alert("Failed to generate ZIP file. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const handleAddPartner = (e) => {
    const val = e.target.value;
    if (!val) return;
    if (!campForm.partners.includes(val)) {
      setCampForm({
        ...campForm,
        partners: [...campForm.partners, val]
      });
    }
    e.target.value = "";
  };

  const handleRemovePartner = (partnerId) => {
    setCampForm({
      ...campForm,
      partners: campForm.partners.filter(id => id !== partnerId)
    });
  };

  const handleRemoveVolunteer = (name) => {
    setCampForm({
      ...campForm,
      volunteers: campForm.volunteers.filter(v => v !== name)
    });
  };

  const handleCreateCamp = async () => {
    try {
      if (!campForm.name || !campForm.location || !campForm.date || !campForm.time) {
        alert("Please fill all required fields (Name, Location, Date, Time)");
        return;
      }

      const formData = {
        name: campForm.name,
        location: campForm.location,
        address: campForm.address || "",
        date: campForm.date,
        time: campForm.time,
        createdBy: currentUserId,
        creatorRole: "partner",
        volunteers: campForm.volunteers || [],
        partners: campForm.partners || []
      };

      await axios.post(`${API_BASE}/camps/addcamp`, formData);
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
      window.location.reload();
    } catch (err) {
      console.error("CREATE CAMP ERROR", err);
      alert("❌ Failed to create camp: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateCamp = async () => {
    try {
      if (!editingCamp) return;
      
      const formData = {
        name: campForm.name,
        location: campForm.location,
        address: campForm.address || "",
        date: campForm.date,
        time: campForm.time,
        volunteers: campForm.volunteers || [],
        partners: campForm.partners || []
      };
      
      await axios.put(`${API_BASE}/camps/update-camp/${editingCamp._id}`, formData);
      alert("✅ Camp updated successfully");
      setShowEditModal(false);
      setEditingCamp(null);
      setCampForm({
        name: "",
        location: "",
        address: "",
        date: "",
        time: "",
        volunteers: [],
        partners: []
      });
      window.location.reload();
    } catch (err) {
      console.error("Update camp error:", err);
      alert("❌ Failed to update camp: " + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = (camp) => {
    setEditingCamp(camp);
    setCampForm({
      name: camp.name || "",
      location: camp.location || "",
      address: camp.address || "",
      date: camp.date || "",
      time: camp.time || "",
      volunteers: camp.volunteers || [],
      partners: camp.partners || []
    });
    setShowEditModal(true);
  };

  // ✅ FIXED: getPartnerName - Better partner name resolution
  const getPartnerName = (partnerId) => {
    if (!partnerId) return "Unknown Partner";
    
    if (typeof partnerId === 'object') {
      return partnerId.name || partnerId.partnerName || partnerId.clinicName || "Unknown Partner";
    }
    
    if (typeof partnerId === 'string' && !partnerId.match(/^[0-9a-fA-F]{24}$/)) {
      return partnerId;
    }
    
    const partner = partnerList.find(p => String(p._id) === String(partnerId));
    if (partner) {
      return partner.name || partner.partnerName || partner.clinicName || "Partner";
    }
    
    console.log(`⚠️ Partner not found in list: ${partnerId}`);
    return `Partner (${String(partnerId).slice(-6)})`;
  };

  const getVolunteerName = (id) => {
    if (!id) return "Unknown";
    if (typeof id === 'object') {
      return id.name || id.email || "Unknown";
    }
    if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) {
      return id;
    }
    return employeeMap[String(id)] || String(id);
  };

  // ✅ FIXED: getCreatorInfo - Shows proper creator name
  const getCreatorInfo = (camp) => {
    // For admin created camps
    if (camp.creatorRole === "admin") {
      let creatorName = "Admin";
      if (camp.createdBy) {
        if (typeof camp.createdBy === 'object') {
          creatorName = camp.createdBy.name || camp.createdBy.email || "Admin";
        } else if (typeof camp.createdBy === 'string') {
          if (camp.createdBy.match(/^[0-9a-fA-F]{24}$/)) {
            creatorName = "Admin";
          } else {
            creatorName = camp.createdBy;
          }
        }
      }
      return { 
        label: `Created by Admin: ${creatorName}`, 
        color: "bg-blue-100 text-blue-700" 
      };
    } 
    // For partner created camps
    else if (camp.creatorRole === "partner") {
      let partnerName = "Unknown Partner";
      const partnerId = camp.createdBy?._id || camp.createdBy;
      
      if (partnerId) {
        if (typeof partnerId === 'object') {
          partnerName = partnerId.name || partnerId.partnerName || partnerId.clinicName || "Partner";
        } else if (typeof partnerId === 'string') {
          if (partnerId.match(/^[0-9a-fA-F]{24}$/)) {
            const partner = partnerList.find(p => String(p._id) === String(partnerId));
            if (partner) {
              partnerName = partner.name || partner.partnerName || partner.clinicName || "Partner";
            } else {
              partnerName = `Partner (${partnerId.slice(-6)})`;
            }
          } else {
            partnerName = partnerId;
          }
        }
      }
      
      return { 
        label: `Created by Partner: ${partnerName}`,
        color: "bg-emerald-100 text-emerald-700"
      };
    }
    
    // Fallback for unknown - show as Admin
    return { 
      label: `Created by Admin`, 
      color: "bg-blue-100 text-blue-700" 
    };
  };

  const DeleteConfirmationModal = () => {
    if (!showDeleteModal) return null;

    const isPatient = deleteType === "patient";
    const name = deleteTarget?.name || deleteTarget?.patientName || "Unknown";

    return createPortal(
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeDeleteModal();
          }
        }}
      >
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
          <div className={`p-6 ${isPatient ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FiTrash2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Delete {isPatient ? 'Patient' : 'Camp'}</h3>
                <p className="text-sm text-red-100">This action cannot be undone</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-700 text-center py-4">
              Are you sure you want to delete <br />
              <strong className="text-red-600 text-lg">{name}</strong>?
            </p>
            {isPatient && deleteTarget?.contact && (
              <p className="text-xs text-gray-400 text-center">
                Phone: {deleteTarget.contact}
              </p>
            )}
            {!isPatient && deleteTarget?._id && (
              <p className="text-xs text-gray-400 text-center">
                Camp ID: {deleteTarget._id.slice(-6).toUpperCase()}
              </p>
            )}

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} className="inline mr-2" />
                    Delete {isPatient ? 'Patient' : 'Camp'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

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
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600">
            <div>
              <h3 className="text-xl font-bold text-white">{statsModal.title}</h3>
              <p className="text-sm text-purple-100">
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
                    {(statsModal.type === "camps" || statsModal.type === "active" || statsModal.type === "upcoming" || statsModal.type === "hidden") && (
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
                          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-100">
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
                      {(statsModal.type === "camps" || statsModal.type === "active" || statsModal.type === "upcoming" || statsModal.type === "hidden") && (
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
                              statsModal.type === "hidden" || item.isHidden 
                                ? "bg-purple-100 text-purple-700" 
                                : statsModal.type === "active" 
                                  ? "bg-green-100 text-green-700"
                                  : statsModal.type === "upcoming"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}>
                              {item.isHidden ? "Hidden" : 
                               statsModal.type === "active" ? "Active" :
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

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
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

  const HiddenCampsModal = () => {
    if (!showHiddenModal) return null;

    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowHiddenModal(false);
          }
        }}
      >
        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600">
            <div>
              <h3 className="text-xl font-bold text-white">Hidden Camps</h3>
              <p className="text-sm text-purple-100">
                {hiddenCamps.length} camps hidden (auto-hide after 10 days)
              </p>
            </div>
            <button
              onClick={() => setShowHiddenModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="overflow-auto flex-1 p-0">
            {hiddenCamps.length === 0 ? (
              <div className="text-center py-12">
                <FiArchive size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">No hidden camps found</p>
                <p className="text-sm text-gray-300 mt-1">Camps auto-hide after 10 days</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Camp Name</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Location</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Date</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Created</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Patients</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {hiddenCamps.map(camp => {
                    const patientCount = patients.filter(
                      p => String(p.campId?._id) === String(camp._id)
                    ).length;
                    
                    const createdDate = camp.createdAt ? new Date(camp.createdAt).toLocaleDateString() : 'N/A';
                    const daysOld = camp.createdAt ? 
                      Math.floor((new Date() - new Date(camp.createdAt)) / (1000 * 60 * 60 * 24)) : 0;

                    return (
                      <tr key={camp._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-100">
                              {camp.name?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <span className="font-semibold text-gray-900">{camp.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{camp.location || 'N/A'}</td>
                        <td className="p-4 text-sm text-gray-600">{camp.date || 'N/A'}</td>
                        <td className="p-4">
                          <span className="text-sm text-gray-600">{createdDate}</span>
                          <span className="block text-xs text-gray-400">{daysOld} days old</span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full">
                            {patientCount} patients
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setViewCamp(camp);
                                setShowHiddenModal(false);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            >
                              <FiEye size={14} /> View
                            </button>
                            <button
                              onClick={() => handleUnhideCamp(camp._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <FiEyeShow size={14} /> Restore
                            </button>
                            <button
                              onClick={() => openDeleteModal(camp, "camp")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            >
                              <FiTrash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={() => setShowHiddenModal(false)}
              className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dash">
      <div className="admin-dash__header">
        <div>
          <h1 className="admin-dash__greeting">
            Camp <span>Dashboard</span>
          </h1>
          <p className="admin-dash__subtitle">
            Manage health camps, participants, and reports in one place.
          </p>
          {currentUserRole === "partner" && (
            <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              <FiUserCheck size={14} />
              <span>Partner View - Showing your assigned and created camps</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
            onClick={handleManualArchive}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition shadow-lg shadow-orange-100"
            disabled={loading}
          >
            <FiEyeOff size={18} />
            {loading ? "Processing..." : "Hide Old"}
          </button>
          
          <button
            onClick={() => setShowHiddenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-100 relative"
          >
            <FiEyeOff size={18} />
            Hidden
            {totalHiddenCamps > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalHiddenCamps}
              </span>
            )}
          </button>
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
        <div 
          className="admin-dash__stat cursor-pointer" 
          onClick={() => openStatsModal("camps", "All Camps", allCamps)}
        >
          <div className="admin-dash__stat-top">
            <span className="admin-dash__stat-label">Total Camps</span>
            <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
              <FiMapPin />
            </div>
          </div>
          <div className="admin-dash__stat-value">{allCamps.length}</div>
          <div className="admin-dash__stat-meta">total camps</div>
        </div>

        <div 
          className="admin-dash__stat cursor-pointer" 
          onClick={() => openStatsModal("active", "Active Camps", allCamps.filter(c => !c.isHidden))}
        >
          <div className="admin-dash__stat-top">
            <span className="admin-dash__stat-label">Active Camps</span>
            <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
              <FiActivity />
            </div>
          </div>
          <div className="admin-dash__stat-value">{allCamps.filter(c => !c.isHidden).length}</div>
          <div className="admin-dash__stat-meta">active camps</div>
        </div>

        <div 
          className="admin-dash__stat cursor-pointer" 
          onClick={() => openStatsModal("patients", "All Patients", patients)}
        >
          <div className="admin-dash__stat-top">
            <span className="admin-dash__stat-label">Total Patients</span>
            <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
              <FiUsers />
            </div>
          </div>
          <div className="admin-dash__stat-value">{patients.length}</div>
          <div className="admin-dash__stat-meta">total patients</div>
        </div>

        <div 
          className="admin-dash__stat cursor-pointer" 
          onClick={() => openStatsModal("upcoming", "Upcoming Camps", allCamps.filter(c => {
            if (c.isHidden) return false;
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
          <div className="admin-dash__stat-value">{allCamps.filter(c => {
            if (c.isHidden) return false;
            const { status } = getCampStatus(c.date, c.time);
            return status === 'upcoming';
          }).length}</div>
          <div className="admin-dash__stat-meta">scheduled camps</div>
        </div>

        <div 
          className="admin-dash__stat cursor-pointer" 
          onClick={() => {
            if (hiddenCamps.length > 0) {
              setShowHiddenModal(true);
            } else {
              alert("No hidden camps found");
            }
          }}
        >
          <div className="admin-dash__stat-top">
            <span className="admin-dash__stat-label">Hidden</span>
            <div className="admin-dash__stat-icon admin-dash__stat-icon--purple" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
              <FiEyeOff />
            </div>
          </div>
          <div className="admin-dash__stat-value">{hiddenCamps.length}</div>
          <div className="admin-dash__stat-meta">hidden camps</div>
        </div>
      </div>

      <div ref={campsSectionRef} className="admin-dash__card">
        <div className="admin-dash__card-header">
          <h3 className="admin-dash__card-title">
            {campViewFilter === "active" ? "Active Camps" : "Hidden Camps"}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            {currentUserRole === "partner" && (
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab("assigned")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "assigned" 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Assigned ({camps.length})
                </button>
                <button
                  onClick={() => setActiveTab("created")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "created" 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Created ({createdCamps.length})
                </button>
              </div>
            )}

            <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
              {activeCampsCount} Active
            </span>
          </div>
        </div>
        <div className="admin-dash__card-body">
          {displayCamps.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {campViewFilter === "active" ? (
                <>
                  <FiMapPin size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="font-medium">No active camps found</p>
                  <p className="text-sm text-gray-400 mt-1">Create a new camp to get started</p>
                </>
              ) : (
                <>
                  <FiEyeOff size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="font-medium">No hidden camps found</p>
                  <p className="text-sm text-gray-400 mt-1">Camps auto-hide after 10 days</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {displayCamps.map(camp => {
                const isSelected = selectedCampId === camp._id;
                const isCreated = currentUserRole === "partner" && activeTab === "created";
                const creatorInfo = getCreatorInfo(camp);
                const isHidden = camp.isHidden === true;

                return (
                  <div
                    key={camp._id}
                    onClick={() => {
                      setSelectedCampId(camp._id);
                      scrollToSection(patientsSectionRef);
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all relative
                      ${isSelected
                        ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                        : "bg-white hover:border-indigo-300 hover:shadow-md"
                      }
                      ${isHidden ? "border-purple-300 bg-purple-50/30" : ""}
                    `}
                  >
                    <div className={`absolute top-2 left-2 text-[8px] font-bold px-2 py-0.5 rounded-full ${creatorInfo.color}`}>
                      {creatorInfo.label}
                    </div>

                    {isHidden && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <FiEyeOff size={10} />
                        Hidden
                      </div>
                    )}

                    {camp.createdByCurrentPartner && currentUserRole === "partner" && !isHidden && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Your Camp
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mb-1 mt-4">
                      <h4 className="font-bold truncate">{camp.name}</h4>
                      {!isHidden && <CampStatusBadge date={camp.date} time={camp.time} />}
                      {isHidden && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className={`mt-2 flex items-center gap-2 text-sm ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                      <FiMapPin size={14} />
                      <span className="truncate">{camp.location}</span>
                    </div>

                    <div className={`mt-1 flex items-center gap-2 text-sm ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                      <FiCalendar size={14} />
                      <span>{camp.date || "No date"}</span>
                    </div>

                    <div className={`mt-1 flex items-center gap-2 text-sm ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                      <FiClock size={14} />
                      <span>{camp.time || "No time"}</span>
                    </div>

                    {camp.partners && camp.partners.length > 0 && (
                      <div className="mt-2">
                        <PartnerDisplay
                          partners={camp.partners}
                          isSelected={isSelected}
                          partnersList={partnerList}
                        />
                      </div>
                    )}

                    {camp.volunteers && camp.volunteers.length > 0 && (
                      <div className="mt-2">
                        <VolunteerDisplay
                          volunteers={camp.volunteers}
                          isSelected={isSelected}
                          employeeMap={employeeMap}
                        />
                      </div>
                    )}

                    <span className={`inline-block mt-3 text-xs font-bold px-2 py-1 rounded-lg ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                      {patients.filter((p) => String(p.campId?._id) === String(camp._id)).length} Patients
                    </span>

                    <div className="float-right mt-3 flex items-center gap-1">
                      {isCreated && !isHidden && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(camp);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelected 
                                ? "text-white hover:bg-white/20" 
                                : "text-orange-600 hover:bg-orange-50"
                            }`}
                            title="Edit Camp"
                          >
                            <FiEdit size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(camp, "camp");
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelected 
                                ? "text-white hover:bg-white/20" 
                                : "text-red-600 hover:bg-red-50"
                            }`}
                            title="Delete Camp"
                          >
                            <FiTrash2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHideCamp(camp._id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelected 
                                ? "text-white hover:bg-white/20" 
                                : "text-purple-600 hover:bg-purple-50"
                            }`}
                            title="Hide Camp"
                          >
                            <FiEyeOff size={12} />
                          </button>
                        </>
                      )}
                      {isHidden && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnhideCamp(camp._id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelected 
                                ? "text-white hover:bg-white/20" 
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title="Restore Camp"
                          >
                            <FiEyeShow size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(camp, "camp");
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelected 
                                ? "text-white hover:bg-white/20" 
                                : "text-red-600 hover:bg-red-50"
                            }`}
                            title="Delete Camp"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewCamp(camp);
                        }}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors
                          ${isSelected
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          }`}
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
          <h3 className="admin-dash__card-title">Participants</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <FiSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, phone or camp..."
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiFilter size={16} />
              <span>Showing {filteredPatients.length} participants</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/add-patient", { state: { campId: selectedCampId } })}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700"
              >
                <FiPlus size={16} />
                Add Patient
              </button>
              <button
                onClick={handleBulkDownload}
                disabled={selectedCampId === "all" || loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload size={16} />
                {loading ? "Generating..." : "Download ZIP"}
              </button>
            </div>
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
                  <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Reports</th>
                  <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                        <span>Loading participants...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                            {patient.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.age} Y • {patient.gender}</p>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => viewReport(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                            <FiEye size={14} /> View
                          </button>
                          <button onClick={() => navigate(`/patient/${patient._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                            <FiEdit size={14} /> Edit
                          </button>
                          <button onClick={() => downloadPDF(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                            <FiFileText size={14} /> Download
                          </button>
                          <button onClick={() => shareReport(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                            <FiMessageCircle size={14} /> WhatsApp
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => openDeleteModal(patient, "patient")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                        <FiUsers size={48} className="opacity-20" />
                        <p className="text-lg font-medium">No participants found</p>
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

      {showShareModal && currentPatient && (
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl animate-scale-in">
              <div className="p-6 text-center text-white bg-green-600">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
                  <FiMessageCircle size={32} />
                </div>
                <h3 className="text-xl font-bold">Share Report on WhatsApp</h3>
                <p className="mt-1 text-sm text-green-100">Download link generated successfully!</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-green-700 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
                      {currentPatient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{currentPatient.name}</p>
                      <p className="text-sm text-gray-600">{currentPatient.contact || "No phone number"} • {currentPatient.age} Y</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-2 border-green-200 border-dashed rounded-2xl bg-green-50/50">
                  <p className="mb-2 text-sm font-bold text-green-800">📄 WhatsApp Message Preview:</p>
                  <div className="p-3 overflow-y-auto bg-white border border-green-100 rounded-lg max-h-40">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">{downloadLink}</pre>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Patient will receive this message with a clickable download link.</p>
                </div>
                <div className="space-y-3">
                  <button onClick={handleWhatsAppShare} className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                    <FiMessageCircle size={18} /> Open WhatsApp with Message
                  </button>
                  <button onClick={handleCopyMessage} className="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2">
                    {copied ? <FiCheckCircle size={16} className="text-green-600" /> : <FiCopy size={16} />} {copied ? "Copied!" : "Copy Full Message"}
                  </button>
                  <button onClick={handleCopyLinkOnly} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                    <FiLink size={16} /> Copy Download Link Only
                  </button>
                  <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>, document.body)
        )}

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
                  
                  {volunteers.filter(v => v.source === 'partner').length > 0 && (
                    <optgroup label="⭐ Partner Volunteers">
                      {volunteers.filter(v => v.source === 'partner').map(vol => (
                        <option key={vol._id} value={vol.name}>
                          {vol.name} ({vol.designation || "Volunteer"}) ⭐
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {volunteers.filter(v => v.source !== 'partner').length > 0 && (
                    <optgroup label="👥 Employee Volunteers">
                      {volunteers.filter(v => v.source !== 'partner').map(vol => (
                        <option key={vol._id} value={vol.name}>
                          {vol.name} ({vol.designation || vol.role || "Staff"})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {volunteers.filter(v => v.source === 'partner').length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {volunteers.filter(v => v.source === 'partner').length} partner volunteers available
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assign Partners (Doctors)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {campForm.partners.map(partnerId => {
                    const partner = partnerList.find(p => p._id === partnerId);
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
                  {partnerList.map(partner => (
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

      {showEditModal && editingCamp && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Edit Camp</h2>
                <button onClick={() => { setShowEditModal(false); setEditingCamp(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
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
                  value={campForm.name} 
                  onChange={e => setCampForm({ ...campForm, name: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  value={campForm.location} 
                  onChange={e => setCampForm({ ...campForm, location: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  value={campForm.address} 
                  onChange={e => setCampForm({ ...campForm, address: e.target.value })} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    value={campForm.date} 
                    onChange={e => setCampForm({ ...campForm, date: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
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
                  {campForm.partners && campForm.partners.map(partnerId => {
                    const partner = partnerList.find(p => p._id === partnerId);
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
                  {partnerList.map(partner => (
                    <option key={partner._id} value={partner._id}>
                      {partner.name || partner.clinicName} ({partner.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button onClick={() => { setShowEditModal(false); setEditingCamp(null); }} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleUpdateCamp} className="px-6 py-2 text-white bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                Update Camp
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {viewCamp && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
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
                
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-600">Created by:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    viewCamp.creatorRole === "admin" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {viewCamp.creatorRole === "admin" 
                      ? "Admin" 
                      : getPartnerName(viewCamp.createdBy?._id || viewCamp.createdBy)
                    }
                  </span>
                </div>
                
                {viewCamp.partners && viewCamp.partners.length > 0 && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-semibold text-gray-600">Partners:</span>
                    <PartnerDisplay
                      partners={viewCamp.partners}
                      isSelected={false}
                      partnersList={partnerList}
                    />
                  </div>
                )}
                
                {viewCamp.volunteers && viewCamp.volunteers.length > 0 && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-semibold text-gray-600">Volunteers:</span>
                    <VolunteerDisplay
                      volunteers={viewCamp.volunteers}
                      isSelected={false}
                      employeeMap={employeeMap}
                    />
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setViewCamp(null)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {viewCampPatients.length} Participants
                </span>
                <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAddPatientForm(prev => ({ ...prev, campId: viewCamp._id }));
                    setShowAddPatientModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <FiPlus size={16} />
                  Add Patient
                </button>
                
                <button
                  onClick={handleDownloadCampCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
                >
                  <FiFileText size={16} />
                  Download Report
                </button>
              </div>
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/patient/${patient._id}`)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              View Details <FiChevronRight size={12} />
                            </button>
                            <button
                              onClick={() => {
                                setViewCamp(null);
                                setTimeout(() => openDeleteModal(patient, "patient"), 100);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 hover:underline"
                            >
                              <FiTrash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <FiUsers size={32} className="opacity-20" />
                          <span className="text-sm font-medium">No patients found in this camp yet.</span>
                        </div>
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

      {showAddPatientModal && viewCamp && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiPlus size={20} />
                  Add Patient
                </h3>
                <p className="text-sm text-indigo-100">Adding to: {viewCamp.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowAddPatientModal(false);
                  setAddPatientForm({
                    salutation: "",
                    name: "",
                    age: "",
                    gender: "female",
                    contact: "",
                    address: "",
                    campId: ""
                  });
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <FiX size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddPatientSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  Camp <span className="text-red-500">*</span>
                </label>
                <div className="w-full p-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl text-indigo-800 font-medium">
                  {viewCamp.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="contact"
                  value={addPatientForm.contact}
                  placeholder="+91 9876543210"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  onChange={handleAddPatientChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  Salutation
                </label>
                <div className="relative">
                  <select
                    name="salutation"
                    value={addPatientForm.salutation}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none bg-white"
                    onChange={handleAddPatientChange}
                  >
                    {salutationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="name"
                  value={addPatientForm.name}
                  placeholder="Enter full name"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  onChange={handleAddPatientChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="age"
                    type="number"
                    min="0"
                    max="150"
                    value={addPatientForm.age}
                    placeholder="Years"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                    onChange={handleAddPatientChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={addPatientForm.gender}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
                    onChange={handleAddPatientChange}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  name="address"
                  value={addPatientForm.address}
                  rows="3"
                  placeholder="Full residential address..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                  onChange={handleAddPatientChange}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPatientModal(false);
                    setAddPatientForm({
                      salutation: "",
                      name: "",
                      age: "",
                      gender: "female",
                      contact: "",
                      address: "",
                      campId: ""
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPatientLoading}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addPatientLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      Register Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <StatsModal />
      <HiddenCampsModal />
      <DeleteConfirmationModal />

      </div>
    </div>
  );
}