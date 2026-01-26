import axios from "axios";
import {
    Activity,
    Calendar,
    ChevronRight,
    Clock,
    Filter,
    MapPin,
    Plus,
    Search,
    Stethoscope,
    Users,
    MessageCircle,
    CheckCircle,
    Copy,
    Link as LinkIcon,
    XCircle,
    CheckCircle2,
    Eye,
    Edit,
    FileText,
    Download,
    X,
    FileSpreadsheet
} from "lucide-react";
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

const API_BASE = config.API_BASE_URL;

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
        if (t.type === "sugarType") r.sugarType = t.value;
        if (t.type === "bp") {
            r.systolic = t.value;
            r.diastolic = t.value2;
        }
    });
    return r;
};

const getCampStartTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const dateDigits = dateStr.match(/\d+/g);
    if (!dateDigits || dateDigits.length < 3) return null;

    let year, month, day;
    const d1 = parseInt(dateDigits[0], 10);
    const d2 = parseInt(dateDigits[1], 10);
    const d3 = parseInt(dateDigits[2], 10);

    if (d1 > 1000) { year = d1; month = d2 - 1; day = d3; }
    else { year = d3; month = d2 - 1; day = d1; }

    const upperTime = timeStr.toUpperCase();
    const parts = upperTime.split(/\s+TO\s+|\s+T0\s+|-|THROUGH|\s+TO|TO\s+/);
    if (parts.length < 1) return null;

    const cleanStr = parts[0].replace(/O/g, '0').replace(/[^\d\sAMP:]/g, '');
    const nums = cleanStr.match(/\d+/g);
    if (!nums) return null;

    let h = parseInt(nums[0], 10);
    let m = nums.length > 1 ? parseInt(nums[1], 10) : 0;
    const isPM = cleanStr.includes('PM') || (h >= 1 && h < 8 && !cleanStr.includes('AM'));
    const isAM = cleanStr.includes('AM');
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;

    return new Date(year, month, day, h, m, 0);
};

/* ================= COMPONENT ================= */

