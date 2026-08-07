// import axios from "axios";
// import {
//     FiActivity,
//     FiCalendar,
//     FiPlusCircle,
//     FiLayout,
//     FiMapPin,
//     FiUsers,
//     FiActivity as FiStethoscope,
//     FiPlus,
//     FiClock,
//     FiXCircle,
//     FiSearch,
//     FiChevronRight,
//     FiPhone,
//     FiDownload,
//     FiX,
//     FiFileText,
//     FiCheckCircle,
//     FiEdit,
//     FiEye,
//     FiMessageCircle,
//     FiCopy
// } from "react-icons/fi";
// import React, { useEffect, useState, useMemo, useRef } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate, Link } from "react-router-dom";
// import config from "../config";
// import { CampStatusBadge, getCampStatus } from "../utils/campStatus";
// import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
// import {
//     CampPieChart,
//     CampParticipationChart,
//     CampBMIChart,
//     HealthMetricChart
// } from "../components/DashboardCharts";
// import VolunteerDisplay from "../components/VolunteerDisplay";
// import PartnerDisplay from "../components/PartnerDisplay";
// import "./Dashboard.css";

// const DoctorDashboard = () => {
//     const [assignedCamps, setAssignedCamps] = useState([]);
//     const [patients, setPatients] = useState([]);
//     const [search, setSearch] = useState("");
//     const [selectedCampId, setSelectedCampId] = useState("all");
//     const [volunteers, setVolunteers] = useState([]);
//     const [partnerList, setPartnerList] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [healthMetric, setHealthMetric] = useState("bp");
//     const [dateFrom, setDateFrom] = useState("");
//     const [dateTo, setDateTo] = useState("");
//     const [showCampModal, setShowCampModal] = useState(false);
//     const [viewCamp, setViewCamp] = useState(null);
//     const [showShareModal, setShowShareModal] = useState(false);
//     const [currentPatient, setCurrentPatient] = useState(null);
//     const [downloadLink, setDownloadLink] = useState("");
//     const [copied, setCopied] = useState(false);
//     const [campForm, setCampForm] = useState({
//         name: "",
//         location: "",
//         address: "",
//         date: "",
//         time: "",
//         volunteers: [],
//         partners: []
//     });
//     const navigate = useNavigate();

//     const campsSectionRef = useRef(null);
//     const patientsSectionRef = useRef(null);

//     const scrollToSection = (ref) => {
//         if (ref?.current) {
//             ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
//         }
//     };

//     const getPartnerId = () => {
//         const id = localStorage.getItem("userId");
//         if (id) return id;
//         const userData = localStorage.getItem("userData");
//         if (userData) {
//             try {
//                 const parsed = JSON.parse(userData);
//                 return parsed.id || parsed._id;
//             } catch (e) {
//                 return null;
//             }
//         }
//         return null;
//     };

//     const partnerId = getPartnerId();
//     const role = localStorage.getItem("role");
//     const name = localStorage.getItem("name") || "Doctor";

//     const viewCampPatients = useMemo(() => {
//         if (!viewCamp) return [];
//         return patients.filter(p => String(p.campId?._id || p.campId) === String(viewCamp._id));
//     }, [viewCamp, patients]);

//     /* ================= UTILS ================= */
//     const calculateBMI = (weight, heightCm) => {
//         if (!weight || !heightCm) return null;
//         const h = heightCm / 100;
//         return +(weight / (h * h)).toFixed(1);
//     };

//     const getBMICategory = (bmi) => {
//         if (!bmi) return "-";
//         if (bmi < 18.5) return "Underweight";
//         if (bmi < 25) return "Healthy";
//         if (bmi < 30) return "Overweight";
//         return "Obese";
//     };

//     const extractLatestVitals = (tests = []) => {
//         const r = {};
//         if (!tests) return r;
//         tests.forEach(t => {
//             r.date = t.date;
//             if (t.type === "weight") r.weight = t.value;
//             if (t.type === "height") r.height = t.value;
//             if (t.type === "sugar") r.sugar = t.value;
//             if (t.type === "sugarType") r.sugarType = t.value;
//             if (t.type === "bp") { r.systolic = t.value; r.diastolic = t.value2; }
//         });
//         return r;
//     };

//     const prepareReportData = async (patientId) => {
//         try {
//             const res = await axios.get(`${config.API_BASE_URL}/patients/${patientId}`);
//             const fullPatient = res.data;
//             if (!fullPatient) return null;

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
//         const rawPdf = await generateMedicalReportFile(patientData, testsData, bmiData);
//         const pdfBlob = new Blob([rawPdf], { type: "application/pdf" });
//         const formData = new FormData();
//         formData.append("file", pdfBlob, "health-report.pdf");

//         const res = await axios.post(
//             `${config.API_BASE_URL}/reports/upload`,
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
//             state: { patient: data.patientData, tests: data.testsData }
//         });
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

//     useEffect(() => {
//         if (role !== "partner" && role !== "admin") {
//             navigate("/dashboard");
//             return;
//         }

//         if (partnerId) {
//             fetchDashboardData();
//         } else {
//             setLoading(false);
//         }
//     }, [partnerId, role, navigate]);

//     const fetchDashboardData = async () => {
//         try {
//             setLoading(true);
//             const [campsRes, patientsRes, employeesRes, partnersRes] = await Promise.all([
//                 axios.get(`${config.API_BASE_URL}/camps/assigned-camps/${partnerId}`),
//                 axios.get(`${config.API_BASE_URL}/patients`),
//                 axios.get(`${config.API_BASE_URL}/proxy/employees/get-employees`).catch(() => ({ data: [] })),
//                 axios.get(`${config.API_BASE_URL}/auth/partners`).catch(() => ({ data: [] }))
//             ]);

//             setAssignedCamps(campsRes.data || []);

