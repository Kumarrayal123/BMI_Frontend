import axios from "axios";
import JSZip from "jszip";
import {
    Activity,
    MapPin,
    Search,
    Users,
    Calendar,
    Clock,
    Filter,
    Plus,
    Eye,
    Edit,
    FileText,
    MessageCircle,
    Copy,
    ChevronRight,
    CheckCircle,
    X,
    FileSpreadsheet,
    Download,
    AlertCircle,
    Trash2,
    AlertTriangle,
    UserPlus
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import config from "../config";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
import { CampStatusBadge, sortCampsByStatus, getCampStatus } from "../utils/campStatus";
import VolunteerDisplay from "../components/VolunteerDisplay";
import PartnerDisplay from "../components/PartnerDisplay";
import "./Dashboard.css";

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

export default function MyCamps() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const [patients, setPatients] = useState([]);
    const [camps, setCamps] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedCampId, setSelectedCampId] = useState("all");
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [downloadLink, setDownloadLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [viewCamp, setViewCamp] = useState(null);

    // 🔥 Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // 🔥 Stats Modal State
    const [statsModal, setStatsModal] = useState({
        show: false,
        title: "",
        data: [],
        type: ""
    });

    // 🔥 Partner and Volunteer maps
    const [partnerList, setPartnerList] = useState([]);
    const [employeeMap, setEmployeeMap] = useState({});

    const partnerMap = useMemo(() => {
        const map = {};
        partnerList.forEach(p => {
            if (p && p._id) map[String(p._id)] = p.name;
        });
        return map;
    }, [partnerList]);

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

    const patientsSectionRef = useRef(null);
    const campsSectionRef = useRef(null);

    const scrollToSection = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // ✅ NEW: Handle camp card click - Navigate to Add Patient with camp pre-selected
    const handleCampCardClick = (campId, campName) => {
        navigate("/add-patient", { state: { campId: campId, campName: campName } });
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

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "employee" && role !== "partner" && role !== "volunteer") {
            navigate("/dashboard");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch patients
                const patientsRes = await axios.get(`${API_BASE}/patients`).catch(() => ({ data: [] }));
                setPatients(patientsRes.data || []);
                
                // Fetch employees for volunteer map
                const employeesRes = await axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
                const empData = employeesRes.data || [];
                const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
                
                // Fetch volunteers
                const volRes = await axios.get(`${API_BASE}/volunteers/all-volunteers`).catch(() => ({ data: [] }));
                const volData = volRes.data?.volunteers || volRes.data || [];
                
                const empMap = {};
                allEmployees.forEach(emp => {
                    empMap[String(emp._id)] = emp.name;
                });
                volData.forEach(vol => {
                    empMap[String(vol._id)] = vol.name;
                });
                setEmployeeMap(empMap);

                // Fetch partners
                const partnersRes = await axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }));
                let partnerData = partnersRes.data || [];
                if (!Array.isArray(partnerData)) {
                    partnerData = partnerData.data || partnerData.partners || [];
                    if (!Array.isArray(partnerData)) partnerData = [];
                }
                setPartnerList(partnerData);

                // Fetch camps based on role
                let campsData = [];
                const employeeName = localStorage.getItem("employeeName") || localStorage.getItem("name");
                const userId = localStorage.getItem("userId");
                const userDataStr = localStorage.getItem("userData");
                const userData = userDataStr ? JSON.parse(userDataStr) : null;
                const partnerId = userId || (userData ? userData.id : null);
                
                console.log("🔍 Role:", role);
                console.log("🔍 Employee Name:", employeeName);
                console.log("🔍 Partner ID:", partnerId);
                
                if (role === "partner" && partnerId) {
                    const campsRes = await axios.get(`${API_BASE}/camps/assigned-camps/${partnerId}`).catch(() => ({ data: [] }));
                    campsData = campsRes.data || [];
                    if (!Array.isArray(campsData)) {
                        campsData = campsData.data || campsData.camps || [];
                        if (!Array.isArray(campsData)) campsData = [];
                    }
                } else {
                    const campsRes = await axios.get(`${API_BASE}/camps/allcamps`).catch(() => ({ data: [] }));
                    let allCamps = campsRes.data || [];
                    if (!Array.isArray(allCamps)) {
                        allCamps = allCamps.data || allCamps.camps || [];
                        if (!Array.isArray(allCamps)) allCamps = [];
                    }
                    
                    if (employeeName || userId) {
                        campsData = allCamps.filter(camp => {
                            if (!camp.volunteers || camp.volunteers.length === 0) return false;
                            return camp.volunteers.some(v => {
                                if (!v) return false;
                                if (typeof v === 'object') {
                                    if (v.$oid) {
                                        return String(v.$oid).toLowerCase().trim() === String(userId).toLowerCase().trim();
                                    }
                                    const idStr = String(v._id || v.id || '').toLowerCase().trim();
                                    if (userId && idStr && idStr === String(userId).toLowerCase().trim()) return true;
                                    const nameStr = String(v.name || '').toLowerCase().trim();
                                    if (employeeName && nameStr && nameStr === String(employeeName).toLowerCase().trim()) return true;
                                    const emailStr = String(v.email || '').toLowerCase().trim();
                                    const employeeEmail = localStorage.getItem("employeeEmail") || localStorage.getItem("email") || "";
                                    if (employeeEmail && emailStr && emailStr === String(employeeEmail).toLowerCase().trim()) return true;
                                    return false;
                                }
                                const valStr = String(v).toLowerCase().trim();
                                if (userId && valStr === String(userId).toLowerCase().trim()) return true;
                                if (employeeName && valStr === String(employeeName).toLowerCase().trim()) return true;
                                return false;
                            });
                        });
                    } else {
                        campsData = allCamps;
                    }
                }
                
                console.log("📦 Assigned Camps:", campsData.length);
                setCamps(sortCampsByStatus(campsData));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

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

    const myAssignedCamps = useMemo(() => {
        return camps;
    }, [camps]);

    const campsWithCount = useMemo(() => {
        return myAssignedCamps.map(camp => {
            const count = patients.filter(p => p.campId?._id === camp._id).length;
            return { ...camp, count };
        });
    }, [myAssignedCamps, patients]);

    const filteredPatients = useMemo(() => {
        return patients.filter(p => {
            const isAssigned = myAssignedCamps.some(c => c._id === p.campId?._id);
            if (!isAssigned) return false;

            if (selectedCampId !== "all") {
                if (p.campId?._id !== selectedCampId) return false;
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
    }, [patients, myAssignedCamps, selectedCampId, searchQuery]);

    const totalCamps = myAssignedCamps.length;
    const activeCampsCount = myAssignedCamps.filter(c => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let campDate = new Date(c.date);
        if (isNaN(campDate.getTime())) {
            const parts = c.date.split('-');
            if (parts.length === 3) {
                campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }
        if (isNaN(campDate.getTime())) return false;
        campDate.setHours(0, 0, 0, 0);
        return campDate.getTime() === today.getTime();
    }).length;

    const totalPatientsCount = patients.filter(p => myAssignedCamps.some(c => c._id === p.campId?._id)).length;
    const upcomingCampsCount = myAssignedCamps.filter(c => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let campDate = new Date(c.date);
        if (isNaN(campDate.getTime())) {
            const parts = c.date.split('-');
            if (parts.length === 3) {
                campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }
        if (isNaN(campDate.getTime())) return false;
        campDate.setHours(0, 0, 0, 0);
        return campDate.getTime() > today.getTime();
    }).length;

    const completedCampsCount = myAssignedCamps.filter(c => {
        const { status } = getCampStatus(c.date, c.time);
        return status === 'completed';
    }).length;

    // 🔥 FIXED: viewReport - navigates to health report page
    const viewReport = async (patient) => {
        try {
            const res = await axios.get(`${API_BASE}/patients/${patient._id}`);
            const fullPatient = res.data;

            if (!fullPatient?.tests?.length) {
                alert("No test data available for this patient.");
                return;
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

            navigate('/health-report', { 
                state: { 
                    patient: patientData, 
                    tests: testsData 
                } 
            });
        } catch (err) {
            console.error("View report error:", err);
            alert("Failed to load report data.");
        }
    };

    // 🔥 FIXED: downloadPDF - uses generateMedicalReport
    const downloadPDF = async (patient) => {
        try {
            const res = await axios.get(`${API_BASE}/patients/${patient._id}`);
            const fullPatient = res.data;

            if (!fullPatient?.tests?.length) {
                alert("No test data available for this patient.");
                return;
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

            generateMedicalReport(patientData, testsData, bmiData);
        } catch (err) {
            console.error(err);
            alert("Failed to download report");
        }
    };

    const shareReport = async (patient) => {
        try {
            setCurrentPatient(patient);
            const message = `*Health Checkup Report* 🩺\n\nHello ${patient.name},\nYour medical health report is ready.\n\n📄 View Details:\n${window.location.origin}/patient/${patient._id}\n\n(Generated by BIM Medical)`;
            setDownloadLink(message);
            setShowShareModal(true);
        } catch (err) {
            console.error(err);
            alert("Failed to generate sharing link");
        }
    };

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
            return null;
        }
    };

    const handleBulkDownload = async () => {
        if (selectedCampId === "all") {
            alert("Please select a specific camp to download reports.");
            return;
        }

        const campPatients = patients.filter(p => String(p.campId?._id || p.campId) === String(selectedCampId));

        if (campPatients.length === 0) {
            alert("No patients found in this camp.");
            return;
        }

        try {
            setLoading(true);
            const zip = new JSZip();
            const selectedCamp = camps.find(c => String(c._id) === String(selectedCampId));
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
                            <X size={20} />
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
                                        {(statsModal.type === "camps" || statsModal.type === "active" || statsModal.type === "upcoming" || statsModal.type === "completed") && (
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
                                            {(statsModal.type === "camps" || statsModal.type === "active" || statsModal.type === "upcoming" || statsModal.type === "completed") && (
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
                                                                    : statsModal.type === "completed"
                                                                        ? "bg-gray-100 text-gray-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                            {statsModal.type === "active" ? "Active" :
                                                             statsModal.type === "upcoming" ? "Upcoming" :
                                                             statsModal.type === "completed" ? "Completed" : "Active"}
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
                                                    <Eye size={14} /> View
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

    return (
        <div className="admin-dash">
            <div className="admin-dash__wrapper">
            {/* Header */}
            <div className="admin-dash__header">
                <div>
                    <h1 className="admin-dash__greeting">
                        My Assigned <span>Camps</span>
                    </h1>
                    <p className="admin-dash__subtitle">
                        {role === "partner" ? "View and manage patients in your partner camps." : "View and manage patients in your assigned camps."}
                    </p>
                    {myAssignedCamps.length === 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            <AlertCircle size={14} />
                            <span>No camps assigned to you yet. Contact your admin.</span>
                        </div>
                    )}
                </div>
                <div className="admin-dash__date-pill">
                    <Calendar />
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

            {/* STATS Section - Clickable */}
            <div className="admin-dash__stats">
                <div 
                    className="admin-dash__stat cursor-pointer" 
                    onClick={() => openStatsModal("camps", "All Camps", myAssignedCamps)}
                >
                    <div className="admin-dash__stat-top">
                        <span className="admin-dash__stat-label">Total Camps</span>
                        <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                            <MapPin />
                        </div>
                    </div>
                    <div className="admin-dash__stat-value">{myAssignedCamps.length}</div>
                    <div className="admin-dash__stat-meta">assigned camps</div>
                </div>

                <div 
                    className="admin-dash__stat cursor-pointer" 
                    onClick={() => openStatsModal("active", "Active Camps", myAssignedCamps.filter(c => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        let campDate = new Date(c.date);
                        if (isNaN(campDate.getTime())) {
                            const parts = c.date.split('-');
                            if (parts.length === 3) {
                                campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                            }
                        }
                        if (isNaN(campDate.getTime())) return false;
                        campDate.setHours(0, 0, 0, 0);
                        return campDate.getTime() === today.getTime();
                    }))}
                >
                    <div className="admin-dash__stat-top">
                        <span className="admin-dash__stat-label">Active Camps</span>
                        <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                            <Activity />
                        </div>
                    </div>
                    <div className="admin-dash__stat-value">{activeCampsCount}</div>
                    <div className="admin-dash__stat-meta">currently running</div>
                </div>

                <div 
                    className="admin-dash__stat cursor-pointer" 
                    onClick={() => openStatsModal("patients", "All Patients", patients.filter(p => myAssignedCamps.some(c => c._id === p.campId?._id)))}
                >
                    <div className="admin-dash__stat-top">
                        <span className="admin-dash__stat-label">Patients</span>
                        <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                            <Users />
                        </div>
                    </div>
                    <div className="admin-dash__stat-value">{totalPatientsCount}</div>
                    <div className="admin-dash__stat-meta">total patients</div>
                </div>

                <div 
                    className="admin-dash__stat cursor-pointer" 
                    onClick={() => openStatsModal("upcoming", "Upcoming Camps", myAssignedCamps.filter(c => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        let campDate = new Date(c.date);
                        if (isNaN(campDate.getTime())) {
                            const parts = c.date.split('-');
                            if (parts.length === 3) {
                                campDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                            }
                        }
                        if (isNaN(campDate.getTime())) return false;
                        campDate.setHours(0, 0, 0, 0);
                        return campDate.getTime() > today.getTime();
                    }))}
                >
                    <div className="admin-dash__stat-top">
                        <span className="admin-dash__stat-label">Upcoming</span>
                        <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                            <Calendar />
                        </div>
                    </div>
                    <div className="admin-dash__stat-value">{upcomingCampsCount}</div>
                    <div className="admin-dash__stat-meta">scheduled camps</div>
                </div>

                <div 
                    className="admin-dash__stat cursor-pointer" 
                    onClick={() => openStatsModal("completed", "Completed Camps", myAssignedCamps.filter(c => {
                        const { status } = getCampStatus(c.date, c.time);
                        return status === 'completed';
                    }))}
                >
                    <div className="admin-dash__stat-top">
                        <span className="admin-dash__stat-label">Completed</span>
                        <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                            <CheckCircle />
                        </div>
                    </div>
                    <div className="admin-dash__stat-value">{completedCampsCount}</div>
                    <div className="admin-dash__stat-meta">finished camps</div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="space-y-8">
                {/* CAMPS SECTION - UPDATED with VolunteerDisplay and PartnerDisplay */}
                <div ref={campsSectionRef} className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">Assigned Camps</h3>
                        <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                            {myAssignedCamps.length} {myAssignedCamps.length === 1 ? 'Camp' : 'Camps'}
                        </span>
                    </div>
                    <div className="admin-dash__card-body">
                        {myAssignedCamps.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="font-medium">No camps assigned to you yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Contact your admin for camp assignments.</p>
                            </div>
                        ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {campsWithCount.map(camp => {
                                const patientCount = patients.filter(p => String(p.campId?._id) === String(camp._id)).length;
                                
                                return (
                                    <div
                                        key={camp._id}
                                        onClick={() => handleCampCardClick(camp._id, camp.name)}
                                        className={`cursor-pointer p-4 rounded-2xl border transition-all hover:shadow-lg hover:scale-[1.02] hover:border-indigo-400
                                            ${selectedCampId === camp._id
                                                ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                                                : "bg-white hover:border-indigo-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="font-bold truncate">{camp.name}</h4>
                                            <CampStatusBadge date={camp.date} time={camp.time} />
                                        </div>

                                        <div className={`mt-2 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                            <MapPin size={14} />
                                            <span className="truncate">{camp.location}</span>
                                        </div>

                                        <div className={`mt-1 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                            <Calendar size={14} />
                                            <span>{camp.date || "Date TBD"}</span>
                                        </div>

                                        <div className={`mt-1 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                            <Clock size={14} />
                                            <span>{camp.time || "Time TBD"}</span>
                                        </div>

                                        {/* Creator Info */}
                                        <div className={`text-[8px] font-semibold mt-1.5 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
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
                                            <div className={`text-[8px] font-semibold mt-0.5 ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                                                <span className="opacity-75">Assigned Partner: </span>
                                                <span className="font-bold">
                                                    {typeof camp.assignedPartner === 'object' && camp.assignedPartner
                                                        ? (camp.assignedPartner.name || camp.assignedPartner.clinicName)
                                                        : (getPartnerName(camp.assignedPartner) || "Partner")
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {/* 🔥 Using VolunteerDisplay component */}
                                        {camp.volunteers && camp.volunteers.length > 0 && (
                                            <div className="mt-2">
                                                <VolunteerDisplay
                                                    volunteers={camp.volunteers}
                                                    isSelected={selectedCampId === camp._id}
                                                    employeeMap={employeeMap}
                                                />
                                            </div>
                                        )}

                                        {/* 🔥 Using PartnerDisplay component */}
                                        {camp.partners && camp.partners.length > 0 && (
                                            <div className="mt-1">
                                                <PartnerDisplay
                                                    partners={camp.partners}
                                                    isSelected={selectedCampId === camp._id}
                                                    partnersList={partnerList}
                                                />
                                            </div>
                                        )}

                                        <div className={`mt-3 pt-3 border-t flex items-center justify-between ${selectedCampId === camp._id ? "border-white/20" : "border-gray-50"}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedCampId === camp._id
                                                    ? "bg-white/20 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}>
                                                    {patientCount} Patients
                                                </span>
                                                {/* <span className="text-[8px] text-green-600 font-medium flex items-center gap-0.5">
                                                    <UserPlus size={10} /> Click to add
                                                </span> */}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewCamp(camp);
                                                }}
                                                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors
                                                    ${selectedCampId === camp._id
                                                        ? "bg-white/20 text-white hover:bg-white/30"
                                                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                                    }`}
                                            >
                                                <Eye size={12} /> View
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        )}
                    </div>
                </div>

                {/* PATIENTS SECTION */}
                <div ref={patientsSectionRef} className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">Patients</h3>
                        <div className="relative w-full sm:w-72">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by name, phone or camp..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                    <div className="admin-dash__card-body">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Filter size={16} />
                                <span>Showing {filteredPatients.length} participants</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {role !== "volunteer" && (
                                    <button
                                        onClick={() => navigate("/add-patient", { state: { campId: selectedCampId === "all" ? "" : selectedCampId } })}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700"
                                    >
                                        <Plus size={16} />
                                        Add Patient
                                    </button>
                                )}
                                <button
                                    onClick={handleBulkDownload}
                                    disabled={selectedCampId === "all" || loading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={16} />
                                    {loading ? "Generating..." : "Download ZIP"}
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
                                        <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase text-center">Actions</th>
                                    </tr>
                                </thead>
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
                                        filteredPatients.map(patient => (
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
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-100">
                                                        <MapPin size={12} />
                                                        {patient.campId?.name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                                        {/* View Report button */}
                                                        <button
                                                            onClick={() => viewReport(patient)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <Eye size={14} />
                                                            View
                                                        </button>

                                                        {role !== "volunteer" && (
                                                            <button
                                                                onClick={() => navigate(`/patient/${patient._id}`)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                            >
                                                                <Edit size={14} />
                                                                Edit
                                                            </button>
                                                        )}

                                                        {/* Download button */}
                                                        <button
                                                            onClick={() => downloadPDF(patient)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                        >
                                                            <FileText size={14} />
                                                            Download
                                                        </button>

                                                        <button
                                                            onClick={() => shareReport(patient)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                                        >
                                                            <MessageCircle size={14} />
                                                            WhatsApp
                                                        </button>

                                                        {/* 🔥 NEW: Delete button */}
                                                        <button
                                                            onClick={() => {
                                                                setPatientToDelete(patient);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-gray-400">
                                                    <Users size={48} className="opacity-20" />
                                                    <div>
                                                        <p className="text-lg font-bold text-gray-800">No participants found</p>
                                                        <p className="text-sm mt-1">Try adjusting your filters or selection.</p>
                                                    </div>
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
                                <AlertTriangle size={24} className="text-red-600" />
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
                                        <Trash2 size={16} />
                                        Delete Patient
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* SHARE MODAL - FIXED POSITION */}
            {showShareModal && currentPatient && createPortal(
                <div 
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowShareModal(false);
                        }
                    }}
                >
                    <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center text-white bg-gradient-to-r from-green-600 to-emerald-600">
                            <MessageCircle size={32} className="mx-auto mb-2" />
                            <h3 className="text-xl font-bold">Share Health Report</h3>
                            <p className="text-sm text-green-100 mt-1">Ready to send via WhatsApp</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                                <div className="w-12 h-12 flex items-center justify-center text-lg font-bold text-green-700 rounded-full bg-green-100 uppercase border border-green-200">
                                    {currentPatient.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{currentPatient.name}</p>
                                    <p className="text-sm text-gray-600">{currentPatient.contact}</p>
                                </div>
                            </div>
                            <div className="p-4 border-2 border-green-200 border-dashed rounded-2xl bg-green-50/50">
                                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed break-words">{downloadLink}</p>
                            </div>
                            <button
                                onClick={() => {
                                    const phone = currentPatient.contact.replace(/\D/g, '');
                                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(downloadLink)}`, "_blank");
                                    setShowShareModal(false);
                                }}
                                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={18} /> Open WhatsApp
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(downloadLink);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                                {copied ? "Copied!" : "Copy Full Message"}
                            </button>
                            <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">Close</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* VIEW CAMP MODAL - FIXED POSITION WITH PROPER BUTTON LAYOUT */}
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
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{viewCamp.name}</h3>
                                        <CampStatusBadge date={viewCamp.date} time={viewCamp.time} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={15} className="text-indigo-500" />
                                            <span className="font-medium">{viewCamp.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={15} className="text-indigo-500" />
                                            <span className="font-medium">{viewCamp.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={15} className="text-indigo-500" />
                                            <span className="font-medium">{viewCamp.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={15} className="text-indigo-500" />
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

                                    {/* VolunteerDisplay in View Modal */}
                                    {viewCamp.volunteers && viewCamp.volunteers.length > 0 && (
                                        <div className="mt-2">
                                            <VolunteerDisplay
                                                volunteers={viewCamp.volunteers}
                                                isSelected={false}
                                                employeeMap={employeeMap}
                                            />
                                        </div>
                                    )}

                                    {/* PartnerDisplay in View Modal */}
                                    {viewCamp.partners && viewCamp.partners.length > 0 && (
                                        <div className="mt-1">
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
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shadow-sm flex-shrink-0"
                                >
                                    <X size={18} />
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
                                                            <CheckCircle size={12} /> Screened
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
                                                        View Details <ChevronRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Users size={40} className="opacity-20" />
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
                                        <FileSpreadsheet size={16} />
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

            {/* Stats Modal */}
            <StatsModal />
            </div>
        </div>
    );
}