// import axios from "axios";
// import {
//     FiActivity,
//     FiCalendar,
//     FiChevronRight,
//     FiClock,
//     FiFilter,
//     FiMapPin,
//     FiPlus,
//     FiSearch,
//     FiUsers,
//     FiMessageCircle,
//     FiCheckCircle,
//     FiCopy,
//     FiXCircle,
//     FiEye,
//     FiEdit,
//     FiFileText,
//     FiDownload,
//     FiX
// } from "react-icons/fi";
// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate } from "react-router-dom";
// import config from "../config";
// import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";
// import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
// import VolunteerDisplay from "../components/VolunteerDisplay";
// import PartnerDisplay from "../components/PartnerDisplay";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
// import "./Dashboard.css";

// const API_BASE = config.API_BASE_URL;

// /* ================= UTILS ================= */

// const calculateBMI = (weight, heightCm) => {
//     if (!weight || !heightCm) return null;
//     const h = heightCm / 100;
//     return +(weight / (h * h)).toFixed(1);
// };

// const getBMICategory = (bmi) => {
//     if (!bmi) return "-";
//     if (bmi < 18.5) return "Underweight";
//     if (bmi < 25) return "Healthy";
//     if (bmi < 30) return "Overweight";
//     return "Obese";
// };

// const extractLatestVitals = (tests = []) => {
//     const r = {};
//     if (!tests) return r;

//     tests.forEach(t => {
//         r.date = t.date;
//         if (t.type === "weight") r.weight = t.value;
//         if (t.type === "height") r.height = t.value;
//         if (t.type === "sugar") r.sugar = t.value;
//         if (t.type === "sugarType") r.sugarType = t.value;
//         if (t.type === "bp") {
//             r.systolic = t.value;
//             r.diastolic = t.value2;
//         }
//     });
//     return r;
// };

// const getCampStartTime = (dateStr, timeStr) => {
//     if (!dateStr || !timeStr) return null;
//     const dateDigits = dateStr.match(/\d+/g);
//     if (!dateDigits || dateDigits.length < 3) return null;

//     let year, month, day;
//     const d1 = parseInt(dateDigits[0], 10);
//     const d2 = parseInt(dateDigits[1], 10);
//     const d3 = parseInt(dateDigits[2], 10);

//     if (d1 > 1000) { year = d1; month = d2 - 1; day = d3; }
//     else { year = d3; month = d2 - 1; day = d1; }

//     const upperTime = timeStr.toUpperCase();
//     const parts = upperTime.split(/\s+TO\s+|\s+T0\s+|-|THROUGH|\s+TO|TO\s+/);
//     if (parts.length < 1) return null;

//     const cleanStr = parts[0].replace(/O/g, '0').replace(/[^\d\sAMP:]/g, '');
//     const nums = cleanStr.match(/\d+/g);
//     if (!nums) return null;

//     let h = parseInt(nums[0], 10);
//     let m = nums.length > 1 ? parseInt(nums[1], 10) : 0;
//     const isPM = cleanStr.includes('PM') || (h >= 1 && h < 8 && !cleanStr.includes('AM'));
//     const isAM = cleanStr.includes('AM');
//     if (isPM && h < 12) h += 12;
//     if (isAM && h === 12) h = 0;

//     return new Date(year, month, day, h, m, 0);
// };

// /* ================= COMPONENT ================= */

// const DoctorCamps = () => {
//     const navigate = useNavigate();
//     const [camps, setCamps] = useState([]);
//     const [patients, setPatients] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [partnerList, setPartnerList] = useState([]);
//     const [volunteers, setVolunteers] = useState([]);

//     const [selectedCampId, setSelectedCampId] = useState("all");
//     const [searchQuery, setSearchQuery] = useState("");

//     const [showCampModal, setShowCampModal] = useState(false);
//     const [viewCamp, setViewCamp] = useState(null);
//     const [campForm, setCampForm] = useState({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });

//     const [showShareModal, setShowShareModal] = useState(false);
//     const [currentPatient, setCurrentPatient] = useState(null);
//     const [downloadLink, setDownloadLink] = useState("");
//     const [copied, setCopied] = useState(false);
//     const [downloadingBulk, setDownloadingBulk] = useState(false);

//     const partnerId = useMemo(() => {
//         const userData = localStorage.getItem("userData");
//         return localStorage.getItem("userId") || (userData ? JSON.parse(userData).id : null);
//     }, []);

//     useEffect(() => {
//         if (partnerId) {
//             fetchData();
//         } else {
//             // Optionally redirect or handle missing partnerId
//             setLoading(false);
//         }
//     }, [partnerId]);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const [campsRes, patientsRes, employeesRes, partnersRes] = await Promise.all([
//                 axios.get(`${API_BASE}/camps/assigned-camps/${partnerId}`),
//                 axios.get(`${API_BASE}/patients`),
//                 axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] })),
//                 axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }))
//             ]);

//             const assignedCamps = campsRes.data || [];
//             setCamps(sortCampsByStatus(assignedCamps));

//             setPartnerList(Array.isArray(partnersRes.data) ? partnersRes.data : []);

//             const empData = employeesRes.data || [];
//             const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
//             const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
//             const filteredVolunteers = allEmployees.filter(emp => {
//                 const dept = (emp.department || "").trim();
//                 return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
//             });
//             setVolunteers(filteredVolunteers);

//             const assignedIds = assignedCamps.map(c => String(c._id));
//             const filteredPatients = (patientsRes.data || []).filter(p =>
//                 p.campId && assignedIds.includes(String(p.campId?._id || p.campId))
//             );
//             setPatients(filteredPatients);

//         } catch (err) {
//             console.error("Error fetching data:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredPatients = useMemo(() => {
//         return patients.filter(p => {
//             if (selectedCampId !== "all" && String(p.campId?._id) !== String(selectedCampId)) return false;
//             if (searchQuery) {
//                 const q = searchQuery.toLowerCase();
//                 const matchesName = p.name?.toLowerCase().includes(q);
//                 const matchesPhone = p.contact?.includes(q);
//                 if (!matchesName && !matchesPhone) return false;
//             }
//             return true;
//         });
//     }, [patients, selectedCampId, searchQuery]);

//     const viewCampPatients = useMemo(() => {
//         if (!viewCamp) return [];
//         return patients.filter(p => String(p.campId?._id || p.campId) === String(viewCamp._id));
//     }, [viewCamp, patients]);

//     const campsWithCount = useMemo(() => {
//         return camps.map(c => {
//             const count = patients.filter(p => String(p.campId?._id) === String(c._id)).length;
//             return { ...c, count };
//         });
//     }, [camps, patients]);

//     const handleUpdateStatus = async (campId, status) => {
//         try {
//             await axios.post(`${API_BASE}/camps/update-assignment-status`, {
//                 campId,
//                 partnerId,
//                 status
//             });
//             alert(`Camp assignment ${status} successfully!`);
//             fetchData();
//         } catch (err) {
//             console.error("Error updating status:", err);
//             alert("Failed to update status");
//         }
//     };

//     const handleCreateCamp = async () => {
//         try {
//             await axios.post(`${API_BASE}/camps/addcamp`, campForm);
//             alert("✅ Camp created successfully");
//             setShowCampModal(false);
//             setCampForm({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });
//             fetchData();
//         } catch (err) {
//             console.error("Create camp error:", err);
//             alert("❌ Failed to create camp");
//         }
//     };

//     const handleAddVolunteer = (e) => {
//         const val = e.target.value;
//         if (!val) return;
//         if (!campForm.volunteers.includes(val)) {
//             setCampForm({ ...campForm, volunteers: [...campForm.volunteers, val] });
//         }
//     };

//     const handleRemoveVolunteer = (name) => {
//         setCampForm({
//             ...campForm,
//             volunteers: campForm.volunteers.filter(v => v !== name)
//         });
//     };

//     const handleAddPartner = (e) => {
//         const pid = e.target.value;
//         if (!pid) return;
//         if (!campForm.partners.includes(pid)) {
//             setCampForm({ ...campForm, partners: [...campForm.partners, pid] });
//         }
//     };

//     const handleRemovePartner = (id) => {
//         setCampForm({
//             ...campForm,
//             partners: campForm.partners.filter(p => p !== id)
//         });
//     };

//     /* -------- HELPER: PREPARE REPORT DATA -------- */

//     const prepareReportData = async (patientId) => {
//         try {
//             const res = await axios.get(`${API_BASE}/patients/${patientId}`);
//             const fullPatient = res.data;

//             if (!fullPatient?.tests?.length) {
//                 alert("No test data available for this patient.");
//                 return null;
//             }

//             const test = extractLatestVitals(fullPatient.tests);
//             const bmiValue = calculateBMI(test.weight, test.height);

//             const patientData = {
//                 name: fullPatient.name,
//                 age: fullPatient.age,
//                 gender: fullPatient.gender,
//                 id: fullPatient._id.slice(-6).toUpperCase(),
//                 date: new Date(test.date || Date.now()).toLocaleDateString(),
//                 phone: fullPatient.contact,
//                 address: fullPatient.address,
//             };

//             const testsData = {
//                 weight: test.weight,
//                 height: test.height,
//                 sugar: test.sugar,
//                 sugarType: test.sugarType || "Random",
//                 systolic: test.systolic,
//                 diastolic: test.diastolic,
//                 heartRate: "-",
//             };

//             const bmiData = {
//                 bmi: bmiValue,
//                 category: getBMICategory(bmiValue),
//             };

//             return { patientData, testsData, bmiData };

//         } catch (err) {
//             console.error(err);
//             alert("Failed to fetch report data.");
//             return null;
//         }
//     };

//     const uploadPdfToServer = async (patientData, testsData, bmiData) => {
//         const rawPdf = await generateMedicalReportFile(
//             patientData,
//             testsData,
//             bmiData
//         );

//         const pdfBlob = new Blob([rawPdf], {
//             type: "application/pdf"
//         });

//         const formData = new FormData();
//         formData.append("file", pdfBlob, "health-report.pdf");

//         const res = await axios.post(
//             `${API_BASE}/reports/upload`,
//             formData,
//             { headers: { "Content-Type": "multipart/form-data" } }
//         );

//         return res.data.downloadLink;
//     };

//     /* -------- HANDLERS -------- */
//     const downloadPDF = async (patient) => {
//         const data = await prepareReportData(patient._id);
//         if (!data) return;
//         generateMedicalReport(data.patientData, data.testsData, data.bmiData);
//     };

//     const viewReport = async (patient) => {
//         const data = await prepareReportData(patient._id);
//         if (!data) return;
//         navigate('/health-report', {
//             state: {
//                 patient: data.patientData,
//                 tests: data.testsData
//             }
//         });
//     };

//     const shareReport = async (patient) => {
//         try {
//             setCurrentPatient(patient);

//             const data = await prepareReportData(patient._id);
//             if (!data) return;

//             const publicLink = await uploadPdfToServer(
//                 data.patientData,
//                 data.testsData,
//                 data.bmiData
//             );

//             const message = `*Health Checkup Report* 🩺\n\nHello ${patient.name},\nYour medical health report is ready.\n\n📄 Download Report:\n${publicLink}\n\n(Generated by BIM Medical)`;

//             setDownloadLink(message);
//             setShowShareModal(true);

//         } catch (err) {
//             console.error("UPLOAD ERROR", err);
//             alert("Failed to generate sharing link");
//         }
//     };

//     const handleWhatsAppShare = () => {
//         if (!currentPatient || !downloadLink) return;
//         const phone = currentPatient.contact ? currentPatient.contact.replace(/\D/g, '') : '';
//         if (!phone) {
//             alert("Phone number required");
//             return;
//         }
//         window.open(`https://wa.me/${phone}?text=${encodeURIComponent(downloadLink)}`, "_blank");
//         setShowShareModal(false);
//     };

//     const handleCopyMessage = () => {
//         navigator.clipboard.writeText(downloadLink);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     const handleDownloadCampCSV = () => {
//         if (!viewCamp || viewCampPatients.length === 0) {
//             alert("No data to download");
//             return;
//         }

//         const headers = ["Patient Name", "Age", "Gender", "Contact", "Camp Name", "Date", "Location", "BMI", "BP (Sys/Dia)", "Sugar"];
//         const rows = viewCampPatients.map(p => {
//             let bmi = "-", bp = "-", sugar = "-";
//             if (p.tests && p.tests.length > 0) {
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

//     const handleBulkDownload = async () => {
//         if (selectedCampId === "all") {
//             alert("Please select a specific camp to download bulk reports.");
//             return;
//         }

//         const campPatients = filteredPatients;
//         if (campPatients.length === 0) {
//             alert("No patient reports to download for this camp.");
//             return;
//         }