//             // Filter patients that belong to this doctor's assigned camps
//             const assignedCampIds = (campsRes.data || []).map(c => String(c._id));
//             const filteredPatients = (patientsRes.data || []).filter(p =>
//                 p.campId && assignedCampIds.includes(String(p.campId?._id || p.campId))
//             );
//             setPatients(filteredPatients);

//             // Set volunteers and partners for modal
//             const empData = employeesRes.data || [];
//             const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
//             const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
//             setVolunteers(allEmployees.filter(emp => allowedDepts.some(d => d.toLowerCase() === (emp.department || "").trim().toLowerCase())));
//             setPartnerList(Array.isArray(partnersRes.data) ? partnersRes.data : []);

//         } catch (err) {
//             console.error("Error fetching dashboard data:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredPatients = useMemo(() => {
//         return patients.filter((p) => {
//             const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.contact.includes(search);
//             const matchesCamp = selectedCampId === "all" ? true : String(p.campId?._id || p.campId) === selectedCampId;
//             return matchesSearch && matchesCamp;
//         });
//     }, [patients, search, selectedCampId]);

//     const campOnlyFilteredPatients = useMemo(() => {
//         return patients.filter((p) => {
//             return selectedCampId === "all" ? true : String(p.campId?._id || p.campId) === selectedCampId;
//         });
//     }, [patients, selectedCampId]);

//     const campStats = useMemo(() => {
//         const filtered = assignedCamps.filter(camp => {
//             if (!camp.date) return true;
//             const campDate = new Date(camp.date);
//             const from = dateFrom ? new Date(dateFrom) : null;
//             const to = dateTo ? new Date(dateTo) : null;
//             if (from && campDate < from) return false;
//             if (to && campDate > to) return false;
//             return true;
//         });

//         const stats = filtered.reduce((acc, camp) => {
//             const { status } = getCampStatus(camp.date, camp.time);
//             if (status === 'live') acc.live++;
//             else if (status === 'today') acc.today++;
//             else if (status === 'upcoming') acc.upcoming++;
//             else if (status === 'completed') acc.completed++;
//             return acc;
//         }, { live: 0, today: 0, upcoming: 0, completed: 0 });

//         return {
//             ...stats,
//             active: stats.live + stats.today,
//             filteredCamps: filtered
//         };
//     }, [assignedCamps, dateFrom, dateTo]);

//     // Filter patients based on filtered camps
//     const chartFilteredPatients = useMemo(() => {
//         const filteredIds = campStats.filteredCamps.map(c => String(c._id));
//         return patients.filter(p => {
//             const campId = String(p.campId?._id || p.campId);
//             return filteredIds.includes(campId);
//         });
//     }, [patients, campStats.filteredCamps]);

//     const handleCreateCamp = async () => {
//         try {
//             await axios.post(`${config.API_BASE_URL}/camps/addcamp`, campForm);
//             alert("✅ Camp created successfully");
//             setShowCampModal(false);
//             setCampForm({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });
//             fetchDashboardData();
//         } catch (err) {
//             console.error("Create camp error:", err);
//             alert("❌ Failed to create camp");
//         }
//     };

//     // Modal Handlers
//     const handleAddVolunteer = (e) => {
//         const val = e.target.value;
//         if (val && !campForm.volunteers.includes(val)) {
//             setCampForm({ ...campForm, volunteers: [...campForm.volunteers, val] });
//         }
//     };
//     const handleRemoveVolunteer = (name) => setCampForm({ ...campForm, volunteers: campForm.volunteers.filter(v => v !== name) });
//     const handleAddPartner = (e) => {
//         const pid = e.target.value;
//         if (pid && !campForm.partners.includes(pid)) {
//             setCampForm({ ...campForm, partners: [...campForm.partners, pid] });
//         }
//     };
//     const handleRemovePartner = (id) => setCampForm({ ...campForm, partners: campForm.partners.filter(p => p !== id) });

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
//                         Doctor <span>Dashboard</span>
//                     </h1>
//                     <p className="admin-dash__subtitle">
//                         Manage your assigned camps and patient health records.
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
//                 <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Total Camps</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
//                             <FiMapPin />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{assignedCamps.length}</div>
//                     <div className="admin-dash__stat-meta">assigned camps</div>
//                 </div>
//                 <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Active</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
//                             <FiActivity />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{campStats.active}</div>
//                     <div className="admin-dash__stat-meta">currently active</div>
//                 </div>
//                 <div className="admin-dash__stat" onClick={() => scrollToSection(patientsSectionRef)}>
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Patients</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
//                             <FiUsers />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{patients.length}</div>
//                     <div className="admin-dash__stat-meta">total patients</div>
//                 </div>
//                 <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Upcoming</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
//                             <FiCalendar />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{campStats.upcoming}</div>
//                     <div className="admin-dash__stat-meta">scheduled camps</div>
//                 </div>
//                 <div className="admin-dash__stat" onClick={() => scrollToSection(campsSectionRef)}>
//                     <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Completed</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
//                             <FiCheckCircle />
//                         </div>
//                     </div>
//                     <div className="admin-dash__stat-value">{campStats.completed}</div>
//                     <div className="admin-dash__stat-meta">completed camps</div>
//                 </div>
//             </div>

