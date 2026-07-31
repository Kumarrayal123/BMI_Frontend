import axios from "axios";
import JSZip from "jszip";
import {
    FiSearch,
    FiUser,
    FiCalendar,
    FiEye,
    FiDownload,
    FiFilter,
    FiX,
    FiMapPin,
    FiPhone,
    FiMail,
    FiFileText,
    FiCheckCircle,
    FiClock,
    FiUserCheck,
    FiActivity,
    FiCheckSquare,
    FiSquare
} from "react-icons/fi";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
import "./Dashboard.css";

const AllReports = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    
    // 🔥 Bulk Download States
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDownloading, setBulkDownloading] = useState(false);
    
    // 🔥 Filter States
    const [filterType, setFilterType] = useState("name");
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    
    // 🔥 Selected Patient for Report
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    // 🔒 SCROLL LOCK FUNCTION
    const lockScroll = () => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    };

    const unlockScroll = () => {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.width = 'auto';
    };

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${config.API_BASE_URL}/patients`);
            console.log("Fetched patients:", res.data);
            setPatients(res.data || []);
            setSelectedIds([]);
        } catch (err) {
            console.error("Failed to fetch patients:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Filter patients with reports and without reports
    const patientsWithTests = useMemo(() => {
        return patients.filter(p => p.tests && p.tests.length > 0);
    }, [patients]);

    const patientsWithoutTests = useMemo(() => {
        return patients.filter(p => !p.tests || p.tests.length === 0);
    }, [patients]);

    // 🔥 Get unique values for dropdown
    const uniqueNames = useMemo(() => {
        return [...new Set(patients.map(p => p.name).filter(Boolean))].sort();
    }, [patients]);

    const uniqueCamps = useMemo(() => {
        return [...new Set(patients.map(p => p.campId?.name).filter(Boolean))].sort();
    }, [patients]);

    const uniquePhones = useMemo(() => {
        return [...new Set(patients.map(p => p.contact).filter(Boolean))].sort();
    }, [patients]);

    const uniqueAddresses = useMemo(() => {
        return [...new Set(patients.map(p => p.address).filter(Boolean))].sort();
    }, [patients]);

    // 🔥 Filter Options
    const filterOptions = [
        { value: "name", label: "Name" },
        { value: "camp", label: "Camp Name" },
        { value: "phone", label: "Phone Number" },
        { value: "address", label: "Address" }
    ];

    // 🔥 Get dropdown options based on selected filter
    const getDropdownOptions = () => {
        switch(filterType) {
            case "name": return uniqueNames;
            case "camp": return uniqueCamps;
            case "phone": return uniquePhones;
            case "address": return uniqueAddresses;
            default: return [];
        }
    };

    // 🔥 Filter dropdown options based on search
    const filteredDropdownOptions = getDropdownOptions().filter(option =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 🔥 Filter Patients
    const filteredPatients = useMemo(() => {
        if (!searchQuery.trim()) return patients;
        const searchLower = searchQuery.toLowerCase();
        return patients.filter((p) => {
            switch(filterType) {
                case "name":
                    return p.name?.toLowerCase().includes(searchLower);
                case "camp":
                    return p.campId?.name?.toLowerCase().includes(searchLower);
                case "phone":
                    return p.contact?.toLowerCase().includes(searchLower);
                case "address":
                    return p.address?.toLowerCase().includes(searchLower);
                default:
                    return p.name?.toLowerCase().includes(searchLower);
            }
        });
    }, [patients, searchQuery, filterType]);

    // 🔥 Get filtered patients with tests
    const filteredPatientsWithTests = useMemo(() => {
        return filteredPatients.filter(p => p.tests && p.tests.length > 0);
    }, [filteredPatients]);

    // 🔥 Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.report-search-container')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 🔥 Helper: Extract latest vitals
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

    // 🔥 Prepare report data
    const prepareReportData = async (patientId) => {
        try {
            const res = await axios.get(`${config.API_BASE_URL}/patients/${patientId}`);
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

    // 🔥 TOGGLE SELECTION
    const toggleSelection = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // 🔥 SELECT ALL - Filtered patients
    const handleSelectAllFiltered = () => {
        const allIds = filteredPatients.map(p => p._id);
        if (selectedIds.length === allIds.length && allIds.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allIds);
        }
    };

    // 🔥 BULK DOWNLOAD - DOWNLOAD ALL SELECTED PATIENTS
    const handleBulkDownload = async () => {
        console.log("🔥 Bulk download clicked! Selected:", selectedIds);
        
        if (selectedIds.length === 0) {
            alert("Please select at least one patient to download.");
            return;
        }

        const patientsWithTestsList = selectedIds.filter(id => {
            const patient = patients.find(p => p._id === id);
            return patient && patient.tests && patient.tests.length > 0;
        });

        if (patientsWithTestsList.length === 0) {
            alert("Selected patients have no test data. Please select patients with completed reports.");
            return;
        }

        try {
            setBulkDownloading(true);
            const zip = new JSZip();
            let successCount = 0;
            let failCount = 0;

            for (const patientId of patientsWithTestsList) {
                try {
                    const patient = patients.find(p => p._id === patientId);
                    const data = await prepareReportData(patientId);
                    
                    if (data) {
                        const pdfBlob = await generateMedicalReportFile(
                            data.patientData,
                            data.testsData,
                            data.bmiData
                        );
                        const fileName = `${patient.name.replace(/[^a-z0-9]/gi, '_')}_${patient._id.slice(-6)}.pdf`;
                        zip.file(fileName, pdfBlob);
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (err) {
                    console.error(`Failed to generate report for ${patientId}:`, err);
                    failCount++;
                }
            }

            if (successCount === 0) {
                alert("Failed to generate any reports. Please try again.");
                setBulkDownloading(false);
                return;
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement("a");
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `Patient_Reports_${date}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setSelectedIds([]);

            const message = `✅ Successfully downloaded ${successCount} patient reports.`;
            if (failCount > 0) {
                alert(`${message}\n⚠️ ${failCount} patients failed to generate.`);
            } else {
                alert(message);
            }

        } catch (err) {
            console.error("Bulk download error:", err);
            alert("Failed to generate ZIP file. Please try again.");
        } finally {
            setBulkDownloading(false);
        }
    };

    // 🔥 View Report
    const handleViewReport = async (patient) => {
        lockScroll();
        setSelectedPatient(patient);
        setShowReportModal(true);
        setReportLoading(true);
        
        try {
            const res = await axios.get(`${config.API_BASE_URL}/patients/${patient._id}`);
            setReportData(res.data);
        } catch (err) {
            console.error("Failed to fetch report data:", err);
            alert("Failed to load report data");
        } finally {
            setReportLoading(false);
        }
    };

    // 🔥 Download Report - Single
    const handleDownloadReport = async (patient) => {
        try {
            setGenerating(true);
            
            const data = await prepareReportData(patient._id);
            if (!data) {
                alert("No test data available for this patient.");
                setGenerating(false);
                return;
            }
            
            await generateMedicalReport(
                data.patientData, 
                data.testsData, 
                data.bmiData
            );
            
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download report. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    // 🔥 Close Report Modal
    const closeReportModal = () => {
        unlockScroll();
        setShowReportModal(false);
        setSelectedPatient(null);
        setReportData(null);
    };

    // 🔥 Navigate to With Reports Page
    const goToWithReports = () => {
        navigate('/with-reports');
    };

    // 🔥 Navigate to Pending Reports Page
    const goToPendingReports = () => {
        navigate('/pending-reports');
    };

    // Report Modal Component
    const ReportModal = () => {
        if (!showReportModal || !selectedPatient) return null;

        const patient = reportData || selectedPatient;
        const vitals = patient.vitals || {};
        const tests = patient.tests || [];

        const latestWeight = tests.filter(t => t.type === 'weight').pop();
        const latestHeight = tests.filter(t => t.type === 'height').pop();
        const latestSugar = tests.filter(t => t.type === 'sugar').pop();
        const latestBP = tests.filter(t => t.type === 'bp').pop();

        const weight = latestWeight?.value || vitals.weight || '-';
        const height = latestHeight?.value || vitals.height || '-';
        const sugar = latestSugar?.value || vitals.sugar || '-';
        const sugarType = latestSugar?.sugarType || vitals.sugarType || 'Random';
        const bpSys = latestBP?.value || vitals.bpSys || '-';
        const bpDia = latestBP?.value2 || vitals.bpDia || '-';
        
        const bmi = (weight !== '-' && height !== '-') ? calculateBMI(parseFloat(weight), parseFloat(height)) : '-';
        const bmiCategory = bmi !== '-' ? getBMICategory(bmi) : '-';

        return (
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        closeReportModal();
                    }
                }}
            >
                <div 
                    className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-600 text-white sticky top-0 z-10">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <FiFileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Health Report</h3>
                                    <p className="text-sm text-emerald-100">
                                        {patient.name} • {patient.age} years • {patient.gender}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeReportModal}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                    </div>

                    {reportLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                            <p className="mt-4 text-gray-500">Loading report...</p>
                        </div>
                    ) : (
                        <>
                            {/* Patient Info */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</p>
                                        <p className="mt-1 font-semibold text-gray-800">{patient.name}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age / Gender</p>
                                        <p className="mt-1 font-semibold text-gray-800">{patient.age} Y • {patient.gender}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                                        <p className="mt-1 font-semibold text-gray-800">{patient.contact || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camp</p>
                                        <p className="mt-1 font-semibold text-gray-800">{patient.campId?.name || 'N/A'}</p>
                                    </div>
                                </div>
                                {patient.address && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                        <p className="mt-1 text-gray-700">{patient.address}</p>
                                    </div>
                                )}
                            </div>

                            {/* Clinical Vitals */}
                            <div className="p-6 border-b border-gray-100">
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FiActivity className="text-emerald-600" />
                                    Clinical Vitals
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Weight</p>
                                        <p className="mt-1 text-2xl font-bold text-blue-700">{weight} <span className="text-sm font-normal">kg</span></p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Height</p>
                                        <p className="mt-1 text-2xl font-bold text-purple-700">{height} <span className="text-sm font-normal">cm</span></p>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Sugar</p>
                                        <p className="mt-1 text-2xl font-bold text-amber-700">{sugar} <span className="text-sm font-normal">mg/dL</span></p>
                                        <p className="text-xs text-amber-500">{sugarType}</p>
                                    </div>
                                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                        <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Blood Pressure</p>
                                        <p className="mt-1 text-2xl font-bold text-rose-700">{bpSys}/{bpDia} <span className="text-sm font-normal">mmHg</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* BMI Analysis */}
                            <div className="p-6 border-b border-gray-100">
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FiUserCheck className="text-emerald-600" />
                                    BMI Analysis
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">BMI Value</p>
                                        <p className="mt-1 text-3xl font-bold text-indigo-700">{bmi}</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${
                                        bmiCategory === 'Healthy' ? 'bg-green-50 border-green-200' :
                                        bmiCategory === 'Underweight' ? 'bg-amber-50 border-amber-200' :
                                        bmiCategory === 'Overweight' ? 'bg-orange-50 border-orange-200' :
                                        'bg-red-50 border-red-200'
                                    }`}>
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Category</p>
                                        <p className={`mt-1 text-2xl font-bold ${
                                            bmiCategory === 'Healthy' ? 'text-green-700' :
                                            bmiCategory === 'Underweight' ? 'text-amber-700' :
                                            bmiCategory === 'Overweight' ? 'text-orange-700' :
                                            'text-red-700'
                                        }`}>{bmiCategory}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Test History */}
                            {tests.length > 0 && (
                                <div className="p-6">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FiClock className="text-emerald-600" />
                                        Test History
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                                    <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Test</th>
                                                    <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Value</th>
                                                    <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Unit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {tests.slice().reverse().map((test, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-3 text-sm text-gray-600">{formatDateTime(test.date)}</td>
                                                        <td className="p-3 text-sm font-medium text-gray-700 capitalize">{test.type}</td>
                                                        <td className="p-3 text-sm font-semibold text-gray-800">
                                                            {test.type === 'bp' ? `${test.value}/${test.value2}` : test.value}
                                                        </td>
                                                        <td className="p-3 text-sm text-gray-500">{test.unit || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3 justify-end">
                                <button
                                    onClick={() => handleDownloadReport(patient)}
                                    disabled={generating || !patient.tests || patient.tests.length === 0}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition shadow-sm active:scale-[0.98] ${
                                        patient.tests && patient.tests.length > 0
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {generating ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FiDownload size={16} />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={closeReportModal}
                                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition shadow-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // Stats Cards
    const totalPatients = patients.length;
    const patientsWithTestsCount = patientsWithTests.length;
    const patientsWithoutTestsCount = patientsWithoutTests.length;
    const selectedCount = selectedIds.length;
    const isAllSelected = selectedIds.length === filteredPatients.length && filteredPatients.length > 0;

    return (
        <div className="admin-dash">
            {/* Header */}
            <div className="admin-dash__header">
                <div>
                    <h1 className="admin-dash__greeting">
                        All <span>Reports</span>
                    </h1>
                    <p className="admin-dash__subtitle">
                        View and manage health reports of all patients.
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
                {/* Stats Cards */}
                <div className="admin-dash__stats" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '1.5rem',
                    marginBottom: '0'
                }}>
                    <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/all-reports')}>
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Total Patients</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                                <FiUser />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{totalPatients}</div>
                        <div className="admin-dash__stat-meta">registered patients</div>
                    </div>

                    <div className="admin-dash__stat cursor-pointer" onClick={goToWithReports}>
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">With Reports</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                                <FiCheckCircle />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{patientsWithTestsCount}</div>
                        <div className="admin-dash__stat-meta">have test data</div>
                    </div>

                    <div className="admin-dash__stat cursor-pointer" onClick={goToPendingReports}>
                        <div className="admin-dash__stat-top">
                            <span className="admin-dash__stat-label">Pending Reports</span>
                            <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                                <FiClock />
                            </div>
                        </div>
                        <div className="admin-dash__stat-value">{patientsWithoutTestsCount}</div>
                        <div className="admin-dash__stat-meta">no test data yet</div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">Patient Reports</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* 🔥 SELECT ALL & BULK DOWNLOAD IN FILTER SECTION */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Select All Checkbox */}
                                <button
                                    onClick={handleSelectAllFiltered}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                    title={isAllSelected ? "Deselect all" : "Select all"}
                                >
                                    {isAllSelected ? (
                                        <FiCheckSquare size={16} className="text-indigo-600" />
                                    ) : (
                                        <FiSquare size={16} className="text-gray-400" />
                                    )}
                                    <span className="text-xs font-medium text-gray-600">
                                        {isAllSelected ? "All Selected" : "Select All"}
                                    </span>
                                </button>

                                {/* Separator */}
                                <span className="text-gray-300">|</span>

                                {/* Bulk Download Button */}
                                <button
                                    onClick={handleBulkDownload}
                                    disabled={selectedCount === 0 || bulkDownloading}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                                        selectedCount > 0 && !bulkDownloading
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 cursor-pointer'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {bulkDownloading ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            <span className="text-xs">ZIP...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiDownload size={14} />
                                            <span className="text-xs font-medium">
                                                Download {selectedCount > 0 ? `(${selectedCount})` : ''}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* Selected count badge */}
                                {selectedCount > 0 && (
                                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                                        {selectedCount} selected
                                    </span>
                                )}
                            </div>

                            {/* Search & Filter */}
                            <div className="flex items-center gap-2 ml-auto">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={filterType}
                                        onChange={(e) => {
                                            setFilterType(e.target.value);
                                            setSearchQuery("");
                                            setShowDropdown(false);
                                        }}
                                        className="px-3 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                                    >
                                        {filterOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative report-search-container w-full sm:w-56">
                                    <FiSearch
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                                    />
                                    <input
                                        type="text"
                                        placeholder={`Search by ${filterOptions.find(o => o.value === filterType)?.label || 'Name'}...`}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    {showDropdown && filteredDropdownOptions.length > 0 && searchQuery.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                            {filteredDropdownOptions.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        setSearchQuery(option);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="admin-dash__card-body p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                <p className="text-gray-500">Loading patients...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="p-3 text-center" style={{ width: '40px', minWidth: '40px' }}>
                                                {/* Empty header - selection handled in filter section */}
                                            </th>
                                            <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Patient</th>
                                            <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
                                            <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</th>
                                            <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Tests</th>
                                            <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Status</th>
                                            <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map((patient) => {
                                                const testCount = patient.tests?.length || 0;
                                                const hasTests = testCount > 0;
                                                const isSelected = selectedIds.includes(patient._id);
                                                
                                                return (
                                                    <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => toggleSelection(patient._id)}
                                                                className="p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer inline-flex"
                                                                title={isSelected ? "Deselect" : "Select"}
                                                            >
                                                                {isSelected ? (
                                                                    <FiCheckSquare size={16} className="text-indigo-600" />
                                                                ) : (
                                                                    <FiSquare size={16} className="text-gray-400" />
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center justify-center w-9 h-9 text-sm font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0">
                                                                    {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 text-sm">{patient.name || 'N/A'}</p>
                                                                    <p className="text-xs text-gray-500">{patient.age || 'N/A'} Y • {patient.gender || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className="px-2.5 py-1 text-xs text-green-700 bg-green-100 rounded-full whitespace-nowrap">
                                                                {patient.campId?.name || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                                <FiPhone size={12} className="text-gray-400 flex-shrink-0" />
                                                                {patient.contact || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                                                hasTests 
                                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                                    : 'bg-gray-100 text-gray-500'
                                                            }`}>
                                                                {testCount} tests
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            {hasTests ? (
                                                                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1 whitespace-nowrap">
                                                                    <FiCheckCircle size={12} />
                                                                    Complete
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full flex items-center gap-1 whitespace-nowrap">
                                                                    <FiClock size={12} />
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <button
                                                                    onClick={() => handleViewReport(patient)}
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                                                                >
                                                                    <FiEye size={12} /> View
                                                                </button>
                                                                {hasTests && (
                                                                    <button
                                                                        onClick={() => handleDownloadReport(patient)}
                                                                        disabled={generating}
                                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                                    >
                                                                        <FiDownload size={12} /> Download
                                                                    </button>
                                                                )}
                                                                {!hasTests && (
                                                                    <span className="text-xs text-gray-400 italic">No test data</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                                        <FiFileText size={48} className="opacity-20" />
                                                        <p className="text-lg font-medium">No patients found</p>
                                                        <p className="text-sm">Try adjusting your search.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            <ReportModal />
        </div>
    );
};

export default AllReports;