//         try {
//             setDownloadingBulk(true);
//             const zip = new JSZip();
//             const campName = camps.find(c => c._id === selectedCampId)?.name || "Camp";

//             // Process patients in batches or sequentially
//             for (const p of campPatients) {
//                 const data = await prepareReportData(p._id);
//                 if (data) {
//                     const pdfBytes = await generateMedicalReportFile(data.patientData, data.testsData, data.bmiData);
//                     const fileName = `${p.name.replace(/\s+/g, "_")}_${p._id.slice(-4)}.pdf`;
//                     zip.file(fileName, pdfBytes);
//                 }
//             }

//             const content = await zip.generateAsync({ type: "blob" });
//             saveAs(content, `${campName.replace(/\s+/g, "_")}_Reports.zip`);

//         } catch (err) {
//             console.error("Bulk download error:", err);
//             alert("Error generating bulk reports.");
//         } finally {
//             setDownloadingBulk(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-[60vh]">
//                 <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="admin-dash">
//             {/* Header */}
//             <div className="admin-dash__header">
//                 <div>
//                     <h1 className="admin-dash__greeting">
//                         Camp <span>Assignments</span>
//                     </h1>
//                     <p className="admin-dash__subtitle">
//                         Manage your assigned medical camps and patient data.
//                     </p>
//                 </div>
//                 <div className="admin-dash__date-pill">
//                     <FiCalendar />
//                     <span>
//                         {new Date().toLocaleDateString("en-US", {
//                             weekday: "short",
//                             year: "numeric",
//                             month: "short",
//                             day: "numeric",
//                         })}
//                     </span>
//                 </div>
//             </div>

//             <div className="space-y-10">

//             {/* Top Summary Stats */}
//             <div className="admin-dash__stats">
//                 <div className="admin-dash__stat">
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Assigned Camps</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
//                             <FiMapPin />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{camps.length}</div>
//                     <div className="admin-dash__stat-meta">total assignments</div>
//                 </div>
//                 <div className="admin-dash__stat">
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Total Patients</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
//                             <FiUsers />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{patients.length}</div>
//                     <div className="admin-dash__stat-meta">total patients</div>
//                 </div>
//                 <div className="admin-dash__stat">
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Upcoming</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
//                             <FiCalendar />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{camps.filter(c => getCampStatus(c.date, c.time).status === 'upcoming').length}</div>
//                     <div className="admin-dash__stat-meta">upcoming camps</div>
//                 </div>
//                 <div className="admin-dash__stat">
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Live</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
//                             <FiActivity />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{camps.filter(c => getCampStatus(c.date, c.time).status === 'live').length}</div>
//                     <div className="admin-dash__stat-meta">live screenings</div>
//                 </div>
//                 <div className="admin-dash__stat">
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Completed</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
//                             <FiCheckCircle />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{camps.filter(c => getCampStatus(c.date, c.time).status === 'completed').length}</div>
//                     <div className="admin-dash__stat-meta">completed camps</div>
//                 </div>
//             </div>