//             {/* Date Filter Section */}
//             <div className="admin-dash__card">
//                 <div className="admin-dash__card-header">
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
//                             <FiCalendar size={20} />
//                         </div>
//                         <div>
//                             <h4 className="text-sm font-bold text-gray-800">Filter Analytics</h4>
//                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select Date Range</p>
//                         </div>
//                     </div>
//                     <div className="flex flex-wrap items-center gap-4">
//                         <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border">
//                             <span className="text-[10px] font-black text-gray-400 uppercase">From</span>
//                             <input
//                                 type="date"
//                                 value={dateFrom}
//                                 onChange={(e) => setDateFrom(e.target.value)}
//                                 className="bg-transparent text-sm font-bold outline-none text-gray-700"
//                             />
//                         </div>
//                         <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border">
//                             <span className="text-[10px] font-black text-gray-400 uppercase">To</span>
//                             <input
//                                 type="date"
//                                 value={dateTo}
//                                 onChange={(e) => setDateTo(e.target.value)}
//                                 className="bg-transparent text-sm font-bold outline-none text-gray-700"
//                             />
//                         </div>
//                         <button
//                             onClick={() => { setDateFrom(""); setDateTo(""); }}
//                             className="px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
//                         >
//                             Reset
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* CHARTS SECTION */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="admin-dash__card">
//                     <div className="admin-dash__card-header">
//                         <h3 className="admin-dash__card-title">Camp Overview</h3>
//                     </div>
//                     <div className="admin-dash__card-body">
//                         <CampPieChart
//                             camps={campStats.filteredCamps}
//                             patients={chartFilteredPatients}
//                             totalCamps={campStats.filteredCamps.length}
//                             liveCamps={campStats.live}
//                             todayCamps={campStats.today}
//                             upcomingCamps={campStats.upcoming}
//                             completedCamps={campStats.completed}
//                         />
//                     </div>
//                 </div>
//                 <div className="admin-dash__card">
//                     <div className="admin-dash__card-header">
//                         <h3 className="admin-dash__card-title">Camp Participation</h3>
//                     </div>
//                     <div className="admin-dash__card-body">
//                         <CampParticipationChart camps={campStats.filteredCamps} patients={chartFilteredPatients} />
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="admin-dash__card">
//                     <div className="admin-dash__card-header">
//                         <h3 className="admin-dash__card-title">BMI Distribution</h3>
//                     </div>
//                     <div className="admin-dash__card-body">
//                         <CampBMIChart camps={campStats.filteredCamps} patients={chartFilteredPatients} />
//                     </div>
//                 </div>
//                 <div className="admin-dash__card">
//                     <div className="admin-dash__card-header">
//                         <h3 className="admin-dash__card-title">Health Metrics</h3>
//                     </div>
//                     <div className="admin-dash__card-body">
//                         <HealthMetricChart
//                             type={healthMetric}
//                             patients={chartFilteredPatients}
//                             selectedCampName={null}
//                             onToggle={(v) => setHealthMetric(v)}
//                             currentMetric={healthMetric}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* CAMPS SECTION */}
//             <div ref={campsSectionRef} className="admin-dash__card">
//                 <div className="admin-dash__card-header">
//                     <h3 className="admin-dash__card-title">My Assignments</h3>
//                     <button
//                         onClick={() => navigate("/doctor-camps")}
//                         className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
//                     >
//                         View All <FiPlus size={16} />
//                     </button>
//                 </div>
//                 <div className="admin-dash__card-body">
//                     {assignedCamps.length === 0 ? (
//                         <div className="p-12 text-center text-gray-500">
//                             <FiActivity size={48} className="mx-auto text-gray-200 mb-4" />
//                             <p className="font-medium">No camps assigned yet.</p>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                             {assignedCamps.map((camp) => (
//                                 <div
//                                     key={camp._id}
//                                     onClick={() => navigate("/doctor-camps", { state: { selectedCamp: camp } })}
//                                     className="cursor-pointer bg-white p-5 rounded-2xl border shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
//                                 >
//                                     <div className="flex items-start justify-between gap-2 mb-4">
//                                         <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{camp.name}</h4>
//                                         <div className="flex flex-col items-end gap-1">
//                                             {(() => {
//                                                 const status = camp.partners?.find(p => String(p.partnerId?._id || p.partnerId) === String(partnerId))?.status || "pending";
//                                                 return (
//                                                     <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter shadow-sm
//                                                         ${status === 'accepted' ? 'bg-emerald-500 text-white' :
//                                                             status === 'rejected' ? 'bg-rose-500 text-white' :
//                                                                 'bg-amber-400 text-white'}`}>
//                                                         {status}
//                                                     </span>
//                                                 );
//                                             })()}
//                                             <CampStatusBadge date={camp.date} time={camp.time} />
//                                         </div>
//                                     </div>
//                                     <div className="space-y-2 text-sm text-gray-500 font-medium">
//                                         <div className="flex items-center gap-2">
//                                             <FiMapPin size={14} className="text-indigo-500" />
//                                             <span className="truncate">{camp.location}</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <FiCalendar size={14} className="text-indigo-400" />
//                                             <span>{camp.date}</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <FiClock size={14} className="text-indigo-500" />
//                                             <span>{camp.time || "No time"}</span>
//                                         </div>
//                                         <VolunteerDisplay volunteers={camp.volunteers} isSelected={false} />
//                                         <PartnerDisplay partners={camp.partners} isSelected={false} />
//                                     </div>
//                                     <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
//                                         <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
//                                             <FiUsers size={14} />
//                                             <span>{patients.filter(p => String(p.campId?._id || p.campId) === String(camp._id)).length} Patients</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     setViewCamp(camp);
//                                                 }}
//                                                 className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-indigo-100"
//                                             >
//                                                 <FiEye size={12} className="inline mr-1" /> View
//                                             </button>
//                                             <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
//                                                 <FiChevronRight size={18} />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* PATIENTS SECTION */}
//             <div ref={patientsSectionRef} className="admin-dash__card">
//                 <div className="admin-dash__card-header">
//                     <h3 className="admin-dash__card-title">My Patients</h3>
//                     <div className="flex flex-wrap items-center gap-3">
//                         <select
//                             value={selectedCampId}
//                             onChange={(e) => setSelectedCampId(e.target.value)}
//                             className="text-sm bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-700 shadow-sm"
//                         >
//                             <option value="all">All Assignments</option>
//                             {assignedCamps.map(camp => (
//                                 <option key={camp._id} value={camp._id}>{camp.name}</option>
//                             ))}
//                         </select>
//                         <div className="relative w-full sm:w-72">
//                             <FiSearch
//                                 size={18}
//                                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                             />
//                             <input
//                                 type="text"
//                                 placeholder="Search patients..."
//                                 value={search}
//                                 onChange={(e) => setSearch(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm"
//                             />
//                         </div>
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
//                                     <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100">
//                                 {filteredPatients.length > 0 ? (
//                                     filteredPatients.map((patient) => (
//                                         <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
//                                             <td className="p-4">
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
//                                                         {patient.name?.charAt(0)?.toUpperCase()}
//                                                     </div>
//                                                     <div>
//                                                         <p className="font-semibold text-gray-900">{patient.name}</p>
//                                                         <p className="text-xs text-gray-500">{patient.age || 'N/A'} Y • {patient.gender || 'N/A'}</p>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="p-4">
//                                                 <span className="text-sm font-medium text-gray-700">{patient.contact || "N/A"}</span>
//                                             </td>
//                                             <td className="p-4">
//                                                 <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
//                                                     {patient.campId?.name || "N/A"}
//                                                 </span>
//                                             </td>
//                                             <td className="p-4">
//                                                 <div className="flex items-center gap-2">
//                                                     <button
//                                                         onClick={() => viewReport(patient)}
//                                                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
//                                                     >
//                                                         <FiEye size={14} /> View
//                                                     </button>
//                                                     <Link
//                                                         to={`/patient/${patient._id}`}
//                                                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
//                                                     >
//                                                         <FiEdit size={14} /> Edit
//                                                     </Link>
//                                                     <button
//                                                         onClick={() => downloadPDF(patient)}
//                                                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
//                                                     >
//                                                         <FiFileText size={14} /> Download
//                                                     </button>
//                                                     <button
//                                                         onClick={() => shareReport(patient)}
//                                                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
//                                                     >
//                                                         <FiMessageCircle size={14} /> WhatsApp
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan={4} className="p-12 text-center text-gray-400">
//                                             <div className="flex flex-col items-center justify-center gap-3">
//                                                 <FiUsers size={48} className="opacity-20" />
//                                                 <p className="text-lg font-medium">No patients found</p>
//                                                 <p className="text-sm">Try adjusting your search or filters.</p>
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
//                 <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
//                     <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-slide-up">
//                         <div className="p-8">
//                             <div className="flex justify-between items-center mb-8">
//                                 <div>
//                                     <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create New Camp</h2>
//                                     <p className="text-gray-500 font-medium">Schedule a new medical screening camp</p>
//                                 </div>
//                                 <button onClick={() => setShowCampModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
//                                     <FiXCircle className="text-gray-400" size={32} />
//                                 </button>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                                 <div className="space-y-2">
//                                     <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Camp Name</label>
//                                     <input
//                                         type="text"
//                                         placeholder="e.g. Summer Health Drive"
//                                         className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
//                                         value={campForm.name}
//                                         onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Location</label>
//                                     <input
//                                         type="text"
//                                         placeholder="City / Area"
//                                         className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
//                                         value={campForm.location}
//                                         onChange={(e) => setCampForm({ ...campForm, location: e.target.value })}
//                                     />
//                                 </div>
//                                 <div className="space-y-2 md:col-span-2">
//                                     <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Full Address</label>
//                                     <textarea
//                                         placeholder="Full street address..."
//                                         rows="2"
//                                         className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium resize-none"
//                                         value={campForm.address}
//                                         onChange={(e) => setCampForm({ ...campForm, address: e.target.value })}
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Date</label>
//                                     <input
//                                         type="date"
//                                         className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
//                                         value={campForm.date}
//                                         onChange={(e) => setCampForm({ ...campForm, date: e.target.value })}
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Time</label>
//                                     <input
//                                         type="time"
//                                         className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
//                                         value={campForm.time}
//                                         onChange={(e) => setCampForm({ ...campForm, time: e.target.value })}
//                                     />
//                                 </div>

