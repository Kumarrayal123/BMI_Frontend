import axios from "axios";
import JSZip from "jszip";
import {
  Activity,
  Calendar,
  Clock,
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
  Users,
  Edit,
  ChevronRight,
  X,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
import config from "../config";
import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";
import VolunteerDisplay from "../components/VolunteerDisplay";
import PartnerDisplay from "../components/PartnerDisplay";

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

/* ================= COMPONENTS ================= */

const StatsCard = ({ title, value, icon: Icon, colorClass, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02] ${onClick ? 'cursor-pointer' : ''}`}
  >
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
  const [camps, setCamps] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerList, setPartnerList] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  // Filters
  const [selectedCampId, setSelectedCampId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [generatedReportFile, setGeneratedReportFile] = useState(null);



  // Modal State
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

  // Refs for scrolling
  const campsSectionRef = useRef(null);
  const patientsSectionRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /* -------- FETCH DATA -------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const role = localStorage.getItem("role");
        const userDataStr = localStorage.getItem("userData");
        const partnerId = localStorage.getItem("userId") || (userDataStr ? JSON.parse(userDataStr).id : null);

        const [campsRes, patientsRes, employeesRes, partnersRes] = await Promise.all([
          role === "partner" && partnerId
            ? axios.get(`${API_BASE}/camps/assigned-camps/${partnerId}`).catch(() => ({ data: [] }))
            : axios.get(`${API_BASE}/camps/allcamps`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/patients`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/proxy/employees/get-employees`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/auth/partners`).catch(() => ({ data: [] }))
        ]);

        let finalCamps = campsRes.data || [];
        setCamps(sortCampsByStatus(finalCamps));

        // If partner, further filter patients to only those in their assigned camps
        let allPatients = patientsRes.data || [];
        if (role === "partner" && partnerId) {
          const assignedIds = finalCamps.map(c => String(c._id));
          allPatients = allPatients.filter(p => p.campId && assignedIds.includes(String(p.campId?._id || p.campId)));
        }
        setPatients(allPatients);

        // Filter volunteers from external backend
        const empData = employeesRes.data || [];
        const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];

        // Filter by departments: Laboratory Medicine, Nursing, Medical
        const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
        const filteredVolunteers = allEmployees.filter(emp => {
          const dept = (emp.department || "").trim();
          return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
        });

        setVolunteers(filteredVolunteers);
        setPartnerList(Array.isArray(partnersRes.data) ? partnersRes.data : []);
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

  // Calculate Status Counts using centralized utility
  const activeCampsCount = camps.filter(c => {
    const { status } = getCampStatus(c.date, c.time);
    return status === 'live' || status === 'today';
  }).length;

  const upcomingCampsCount = camps.filter(c => {
    const { status } = getCampStatus(c.date, c.time);
    return status === 'upcoming';
  }).length;

  const campsWithCount = useMemo(() => {
    return camps.map(c => {
      const count = patients.filter(
        p => String(p.campId?._id) === String(c._id)
      ).length;
      return { ...c, count };
    });
  }, [camps, patients]);

  /* -------- VIEW MODAL HELPERS -------- */

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
      // Find latest vitals if tests exist
      let bmi = "-", bp = "-", sugar = "-";
      if (p.tests && p.tests.length > 0) {
        // Sort by date desc
        const sortedTests = [...p.tests].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Iterate to find specific values
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
      `${config.API_BASE_URL}/reports/upload`,
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

  /* -------- BULK ZIP DOWNLOAD -------- */
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
      const selectedCamp = camps.find(c => String(c._id) === String(selectedCampId));
      const campName = selectedCamp?.name || "Camp";

      // Generate PDFs for all patients
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

            // Add PDF to ZIP with patient name and ID
            const fileName = `${patient.name.replace(/[^a-z0-9]/gi, '_')}_${patient._id.slice(-6)}.pdf`;
            zip.file(fileName, pdfBlob);
          }
        } catch (err) {
          console.error(`Failed to generate report for ${patient.name}:`, err);
        }
      }

      // Generate and download ZIP file
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
  };

  const handleRemovePartner = (id) => {
    setCampForm({
      ...campForm,
      partners: campForm.partners.filter(p => p !== id)
    });
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
        time: "",
        volunteers: [],
        partners: []
      });
      // camps list refresh
      const res = await axios.get(`${API_BASE}/camps/allcamps`);
      setCamps(sortCampsByStatus(res.data)); // Apply sorting here too
    } catch (err) {
      console.error("CREATE CAMP ERROR", err);
      alert("❌ Failed to create camp");
    }
  };

  return (
    <div className="min-h-screen p-0 space-y-1 bg-gray-50/50 md:p-0 animate-fade-in">
      {/* HEADER Section */}
      {/* <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
      </div> */}

      {/* STATS Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Camps"
          value={totalCamps}
          icon={MapPin}
          colorClass="bg-gradient-to-br from-indigo-500 to-purple-600"
          onClick={() => scrollToSection(campsSectionRef)}
        />
        <StatsCard
          title="Active Camps"
          value={activeCampsCount}
          icon={Activity}
          colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600"
          onClick={() => scrollToSection(campsSectionRef)}
        />
        <StatsCard
          title="Total Patients"
          value={totalPatients}
          icon={Users}
          colorClass="bg-gradient-to-br from-blue-500 to-cyan-500"
          onClick={() => scrollToSection(patientsSectionRef)}
        />
        <StatsCard
          title="Upcoming Camps"
          value={upcomingCampsCount}
          icon={Activity}
          colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
          onClick={() => scrollToSection(campsSectionRef)}
        />
      </div>

      {/* ===== CAMPS ROW (Below Stats) ===== */}
      <div className="space-y-4" ref={campsSectionRef}>
        <div className="flex items-center pt-2.5 justify-between">
          <h3 className="text-lg font-bold text-gray-800">Camps</h3>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
              {activeCampsCount} Active
            </span>
            <button
              onClick={() => setSelectedCampId("all")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              All Camps Data
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {campsWithCount.map(camp => (
            <div
              key={camp._id}
              onClick={() => {
                setSelectedCampId(camp._id);
                scrollToSection(patientsSectionRef);
              }}
              className={`cursor-pointer p-4 rounded-2xl border transition-all
          ${selectedCampId === camp._id
                  ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                  : "bg-white hover:border-indigo-300 hover:shadow-md"
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
                <span>{camp.date || "No date"}</span>
              </div>

              <div className={`mt-1 flex items-center gap-2 text-sm ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                <Clock size={14} />
                <span>{camp.time || "No time"}</span>
              </div>

              <VolunteerDisplay
                volunteers={camp.volunteers}
                isSelected={selectedCampId === camp._id}
              />

              <PartnerDisplay
                partners={camp.partners}
                isSelected={selectedCampId === camp._id}
              />

              <span className={`inline-block mt-3 text-xs font-bold px-2 py-1 rounded-lg ${selectedCampId === camp._id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {camp.count} Patients
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewCamp(camp);
                }}
                className="float-right mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Eye size={12} /> View
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE - PARTICIPANTS TABLE */}
        <div className="space-y-6 lg:col-span-3" ref={patientsSectionRef}>
          {/* Controls */}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/add-patient", { state: { campId: selectedCampId } })}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700"
                >
                  <Plus size={16} />
                  Add Patient
                </button>
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
          </div>

          {/* Table Container */}
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
                          <div className="flex items-center gap-2">
                            <button onClick={() => viewReport(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                              <Eye size={14} /> View
                            </button>
                            <button onClick={() => navigate(`/patient/${patient._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => downloadPDF(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                              <FileText size={14} /> Download
                            </button>
                            <button onClick={() => shareReport(patient)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                              <MessageCircle size={14} /> WhatsApp
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
                          <p className="text-sm">Try adjusting your search or filters.</p>
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
            createPortal(
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
                        <MessageCircle size={18} /> Open WhatsApp with Message
                      </button>
                      <button onClick={handleCopyMessage} className="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2">
                        {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />} {copied ? "Copied!" : "Copy Full Message"}
                      </button>
                      <button onClick={handleCopyLinkOnly} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                        <Link size={16} /> Copy Download Link Only
                      </button>
                      <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>, document.body)
          )}
        </div>
      </div>

      {/* --- CREATE CAMP MODAL --- */}
      {showCampModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Create New Camp</h2>
                <button onClick={() => setShowCampModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  &times;
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <input className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="Camp Name" value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} />
              <input className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="Location" value={campForm.location} onChange={e => setCampForm({ ...campForm, location: e.target.value })} />
              <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={campForm.date} onChange={e => setCampForm({ ...campForm, date: e.target.value })} />
              <input className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="Time" value={campForm.time} onChange={e => setCampForm({ ...campForm, time: e.target.value })} />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Volunteers</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {campForm.volunteers.map((vol, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-700 bg-indigo-100 rounded-full">
                      {vol} <button onClick={() => handleRemoveVolunteer(vol)} className="ml-1 text-indigo-500 hover:text-indigo-900">&times;</button>
                    </span>
                  ))}
                </div>
                <select className="w-full px-4 py-2 border rounded-xl bg-white" value="" onChange={handleAddVolunteer}>
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
                    const partner = partnerList.find(p => p._id === partnerId);
                    return partner ? (
                      <span key={partnerId} className="flex items-center gap-1 px-3 py-1 text-sm text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
                        {partner.clinicName || partner.name} <button onClick={() => handleRemovePartner(partnerId)} className="ml-1 text-emerald-500 hover:text-emerald-900">&times;</button>
                      </span>
                    ) : null;
                  })}
                </div>
                <select className="w-full px-4 py-2 border rounded-xl bg-white" value="" onChange={handleAddPartner}>
                  <option value="">+ Assign Partner</option>
                  {partnerList.map(partner => (
                    <option key={partner._id} value={partner._id}>{partner.clinicName || partner.name} ({partner.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setShowCampModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleCreateCamp} className="px-4 py-2 text-white bg-green-600 rounded-xl font-bold hover:bg-green-700">Create Camp</button>
            </div>
          </div>
        </div>, document.body
      )}
      {/* ================= VIEW CAMP MODAL ================= */}
      {viewCamp && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
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
                <FileSpreadsheet size={16} />
                Download Report
              </button>
            </div>

            {/* Table */}
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
                              <CheckCircle size={12} /> Screened
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
                              View Details <ChevronRight size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                        <Users size={32} className="opacity-20" />
                        <span className="text-sm font-medium">No patients found in this camp yet.</span>
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
    </div>
  );
}