//             {/* CAMPS Section */}
//             <div className="admin-dash__card">
//                 <div className="admin-dash__card-header">
//                     <h3 className="admin-dash__card-title">My Assignments</h3>
//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={() => setSelectedCampId("all")}
//                             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedCampId === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
//                         >
//                             All Assignments
//                         </button>
//                         <button
//                             onClick={() => setShowCampModal(true)}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
//                         >
//                             <FiCalendar size={14} />
//                             Create Camp
//                         </button>
//                     </div>
//                 </div>
//                 <div className="admin-dash__card-body">

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {campsWithCount.map(camp => {
//                         const isSelected = selectedCampId === camp._id;
//                         const status = camp.partners.find(p => String(p.partnerId?._id || p.partnerId) === String(partnerId))?.status || "pending";

//                         return (
//                             <div
//                                 key={camp._id}
//                                 onClick={() => setSelectedCampId(camp._id)}
//                                 className={`cursor-pointer p-5 rounded-2xl border transition-all group
//                                     ${isSelected
//                                         ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
//                                         : "bg-white hover:border-indigo-300 hover:shadow-md text-gray-700"}`}
//                             >
//                                 <div className="flex items-start justify-between gap-2 mb-4">
//                                     <h4 className={`font-bold truncate ${isSelected ? "text-white" : "text-gray-900 group-hover:text-indigo-600 transition-colors"}`}>{camp.name}</h4>
//                                     <div className="flex flex-col items-end gap-1">
//                                         <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter shadow-sm
//                                             ${status === 'accepted' ? 'bg-emerald-500 text-white' :
//                                                 status === 'rejected' ? 'bg-rose-500 text-white' :
//                                                     'bg-amber-400 text-white'}`}>
//                                             {status}
//                                         </span>
//                                         <CampStatusBadge date={camp.date} time={camp.time} />
//                                     </div>
//                                 </div>

//                                 <div className="space-y-2 text-sm font-medium mt-3">
//                                     <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
//                                         <FiMapPin size={14} className={isSelected ? "text-indigo-200" : "text-indigo-500"} />
//                                         <span className="truncate">{camp.location}</span>
//                                     </div>
//                                     <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
//                                         <FiCalendar size={14} className={isSelected ? "text-indigo-200" : "text-indigo-400"} />
//                                         <span>{camp.date || "No date"}</span>
//                                     </div>
//                                     <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
//                                         <FiClock size={14} className={isSelected ? "text-indigo-200" : "text-indigo-500"} />
//                                         <span>{camp.time || "No time"}</span>
//                                     </div>

//                                     <VolunteerDisplay
//                                         volunteers={camp.volunteers}
//                                         isSelected={isSelected}
//                                     />

//                                     <PartnerDisplay
//                                         partners={camp.partners}
//                                         isSelected={isSelected}
//                                     />
//                                 </div>

//                                 {(() => {
//                                     const acceptedPartner = camp.partners.find(p => p.status === 'accepted');
//                                     const istakenByOther = acceptedPartner && String(acceptedPartner.partnerId?._id || acceptedPartner.partnerId) !== String(partnerId);

//                                     if (istakenByOther) {
//                                         return (
//                                             <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
//                                                 <FiClock size={14} />
//                                                 <span className="text-[10px] font-bold uppercase">Allocated to another doctor</span>
//                                             </div>
//                                         );
//                                     }

//                                     const { status: timeStatus } = getCampStatus(camp.date, camp.time);
//                                     if (timeStatus !== 'upcoming') return null;

//                                     const start = getCampStartTime(camp.date, camp.time);
//                                     const now = new Date();
//                                     const hoursDiff = start ? (start - now) / (1000 * 60 * 60) : 0;

//                                     if (hoursDiff < 12) {
//                                         return (
//                                             <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
//                                                 <FiClock size={14} />
//                                                 <span className="text-[10px] font-bold uppercase">Actions Closed (Less than 12h)</span>
//                                             </div>
//                                         );
//                                     }

//                                     return (
//                                         <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100/10">
//                                             {status !== 'rejected' && (
//                                                 <button
//                                                     onClick={(e) => {
//                                                         e.stopPropagation();
//                                                         handleUpdateStatus(
//                                                             camp._id,
//                                                             status === 'accepted' ? 'pending' : 'accepted'
//                                                         );
//                                                     }}
//                                                     className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border
//         ${status === 'accepted'
//                                                             ? 'bg-[#16A34A] text-white border-[#16A34A]'
//                                                             : 'bg-[#16A34A]/20 hover:bg-[#16A34A]/30  border-white/20'
//                                                         }`}
//                                                 >
//                                                     {status === 'accepted' ? 'Accepted' : 'Accept'}
//                                                 </button>
//                                             )}

//                                             {status !== 'accepted' && (
//                                                 <button
//                                                     onClick={(e) => {
//                                                         e.stopPropagation();
//                                                         handleUpdateStatus(
//                                                             camp._id,
//                                                             status === 'rejected' ? 'pending' : 'rejected'
//                                                         );
//                                                     }}
//                                                     className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border
//         ${status === 'rejected'
//                                                             ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
//                                                             : 'bg-[#4F46E5]/20 hover:bg-[#4F46E5]/30  border-white/20'
//                                                         }`}
//                                                 >
//                                                     {status === 'rejected' ? 'Passed' : 'Pass'}
//                                                 </button>
//                                             )}
//                                         </div>
//                                     );
//                                 })()}

//                                 <div className={`mt-5 pt-4 border-t flex items-center justify-between ${isSelected ? "border-white/20" : "border-gray-50"}`}>
//                                     <div className={`flex items-center gap-2 text-xs font-bold ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
//                                         <FiUsers size={14} />
//                                         <span>{camp.count} Patients</span>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setViewCamp(camp);
//                                             }}
//                                             className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all
//                                                 ${isSelected
//                                                     ? "bg-white/20 text-white hover:bg-white/30"
//                                                     : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
//                                         >
//                                             <FiEye size={12} className="inline mr-1" /> View
//                                         </button>
//                                         <div className={`${isSelected ? "text-white" : "text-indigo-600"} opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
//                                             <FiChevronRight size={18} />
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//                 </div>
//             </div>

//             {/* PATIENTS Section */}
//             <div className="admin-dash__card">
//                 <div className="admin-dash__card-header">
//                     <h3 className="admin-dash__card-title">Participants</h3>
//                     <div className="flex flex-wrap items-center gap-3">
//                         <div className="relative w-full lg:max-w-md">
//                             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                             <input
//                                 type="text"
//                                 placeholder="Search by name, phone or camp..."
//                                 className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-500">
//                             <FiFilter size={16} />
//                             <span>{filteredPatients.length} participants</span>
//                         </div>
//                         <button
//                             onClick={handleBulkDownload}
//                             disabled={downloadingBulk || selectedCampId === "all"}
//                             className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-xl 
//                                 ${downloadingBulk || selectedCampId === "all"
//                                     ? 'bg-gray-300 cursor-not-allowed opacity-60'
//                                     : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95'}`}
//                         >
//                             {downloadingBulk ? (
//                                 <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
//                             ) : (
//                                 <FiDownload size={16} />
//                             )}
//                             {downloadingBulk ? "Generating..." : "Download ZIP"}
//                         </button>
//                         <button
//                             onClick={() => navigate("/add-patient", { state: { campId: selectedCampId !== "all" ? selectedCampId : "" } })}
//                             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
//                         >
//                             <FiPlus size={16} /> Add Patient
//                         </button>
//                     </div>
//                 </div>
//                 <div className="admin-dash__card-body p-0">
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left">
//                             <thead>
//                                 <tr className="border-b border-gray-100 bg-gray-50/50">
//                                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
//                                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
//                                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
//                                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Reports</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100">
//                                 {filteredPatients.length > 0 ? filteredPatients.map(patient => (
//                                     <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
//                                         <td className="p-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
//                                                     {patient.name?.charAt(0).toUpperCase()}
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-semibold text-gray-900">{patient.name}</p>
//                                                     <p className="text-xs text-gray-500">{patient.age} Y • {patient.gender}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="p-4">
//                                             <span className="text-sm font-medium text-gray-700">{patient.contact || "No contact"}</span>
//                                         </td>
//                                         <td className="p-4">
//                                             <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium border border-gray-200">
//                                                 {patient.campId?.name || "N/A"}
//                                             </span>
//                                         </td>
//                                         <td className="p-4">
//                                             <div className="flex items-center gap-2">
//                                                 <button
//                                                     onClick={() => viewReport(patient)}
//                                                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
//                                                 >
//                                                     <FiEye size={14} />
//                                                     View
//                                                 </button>
//                                                 <button
//                                                     onClick={() => navigate(`/patient/${patient._id}`)}
//                                                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
//                                                 >
//                                                     <FiEdit size={14} />
//                                                     Edit
//                                                 </button>
//                                                 <button
//                                                     onClick={() => downloadPDF(patient)}
//                                                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
//                                                 >
//                                                     <FiFileText size={14} />
//                                                     Download
//                                                 </button>
//                                                 <button
//                                                     onClick={() => shareReport(patient)}
//                                                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
//                                                 >
//                                                     <FiMessageCircle size={14} />
//                                                     WhatsApp
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr>
//                                         <td colSpan={4} className="p-12 text-center text-gray-400">
//                                             <div className="flex flex-col items-center justify-center gap-3">
//                                                 <FiUsers size={48} className="opacity-20" />
//                                                 <p className="text-lg font-medium italic">No records found</p>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>

//             {/* CREATE CAMP MODAL */}
//             {showCampModal && createPortal(
//                 <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
//                     <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
//                         <div className="p-6 border-b border-gray-100">
//                             <div className="flex items-center justify-between mb-2">
//                                 <h2 className="text-xl font-bold text-gray-800">Create New Camp</h2>
//                                 <button onClick={() => setShowCampModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
//                                     <FiXCircle size={20} />
//                                 </button>
//                             </div>
//                             <p className="text-sm text-gray-500 font-medium">Schedule a new screening event and assign staff.</p>
//                         </div>

//                         <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camp Name</label>
//                                 <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="E.g., Heart Health Screening" value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} />
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-1.5">
//                                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
//                                     <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="City/Area" value={campForm.location} onChange={e => setCampForm({ ...campForm, location: e.target.value })} />
//                                 </div>
//                                 <div className="space-y-1.5">
//                                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
//                                     <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.date} onChange={e => setCampForm({ ...campForm, date: e.target.value })} />
//                                 </div>
//                             </div>

//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Range</label>
//                                 <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="E.g., 10:00 AM - 4:00 PM" value={campForm.time} onChange={e => setCampForm({ ...campForm, time: e.target.value })} />
//                             </div>

//                             <div className="space-y-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Volunteers</label>
//                                 <div className="flex flex-wrap gap-2 mb-2">
//                                     {campForm.volunteers.map(vol => (
//                                         <span key={vol} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1 shadow-sm">
//                                             {vol} <FiXCircle size={14} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => handleRemoveVolunteer(vol)} />
//                                         </span>
//                                     ))}
//                                 </div>
//                                 <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" value="" onChange={handleAddVolunteer}>
//                                     <option value="">+ Add Staff/Volunteer</option>
//                                     {volunteers.map(v => <option key={v._id} value={v.name}>{v.name} ({v.designation || "Staff"})</option>)}
//                                 </select>
//                             </div>

//                             <div className="space-y-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Partners (Doctors)</label>
//                                 <div className="flex flex-wrap gap-2 mb-2">
//                                     {campForm.partners.map(pid => {
//                                         const p = partnerList.find(pl => pl._id === pid);
//                                         return p ? (
//                                             <span key={pid} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1 shadow-sm">
//                                                 {p.clinicName || p.name} <FiXCircle size={14} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => handleRemovePartner(pid)} />
//                                             </span>
//                                         ) : null;
//                                     })}
//                                 </div>
//                                 <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" value="" onChange={handleAddPartner}>
//                                     <option value="">+ Assign Partner Doctor</option>
//                                     {partnerList.map(p => <option key={p._id} value={p._id}>{p.clinicName || p.name}</option>)}
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
//                             <button onClick={() => setShowCampModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
//                             <button onClick={handleCreateCamp} className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">Create Camp</button>
//                         </div>
//                     </div>
//                 </div>
//                 , document.body)}

//             {/* SHARE MODAL */}
//             {showShareModal && currentPatient && (
//                 createPortal(
//                     <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//                         <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
//                             <div className="bg-green-600 p-6 text-white text-center">
//                                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
//                                     <FiMessageCircle size={32} />
//                                 </div>
//                                 <h3 className="text-xl font-bold">Share Report Link</h3>
//                                 <p className="text-sm text-green-100 mt-1 opacity-90">WhatsApp message generated successfully!</p>
//                             </div>
//                             <div className="p-6 space-y-6">
//                                 <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
//                                     <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-lg">
//                                         {currentPatient?.name?.charAt(0).toUpperCase()}
//                                     </div>
//                                     <div>
//                                         <p className="font-bold text-gray-900">{currentPatient?.name}</p>
//                                         <p className="text-xs text-gray-500 font-medium">{currentPatient?.contact || "No Number"}</p>
//                                     </div>
//                                 </div>

//                                 <div className="p-4 bg-green-50/50 border-2 border-green-200 border-dashed rounded-2xl">
//                                     <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-2">Message Preview</p>
//                                     <div className="bg-white p-3 rounded-lg border border-green-100 max-h-32 overflow-y-auto text-xs text-gray-600 leading-relaxed italic">
//                                         {downloadLink}
//                                     </div>
//                                 </div>

//                                 <div className="space-y-3">
//                                     <button onClick={handleWhatsAppShare} className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
//                                         <FiMessageCircle size={18} /> Open WhatsApp
//                                     </button>
//                                     <button onClick={handleCopyMessage} className="w-full py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 flex items-center justify-center gap-2 transition-all">
//                                         {copied ? <FiCheckCircle size={18} /> : <FiCopy size={18} />}
//                                         {copied ? "Copied!" : "Copy Link"}
//                                     </button>
//                                     <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     , document.body)
//             )}

//             {/* VIEW CAMP MODAL */}
//             {viewCamp && createPortal(
//                 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
//                     <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
//                         <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//                             <div>
//                                 <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
//                                 <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
//                                     <div className="flex items-center gap-1.5">
//                                         <FiMapPin size={14} className="text-indigo-500" />
//                                         <span>{viewCamp.location}</span>
//                                     </div>
//                                     <div className="flex items-center gap-1.5">
//                                         <FiCalendar size={14} className="text-indigo-500" />
//                                         <span>{viewCamp.date}</span>
//                                     </div>
//                                     <div className="flex items-center gap-1.5">
//                                         <FiClock size={14} className="text-indigo-500" />
//                                         <span>{viewCamp.time}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setViewCamp(null)}
//                                 className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm"
//                             >
//                                 <FiX size={16} />
//                             </button>
//                         </div>

//                         <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
//                             <div className="flex items-center gap-3">
//                                 <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
//                                     {viewCampPatients.length} Participants
//                                 </span>
//                                 <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
//                             </div>

//                             <button
//                                 onClick={handleDownloadCampCSV}
//                                 className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
//                             >
//                                 <FiFileText size={16} />
//                                 Download Report
//                             </button>
//                         </div>

//                         <div className="overflow-auto flex-1 p-0 custom-scrollbar">
//                             <table className="w-full text-left border-collapse">
//                                 <thead className="bg-gray-50 sticky top-0 z-10">
//                                     <tr>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Patient Name</th>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contact</th>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Age / Gender</th>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Health Check</th>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {viewCampPatients.length > 0 ? (
//                                         viewCampPatients.map(patient => (
//                                             <tr key={patient._id} className="hover:bg-gray-50/80 transition-colors group">
//                                                 <td className="p-4">
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
//                                                             {patient.name?.charAt(0).toUpperCase()}
//                                                         </div>
//                                                         <span className="font-semibold text-gray-900">{patient.name}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="p-4 text-sm text-gray-600 font-medium font-mono">{patient.contact}</td>
//                                                 <td className="p-4 text-sm text-gray-500">
//                                                     {patient.age} Y <span className="mx-1">•</span> {patient.gender}
//                                                 </td>
//                                                 <td className="p-4">
//                                                     {patient.tests && patient.tests.length > 0 ? (
//                                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
//                                                             <FiCheckCircle size={12} /> Screened
//                                                         </span>
//                                                     ) : (
//                                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-400 text-xs font-bold border border-gray-200">
//                                                             Pending
//                                                         </span>
//                                                     )}
//                                                 </td>
//                                                 <td className="p-4 text-right">
//                                                     <button
//                                                         onClick={() => navigate(`/patient/${patient._id}`)}
//                                                         className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
//                                                     >
//                                                         Details <FiChevronRight size={12} />
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={5} className="p-12 text-center text-gray-400">
//                                                 <div className="flex flex-col items-center gap-3">
//                                                     <FiUsers size={32} className="opacity-20" />
//                                                     <span className="text-sm font-medium">No patients found in this camp yet.</span>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
//                             <button
//                                 onClick={() => setViewCamp(null)}
//                                 className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>,
//                 document.body
//             )}
//             </div>
//         </div>
//     );
// };

// export default DoctorCamps;

// import axios from "axios";
// import {
//     FiActivity,
//     FiCalendar,
//     FiChevronRight,
//     FiClock,
//     FiFilter,
//     FiMapPin,
//     FiPlus,
//     FiSearch,
//     FiUsers,
//     FiMessageCircle,
//     FiCheckCircle,
//     FiCopy,
//     FiXCircle,
//     FiEye,
//     FiEdit,
//     FiFileText,
//     FiDownload,
//     FiX,
//     FiTrash2,
//     FiUserCheck,
//     FiPlusCircle
// } from "react-icons/fi";
// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate } from "react-router-dom";
// import config from "../config";
// import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";
// import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
// import VolunteerDisplay from "../components/VolunteerDisplay";
// import PartnerDisplay from "../components/PartnerDisplay";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
// import "./Dashboard.css";

// const API_BASE = config.API_BASE_URL;

// const calculateBMI = (weight, heightCm) => {
//     if (!weight || !heightCm) return null;
//     const h = heightCm / 100;
//     return +(weight / (h * h)).toFixed(1);
// };

// const getBMICategory = (bmi) => {
//     if (!bmi) return "-";
//     if (bmi < 18.5) return "Underweight";
//     if (bmi < 25) return "Healthy";
//     if (bmi < 30) return "Overweight";
//     return "Obese";
// };

// const extractLatestVitals = (tests = []) => {
//     const r = {};
//     if (!tests) return r;
//     tests.forEach(t => {
//         r.date = t.date;
//         if (t.type === "weight") r.weight = t.value;
//         if (t.type === "height") r.height = t.value;
//         if (t.type === "sugar") r.sugar = t.value;
//         if (t.type === "sugarType") r.sugarType = t.value;
//         if (t.type === "bp") {
//             r.systolic = t.value;
//             r.diastolic = t.value2;
//         }
//     });
//     return r;
// };

// const DoctorCamps = () => {
//     const navigate = useNavigate();
//     const [camps, setCamps] = useState([]);
//     const [createdCamps, setCreatedCamps] = useState([]);
//     const [patients, setPatients] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [partnerList, setPartnerList] = useState([]);
//     const [volunteers, setVolunteers] = useState([]);
//     const [volunteerMap, setVolunteerMap] = useState({});
//     const [partnerMap, setPartnerMap] = useState({});

//     const [selectedCampId, setSelectedCampId] = useState("all");
//     const [searchQuery, setSearchQuery] = useState("");
//     const [activeTab, setActiveTab] = useState("assigned");

//     const [showCampModal, setShowCampModal] = useState(false);
//     const [viewCamp, setViewCamp] = useState(null);
//     const [campForm, setCampForm] = useState({ 
//         name: "", 
//         location: "", 
//         address: "", 
//         date: "", 
//         time: "", 
//         volunteers: [],
//         partners: []
//     });
//     const [editingCamp, setEditingCamp] = useState(null);
//     const [showEditModal, setShowEditModal] = useState(false);

//     const [showShareModal, setShowShareModal] = useState(false);
//     const [currentPatient, setCurrentPatient] = useState(null);
//     const [downloadLink, setDownloadLink] = useState("");
//     const [copied, setCopied] = useState(false);
//     const [downloadingBulk, setDownloadingBulk] = useState(false);

//     const partnerId = useMemo(() => {
//         const userData = localStorage.getItem("userData");
//         return localStorage.getItem("userId") || (userData ? JSON.parse(userData).id : null);
//     }, []);

//     // Helper functions
//     const getVolunteerName = (id) => {
//         if (!id) return 'Unknown';
//         if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) return id;
//         if (typeof id === 'object' && id !== null && id.name) return id.name;
//         const idStr = String(id);
//         return volunteerMap[idStr] || idStr;
//     };

//     const getPartnerName = (id) => {
//         if (!id) return 'Unknown';
//         if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) return id;
//         if (typeof id === 'object' && id !== null && id.name) return id.name;
//         const idStr = String(id);
//         return partnerMap[idStr] || idStr;
//     };

//     useEffect(() => {
//         if (partnerId) {
//             fetchData();
//         } else {
//             setLoading(false);
//         }
//     }, [partnerId]);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
            
//             // Fetch employees
//             const employeesRes = await axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
//             const empData = employeesRes.data || [];
//             const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
//             const volMap = {};
//             allEmployees.forEach(emp => { volMap[emp._id] = emp.name; });
//             setVolunteerMap(volMap);
            
//             const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
//             const filteredVolunteers = allEmployees.filter(emp => {
//                 const dept = (emp.department || "").trim();
//                 return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
//             });
//             setVolunteers(filteredVolunteers);

//             // Fetch partners
//             const partnersRes = await axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }));
//             let partnerData = partnersRes.data || [];
//             if (!Array.isArray(partnerData)) {
//                 partnerData = partnerData.data || partnerData.partners || [];
//                 if (!Array.isArray(partnerData)) partnerData = [];
//             }
//             setPartnerList(partnerData);
//             const pMap = {};
//             partnerData.forEach(p => { pMap[p._id] = p.name; });
//             setPartnerMap(pMap);

//             // Fetch assigned camps
//             const assignedRes = await axios.get(`${API_BASE}/camps/assigned-camps/${partnerId}`).catch(() => ({ data: [] }));
//             let assignedData = [];
//             if (assignedRes.data) {
//                 if (Array.isArray(assignedRes.data)) assignedData = assignedRes.data;
//                 else if (assignedRes.data.data && Array.isArray(assignedRes.data.data)) assignedData = assignedRes.data.data;
//                 else if (assignedRes.data.camps && Array.isArray(assignedRes.data.camps)) assignedData = assignedRes.data.camps;
//             }
//             setCamps(assignedData);

//             // Fetch created camps
//             const createdRes = await axios.get(`${API_BASE}/camps/partner-created-camps/${partnerId}`).catch(() => ({ data: [] }));
//             let createdData = [];
//             if (createdRes.data) {
//                 if (Array.isArray(createdRes.data)) createdData = createdRes.data;
//                 else if (createdRes.data.data && Array.isArray(createdRes.data.data)) createdData = createdRes.data.data;
//                 else if (createdRes.data.camps && Array.isArray(createdRes.data.camps)) createdData = createdRes.data.camps;
//             }
//             setCreatedCamps(createdData);

//             // Fetch patients
//             const patientsRes = await axios.get(`${API_BASE}/patients`);
//             let patientData = [];
//             if (patientsRes.data) {
//                 if (Array.isArray(patientsRes.data)) patientData = patientsRes.data;
//                 else if (patientsRes.data.data && Array.isArray(patientsRes.data.data)) patientData = patientsRes.data.data;
//                 else if (patientsRes.data.patients && Array.isArray(patientsRes.data.patients)) patientData = patientsRes.data.patients;
//             }
//             const allCampIds = [...assignedData.map(c => String(c._id)), ...createdData.map(c => String(c._id))];
//             const filteredPatients = patientData.filter(p =>
//                 p.campId && allCampIds.includes(String(p.campId?._id || p.campId))
//             );
//             setPatients(filteredPatients);

//         } catch (err) {
//             console.error("Error fetching data:", err);
//             setCamps([]);
//             setCreatedCamps([]);
//             setPatients([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const allCamps = useMemo(() => [...camps, ...createdCamps], [camps, createdCamps]);
//     const displayCamps = useMemo(() => {
//         return activeTab === "assigned" ? camps : createdCamps;
//     }, [camps, createdCamps, activeTab]);

//     const filteredPatients = useMemo(() => {
//         return patients.filter(p => {
//             if (selectedCampId !== "all" && String(p.campId?._id) !== String(selectedCampId)) return false;
//             if (searchQuery) {
//                 const q = searchQuery.toLowerCase();
//                 const matchesName = p.name?.toLowerCase().includes(q);
//                 const matchesPhone = p.contact?.includes(q);
//                 if (!matchesName && !matchesPhone) return false;
//             }
//             return true;
//         });
//     }, [patients, selectedCampId, searchQuery]);

//     const viewCampPatients = useMemo(() => {
//         if (!viewCamp) return [];
//         return patients.filter(p => String(p.campId?._id || p.campId) === String(viewCamp._id));
//     }, [viewCamp, patients]);

//     const campsWithCount = useMemo(() => {
//         return displayCamps.map(c => {
//             const count = patients.filter(p => String(p.campId?._id) === String(c._id)).length;
//             return { ...c, count };
//         });
//     }, [displayCamps, patients]);

//     const handleCreateCamp = async () => {
//         try {
//             if (!campForm.name || !campForm.location || !campForm.date || !campForm.time) {
//                 alert("Please fill all required fields");
//                 return;
//             }

//             const formData = {
//                 name: campForm.name,
//                 location: campForm.location,
//                 address: campForm.address || "",
//                 date: campForm.date,
//                 time: campForm.time,
//                 createdBy: partnerId,
//                 creatorRole: "partner",
//                 volunteers: campForm.volunteers || [],
//                 partners: campForm.partners || []
//             };
            
//             const response = await axios.post(`${API_BASE}/camps/create-by-partner`, formData);
//             console.log("✅ Camp created:", response.data);
            
//             alert("✅ Camp created successfully");
//             setShowCampModal(false);
//             setCampForm({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });
//             fetchData();
//         } catch (err) {
//             console.error("❌ Create camp error:", err);
//             alert("❌ Failed to create camp: " + (err.response?.data?.message || err.message));
//         }
//     };

//     const handleUpdateCamp = async () => {
//         try {
//             if (!editingCamp) return;
//             const formData = {
//                 name: campForm.name,
//                 location: campForm.location,
//                 address: campForm.address || "",
//                 date: campForm.date,
//                 time: campForm.time,
//                 volunteers: campForm.volunteers || [],
//                 partners: campForm.partners || []
//             };
//             await axios.put(`${API_BASE}/camps/update-partner-camp/${editingCamp._id}`, formData);
//             alert("✅ Camp updated successfully");
//             setShowEditModal(false);
//             setEditingCamp(null);
//             setCampForm({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });
//             fetchData();
//         } catch (err) {
//             console.error("Update camp error:", err);
//             alert("❌ Failed to update camp");
//         }
//     };

//     const handleDeleteCamp = async (campId) => {
//         if (!window.confirm("Are you sure you want to delete this camp?")) return;
//         try {
//             await axios.delete(`${API_BASE}/camps/delete-partner-camp/${campId}`);
//             alert("✅ Camp deleted successfully");
//             fetchData();
//         } catch (err) {
//             console.error("Delete camp error:", err);
//             alert("❌ Failed to delete camp");
//         }
//     };

//     const openEditModal = (camp) => {
//         setEditingCamp(camp);
//         setCampForm({
//             name: camp.name || "",
//             location: camp.location || "",
//             address: camp.address || "",
//             date: camp.date || "",
//             time: camp.time || "",
//             volunteers: camp.volunteers || [],
//             partners: camp.partners || []
//         });
//         setShowEditModal(true);
//     };

//     const handleAddVolunteer = (e) => {
//         const val = e.target.value;
//         if (val && !campForm.volunteers.includes(val)) {
//             setCampForm({ ...campForm, volunteers: [...campForm.volunteers, val] });
//         }
//         e.target.value = "";
//     };

//     const handleRemoveVolunteer = (index) => {
//         setCampForm({ 
//             ...campForm, 
//             volunteers: campForm.volunteers.filter((_, i) => i !== index) 
//         });
//     };

//     const handleAddPartner = (e) => {
//         const selectedId = e.target.value;
//         if (selectedId && !campForm.partners.includes(selectedId)) {
//             setCampForm({ ...campForm, partners: [...campForm.partners, selectedId] });
//         }
//         e.target.value = "";
//     };

//     const handleRemovePartner = (index) => {
//         setCampForm({
//             ...campForm,
//             partners: campForm.partners.filter((_, i) => i !== index)
//         });
//     };

//     // Report functions
//     const prepareReportData = async (patientId) => {
//         try {
//             const res = await axios.get(`${API_BASE}/patients/${patientId}`);
//             const fullPatient = res.data;
//             if (!fullPatient?.tests?.length) {
//                 alert("No test data available for this patient.");
//                 return null;
//             }
//             const test = extractLatestVitals(fullPatient.tests);
//             const bmiValue = calculateBMI(test.weight, test.height);
//             const patientData = {
//                 name: fullPatient.name,
//                 age: fullPatient.age,
//                 gender: fullPatient.gender,
//                 id: fullPatient._id.slice(-6).toUpperCase(),
//                 date: new Date(test.date || Date.now()).toLocaleDateString(),
//                 phone: fullPatient.contact,
//                 address: fullPatient.address,
//             };
//             const testsData = {
//                 weight: test.weight,
//                 height: test.height,
//                 sugar: test.sugar,
//                 sugarType: test.sugarType || "Random",
//                 systolic: test.systolic,
//                 diastolic: test.diastolic,
//                 heartRate: "-",
//             };
//             const bmiData = { bmi: bmiValue, category: getBMICategory(bmiValue) };
//             return { patientData, testsData, bmiData };
//         } catch (err) {
//             console.error(err);
//             alert("Failed to fetch report data.");
//             return null;
//         }
//     };

//     const uploadPdfToServer = async (patientData, testsData, bmiData) => {
//         const rawPdf = await generateMedicalReportFile(patientData, testsData, bmiData);
//         const pdfBlob = new Blob([rawPdf], { type: "application/pdf" });
//         const formData = new FormData();
//         formData.append("file", pdfBlob, "health-report.pdf");
//         const res = await axios.post(`${API_BASE}/reports/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
//         return res.data.downloadLink;
//     };

//     const downloadPDF = async (patient) => {
//         const data = await prepareReportData(patient._id);
//         if (!data) return;
//         generateMedicalReport(data.patientData, data.testsData, data.bmiData);
//     };

//     const viewReport = async (patient) => {
//         const data = await prepareReportData(patient._id);
//         if (!data) return;
//         navigate('/health-report', { state: { patient: data.patientData, tests: data.testsData } });
//     };

//     const shareReport = async (patient) => {
//         try {
//             setCurrentPatient(patient);
//             const data = await prepareReportData(patient._id);
//             if (!data) return;
//             const publicLink = await uploadPdfToServer(data.patientData, data.testsData, data.bmiData);
//             const message = `*Health Checkup Report* 🩺\n\nHello ${patient.name},\nYour medical health report is ready.\n\n📄 Download Report:\n${publicLink}\n\n(Generated by BIM Medical)`;
//             setDownloadLink(message);
//             setShowShareModal(true);
//         } catch (err) {
//             console.error("UPLOAD ERROR", err);
//             alert("Failed to generate sharing link");
//         }
//     };

//     const handleWhatsAppShare = () => {
//         if (!currentPatient || !downloadLink) return;
//         const phone = currentPatient.contact ? currentPatient.contact.replace(/\D/g, '') : '';
//         if (!phone) { alert("Phone number required"); return; }
//         window.open(`https://wa.me/${phone}?text=${encodeURIComponent(downloadLink)}`, "_blank");
//         setShowShareModal(false);
//     };

//     const handleCopyMessage = () => {
//         navigator.clipboard.writeText(downloadLink);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     const handleDownloadCampCSV = () => {
//         if (!viewCamp || viewCampPatients.length === 0) {
//             alert("No data to download");
//             return;
//         }
//         const headers = ["Patient Name", "Age", "Gender", "Contact", "Camp Name", "Date", "Location", "BMI", "BP (Sys/Dia)", "Sugar"];
//         const rows = viewCampPatients.map(p => {
//             let bmi = "-", bp = "-", sugar = "-";
//             if (p.tests && p.tests.length > 0) {
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
//                 p.name, p.age, p.gender, p.contact,
//                 viewCamp.name, viewCamp.date, viewCamp.location,
//                 bmi, bp, sugar
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

//     const handleBulkDownload = async () => {
//         if (selectedCampId === "all") {
//             alert("Please select a specific camp to download bulk reports.");
//             return;
//         }
//         const campPatients = filteredPatients;
//         if (campPatients.length === 0) {
//             alert("No patient reports to download for this camp.");
//             return;
//         }
//         try {
//             setDownloadingBulk(true);
//             const zip = new JSZip();
//             const campName = allCamps.find(c => String(c._id) === String(selectedCampId))?.name || "Camp";
//             for (const p of campPatients) {
//                 const data = await prepareReportData(p._id);
//                 if (data) {
//                     const pdfBytes = await generateMedicalReportFile(data.patientData, data.testsData, data.bmiData);
//                     const fileName = `${p.name.replace(/\s+/g, "_")}_${p._id.slice(-4)}.pdf`;
//                     zip.file(fileName, pdfBytes);
//                 }
//             }
//             const content = await zip.generateAsync({ type: "blob" });
//             saveAs(content, `${campName.replace(/\s+/g, "_")}_Reports.zip`);
//         } catch (err) {
//             console.error("Bulk download error:", err);
//             alert("Error generating bulk reports.");
//         } finally {
//             setDownloadingBulk(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-[60vh]">
//                 <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="admin-dash">
//             <div className="admin-dash__header">
//                 <div>
//                     <h1 className="admin-dash__greeting">
//                         Camp <span>Dashboard</span>
//                     </h1>
//                     <p className="admin-dash__subtitle">
//                         Manage your assigned camps and patient data.
//                     </p>
//                 </div>
//                 <div className="admin-dash__date-pill">
//                     <FiCalendar />
//                     <span>
//                         {new Date().toLocaleDateString("en-US", {
//                             weekday: "short",
//                             year: "numeric",
//                             month: "short",
//                             day: "numeric",
//                         })}
//                     </span>
//                 </div>
//             </div>

//             <div className="space-y-10">
//                 <div className="admin-dash__stats">
//                     <div className="admin-dash__stat">
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Assigned Camps</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
//                                 <FiMapPin />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{camps.length}</div>
//                         <div className="admin-dash__stat-meta">total assignments</div>
//                     </div>
//                     <div className="admin-dash__stat">
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Created Camps</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
//                                 <FiPlusCircle />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{createdCamps.length}</div>
//                         <div className="admin-dash__stat-meta">camps you created</div>
//                     </div>
//                     <div className="admin-dash__stat">
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Total Patients</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
//                                 <FiUsers />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{patients.length}</div>
//                         <div className="admin-dash__stat-meta">total patients</div>
//                     </div>
//                     <div className="admin-dash__stat">
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Upcoming</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
//                                 <FiCalendar />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{allCamps.filter(c => getCampStatus(c.date, c.time).status === 'upcoming').length}</div>
//                         <div className="admin-dash__stat-meta">upcoming camps</div>
//                     </div>
//                     <div className="admin-dash__stat">
//                         <div className="admin-dash__stat-top">
//                             <span className="admin-dash__stat-label">Live</span>
//                             <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
//                                 <FiActivity />
//                             </div>
//                         </div>
//                         <div className="admin-dash__stat-value">{allCamps.filter(c => getCampStatus(c.date, c.time).status === 'live').length}</div>
//                         <div className="admin-dash__stat-meta">live screenings</div>
//                     </div>
//                 </div>

//                 <div className="admin-dash__card">
//                     <div className="admin-dash__card-header">
//                         <h3 className="admin-dash__card-title">My Camps</h3>
//                         <div className="flex items-center gap-3">
//                             <div className="flex bg-gray-100 rounded-xl p-1">
//                                 <button
//                                     onClick={() => setActiveTab("assigned")}
//                                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
//                                         activeTab === "assigned" 
//                                             ? "bg-white text-indigo-600 shadow-sm" 
//                                             : "text-gray-500 hover:text-gray-700"
//                                     }`}
//                                 >
//                                     Assigned ({camps.length})
//                                 </button>
//                                 <button
//                                     onClick={() => setActiveTab("created")}
//                                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
//                                         activeTab === "created" 
//                                             ? "bg-white text-indigo-600 shadow-sm" 
//                                             : "text-gray-500 hover:text-gray-700"
//                                     }`}
//                                 >
//                                     Created ({createdCamps.length})
//                                 </button>
//                             </div>
//                             <button
//                                 onClick={() => setShowCampModal(true)}
//                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
//                             >
//                                 <FiPlus size={14} />
//                                 Create Camp
//                             </button>
//                         </div>
//                     </div>
//                     <div className="admin-dash__card-body">
//                         {campsWithCount.length === 0 ? (
//                             <div className="p-12 text-center text-gray-500">
//                                 <FiActivity size={48} className="mx-auto text-gray-200 mb-4" />
//                                 <p className="font-medium">
//                                     {activeTab === "assigned" ? "No camps assigned yet." : "You haven't created any camps yet."}
//                                 </p>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                                 {campsWithCount.map(camp => {
//                                     const isSelected = selectedCampId === camp._id;
//                                     const isCreated = activeTab === "created";
//                                     return (
//                                         <div
//                                             key={camp._id}
//                                             onClick={() => setSelectedCampId(camp._id)}
//                                             className={`cursor-pointer p-5 rounded-2xl border transition-all group relative
//                                                 ${isSelected
//                                                     ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
//                                                     : "bg-white hover:border-indigo-300 hover:shadow-md text-gray-700"
//                                                 }`}
//                                         >
//                                             {isCreated && (
//                                                 <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
//                                                     Your Camp
//                                                 </div>
//                                             )}
//                                             <div className="flex items-start justify-between gap-2 mb-4">
//                                                 <h4 className={`font-bold truncate ${isSelected ? "text-white" : "text-gray-900 group-hover:text-indigo-600 transition-colors"}`}>{camp.name}</h4>
//                                                 <CampStatusBadge date={camp.date} time={camp.time} />
//                                             </div>
//                                             <div className="space-y-2 text-sm font-medium mt-3">
//                                                 <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
//                                                     <FiMapPin size={14} className={isSelected ? "text-indigo-200" : "text-indigo-500"} />
//                                                     <span className="truncate">{camp.location}</span>
//                                                 </div>
//                                                 <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
//                                                     <FiCalendar size={14} className={isSelected ? "text-indigo-200" : "text-indigo-400"} />
//                                                     <span>{camp.date || "No date"}</span>
//                                                 </div>
//                                                 <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
//                                                     <FiClock size={14} className={isSelected ? "text-indigo-200" : "text-indigo-500"} />
//                                                     <span>{camp.time || "No time"}</span>
//                                                 </div>
                                                
//                                                 {camp.volunteers && camp.volunteers.length > 0 && (
//                                                     <div className="mt-1">
//                                                         <div className={`text-[10px] font-semibold mb-1 ${isSelected ? "text-indigo-100" : "text-gray-600"}`}>
//                                                             <FiUsers size={10} className="inline mr-1" />
//                                                             Volunteers:
//                                                         </div>
//                                                         <div className="flex flex-wrap gap-1">
//                                                             {camp.volunteers.map((vol, index) => (
//                                                                 <span key={index} className={`text-[9px] px-2 py-0.5 rounded-full border ${
//                                                                     isSelected 
//                                                                         ? "bg-white/20 text-white border-white/30" 
//                                                                         : "bg-blue-50 text-blue-700 border-blue-200"
//                                                                 }`}>
//                                                                     {getVolunteerName(vol)}
//                                                                 </span>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 )}
                                                
//                                                 {camp.partners && camp.partners.length > 0 && (
//                                                     <div className="mt-1">
//                                                         <div className={`text-[10px] font-semibold mb-1 ${isSelected ? "text-indigo-100" : "text-gray-600"}`}>
//                                                             <FiUserCheck size={10} className="inline mr-1" />
//                                                             Partners:
//                                                         </div>
//                                                         <div className="flex flex-wrap gap-1">
//                                                             {camp.partners.map((partner, index) => (
//                                                                 <span key={index} className={`text-[9px] px-2 py-0.5 rounded-full border ${
//                                                                     isSelected 
//                                                                         ? "bg-white/20 text-white border-white/30" 
//                                                                         : "bg-purple-50 text-purple-700 border-purple-200"
//                                                                 }`}>
//                                                                     {getPartnerName(partner)}
//                                                                 </span>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div className={`mt-5 pt-4 border-t flex items-center justify-between ${isSelected ? "border-white/20" : "border-gray-50"}`}>
//                                                 <div className={`flex items-center gap-2 text-xs font-bold ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
//                                                     <FiUsers size={14} />
//                                                     <span>{camp.count} Patients</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2">
//                                                     {isCreated && (
//                                                         <>
//                                                             <button
//                                                                 onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     openEditModal(camp);
//                                                                 }}
//                                                                 className={`p-1.5 rounded-lg transition-colors ${
//                                                                     isSelected 
//                                                                         ? "text-white hover:bg-white/20" 
//                                                                         : "text-orange-600 hover:bg-orange-50"
//                                                                 }`}
//                                                                 title="Edit Camp"
//                                                             >
//                                                                 <FiEdit size={14} />
//                                                             </button>
//                                                             <button
//                                                                 onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     handleDeleteCamp(camp._id);
//                                                                 }}
//                                                                 className={`p-1.5 rounded-lg transition-colors ${
//                                                                     isSelected 
//                                                                         ? "text-white hover:bg-white/20" 
//                                                                         : "text-red-600 hover:bg-red-50"
//                                                                 }`}
//                                                                 title="Delete Camp"
//                                                             >
//                                                                 <FiTrash2 size={14} />
//                                                             </button>
//                                                         </>
//                                                     )}
//                                                     <button
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             setViewCamp(camp);
//                                                         }}
//                                                         className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all
//                                                             ${isSelected
//                                                                 ? "bg-white/20 text-white hover:bg-white/30"
//                                                                 : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
//                                                             }`}
//                                                     >
//                                                         <FiEye size={12} className="inline mr-1" /> View
//                                                     </button>
//                                                     <div className={`${isSelected ? "text-white" : "text-indigo-600"} opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
//                                                         <FiChevronRight size={18} />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="admin-dash__card">
//                     <div className="admin-dash__card-header">
//                         <h3 className="admin-dash__card-title">Participants</h3>
//                         <div className="flex flex-wrap items-center gap-3">
//                             <div className="relative w-full lg:max-w-md">
//                                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                 <input
//                                     type="text"
//                                     placeholder="Search by name, phone or camp..."
//                                     className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                 />
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-gray-500">
//                                 <FiFilter size={16} />
//                                 <span>{filteredPatients.length} participants</span>
//                             </div>
//                             <button
//                                 onClick={handleBulkDownload}
//                                 disabled={downloadingBulk || selectedCampId === "all"}
//                                 className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-xl 
//                                     ${downloadingBulk || selectedCampId === "all"
//                                         ? 'bg-gray-300 cursor-not-allowed opacity-60'
//                                         : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95'
//                                     }`}
//                             >
//                                 {downloadingBulk ? (
//                                     <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
//                                 ) : (
//                                     <FiDownload size={16} />
//                                 )}
//                                 {downloadingBulk ? "Generating..." : "Download ZIP"}
//                             </button>
//                             <button
//                                 onClick={() => navigate("/add-patient", { state: { campId: selectedCampId !== "all" ? selectedCampId : "" } })}
//                                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
//                             >
//                                 <FiPlus size={16} /> Add Patient
//                             </button>
//                         </div>
//                     </div>
//                     <div className="admin-dash__card-body p-0">
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left">
//                                 <thead>
//                                     <tr className="border-b border-gray-100 bg-gray-50/50">
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
//                                         <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Reports</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-100">
//                                     {filteredPatients.length > 0 ? (
//                                         filteredPatients.map((patient) => (
//                                             <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
//                                                 <td className="p-4">
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
//                                                             {patient.name?.charAt(0)?.toUpperCase()}
//                                                         </div>
//                                                         <div>
//                                                             <p className="font-semibold text-gray-900">{patient.name}</p>
//                                                             <p className="text-xs text-gray-500">{patient.age || 'N/A'} Y • {patient.gender || 'N/A'}</p>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <span className="text-sm font-medium text-gray-700">{patient.contact || "N/A"}</span>
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
//                                                         {patient.campId?.name || "N/A"}
//                                                     </span>
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <div className="flex items-center gap-2">
//                                                         <button onClick={() => viewReport(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
//                                                             <FiEye size={14} /> View
//                                                         </button>
//                                                         <button onClick={() => navigate(`/patient/${patient._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
//                                                             <FiEdit size={14} /> Edit
//                                                         </button>
//                                                         <button onClick={() => downloadPDF(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
//                                                             <FiFileText size={14} /> Download
//                                                         </button>
//                                                         <button onClick={() => shareReport(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
//                                                             <FiMessageCircle size={14} /> WhatsApp
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={4} className="p-12 text-center text-gray-400">
//                                                 <div className="flex flex-col items-center justify-center gap-3">
//                                                     <FiUsers size={48} className="opacity-20" />
//                                                     <p className="text-lg font-medium">No participants found</p>
//                                                     <p className="text-sm">Try adjusting your search or filters.</p>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Create Camp Modal */}
//             {showCampModal && createPortal(
//                 <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
//                     <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
//                         <div className="p-6 border-b border-gray-100">
//                             <div className="flex items-center justify-between mb-2">
//                                 <h2 className="text-xl font-bold text-gray-800">Create New Camp</h2>
//                                 <button onClick={() => setShowCampModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
//                                     <FiXCircle size={20} />
//                                 </button>
//                             </div>
//                             <p className="text-sm text-gray-500 font-medium">Schedule a new screening event and assign staff/partners.</p>
//                         </div>
//                         <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camp Name *</label>
//                                 <input 
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
//                                     placeholder="E.g., Heart Health Screening" 
//                                     value={campForm.name} 
//                                     onChange={e => setCampForm({ ...campForm, name: e.target.value })} 
//                                 />
//                             </div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-1.5">
//                                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location *</label>
//                                     <input 
//                                         className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
//                                         placeholder="City/Area" 
//                                         value={campForm.location} 
//                                         onChange={e => setCampForm({ ...campForm, location: e.target.value })} 
//                                     />
//                                 </div>
//                                 <div className="space-y-1.5">
//                                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date *</label>
//                                     <input 
//                                         type="date" 
//                                         className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
//                                         value={campForm.date} 
//                                         onChange={e => setCampForm({ ...campForm, date: e.target.value })} 
//                                     />
//                                 </div>
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</label>
//                                 <input 
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
//                                     placeholder="Enter full address" 
//                                     value={campForm.address} 
//                                     onChange={e => setCampForm({ ...campForm, address: e.target.value })} 
//                                 />
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Range *</label>
//                                 <input 
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
//                                     placeholder="E.g., 10:00 AM - 4:00 PM" 
//                                     value={campForm.time} 
//                                     onChange={e => setCampForm({ ...campForm, time: e.target.value })} 
//                                 />
//                             </div>
//                             <div className="space-y-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Volunteers</label>
//                                 <div className="flex flex-wrap gap-2 mb-2">
//                                     {campForm.volunteers && campForm.volunteers.map((vol, index) => (
//                                         <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1 shadow-sm">
//                                             {getVolunteerName(vol)}
//                                             <FiXCircle 
//                                                 size={14} 
//                                                 className="cursor-pointer opacity-60 hover:opacity-100" 
//                                                 onClick={() => handleRemoveVolunteer(index)} 
//                                             />
//                                         </span>
//                                     ))}
//                                 </div>
//                                 <select 
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
//                                     value="" 
//                                     onChange={handleAddVolunteer}
//                                 >
//                                     <option value="">+ Add Staff/Volunteer</option>
//                                     {volunteers.map(v => (
//                                         <option key={v._id} value={v._id}>
//                                             {v.name} ({v.designation || "Staff"})
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div className="space-y-2 pt-2 border-t border-gray-100">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Partners</label>
//                                 <div className="flex flex-wrap gap-2 mb-2">
//                                     {campForm.partners && campForm.partners.map((partner, index) => (
//                                         <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1 shadow-sm">
//                                             {getPartnerName(partner)}
//                                             <FiXCircle 
//                                                 size={14} 
//                                                 className="cursor-pointer opacity-60 hover:opacity-100" 
//                                                 onClick={() => handleRemovePartner(index)} 
//                                             />
//                                         </span>
//                                     ))}
//                                 </div>
//                                 <select 
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" 
//                                     value="" 
//                                     onChange={handleAddPartner}
//                                 >
//                                     <option value="">+ Add Partner</option>
//                                     {partnerList.map(p => (
//                                         <option key={p._id} value={p._id}>
//                                             {p.name} ({p.organization || "Partner"})
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>
//                         <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
//                             <button 
//                                 onClick={() => setShowCampModal(false)} 
//                                 className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button 
//                                 onClick={handleCreateCamp} 
//                                 className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
//                             >
//                                 Create Camp
//                             </button>
//                         </div>
//                     </div>
//                 </div>,
//                 document.body
//             )}

//             {/* Edit Camp Modal */}
//             {showEditModal && editingCamp && createPortal(
//                 <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
//                     <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
//                         <div className="p-6 border-b border-gray-100">
//                             <div className="flex items-center justify-between mb-2">
//                                 <h2 className="text-xl font-bold text-gray-800">Edit Camp</h2>
//                                 <button onClick={() => { setShowEditModal(false); setEditingCamp(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
//                                     <FiXCircle size={20} />
//                                 </button>
//                             </div>
//                             <p className="text-sm text-gray-500 font-medium">Update camp details</p>
//                         </div>
//                         <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camp Name</label>
//                                 <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} />
//                             </div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-1.5">
//                                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
//                                     <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.location} onChange={e => setCampForm({ ...campForm, location: e.target.value })} />
//                                 </div>
//                                 <div className="space-y-1.5">
//                                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
//                                     <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.date} onChange={e => setCampForm({ ...campForm, date: e.target.value })} />
//                                 </div>
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Range</label>
//                                 <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.time} onChange={e => setCampForm({ ...campForm, time: e.target.value })} />
//                             </div>
                            
//                             <div className="space-y-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Volunteers</label>
//                                 <div className="flex flex-wrap gap-2 mb-2">
//                                     {campForm.volunteers && campForm.volunteers.map((vol, index) => (
//                                         <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1 shadow-sm">
//                                             {getVolunteerName(vol)}
//                                             <FiXCircle 
//                                                 size={14} 
//                                                 className="cursor-pointer opacity-60 hover:opacity-100" 
//                                                 onClick={() => handleRemoveVolunteer(index)} 
//                                             />
//                                         </span>
//                                     ))}
//                                 </div>
//                                 <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" value="" onChange={handleAddVolunteer}>
//                                     <option value="">+ Add Staff/Volunteer</option>
//                                     {volunteers.map(v => <option key={v._id} value={v._id}>{v.name} ({v.designation || "Staff"})</option>)}
//                                 </select>
//                             </div>

//                             <div className="space-y-2 pt-2 border-t border-gray-100">
//                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Partners</label>
//                                 <div className="flex flex-wrap gap-2 mb-2">
//                                     {campForm.partners && campForm.partners.map((partner, index) => (
//                                         <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1 shadow-sm">
//                                             {getPartnerName(partner)}
//                                             <FiXCircle 
//                                                 size={14} 
//                                                 className="cursor-pointer opacity-60 hover:opacity-100" 
//                                                 onClick={() => handleRemovePartner(index)} 
//                                             />
//                                         </span>
//                                     ))}
//                                 </div>
//                                 <select 
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" 
//                                     value="" 
//                                     onChange={handleAddPartner}
//                                 >
//                                     <option value="">+ Add Partner</option>
//                                     {partnerList.map(p => (
//                                         <option key={p._id} value={p._id}>
//                                             {p.name} ({p.organization || "Partner"})
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>
//                         <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
//                             <button onClick={() => { setShowEditModal(false); setEditingCamp(null); }} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
//                             <button onClick={handleUpdateCamp} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Update Camp</button>
//                         </div>
//                     </div>
//                 </div>,
//                 document.body
//             )}

//             {/* View Camp Modal */}
//             {viewCamp && createPortal(
//                 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
//                     <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
//                         <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//                             <div>
//                                 <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
//                                 <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
//                                     <div className="flex items-center gap-1.5">
//                                         <FiMapPin size={14} className="text-indigo-500" />
//                                         <span>{viewCamp.location}</span>
//                                     </div>
//                                     <div className="flex items-center gap-1.5">
//                                         <FiCalendar size={14} className="text-indigo-500" />
//                                         <span>{viewCamp.date}</span>
//                                     </div>
//                                     <div className="flex items-center gap-1.5">
//                                         <FiClock size={14} className="text-indigo-500" />
//                                         <span>{viewCamp.time}</span>
//                                     </div>
//                                 </div>
//                                 {viewCamp.volunteers && viewCamp.volunteers.length > 0 && (
//                                     <div className="flex items-center gap-2 mt-2">
//                                         <span className="text-xs font-semibold text-gray-600">Volunteers:</span>
//                                         {viewCamp.volunteers.map((vol, index) => (
//                                             <span key={index} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
//                                                 {getVolunteerName(vol)}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 )}
//                                 {viewCamp.partners && viewCamp.partners.length > 0 && (
//                                     <div className="flex items-center gap-2 mt-1">
//                                         <span className="text-xs font-semibold text-gray-600">Partners:</span>
//                                         {viewCamp.partners.map((partner, index) => (
//                                             <span key={index} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
//                                                 {getPartnerName(partner)}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                             <button onClick={() => setViewCamp(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm">
//                                 <FiX size={16} />
//                             </button>
//                         </div>
//                         <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
//                             <div className="flex items-center gap-3">
//                                 <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
//                                     {viewCampPatients.length} Participants
//                                 </span>
//                                 <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
//                             </div>
//                             <button onClick={handleDownloadCampCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95">
//                                 <FiFileText size={16} />
//                                 Download Report
//                             </button>
//                         </div>
//                         <div className="overflow-auto flex-1 p-0 custom-scrollbar">
//                             <table className="w-full text-left border-collapse">
//                                 <thead className="bg-gray-50 sticky top-0 z-10">
//                                     <tr>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Patient Name</th>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contact</th>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Age / Gender</th>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Health Check</th>
//                                         <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {viewCampPatients.length > 0 ? (
//                                         viewCampPatients.map(patient => (
//                                             <tr key={patient._id} className="hover:bg-gray-50/80 transition-colors group">
//                                                 <td className="p-4">
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
//                                                             {patient.name?.charAt(0).toUpperCase()}
//                                                         </div>
//                                                         <span className="font-semibold text-gray-900">{patient.name}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="p-4 text-sm text-gray-600 font-medium font-mono">{patient.contact}</td>
//                                                 <td className="p-4 text-sm text-gray-500">
//                                                     {patient.age} Y <span className="mx-1">•</span> {patient.gender}
//                                                 </td>
//                                                 <td className="p-4">
//                                                     {patient.tests && patient.tests.length > 0 ? (
//                                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
//                                                             <FiCheckCircle size={12} /> Screened
//                                                         </span>
//                                                     ) : (
//                                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-400 text-xs font-bold border border-gray-200">
//                                                             Pending
//                                                         </span>
//                                                     )}
//                                                 </td>
//                                                 <td className="p-4 text-right">
//                                                     <button onClick={() => navigate(`/patient/${patient._id}`)} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
//                                                         Details <FiChevronRight size={12} />
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={5} className="p-12 text-center text-gray-400">
//                                                 <div className="flex flex-col items-center gap-3">
//                                                     <FiUsers size={32} className="opacity-20" />
//                                                     <span className="text-sm font-medium">No patients found in this camp yet.</span>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                         <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
//                             <button onClick={() => setViewCamp(null)} className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm">Close</button>
//                         </div>
//                     </div>
//                 </div>,
//                 document.body
//             )}

//             {/* Share Modal */}
//             {showShareModal && currentPatient && createPortal(
//                 <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//                     <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
//                         <div className="bg-green-600 p-6 text-white text-center">
//                             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
//                                 <FiMessageCircle size={32} />
//                             </div>
//                             <h3 className="text-xl font-bold">Share Report Link</h3>
//                             <p className="text-sm text-green-100 mt-1 opacity-90">WhatsApp message generated successfully!</p>
//                         </div>
//                         <div className="p-6 space-y-6">
//                             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
//                                 <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-lg">
//                                     {currentPatient?.name?.charAt(0).toUpperCase()}
//                                 </div>
//                                 <div>
//                                     <p className="font-bold text-gray-900">{currentPatient?.name}</p>
//                                     <p className="text-xs text-gray-500 font-medium">{currentPatient?.contact || "No Number"}</p>
//                                 </div>
//                             </div>
//                             <div className="p-4 bg-green-50/50 border-2 border-green-200 border-dashed rounded-2xl">
//                                 <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-2">Message Preview</p>
//                                 <div className="bg-white p-3 rounded-lg border border-green-100 max-h-32 overflow-y-auto text-xs text-gray-600 leading-relaxed italic">
//                                     {downloadLink}
//                                 </div>
//                             </div>
//                             <div className="space-y-3">
//                                 <button onClick={handleWhatsAppShare} className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
//                                     <FiMessageCircle size={18} /> Open WhatsApp
//                                 </button>
//                                 <button onClick={handleCopyMessage} className="w-full py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 flex items-center justify-center gap-2 transition-all">
//                                     {copied ? <FiCheckCircle size={18} /> : <FiCopy size={18} />}
//                                     {copied ? "Copied!" : "Copy Link"}
//                                 </button>
//                                 <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>,
//                 document.body
//             )}
//         </div>
//     );
// };

// export default DoctorCamps;



import axios from "axios";
import {
    FiActivity,
    FiCalendar,
    FiChevronRight,
    FiClock,
    FiFilter,
    FiMapPin,
    FiPlus,
    FiSearch,
    FiUsers,
    FiMessageCircle,
    FiCheckCircle,
    FiCopy,
    FiXCircle,
    FiEye,
    FiEdit,
    FiFileText,
    FiDownload,
    FiX,
    FiTrash2,
    FiUserCheck,
    FiPlusCircle,
    FiAlertTriangle
} from "react-icons/fi";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
import VolunteerDisplay from "../components/VolunteerDisplay";
import PartnerDisplay from "../components/PartnerDisplay";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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

const DoctorCamps = () => {
    const navigate = useNavigate();
    const [camps, setCamps] = useState([]);
    const [createdCamps, setCreatedCamps] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [partnerList, setPartnerList] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [partnerVolunteers, setPartnerVolunteers] = useState([]);

    const [volunteerMap, setVolunteerMap] = useState({});
    const [partnerMap, setPartnerMap] = useState({});

    const [selectedCampId, setSelectedCampId] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("assigned");

    const [statsModal, setStatsModal] = useState({
        show: false,
        title: "",
        data: [],
        type: ""
    });

    const [showCampModal, setShowCampModal] = useState(false);
    const [viewCamp, setViewCamp] = useState(null);
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

    const [showShareModal, setShowShareModal] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [downloadLink, setDownloadLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [downloadingBulk, setDownloadingBulk] = useState(false);

    // 🔥 Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const partnerId = useMemo(() => {
        const userData = localStorage.getItem("userData");
        return localStorage.getItem("userId") || (userData ? JSON.parse(userData).id : null);
    }, []);

    useEffect(() => {
        if (partnerId) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [partnerId]);

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

    const getVolunteerName = (id) => {
        if (!id) return 'Unknown';
        if (typeof id === 'object') {
            if (id.name) return id.name;
            if (id.volunteerId && typeof id.volunteerId === 'object' && id.volunteerId.name) return id.volunteerId.name;
            if (id.volunteerId) return volunteerMap[String(id.volunteerId)] || String(id.volunteerId);
            return id.name || id.email || 'Unknown';
        }
        if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) {
            return id;
        }
        const idStr = String(id);
        return volunteerMap[idStr] || idStr;
    };

    const getPartnerName = (id) => {
        if (!id) return 'Unknown';
        if (typeof id === 'object') {
            if (id.name) return id.name;
            if (id.clinicName) return id.clinicName;
            if (id.partnerId && typeof id.partnerId === 'object') {
                return id.partnerId.name || id.partnerId.clinicName;
            }
            if (id.partnerId) return partnerMap[String(id.partnerId)] || String(id.partnerId);
            return id.name || 'Unknown';
        }
        if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) {
            return id;
        }
        const idStr = String(id);
        return partnerMap[idStr] || idStr;
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            
            console.log("🔍 Partner ID:", partnerId);
            
            const employeesRes = await axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
            const empData = employeesRes.data || [];
            const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
            
            const volMap = {};
            allEmployees.forEach(emp => {
                volMap[emp._id] = emp.name;
            });
            setVolunteerMap(volMap);
            
            const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
            const filteredVolunteers = allEmployees.filter(emp => {
                const dept = (emp.department || "").trim();
                return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
            });
            setVolunteers(filteredVolunteers);
            console.log("✅ Volunteers loaded:", filteredVolunteers.length);

            try {
                const partnerVolRes = await axios.get(`${API_BASE}/volunteers/partner-volunteers/${partnerId}`);
                let pvData = [];
                if (partnerVolRes.data) {
                    if (Array.isArray(partnerVolRes.data)) {
                        pvData = partnerVolRes.data;
                    } else if (partnerVolRes.data.volunteers) {
                        pvData = partnerVolRes.data.volunteers;
                    } else if (partnerVolRes.data.data) {
                        pvData = partnerVolRes.data.data;
                    }
                }
                setPartnerVolunteers(pvData);
                console.log("✅ Partner Volunteers loaded:", pvData.length);
            } catch (err) {
                console.error("❌ Error fetching partner volunteers:", err);
                setPartnerVolunteers([]);
            }

            const partnersRes = await axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }));
            let partnerData = partnersRes.data || [];
            if (!Array.isArray(partnerData)) {
                partnerData = partnerData.data || partnerData.partners || [];
                if (!Array.isArray(partnerData)) partnerData = [];
            }
            setPartnerList(partnerData);
            
            const pMap = {};
            partnerData.forEach(p => {
                pMap[p._id] = p.name;
            });
            setPartnerMap(pMap);
            console.log("✅ Partners loaded:", partnerData.length);

            let assignedData = [];
            try {
                const assignedRes = await axios.get(`${API_BASE}/camps/assigned-camps/${partnerId}`);
                console.log("📦 Assigned Camps Response:", assignedRes.data);
                
                if (assignedRes.data) {
                    if (assignedRes.data.data && Array.isArray(assignedRes.data.data)) {
                        assignedData = assignedRes.data.data;
                    } else if (Array.isArray(assignedRes.data)) {
                        assignedData = assignedRes.data;
                    } else if (assignedRes.data.camps && Array.isArray(assignedRes.data.camps)) {
                        assignedData = assignedRes.data.camps;
                    }
                }
                console.log("✅ Assigned Camps from API:", assignedData.length);
            } catch (err) {
                console.error("❌ Assigned camps API failed:", err.message);
            }

            let createdData = [];
            try {
                const createdRes = await axios.get(`${API_BASE}/camps/partner-created-camps/${partnerId}`);
                console.log("📦 Created Camps Response:", createdRes.data);
                
                if (createdRes.data) {
                    if (createdRes.data.data && Array.isArray(createdRes.data.data)) {
                        createdData = createdRes.data.data;
                    } else if (Array.isArray(createdRes.data)) {
                        createdData = createdRes.data;
                    } else if (createdRes.data.camps && Array.isArray(createdRes.data.camps)) {
                        createdData = createdRes.data.camps;
                    }
                }
                console.log("✅ Created Camps from API:", createdData.length);
            } catch (err) {
                console.error("❌ Created camps API failed:", err.message);
            }

            const uniqueAssigned = assignedData.filter((camp, index, self) => 
                index === self.findIndex(c => c._id === camp._id)
            );
            
            const uniqueCreated = createdData.filter((camp, index, self) => 
                index === self.findIndex(c => c._id === camp._id)
            );
            
            console.log("✅ Assigned Camps:", uniqueAssigned.length);
            console.log("✅ Created Camps:", uniqueCreated.length);
            
            setCamps(uniqueAssigned);
            setCreatedCamps(uniqueCreated);

            try {
                const patientsRes = await axios.get(`${API_BASE}/patients`);
                let patientData = [];
                if (patientsRes.data) {
                    if (patientsRes.data.data && Array.isArray(patientsRes.data.data)) {
                        patientData = patientsRes.data.data;
                    } else if (Array.isArray(patientsRes.data)) {
                        patientData = patientsRes.data;
                    } else if (patientsRes.data.patients && Array.isArray(patientsRes.data.patients)) {
                        patientData = patientsRes.data.patients;
                    }
                }
                
                const allCampIds = [...uniqueAssigned.map(c => String(c._id)), ...uniqueCreated.map(c => String(c._id))];
                const filteredPatients = patientData.filter(p =>
                    p.campId && allCampIds.includes(String(p.campId?._id || p.campId))
                );
                setPatients(filteredPatients);
                console.log("✅ Patients loaded:", filteredPatients.length);
            } catch (err) {
                console.error("Error fetching patients:", err);
                setPatients([]);
            }

            console.log("✅ Final Stats - Assigned:", uniqueAssigned.length, "Created:", uniqueCreated.length);

        } catch (err) {
            console.error("❌ Error fetching data:", err);
            setCamps([]);
            setCreatedCamps([]);
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

    const allCamps = useMemo(() => {
        const map = new Map();
        [...camps, ...createdCamps].forEach(camp => {
            if (camp && camp._id) {
                map.set(String(camp._id), camp);
            }
        });
        return Array.from(map.values());
    }, [camps, createdCamps]);

    const displayCamps = useMemo(() => {
        return activeTab === "assigned" ? camps : createdCamps;
    }, [camps, createdCamps, activeTab]);

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

    const campsWithCount = useMemo(() => {
        return displayCamps.map(c => {
            const count = patients.filter(p => String(p.campId?._id) === String(c._id)).length;
            return { ...c, count };
        });
    }, [displayCamps, patients]);

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
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0">
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
                                        {(statsModal.type === "camps" || statsModal.type === "assigned" || statsModal.type === "created" || statsModal.type === "upcoming" || statsModal.type === "live") && (
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
                                            {(statsModal.type === "camps" || statsModal.type === "assigned" || statsModal.type === "created" || statsModal.type === "upcoming" || statsModal.type === "live") && (
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
                                                            statsModal.type === "assigned" 
                                                                ? "bg-blue-100 text-blue-700"
                                                                : statsModal.type === "created"
                                                                    ? "bg-cyan-100 text-cyan-700"
                                                                    : statsModal.type === "upcoming"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : statsModal.type === "live"
                                                                            ? "bg-rose-100 text-rose-700"
                                                                            : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                            {statsModal.type === "assigned" ? "Assigned" :
                                                             statsModal.type === "created" ? "Created" :
                                                             statsModal.type === "upcoming" ? "Upcoming" :
                                                             statsModal.type === "live" ? "Live" : "Active"}
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

    const handleCreateCamp = async () => {
        try {
            if (!campForm.name || !campForm.location || !campForm.date || !campForm.time) {
                alert("Please fill all required fields");
                return;
            }

            const formData = {
                name: campForm.name,
                location: campForm.location,
                address: campForm.address || "",
                date: campForm.date,
                time: campForm.time,
                createdBy: partnerId,
                creatorRole: "partner",
                volunteers: campForm.volunteers || [],
                partners: campForm.partners || []
            };
            
            console.log("📤 Sending camp data:", formData);
            
            const response = await axios.post(`${API_BASE}/camps/create-by-partner`, formData);
            console.log("✅ Camp created response:", response.data);
            
            if (response.data.success) {
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
                fetchData();
            }
        } catch (err) {
            console.error("❌ Create camp error:", err);
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
            
            await axios.put(`${API_BASE}/camps/update-partner-camp/${editingCamp._id}`, formData);
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
            fetchData();
        } catch (err) {
            console.error("❌ Update camp error:", err);
            alert("❌ Failed to update camp: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteCamp = async (campId) => {
        if (!window.confirm("Are you sure you want to delete this camp?")) return;
        try {
            await axios.delete(`${API_BASE}/camps/delete-partner-camp/${campId}`);
            alert("✅ Camp deleted successfully");
            fetchData();
        } catch (err) {
            console.error("❌ Delete camp error:", err);
            alert("❌ Failed to delete camp: " + (err.response?.data?.message || err.message));
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

    const handleAddVolunteer = (e) => {
        const val = e.target.value;
        if (val && !campForm.volunteers.includes(val)) {
            setCampForm({ ...campForm, volunteers: [...campForm.volunteers, val] });
        }
        e.target.value = "";
    };

    const handleRemoveVolunteer = (index) => {
        setCampForm({ 
            ...campForm, 
            volunteers: campForm.volunteers.filter((_, i) => i !== index) 
        });
    };

    const handleAddPartner = (e) => {
        const selectedId = e.target.value;
        if (selectedId && !campForm.partners.includes(selectedId)) {
            setCampForm({
                ...campForm,
                partners: [...campForm.partners, selectedId]
            });
        }
        e.target.value = "";
    };

    const handleRemovePartner = (index) => {
        setCampForm({
            ...campForm,
            partners: campForm.partners.filter((_, i) => i !== index)
        });
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
        const rawPdf = await generateMedicalReportFile(patientData, testsData, bmiData);
        const pdfBlob = new Blob([rawPdf], { type: "application/pdf" });
        const formData = new FormData();
        formData.append("file", pdfBlob, "health-report.pdf");
        const res = await axios.post(`${API_BASE}/reports/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
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
        navigate('/health-report', { state: { patient: data.patientData, tests: data.testsData } });
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

    const handleBulkDownload = async () => {
        if (selectedCampId === "all") {
            alert("Please select a specific camp to download bulk reports.");
            return;
        }

        const campPatients = filteredPatients;
        if (campPatients.length === 0) {
            alert("No patient reports to download for this camp.");
            return;
        }

        try {
            setDownloadingBulk(true);
            const zip = new JSZip();
            const campName = allCamps.find(c => String(c._id) === String(selectedCampId))?.name || "Camp";

            for (const p of campPatients) {
                const data = await prepareReportData(p._id);
                if (data) {
                    const pdfBytes = await generateMedicalReportFile(data.patientData, data.testsData, data.bmiData);
                    const fileName = `${p.name.replace(/\s+/g, "_")}_${p._id.slice(-4)}.pdf`;
                    zip.file(fileName, pdfBytes);
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${campName.replace(/\s+/g, "_")}_Reports.zip`);
        } catch (err) {
            console.error("Bulk download error:", err);
            alert("Error generating bulk reports.");
        } finally {
            setDownloadingBulk(false);
        }
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
            <div className="admin-dash__header">
                <div>
                    <h1 className="admin-dash__greeting">
                        Camp <span>Dashboard</span>
                    </h1>
                    <p className="admin-dash__subtitle">
                        Manage your assigned camps and patient data.
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
                <div className="admin-dash__stats">
                    <div 
                        className="admin-dash__stat cursor-pointer" 
                        onClick={() => openStatsModal("assigned", "Assigned Camps", camps)}
                    >
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Assigned Camps</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                                <FiMapPin />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{camps.length}</div>
                        <div className="admin-dash__stat-meta">total assignments</div>
                    </div>
                    <div 
                        className="admin-dash__stat cursor-pointer" 
                        onClick={() => openStatsModal("created", "Created Camps", createdCamps)}
                    >
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Created Camps</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                                <FiPlusCircle />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{createdCamps.length}</div>
                        <div className="admin-dash__stat-meta">camps you created</div>
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
                        onClick={() => openStatsModal("upcoming", "Upcoming Camps", allCamps.filter(c => getCampStatus(c.date, c.time).status === 'upcoming'))}
                    >
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Upcoming</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                                <FiCalendar />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{allCamps.filter(c => getCampStatus(c.date, c.time).status === 'upcoming').length}</div>
                        <div className="admin-dash__stat-meta">upcoming camps</div>
                    </div>
                    <div 
                        className="admin-dash__stat cursor-pointer" 
                        onClick={() => openStatsModal("live", "Live Camps", allCamps.filter(c => getCampStatus(c.date, c.time).status === 'live'))}
                    >
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Live</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                                <FiActivity />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{allCamps.filter(c => getCampStatus(c.date, c.time).status === 'live').length}</div>
                        <div className="admin-dash__stat-meta">live screenings</div>
                    </div>
                </div>

                <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">My Camps</h3>
                        <div className="flex items-center gap-3">
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
                            <button
                                onClick={() => setShowCampModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
                            >
                                <FiPlus size={14} />
                                Create Camp
                            </button>
                        </div>
                    </div>
                    <div className="admin-dash__card-body">
                        {campsWithCount.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <FiActivity size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="font-medium">
                                    {activeTab === "assigned" ? "No camps assigned yet." : "You haven't created any camps yet."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {campsWithCount.map(camp => {
                                    const isSelected = selectedCampId === camp._id;
                                    const isCreated = activeTab === "created";

                                    return (
                                        <div
                                            key={camp._id}
                                            onClick={() => setSelectedCampId(camp._id)}
                                            className={`cursor-pointer p-5 rounded-2xl border transition-all group relative
                                                ${isSelected
                                                    ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                                                    : "bg-white hover:border-indigo-300 hover:shadow-md text-gray-700"
                                                }`}
                                        >
                                            {isCreated && (
                                                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                    Your Camp
                                                </div>
                                            )}
                                            <div className="flex items-start justify-between gap-2 mb-4">
                                                <h4 className={`font-bold truncate ${isSelected ? "text-white" : "text-gray-900 group-hover:text-indigo-600 transition-colors"}`}>{camp.name}</h4>
                                                <CampStatusBadge date={camp.date} time={camp.time} />
                                            </div>
                                            <div className="space-y-2 text-sm font-medium mt-3">
                                                <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                                    <FiMapPin size={14} className={isSelected ? "text-indigo-200" : "text-indigo-500"} />
                                                    <span className="truncate">{camp.location}</span>
                                                </div>
                                                <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                                    <FiCalendar size={14} className={isSelected ? "text-indigo-200" : "text-indigo-400"} />
                                                    <span>{camp.date || "No date"}</span>
                                                </div>
                                                <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                                    <FiClock size={14} className={isSelected ? "text-indigo-200" : "text-indigo-500"} />
                                                    <span>{camp.time || "No time"}</span>
                                                </div>
                                                
                                                {camp.volunteers && camp.volunteers.length > 0 && (
                                                    <div className="mt-1">
                                                        <VolunteerDisplay
                                                            volunteers={camp.volunteers}
                                                            isSelected={isSelected}
                                                            employeeMap={volunteerMap}
                                                            partnerVolunteers={partnerVolunteers}
                                                        />
                                                    </div>
                                                )}
                                                
                                                <div className="mt-1">
                                                    <PartnerDisplay
                                                        partners={camp.partners}
                                                        isSelected={isSelected}
                                                        partnersList={partnerList}
                                                    />
                                                </div>
                                            </div>
                                            <div className={`mt-5 pt-4 border-t flex items-center justify-between ${isSelected ? "border-white/20" : "border-gray-50"}`}>
                                                <div className={`flex items-center gap-2 text-xs font-bold ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
                                                    <FiUsers size={14} />
                                                    <span>{camp.count} Patients</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isCreated && (
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
                                                                <FiEdit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCamp(camp._id);
                                                                }}
                                                                className={`p-1.5 rounded-lg transition-colors ${
                                                                    isSelected 
                                                                        ? "text-white hover:bg-white/20" 
                                                                        : "text-red-600 hover:bg-red-50"
                                                                }`}
                                                                title="Delete Camp"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewCamp(camp);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all
                                                            ${isSelected
                                                                ? "bg-white/20 text-white hover:bg-white/30"
                                                                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                                            }`}
                                                    >
                                                        <FiEye size={12} className="inline mr-1" /> View
                                                    </button>
                                                    <div className={`${isSelected ? "text-white" : "text-indigo-600"} opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
                                                        <FiChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">Participants</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={selectedCampId}
                                onChange={(e) => setSelectedCampId(e.target.value)}
                                className="text-sm bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-700 shadow-sm"
                            >
                                <option value="all">All Camps</option>
                                {allCamps.map(camp => (
                                    <option key={camp._id} value={camp._id}>{camp.name}</option>
                                ))}
                            </select>
                            <div className="relative w-full sm:w-72">
                                <FiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm"
                                />
                            </div>
                            <button
                                onClick={() => navigate("/add-patient", { state: { campId: selectedCampId !== "all" ? selectedCampId : "" } })}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
                            >
                                <FiPlus size={16} /> Add Patient
                            </button>
                            <button
                                onClick={handleBulkDownload}
                                disabled={downloadingBulk || selectedCampId === "all"}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-xl 
                                    ${downloadingBulk || selectedCampId === "all"
                                        ? 'bg-gray-300 cursor-not-allowed opacity-60'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95'
                                    }`}
                            >
                                {downloadingBulk ? (
                                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                ) : (
                                    <FiDownload size={16} />
                                )}
                                {downloadingBulk ? "Generating..." : "Download ZIP"}
                            </button>
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
                                                        {/* 🔥 NEW: Delete button */}
                                                        <button
                                                            onClick={() => {
                                                                setPatientToDelete(patient);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                        >
                                                            <FiTrash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-3">
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
            </div>

            {/* DELETE CONFIRMATION MODAL */}
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

            {/* Create Camp Modal */}
            {showCampModal && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-gray-800">Create New Camp</h2>
                                <button onClick={() => setShowCampModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <FiXCircle size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Schedule a new screening event and assign staff/partners.</p>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camp Name *</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
                                    placeholder="E.g., Heart Health Screening" 
                                    value={campForm.name} 
                                    onChange={e => setCampForm({ ...campForm, name: e.target.value })} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location *</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
                                        placeholder="City/Area" 
                                        value={campForm.location} 
                                        onChange={e => setCampForm({ ...campForm, location: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date *</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
                                        value={campForm.date} 
                                        onChange={e => setCampForm({ ...campForm, date: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
                                    placeholder="Enter full address" 
                                    value={campForm.address} 
                                    onChange={e => setCampForm({ ...campForm, address: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Range *</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" 
                                    placeholder="E.g., 10:00 AM - 4:00 PM" 
                                    value={campForm.time} 
                                    onChange={e => setCampForm({ ...campForm, time: e.target.value })} 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Volunteers</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {campForm.volunteers && campForm.volunteers.map((vol, index) => (
                                        <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1 shadow-sm">
                                            {getVolunteerName(vol)}
                                            <FiXCircle 
                                                size={14} 
                                                className="cursor-pointer opacity-60 hover:opacity-100" 
                                                onClick={() => handleRemoveVolunteer(index)} 
                                            />
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value="" 
                                    onChange={handleAddVolunteer}
                                >
                                    <option value="">+ Add Staff/Volunteer</option>
                                    
                                    {partnerVolunteers && partnerVolunteers.length > 0 && (
                                        <optgroup label="⭐ My Volunteers (Partner)">
                                            {partnerVolunteers.map(v => (
                                                <option key={v._id} value={v._id} className="text-green-600 font-medium">
                                                    {v.name} ({v.designation || "Volunteer"})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    
                                    {volunteers && volunteers.length > 0 && (
                                        <optgroup label="👥 All Volunteers">
                                            {volunteers
                                                .filter(v => !partnerVolunteers?.some(pv => pv._id === v._id))
                                                .map(v => (
                                                    <option key={v._id} value={v._id}>
                                                        {v.name} ({v.designation || "Staff"})
                                                    </option>
                                                ))
                                            }
                                        </optgroup>
                                    )}
                                </select>
                                {partnerVolunteers && partnerVolunteers.length > 0 && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ✅ {partnerVolunteers.length} volunteers from your organization available
                                    </p>
                                )}
                            </div>
                            
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Partners</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {campForm.partners && campForm.partners.map((partner, index) => (
                                        <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1 shadow-sm">
                                            {getPartnerName(partner)}
                                            <FiXCircle 
                                                size={14} 
                                                className="cursor-pointer opacity-60 hover:opacity-100" 
                                                onClick={() => handleRemovePartner(index)} 
                                            />
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" 
                                    value="" 
                                    onChange={handleAddPartner}
                                >
                                    <option value="">+ Add Partner</option>
                                    {partnerList.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} ({p.organization || "Partner"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowCampModal(false)} 
                                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateCamp} 
                                className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                            >
                                Create Camp
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Camp Modal */}
            {showEditModal && editingCamp && createPortal(
                <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-gray-800">Edit Camp</h2>
                                <button onClick={() => { setShowEditModal(false); setEditingCamp(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <FiXCircle size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Update camp details</p>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camp Name</label>
                                <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                                    <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.location} onChange={e => setCampForm({ ...campForm, location: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
                                    <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.date} onChange={e => setCampForm({ ...campForm, date: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Range</label>
                                <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.time} onChange={e => setCampForm({ ...campForm, time: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Volunteers</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {campForm.volunteers && campForm.volunteers.map((vol, index) => (
                                        <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1 shadow-sm">
                                            {getVolunteerName(vol)}
                                            <FiXCircle 
                                                size={14} 
                                                className="cursor-pointer opacity-60 hover:opacity-100" 
                                                onClick={() => handleRemoveVolunteer(index)} 
                                            />
                                        </span>
                                    ))}
                                </div>
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" value="" onChange={handleAddVolunteer}>
                                    <option value="">+ Add Staff/Volunteer</option>
                                    {volunteers.map(v => <option key={v._id} value={v._id}>{v.name} ({v.designation || "Staff"})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Partners</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {campForm.partners && campForm.partners.map((partner, index) => (
                                        <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1 shadow-sm">
                                            {getPartnerName(partner)}
                                            <FiXCircle 
                                                size={14} 
                                                className="cursor-pointer opacity-60 hover:opacity-100" 
                                                onClick={() => handleRemovePartner(index)} 
                                            />
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" 
                                    value="" 
                                    onChange={handleAddPartner}
                                >
                                    <option value="">+ Add Partner</option>
                                    {partnerList.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} ({p.organization || "Partner"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => { setShowEditModal(false); setEditingCamp(null); }} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                            <button onClick={handleUpdateCamp} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Update Camp</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* View Camp Modal - UPDATED with proper layout */}
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
                                    
                                    {viewCamp.volunteers && viewCamp.volunteers.length > 0 && (
                                        <div className="mt-2">
                                            <VolunteerDisplay
                                                volunteers={viewCamp.volunteers}
                                                isSelected={false}
                                                employeeMap={volunteerMap}
                                                partnerVolunteers={partnerVolunteers}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="mt-1">
                                        <PartnerDisplay
                                            partners={viewCamp.partners}
                                            isSelected={false}
                                            partnersList={partnerList}
                                        />
                                    </div>
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
                                                        onClick={() => navigate(`/patient/${patient._id}`)} 
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Details <FiChevronRight size={14} />
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
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMessageCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold">Share Report Link</h3>
                            <p className="text-sm text-green-100 mt-1 opacity-90">WhatsApp message generated successfully!</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-lg">
                                    {currentPatient?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{currentPatient?.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">{currentPatient?.contact || "No Number"}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-green-50/50 border-2 border-green-200 border-dashed rounded-2xl">
                                <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-2">Message Preview</p>
                                <div className="bg-white p-3 rounded-lg border border-green-100 max-h-32 overflow-y-auto text-xs text-gray-600 leading-relaxed break-words">
                                    {downloadLink}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button onClick={handleWhatsAppShare} className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                                    <FiMessageCircle size={18} /> Open WhatsApp
                                </button>
                                <button onClick={handleCopyMessage} className="w-full py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 flex items-center justify-center gap-2 transition-all">
                                    {copied ? <FiCheckCircle size={18} /> : <FiCopy size={18} />}
                                    {copied ? "Copied!" : "Copy Link"}
                                </button>
                                <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <StatsModal />
        </div>
    );
};

export default DoctorCamps;