//                                 <div className="space-y-2 md:col-span-2">
//                                     <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1 flex items-center gap-2">
//                                         Assign Volunteers <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Medical Staff</span>
//                                     </label>
//                                     <select
//                                         onChange={handleAddVolunteer}
//                                         className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
//                                         value=""
//                                     >
//                                         <option value="">Choose Staff...</option>
//                                         {volunteers.map(v => (
//                                             <option key={v._id} value={v.name}>{v.name} ({v.designation})</option>
//                                         ))}
//                                     </select>
//                                     <div className="flex flex-wrap gap-2 mt-3">
//                                         {campForm.volunteers.map(v => (
//                                             <span key={v} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-indigo-100">
//                                                 {v}
//                                                 <button onClick={() => handleRemoveVolunteer(v)} className="hover:text-red-500"><FiXCircle size={16} /></button>
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <div className="space-y-2 md:col-span-2">
//                                     <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Assign Partners</label>
//                                     <select
//                                         onChange={handleAddPartner}
//                                         className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
//                                         value=""
//                                     >
//                                         <option value="">Choose Partner...</option>
//                                         {partnerList.map(p => (
//                                             <option key={p._id} value={p._id}>{p.name} ({p.role})</option>
//                                         ))}
//                                     </select>
//                                     <div className="flex flex-wrap gap-2 mt-3">
//                                         {campForm.partners.map(pid => {
//                                             const p = partnerList.find(x => x._id === pid);
//                                             return (
//                                                 <span key={pid} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-purple-100">
//                                                     {p?.name || pid}
//                                                     <button onClick={() => handleRemovePartner(pid)} className="hover:text-red-500"><FiXCircle size={16} /></button>
//                                                 </span>
//                                             );
//                                         })}
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="flex gap-4">
//                                 <button
//                                     onClick={() => setShowCampModal(false)}
//                                     className="flex-1 px-8 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleCreateCamp}
//                                     className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
//                                 >
//                                     Launch Camp
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>,
//                 document.body
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
//                                                             {patient.name.charAt(0).toUpperCase()}
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
//                                                     <Link
//                                                         to={`/patient/${patient._id}`}
//                                                         className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
//                                                     >
//                                                         Details <FiChevronRight size={12} />
//                                                     </Link>
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