const DoctorCamps = () => {
    const navigate = useNavigate();
    const [camps, setCamps] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [partnerList, setPartnerList] = useState([]);
    const [volunteers, setVolunteers] = useState([]);

    const [selectedCampId, setSelectedCampId] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [showCampModal, setShowCampModal] = useState(false);
    const [viewCamp, setViewCamp] = useState(null);
    const [campForm, setCampForm] = useState({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });

    const [showShareModal, setShowShareModal] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [downloadLink, setDownloadLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [downloadingBulk, setDownloadingBulk] = useState(false);

    const partnerId = useMemo(() => {
        const userData = localStorage.getItem("userData");
        return localStorage.getItem("userId") || (userData ? JSON.parse(userData).id : null);
    }, []);

    useEffect(() => {
        if (partnerId) {
            fetchData();
        } else {
            // Optionally redirect or handle missing partnerId
            setLoading(false);
        }
    }, [partnerId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [campsRes, patientsRes, employeesRes, partnersRes] = await Promise.all([
                axios.get(`${API_BASE}/camps/assigned-camps/${partnerId}`),
                axios.get(`${API_BASE}/patients`),
                axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] })),
                axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }))
            ]);

            const assignedCamps = campsRes.data || [];
            setCamps(sortCampsByStatus(assignedCamps));

            setPartnerList(Array.isArray(partnersRes.data) ? partnersRes.data : []);

            const empData = employeesRes.data || [];
            const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
            const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
            const filteredVolunteers = allEmployees.filter(emp => {
                const dept = (emp.department || "").trim();
                return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
            });
            setVolunteers(filteredVolunteers);

            const assignedIds = assignedCamps.map(c => String(c._id));
            const filteredPatients = (patientsRes.data || []).filter(p =>
                p.campId && assignedIds.includes(String(p.campId?._id || p.campId))
            );
            setPatients(filteredPatients);

        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

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
        return camps.map(c => {
            const count = patients.filter(p => String(p.campId?._id) === String(c._id)).length;
            return { ...c, count };
        });
    }, [camps, patients]);

    const handleUpdateStatus = async (campId, status) => {
        try {
            await axios.post(`${API_BASE}/camps/update-assignment-status`, {
                campId,
                partnerId,
                status
            });
            alert(`Camp assignment ${status} successfully!`);
            fetchData();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    const handleCreateCamp = async () => {
        try {
            await axios.post(`${API_BASE}/camps/addcamp`, campForm);
            alert("✅ Camp created successfully");
            setShowCampModal(false);
            setCampForm({ name: "", location: "", address: "", date: "", time: "", volunteers: [], partners: [] });
            fetchData();
        } catch (err) {
            console.error("Create camp error:", err);
            alert("❌ Failed to create camp");
        }
    };

    const handleAddVolunteer = (e) => {
        const val = e.target.value;
        if (!val) return;
        if (!campForm.volunteers.includes(val)) {
            setCampForm({ ...campForm, volunteers: [...campForm.volunteers, val] });
        }
    };

    const handleRemoveVolunteer = (name) => {
        setCampForm({
            ...campForm,
            volunteers: campForm.volunteers.filter(v => v !== name)
        });
    };

    const handleAddPartner = (e) => {
        const pid = e.target.value;
        if (!pid) return;
        if (!campForm.partners.includes(pid)) {
            setCampForm({ ...campForm, partners: [...campForm.partners, pid] });
        }
    };

    const handleRemovePartner = (id) => {
        setCampForm({
            ...campForm,
            partners: campForm.partners.filter(p => p !== id)
        });
    };

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
            `${API_BASE}/reports/upload`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        return res.data.downloadLink;
    };

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
        if (!phone) {
            alert("Phone number required");
            return;
        }
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
            const campName = camps.find(c => c._id === selectedCampId)?.name || "Camp";

            // Process patients in batches or sequentially
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
        <div className="min-h-screen p-0 space-y-6 bg-gray-50/50 animate-fade-in text-gray-800">
            {/* HEADER Section */}
            {/* <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Medical Camps Dashboard</h1>
                    <p className="mt-1 text-gray-500">Manage your assigned medical camps and patient screened data.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-xl">
                    <Calendar size={18} className="text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div> */}

            {/* STATS Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Assigned Camps"
                    value={camps.length}
                    icon={MapPin}
                    colorClass="bg-gradient-to-br from-indigo-500 to-purple-600"
                />
                <StatsCard
                    title="Total Patients"
                    value={patients.length}
                    icon={Users}
                    colorClass="bg-gradient-to-br from-blue-500 to-cyan-500"
                />
                <StatsCard
                    title="Upcoming Camps"
                    value={camps.filter(c => getCampStatus(c.date, c.time).status === 'upcoming').length}
                    icon={Activity}
                    colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
                />
                <StatsCard
                    title="Live Screening"
                    value={camps.filter(c => getCampStatus(c.date, c.time).status === 'live').length}
                    icon={Activity}
                    colorClass="bg-gradient-to-br from-rose-500 to-pink-500"
                />
            </div>

            {/* CAMPS Section */}
            <div className="space-y-4">
                <div className="flex items-center pt-2.5 justify-between">
                    <h3 className="text-lg font-bold text-gray-800">My Assignments</h3>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedCampId(selectedCampId === "all" ? "all" : "all")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition ${selectedCampId === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
                        >
                            All Assignments
                        </button>
                        <button
                            onClick={() => setShowCampModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
                        >
                            <Calendar size={14} />
                            Create Camp
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {campsWithCount.map(camp => {
                        const isSelected = selectedCampId === camp._id;
                        const status = camp.partners.find(p => String(p.partnerId?._id || p.partnerId) === String(partnerId))?.status || "pending";

                        return (
                            <div
                                key={camp._id}
                                onClick={() => setSelectedCampId(camp._id)}
                                className={`cursor-pointer p-5 rounded-2xl border transition-all group
                                    ${isSelected
                                        ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                                        : "bg-white hover:border-indigo-300 hover:shadow-md text-gray-700"}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-4">
                                    <h4 className={`font-bold truncate ${isSelected ? "text-white" : "text-gray-900 group-hover:text-indigo-600 transition-colors"}`}>{camp.name}</h4>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter shadow-sm
                                            ${status === 'accepted' ? 'bg-emerald-500 text-white' :
                                                status === 'rejected' ? 'bg-rose-500 text-white' :
                                                    'bg-amber-400 text-white'}`}>
                                            {status}
                                        </span>
                                        <CampStatusBadge date={camp.date} time={camp.time} />
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm font-medium mt-3">
                                    <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                        <MapPin size={14} className={isSelected ? "text-indigo-200" : "text-indigo-500"} />
                                        <span className="truncate">{camp.location}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                        <Calendar size={14} className={isSelected ? "text-indigo-200" : "text-indigo-400"} />
                                        <span>{camp.date || "No date"}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                                        <Clock size={14} className={isSelected ? "text-indigo-200" : "text-indigo-500"} />
                                        <span>{camp.time || "No time"}</span>
                                    </div>

                                    <VolunteerDisplay
                                        volunteers={camp.volunteers}
                                        isSelected={isSelected}
                                    />

                                    <PartnerDisplay
                                        partners={camp.partners}
                                        isSelected={isSelected}
                                    />
                                </div>

                                {(() => {
                                    // 1. Check if taken by ANOTHER doctor
                                    const acceptedPartner = camp.partners.find(p => p.status === 'accepted');
                                    const istakenByOther = acceptedPartner && String(acceptedPartner.partnerId?._id || acceptedPartner.partnerId) !== String(partnerId);

                                    if (istakenByOther) {
                                        return (
                                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-bold uppercase">Allocated to another doctor</span>
                                            </div>
                                        );
                                    }

                                    // 2. Check Camp Status (must be Upcoming)
                                    const { status: timeStatus } = getCampStatus(camp.date, camp.time);
                                    if (timeStatus !== 'upcoming') return null;

                                    // 3. Check 12 Hour Window
                                    const start = getCampStartTime(camp.date, camp.time);
                                    const now = new Date();
                                    const hoursDiff = start ? (start - now) / (1000 * 60 * 60) : 0;

                                    if (hoursDiff < 12) {
                                        return (
                                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-bold uppercase">Actions Closed (Less than 12h)</span>
                                            </div>
                                        );
                                    }

                                    // 4. Render Actions (Allow editing decision)
                                    return (
                                        // <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100/10">
                                        //     {status !== 'rejected' && (
                                        //         <button
                                        //             onClick={(e) => {
                                        //                 e.stopPropagation();
                                        //                 handleUpdateStatus(camp._id, status === 'accepted' ? 'pending' : 'accepted');
                                        //             }}
                                        //             className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border 
                                        //                 ${status === 'accepted' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white/20 hover:bg-white/30 text-white border-white/20'}`}
                                        //         >
                                        //             {status === 'accepted' ? 'Accepted' : 'Accept'}
                                        //         </button>
                                        //     )}

                                        //     {status !== 'accepted' && (
                                        //         <button
                                        //             onClick={(e) => {
                                        //                 e.stopPropagation();
                                        //                 handleUpdateStatus(camp._id, status === 'rejected' ? 'pending' : 'rejected');
                                        //             }}
                                        //             className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border 
                                        //                 ${status === 'rejected' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/20 hover:bg-rose-500/30 text-white border-white/20'}`}
                                        //         >
                                        //             {status === 'rejected' ? 'Passed' : 'Pass'}
                                        //         </button>
                                        //     )}
                                        // </div>
                                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100/10">
                                            {status !== 'rejected' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateStatus(
                                                            camp._id,
                                                            status === 'accepted' ? 'pending' : 'accepted'
                                                        );
                                                    }}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border
        ${status === 'accepted'
                                                            ? 'bg-[#16A34A] text-white border-[#16A34A]'
                                                            : 'bg-[#16A34A]/20 hover:bg-[#16A34A]/30  border-white/20'
                                                        }`}
                                                >
                                                    {status === 'accepted' ? 'Accepted' : 'Accept'}
                                                </button>
                                            )}

                                            {status !== 'accepted' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateStatus(
                                                            camp._id,
                                                            status === 'rejected' ? 'pending' : 'rejected'
                                                        );
                                                    }}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border
        ${status === 'rejected'
                                                            ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                                                            : 'bg-[#4F46E5]/20 hover:bg-[#4F46E5]/30  border-white/20'
                                                        }`}
                                                >
                                                    {status === 'rejected' ? 'Passed' : 'Pass'}
                                                </button>
                                            )}
                                        </div>

                                    );
                                })()}

                                <div className={`mt-5 pt-4 border-t flex items-center justify-between ${isSelected ? "border-white/20" : "border-gray-50"}`}>
                                    <div className={`flex items-center gap-2 text-xs font-bold ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
                                        <Users size={14} />
                                        <span>{camp.count} Patients</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewCamp(camp);
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all
                                                ${isSelected
                                                    ? "bg-white/20 text-white hover:bg-white/30"
                                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                                        >
                                            <Eye size={12} className="inline mr-1" /> View
                                        </button>
                                        <div className={`${isSelected ? "text-white" : "text-indigo-600"} opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* PATIENTS Section */}
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-between gap-4 p-2 bg-white border border-gray-100 shadow-sm rounded-2xl lg:flex-row">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, phone or camp..."
                            className="w-full pl-11 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 mr-2 text-sm text-gray-500">
                            <Filter size={16} />
                            <span>Showing {filteredPatients.length} participants</span>
                        </div>
                        <button
                            onClick={handleBulkDownload}
                            disabled={downloadingBulk || selectedCampId === "all"}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-xl 
                                ${downloadingBulk || selectedCampId === "all"
                                    ? 'bg-gray-300 cursor-not-allowed opacity-60'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95'}`}
                            title={selectedCampId === "all" ? "Select a specific camp to download bulk reports" : "Download all patient reports for this camp as a ZIP"}
                        >
                            {downloadingBulk ? (
                                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                            ) : (
                                <Download size={16} />
                            )}
                            {downloadingBulk ? "Generating..." : "Download ZIP"}
                        </button>
                        <button
                            onClick={() => navigate("/add-patient", { state: { campId: selectedCampId !== "all" ? selectedCampId : "" } })}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
                        >
                            <Plus size={16} /> Add Patient
                        </button>
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
                                    <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Reports</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                                    <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                                                    {patient.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{patient.name}</p>
                                                    <p className="text-xs text-gray-500">{patient.age} Y • {patient.gender}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-medium text-gray-700">{patient.contact || "No contact"}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium border border-gray-200">
                                                {patient.campId?.name || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {/* VIEW */}
                                                <button
                                                    onClick={() => viewReport(patient)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </button>

                                                {/* EDIT */}
                                                <button
                                                    onClick={() => navigate(`/patient/${patient._id}`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </button>

                                                {/* DOWNLOAD */}
                                                <button
                                                    onClick={() => downloadPDF(patient)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                >
                                                    <FileText size={14} />
                                                    Download
                                                </button>

                                                {/* WHATSAPP */}
                                                <button
                                                    onClick={() => shareReport(patient)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                                >
                                                    <MessageCircle size={14} />
                                                    WhatsApp
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Users size={48} className="opacity-20" />
                                                <p className="text-lg font-medium italic">No records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CREATE CAMP MODAL */}
            {showCampModal && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-gray-800">Create New Camp</h2>
                                <button onClick={() => setShowCampModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Schedule a new screening event and assign staff.</p>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camp Name</label>
                                <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="E.g., Heart Health Screening" value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                                    <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="City/Area" value={campForm.location} onChange={e => setCampForm({ ...campForm, location: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
                                    <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={campForm.date} onChange={e => setCampForm({ ...campForm, date: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Range</label>
                                <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="E.g., 10:00 AM - 4:00 PM" value={campForm.time} onChange={e => setCampForm({ ...campForm, time: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Volunteers</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {campForm.volunteers.map(vol => (
                                        <span key={vol} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1 shadow-sm">
                                            {vol} <XCircle size={14} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => handleRemoveVolunteer(vol)} />
                                        </span>
                                    ))}
                                </div>
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" value="" onChange={handleAddVolunteer}>
                                    <option value="">+ Add Staff/Volunteer</option>
                                    {volunteers.map(v => <option key={v._id} value={v.name}>{v.name} ({v.designation || "Staff"})</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assign Partners (Doctors)</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {campForm.partners.map(pid => {
                                        const p = partnerList.find(pl => pl._id === pid);
                                        return p ? (
                                            <span key={pid} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1 shadow-sm">
                                                {p.clinicName || p.name} <XCircle size={14} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => handleRemovePartner(pid)} />
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" value="" onChange={handleAddPartner}>
                                    <option value="">+ Assign Partner Doctor</option>
                                    {partnerList.map(p => <option key={p._id} value={p._id}>{p.clinicName || p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setShowCampModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                            <button onClick={handleCreateCamp} className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">Create Camp</button>
                        </div>
                    </div>
                </div>
                , document.body)}

            {/* SHARE MODAL */}
            {showShareModal && currentPatient && (
                createPortal(
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-green-600 p-6 text-white text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <MessageCircle size={32} />
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
                                    <div className="bg-white p-3 rounded-lg border border-green-100 max-h-32 overflow-y-auto text-xs text-gray-600 leading-relaxed italic">
                                        {downloadLink}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button onClick={handleWhatsAppShare} className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                                        <MessageCircle size={18} /> Open WhatsApp
                                    </button>
                                    <button onClick={handleCopyMessage} className="w-full py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 flex items-center justify-center gap-2 transition-all">
                                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                        {copied ? "Copied!" : "Copy Link"}
                                    </button>
                                    <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    , document.body)
            )}

            {/* ================= VIEW CAMP MODAL ================= */}
            {viewCamp && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
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
                            <div className="flex items-center gap-3">
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
                        <div className="overflow-auto flex-1 p-0 custom-scrollbar">
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
                                            <tr key={patient._id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                                                            {patient.name?.charAt(0).toUpperCase()}
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
                                                    <button
                                                        onClick={() => navigate(`/patient/${patient._id}`)}
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                                                    >
                                                        Details <ChevronRight size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Users size={32} className="opacity-20" />
                                                    <span className="text-sm font-medium">No patients found in this camp yet.</span>
                                                </div>
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
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .7; } }
            `}} />
        </div>
    );
};

const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

export default DoctorCamps;