//             {/* SHARE MODAL */}
//             {showShareModal && createPortal(
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
//                                 <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
//                                     Cancel
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>,
//                 document.body
//             )}
//             </div>
//         </div>
//     );
// };

// export default DoctorDashboard;


import axios from "axios";
import {
    FiActivity,
    FiCalendar,
    FiPlusCircle,
    FiMapPin,
    FiUsers,
    FiPlus,
    FiClock,
    FiXCircle,
    FiSearch,
    FiChevronRight,
    FiDownload,
    FiX,
    FiFileText,
    FiCheckCircle,
    FiEdit,
    FiEye,
    FiMessageCircle,
    FiCopy,
    FiTrash2,
    FiUserCheck,
    FiUser,
    FiBarChart,
    FiTrendingUp,
    FiFilter
} from "react-icons/fi";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
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

// extractLatestVitals function
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

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [assignedCamps, setAssignedCamps] = useState([]);
    const [createdCamps, setCreatedCamps] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [volunteers, setVolunteers] = useState([]);
    const [partnerVolunteers, setPartnerVolunteers] = useState([]);
    const [partnerList, setPartnerList] = useState([]);
    const [volunteerMap, setVolunteerMap] = useState({});
    const [partnerMap, setPartnerMap] = useState({});

    const [selectedCampId, setSelectedCampId] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("assigned");
    const [healthMetric, setHealthMetric] = useState("bp");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [statsModal, setStatsModal] = useState({
        show: false,
        title: "",
        data: [],
        type: ""
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

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

    const campsSectionRef = useRef(null);
    const patientsSectionRef = useRef(null);

    const partnerName = localStorage.getItem("name") || "Partner";
    const partnerId = useMemo(() => {
        const userData = localStorage.getItem("userData");
        return localStorage.getItem("userId") || (userData ? JSON.parse(userData).id : null);
    }, []);

    const scrollToSection = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const getVolunteerName = (id) => {
        if (!id) return 'Unknown';
        if (typeof id === 'object') {
            if (id.name) return id.name;
            if (id.volunteerId && typeof id.volunteerId === 'object' && id.volunteerId.name) return id.volunteerId.name;
            if (id.volunteerId) return volunteerMap[String(id.volunteerId)] || String(id.volunteerId);
            return id.name || id.email || 'Unknown';
        }
        if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) return id;
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
        if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) return id;
        const idStr = String(id);
        return partnerMap[idStr] || idStr;
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
            
            const patientsRes = await axios.get(`${API_BASE}/patients`);
            let patientData = [];
            if (patientsRes.data) {
                if (Array.isArray(patientsRes.data)) patientData = patientsRes.data;
                else if (patientsRes.data.data && Array.isArray(patientsRes.data.data)) patientData = patientsRes.data.data;
                else if (patientsRes.data.patients && Array.isArray(patientsRes.data.patients)) patientData = patientsRes.data.patients;
            }
            const allCampIds = [...assignedCamps.map(c => String(c._id)), ...createdCamps.map(c => String(c._id))];
            const filteredPatients = patientData.filter(p =>
                p.campId && allCampIds.includes(String(p.campId?._id || p.campId))
            );
            setPatients(filteredPatients);
            
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
            await axios.delete(`${API_BASE}/camps/delete-partner-camp/${partnerId}/${deleteTarget._id}`);
            alert("✅ Camp deleted successfully!");
            fetchData();
            closeDeleteModal();
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

    useEffect(() => {
        if (partnerId) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [partnerId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const employeesRes = await axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
            const empData = employeesRes.data || [];
            const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
            const volMap = {};
            allEmployees.forEach(emp => { volMap[emp._id] = emp.name; });
            setVolunteerMap(volMap);
            
            const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
            const filteredVolunteers = allEmployees.filter(emp => {
                const dept = (emp.department || "").trim();
                return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
            });
            setVolunteers(filteredVolunteers);

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
            partnerData.forEach(p => { pMap[p._id] = p.name || p.clinicName; });
            setPartnerMap(pMap);

            // 🔥 FIXED: Fetch assigned camps
            let assignedData = [];
            try {
                const assignedRes = await axios.get(`${API_BASE}/camps/assigned-camps/${partnerId}`);
                if (assignedRes.data) {
                    if (Array.isArray(assignedRes.data)) assignedData = assignedRes.data;
                    else if (assignedRes.data.data && Array.isArray(assignedRes.data.data)) assignedData = assignedRes.data.data;
                    else if (assignedRes.data.camps && Array.isArray(assignedRes.data.camps)) assignedData = assignedRes.data.camps;
                }
                console.log(`✅ Assigned camps loaded: ${assignedData.length}`);
            } catch (err) {
                console.log("⚠️ Assigned camps API failed:", err.message);
                assignedData = [];
            }
            setAssignedCamps(assignedData);

            // Fetch created camps
            let createdData = [];
            try {
                const createdRes = await axios.get(`${API_BASE}/camps/partner-created-camps/${partnerId}`);
                if (createdRes.data) {
                    if (Array.isArray(createdRes.data)) createdData = createdRes.data;
                    else if (createdRes.data.data && Array.isArray(createdRes.data.data)) createdData = createdRes.data.data;
                    else if (createdRes.data.camps && Array.isArray(createdRes.data.camps)) createdData = createdRes.data.camps;
                }
                console.log(`✅ Created camps loaded: ${createdData.length}`);
            } catch (err) {
                console.log("⚠️ Created camps API failed:", err.message);
                createdData = [];
            }
            setCreatedCamps(createdData);

            // Fetch patients
            try {
                const patientsRes = await axios.get(`${API_BASE}/patients`);
                let patientData = [];
                if (patientsRes.data) {
                    if (Array.isArray(patientsRes.data)) patientData = patientsRes.data;
                    else if (patientsRes.data.data && Array.isArray(patientsRes.data.data)) patientData = patientsRes.data.data;
                    else if (patientsRes.data.patients && Array.isArray(patientsRes.data.patients)) patientData = patientsRes.data.patients;
                }
                const allCampIds = [...assignedData.map(c => String(c._id)), ...createdData.map(c => String(c._id))];
                const filteredPatients = patientData.filter(p =>
                    p.campId && allCampIds.includes(String(p.campId?._id || p.campId))
                );
                setPatients(filteredPatients);
            } catch (err) {
                console.error("Error fetching patients:", err);
                setPatients([]);
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            setAssignedCamps([]);
            setCreatedCamps([]);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const allCamps = useMemo(() => {
        const map = new Map();
        [...assignedCamps, ...createdCamps].forEach(camp => {
            if (camp && camp._id) {
                map.set(String(camp._id), camp);
            }
        });
        return Array.from(map.values());
    }, [assignedCamps, createdCamps]);
    
    const displayCamps = useMemo(() => {
        return activeTab === "assigned" ? assignedCamps : createdCamps;
    }, [assignedCamps, createdCamps, activeTab]);

    const filteredCamps = useMemo(() => {
        if (!Array.isArray(allCamps)) return [];
        return allCamps.filter(camp => {
            if (!camp.date) return true;
            const campDate = new Date(camp.date);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from && campDate < from) return false;
            if (to && campDate > to) return false;
            return true;
        });
    }, [allCamps, dateFrom, dateTo]);

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

    const campsWithCount = useMemo(() => {
        return displayCamps.map(c => {
            const count = patients.filter(p => String(p.campId?._id) === String(c._id)).length;
            return { ...c, count };
        });
    }, [displayCamps, patients]);

    const handleAddPartner = (e) => {
        const pid = e.target.value;
        if (pid && !campForm.partners.includes(pid)) {
            setCampForm({ ...campForm, partners: [...campForm.partners, pid] });
        }
        e.target.value = "";
    };

    const handleRemovePartner = (index) => {
        setCampForm({
            ...campForm,
            partners: campForm.partners.filter((_, i) => i !== index)
        });
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
                assignedPartner: campForm.partners && campForm.partners.length > 0 ? campForm.partners[0] : null,
                partners: campForm.partners || [],
                volunteers: campForm.volunteers || []
            };
            
            const response = await axios.post(`${API_BASE}/camps/create-by-partner`, formData);
            
            if (response.data.success) {
                alert("✅ Camp created successfully");
                setShowCampModal(false);
                setCampForm({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });
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
                assignedPartner: campForm.partners && campForm.partners.length > 0 ? campForm.partners[0] : null,
                partners: campForm.partners || [],
                volunteers: campForm.volunteers || []
            };
            
            await axios.put(`${API_BASE}/camps/update-partner-camp/${partnerId}/${editingCamp._id}`, formData);
            
            alert("✅ Camp updated successfully");
            setShowEditModal(false);
            setEditingCamp(null);
            setCampForm({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });
            fetchData();
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
            console.error("❌ prepareReportData error:", err);
            alert("Failed to fetch report data.");
            return null;
        }
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
            const rawPdf = await generateMedicalReportFile(data.patientData, data.testsData, data.bmiData);
            const pdfBlob = new Blob([rawPdf], { type: "application/pdf" });
            const formData = new FormData();
            formData.append("file", pdfBlob, "health-report.pdf");
            const uploadRes = await axios.post(`${API_BASE}/reports/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const publicLink = uploadRes.data.downloadLink;
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

    const DeleteConfirmationModal = () => {
        if (!showDeleteModal) return null;

        const isPatient = deleteType === "patient";
        const name = deleteTarget?.name || "Unknown";

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
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
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
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 size={16} />
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
                        Doctor <span>Dashboard</span>
                    </h1>
                    <p className="admin-dash__subtitle">
                        Manage your assigned camps and patient health records.
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
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg shadow-green-100 text-sm"
                    >
                        <FiPlus size={16} />
                        Create Camp
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Stats */}
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
                        <div className="admin-dash__stat-meta">health camps</div>
                    </div>
                    <div 
                        className="admin-dash__stat cursor-pointer" 
                        onClick={() => openStatsModal("active", "Active Camps", allCamps.filter(c => {
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
                        <div className="admin-dash__stat-value">{allCamps.filter(c => {
                            const { status } = getCampStatus(c.date, c.time);
                            return status === 'live' || status === 'today';
                        }).length}</div>
                        <div className="admin-dash__stat-meta">currently running</div>
                    </div>
                    <div 
                        className="admin-dash__stat cursor-pointer" 
                        onClick={() => openStatsModal("camps", "Created by You", createdCamps)}
                    >
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Created by You</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                                <FiPlusCircle />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{createdCamps.length}</div>
                        <div className="admin-dash__stat-meta">your camps</div>
                    </div>
                    <div 
                        className="admin-dash__stat cursor-pointer" 
                        onClick={() => openStatsModal("camps", "Assigned to You", assignedCamps)}
                    >
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Assigned to You</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                                <FiUserCheck />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{assignedCamps.length}</div>
                        <div className="admin-dash__stat-meta">assigned camps</div>
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
                        <div className="admin-dash__stat-value">{patients.length}</div>
                        <div className="admin-dash__stat-meta">total patients</div>
                    </div>
                </div>

                {/* Filter Section */}
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

                {/* Charts */}
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

                {/* My Camps */}
                <div ref={campsSectionRef} className="admin-dash__card">
                    <div className="admin-dash__card-header py-3 px-4">
                        <h3 className="admin-dash__card-title text-sm">My Camps</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-100 rounded-lg p-0.5">
                                <button
                                    onClick={() => setActiveTab("assigned")}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                        activeTab === "assigned" 
                                            ? "bg-white text-indigo-600 shadow-sm" 
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Assigned ({assignedCamps.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("created")}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                        activeTab === "created" 
                                            ? "bg-white text-indigo-600 shadow-sm" 
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Created ({createdCamps.length})
                                </button>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                                {activeCampsCount} Active
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-gray-100 rounded-full">
                                {displayCamps.length} Total
                            </span>
                        </div>
                    </div>
                    <div className="admin-dash__card-body p-3">
                        {displayCamps.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FiActivity size={36} className="mx-auto text-gray-200 mb-3" />
                                <p className="font-medium text-sm">
                                    {activeTab === "assigned" ? "No camps assigned yet." : "You haven't created any camps yet."}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Create a new camp to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {campsWithCount.map(camp => {
                                    const isSelected = selectedCampId === camp._id;
                                    const isCreated = activeTab === "created";
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
                                            {isCreated && (
                                                <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                    Your Camp
                                                </div>
                                            )}
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
                                            
                                            {camp.volunteers && camp.volunteers.length > 0 && (
                                                <div className="mt-1.5">
                                                    <VolunteerDisplay
                                                        volunteers={camp.volunteers}
                                                        isSelected={isSelected}
                                                        employeeMap={volunteerMap}
                                                    />
                                                </div>
                                            )}
                                            
                                            {camp.partners && camp.partners.length > 0 && (
                                                <div className="mt-1">
                                                    <PartnerDisplay
                                                        partners={camp.partners}
                                                        isSelected={isSelected}
                                                        partnersList={partnerList}
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className={`mt-2 pt-2 border-t flex items-center justify-between ${isSelected ? "border-white/20" : "border-gray-50"}`}>
                                                <span className={`text-[10px] font-bold ${isSelected ? "text-indigo-200" : "text-gray-500"}`}>
                                                    <FiUsers size={10} className="inline mr-0.5" />
                                                    {camp.count} Patients
                                                </span>
                                                <div className="flex items-center gap-0.5">
                                                    {isCreated && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditModal(camp);
                                                                }}
                                                                className={`p-1 rounded-lg transition-colors ${
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
                                                                className={`p-1 rounded-lg transition-colors ${
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

                {/* Patients */}
                <div ref={patientsSectionRef} className="admin-dash__card">
                    <div className="admin-dash__card-header py-3 px-4">
                        <h3 className="admin-dash__card-title text-sm">My Patients</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={selectedCampId}
                                onChange={(e) => setSelectedCampId(e.target.value)}
                                className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-700 shadow-sm"
                            >
                                <option value="all">All Camps</option>
                                {allCamps.map(camp => (
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
                            <button
                                onClick={() => navigate("/add-patient", { state: { campId: selectedCampId !== "all" ? selectedCampId : "" } })}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
                            >
                                <FiPlus size={14} /> Add Patient
                            </button>
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
                                                        <button 
                                                            onClick={() => viewReport(patient)} 
                                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <FiEye size={12} /> View
                                                        </button>
                                                        <Link 
                                                            to={`/patient/${patient._id}`} 
                                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                        >
                                                            <FiEdit size={12} /> Edit
                                                        </Link>
                                                        <button 
                                                            onClick={() => downloadPDF(patient)} 
                                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                        >
                                                            <FiFileText size={12} /> Download
                                                        </button>
                                                        <button 
                                                            onClick={() => shareReport(patient)} 
                                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                                        >
                                                            <FiMessageCircle size={12} /> WhatsApp
                                                        </button>
                                                        <button 
                                                            onClick={() => openDeleteModal(patient, "patient")}
                                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
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

            {/* Modals - Create, Edit, View, Share */}
            {/* Create Camp Modal */}
            {showCampModal && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-gray-800">Create New Camp</h2>
                                <button onClick={() => setShowCampModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <FiX size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Schedule a new screening event and assign staff.</p>
                        </div>
                        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Camp Name *</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                    placeholder="E.g., Heart Health Screening" 
                                    value={campForm.name} 
                                    onChange={e => setCampForm({ ...campForm, name: e.target.value })} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location *</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                        placeholder="City/Area" 
                                        value={campForm.location} 
                                        onChange={e => setCampForm({ ...campForm, location: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date *</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                        value={campForm.date} 
                                        onChange={e => setCampForm({ ...campForm, date: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                    placeholder="Enter full address" 
                                    value={campForm.address} 
                                    onChange={e => setCampForm({ ...campForm, address: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time Range *</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                    placeholder="E.g., 10:00 AM - 4:00 PM" 
                                    value={campForm.time} 
                                    onChange={e => setCampForm({ ...campForm, time: e.target.value })} 
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assign Volunteers</label>
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                    {campForm.volunteers.map((vol, index) => (
                                        <span key={index} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shadow-sm ${
                                            partnerVolunteers.some(pv => String(pv._id) === String(vol)) 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                        }`}>
                                            {getVolunteerName(vol)}
                                            {partnerVolunteers.some(pv => String(pv._id) === String(vol)) && ' ⭐'}
                                            <FiX 
                                                size={12} 
                                                className="cursor-pointer opacity-60 hover:opacity-100" 
                                                onClick={() => handleRemoveVolunteer(index)} 
                                            />
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
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
                                                .filter(v => !partnerVolunteers?.some(pv => String(pv._id) === String(v._id)))
                                                .map(v => (
                                                    <option key={v._id} value={v._id}>
                                                        {v.name} ({v.designation || "Staff"})
                                                    </option>
                                                ))
                                            }
                                        </optgroup>
                                    )}
                                </select>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assign Partners (Doctors)</label>
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                    {campForm.partners.map((pid, index) => (
                                        <span key={index} className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-purple-100 flex items-center gap-1 shadow-sm">
                                            {getPartnerName(pid)}
                                            <FiX 
                                                size={12} 
                                                className="cursor-pointer opacity-60 hover:opacity-100" 
                                                onClick={() => handleRemovePartner(index)} 
                                            />
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                                    value="" 
                                    onChange={handleAddPartner}
                                >
                                    <option value="">+ Assign Partner Doctor</option>
                                    {partnerList.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.name || p.clinicName} 
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-gray-800">Edit Camp</h2>
                                <button onClick={() => { setShowEditModal(false); setEditingCamp(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <FiX size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Update camp details</p>
                        </div>
                        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Camp Name</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                    placeholder="Enter camp name" 
                                    value={campForm.name} 
                                    onChange={e => setCampForm({ ...campForm, name: e.target.value })} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</label>
                                    <input 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                        placeholder="City/Area" 
                                        value={campForm.location} 
                                        onChange={e => setCampForm({ ...campForm, location: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                        value={campForm.date} 
                                        onChange={e => setCampForm({ ...campForm, date: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                    placeholder="Enter full address" 
                                    value={campForm.address} 
                                    onChange={e => setCampForm({ ...campForm, address: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time Range</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                                    placeholder="E.g., 10:00 AM - 4:00 PM" 
                                    value={campForm.time} 
                                    onChange={e => setCampForm({ ...campForm, time: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assign Volunteers</label>
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                    {campForm.volunteers.map((vol, index) => (
                                        <span key={index} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shadow-sm ${
                                            partnerVolunteers.some(pv => String(pv._id) === String(vol)) 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                        }`}>
                                            {getVolunteerName(vol)}
                                            {partnerVolunteers.some(pv => String(pv._id) === String(vol)) && ' ⭐'}
                                            <FiX 
                                                size={12} 
                                                className="cursor-pointer opacity-60 hover:opacity-100" 
                                                onClick={() => handleRemoveVolunteer(index)} 
                                            />
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
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
                                                .filter(v => !partnerVolunteers?.some(pv => String(pv._id) === String(v._id)))
                                                .map(v => (
                                                    <option key={v._id} value={v._id}>
                                                        {v.name} ({v.designation || "Staff"})
                                                    </option>
                                                ))
                                            }
                                        </optgroup>
                                    )}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assign Partners (Doctors)</label>
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                    {campForm.partners.map((pid, index) => (
                                        <span key={index} className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-purple-100 flex items-center gap-1 shadow-sm">
                                            {getPartnerName(pid)}
                                            <FiX 
                                                size={12} 
                                                className="cursor-pointer opacity-60 hover:opacity-100" 
                                                onClick={() => handleRemovePartner(index)} 
                                            />
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                                    value="" 
                                    onChange={handleAddPartner}
                                >
                                    <option value="">+ Assign Partner Doctor</option>
                                    {partnerList.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.name || p.clinicName} 
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={() => { setShowEditModal(false); setEditingCamp(null); }} 
                                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdateCamp} 
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                Update Camp
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* View Camp Modal */}
            {viewCamp && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                            <div className="flex-1 pr-8">
                                <h3 className="text-lg font-bold text-gray-900">{viewCamp.name}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <FiMapPin size={12} className="text-indigo-500" />
                                        <span>{viewCamp.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiCalendar size={12} className="text-indigo-500" />
                                        <span>{viewCamp.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiClock size={12} className="text-indigo-500" />
                                        <span>{viewCamp.time}</span>
                                    </div>
                                </div>
                                {viewCamp.volunteers && viewCamp.volunteers.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                        <span className="text-[10px] font-semibold text-gray-600">Volunteers:</span>
                                        <VolunteerDisplay
                                            volunteers={viewCamp.volunteers}
                                            isSelected={false}
                                            employeeMap={volunteerMap}
                                        />
                                    </div>
                                )}
                                {viewCamp.partners && viewCamp.partners.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                        <span className="text-[10px] font-semibold text-gray-600">Partners:</span>
                                        <PartnerDisplay
                                            partners={viewCamp.partners}
                                            isSelected={false}
                                            partnersList={partnerList}
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
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-white">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                                    {viewCampPatients.length} Participants
                                </span>
                                <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
                            </div>
                            <button onClick={handleDownloadCampCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95">
                                <FiFileText size={14} />
                                Download Report
                            </button>
                        </div>
                        <div className="overflow-auto flex-1 p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Patient Name</th>
                                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contact</th>
                                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Age / Gender</th>
                                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Health Check</th>
                                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {viewCampPatients.length > 0 ? (
                                        viewCampPatients.map(patient => (
                                            <tr key={patient._id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] border border-indigo-100">
                                                            {patient.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-sm text-gray-900">{patient.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-xs text-gray-600 font-medium font-mono">{patient.contact}</td>
                                                <td className="p-3 text-xs text-gray-500">
                                                    {patient.age} Y <span className="mx-1">•</span> {patient.gender}
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
                                                <td className="p-3 text-right">
                                                    <Link to={`/patient/${patient._id}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                                                        Details <FiChevronRight size={10} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FiUsers size={28} className="opacity-20" />
                                                    <span className="text-xs font-medium">No patients found in this camp yet.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setViewCamp(null)} className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm">Close</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Share Modal */}
            {showShareModal && currentPatient && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-green-600 p-5 text-white text-center">
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
                                <div className="bg-white p-2.5 rounded-lg border border-green-100 max-h-28 overflow-y-auto text-[10px] text-gray-600">
                                    {downloadLink}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <button onClick={handleWhatsAppShare} className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                                    <FiMessageCircle size={16} /> Open WhatsApp
                                </button>
                                <button onClick={handleCopyMessage} className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 flex items-center justify-center gap-2 transition-all">
                                    {copied ? <FiCheckCircle size={16} /> : <FiCopy size={16} />}
                                    {copied ? "Copied!" : "Copy Link"}
                                </button>
                                <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Stats Modal */}
            <StatsModal />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal />
        </div>
    );
};

export default DoctorDashboard;