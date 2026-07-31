import axios from "axios";
import {
  Activity,
  Save,
  Eye,
  Heart,
  Droplet,
  Stethoscope,
  Thermometer,
  Weight,
  Ruler,
  Calendar,
  MapPin,
  FileText,
  X,
  Building2,
  ChevronDown,
  User,
  ClipboardList,
  TrendingUp,
  Award,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import config from "../config";

const AddTestForm = ({ patientId, onSuccess = () => {}, isModal = false, onClose = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [selectedCampType, setSelectedCampType] = useState("general");
  const [selectedCampDetails, setSelectedCampDetails] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [activeSection, setActiveSection] = useState("vitals");

  const [formData, setFormData] = useState({
    campType: "general",
    campId: "",
    campName: "",
    campLocation: "",
    campDate: new Date().toISOString().split('T')[0],
    date: new Date().toISOString(),
    weight: "",
    height: "",
    temperature: "",
    heartRate: "",
    oxygenLevel: "",
    systolic: "",
    diastolic: "80",
    sugar: "",
    sugarType: "Random",
    eyeVisionLeft: "",
    eyeVisionRight: "",
    eyePressureLeft: "",
    eyePressureRight: "",
    eyeColorVision: "normal",
    eyeCataract: "none",
    eyeGlaucoma: "no",
    hemoglobin: "",
    whiteBloodCells: "",
    platelets: "",
    cholesterol: "",
    triglycerides: "",
    hba1c: "",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const safeFormatDate = (dateValue) => {
    if (!dateValue) return new Date().toISOString().split('T')[0];
    try {
      const dateObj = new Date(dateValue);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
    } catch (e) {
      console.log("Invalid date format");
    }
    return new Date().toISOString().split('T')[0];
  };

  const fetchPatientCamp = async () => {
    try {
      setLoadingPatient(true);
      const res = await axios.get(`${config.API_BASE_URL}/patients/${patientId}`);
      const patient = res.data;

      if (patient.campId) {
        const camp = patient.campId;
        setSelectedCampDetails(camp);

        const formattedDate = safeFormatDate(camp.date);

        setFormData(prev => ({
          ...prev,
          campId: camp._id,
          campName: camp.name || "",
          campLocation: camp.location || "",
          campDate: formattedDate,
        }));
      }
    } catch (err) {
      console.log("Error fetching patient:", err);
    } finally {
      setLoadingPatient(false);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/patients/${patientId}/tests`);
      setTests(res.data || []);
    } catch (err) {
      console.log("Error fetching tests:", err);
    }
  };

  useEffect(() => {
    if (patientId) {
      Promise.all([fetchTests(), fetchPatientCamp()]);
    }
  }, [patientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCampTypeChange = (type) => {
    setSelectedCampType(type);
    setFormData((prev) => ({ ...prev, campType: type }));
    setActiveSection("vitals");
  };

  const clearForm = () => {
    const formattedDate = safeFormatDate(selectedCampDetails?.date);

    setFormData({
      campType: selectedCampType,
      campId: selectedCampDetails?._id || "",
      campName: selectedCampDetails?.name || "",
      campLocation: selectedCampDetails?.location || "",
      campDate: formattedDate,
      date: new Date().toISOString(),
      weight: "",
      height: "",
      temperature: "",
      heartRate: "",
      oxygenLevel: "",
      systolic: "",
      diastolic: "80",
      sugar: "",
      sugarType: "Random",
      eyeVisionLeft: "",
      eyeVisionRight: "",
      eyePressureLeft: "",
      eyePressureRight: "",
      eyeColorVision: "normal",
      eyeCataract: "none",
      eyeGlaucoma: "no",
      hemoglobin: "",
      whiteBloodCells: "",
      platelets: "",
      cholesterol: "",
      triglycerides: "",
      hba1c: "",
    });
  };

  const sendTest = async (testData) => {
    let campDate = new Date();
    const dateToUse = formData.campDate || selectedCampDetails?.date;
    if (dateToUse) {
      try {
        const parsedDate = new Date(dateToUse);
        if (!isNaN(parsedDate.getTime())) {
          campDate = parsedDate;
        }
      } catch (e) {
        console.log("Invalid date in sendTest, using current date");
      }
    }

    const payload = {
      ...testData,
      campType: selectedCampType,
      campId: formData.campId || selectedCampDetails?._id,
      campName: formData.campName || selectedCampDetails?.name || `${selectedCampType.charAt(0).toUpperCase() + selectedCampType.slice(1)} Camp`,
      campLocation: formData.campLocation || selectedCampDetails?.location || "",
      campDate: campDate,
      date: new Date(),
      doctorVerification: { status: "pending" }
    };
    await axios.post(`${config.API_BASE_URL}/patients/${patientId}/tests`, payload);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      let hasData = false;
      const testPromises = [];

      if (formData.weight) {
        testPromises.push(sendTest({ type: "weight", value: parseFloat(formData.weight), unit: "kg" }));
        hasData = true;
      }

      if (formData.height) {
        testPromises.push(sendTest({ type: "height", value: parseFloat(formData.height), unit: "cm" }));
        hasData = true;
      }

      if (formData.temperature) {
        testPromises.push(sendTest({ type: "temperature", value: parseFloat(formData.temperature), unit: "°F" }));
        hasData = true;
      }

      if (formData.heartRate) {
        testPromises.push(sendTest({ type: "heart_rate", value: parseFloat(formData.heartRate), unit: "bpm" }));
        hasData = true;
      }

      if (formData.oxygenLevel) {
        testPromises.push(sendTest({ type: "oxygen", value: parseFloat(formData.oxygenLevel), unit: "%" }));
        hasData = true;
      }

      if (formData.systolic && formData.diastolic) {
        testPromises.push(sendTest({ type: "bp", value: parseFloat(formData.systolic), value2: parseFloat(formData.diastolic), unit: "mmHg" }));
        hasData = true;
      }

      if (formData.sugar) {
        testPromises.push(sendTest({ type: "sugar", value: parseFloat(formData.sugar), sugarType: formData.sugarType || "Random", unit: "mg/dL" }));
        hasData = true;
      }

      if (selectedCampType === "eye") {
        let eyeData = { type: "eye_exam", value: 1, unit: "exam" };

        if (formData.eyeVisionLeft) { eyeData.eyeVisionLeft = parseFloat(formData.eyeVisionLeft); hasData = true; }
        if (formData.eyeVisionRight) { eyeData.eyeVisionRight = parseFloat(formData.eyeVisionRight); hasData = true; }
        if (formData.eyePressureLeft) { eyeData.eyePressureLeft = parseFloat(formData.eyePressureLeft); hasData = true; }
        if (formData.eyePressureRight) { eyeData.eyePressureRight = parseFloat(formData.eyePressureRight); hasData = true; }
        if (formData.eyeColorVision) { eyeData.eyeColorVision = formData.eyeColorVision; hasData = true; }
        if (formData.eyeCataract) { eyeData.eyeCataract = formData.eyeCataract; hasData = true; }
        if (formData.eyeGlaucoma) { eyeData.eyeGlaucoma = formData.eyeGlaucoma; hasData = true; }

        if (eyeData.eyeVisionLeft || eyeData.eyeVisionRight || eyeData.eyePressureLeft || eyeData.eyePressureRight || eyeData.eyeColorVision || eyeData.eyeCataract || eyeData.eyeGlaucoma) {
          testPromises.push(sendTest(eyeData));
        }
      }

      if (selectedCampType === "blood") {
        let bloodData = { type: "blood_test", value: 1, unit: "panel" };

        if (formData.hemoglobin) { bloodData.hemoglobin = parseFloat(formData.hemoglobin); hasData = true; }
        if (formData.whiteBloodCells) { bloodData.whiteBloodCells = parseFloat(formData.whiteBloodCells); hasData = true; }
        if (formData.platelets) { bloodData.platelets = parseFloat(formData.platelets); hasData = true; }
        if (formData.cholesterol) { bloodData.cholesterol = parseFloat(formData.cholesterol); hasData = true; }
        if (formData.triglycerides) { bloodData.triglycerides = parseFloat(formData.triglycerides); hasData = true; }
        if (formData.hba1c) { bloodData.hba1c = parseFloat(formData.hba1c); hasData = true; }

        if (bloodData.hemoglobin || bloodData.whiteBloodCells || bloodData.platelets || bloodData.cholesterol || bloodData.triglycerides || bloodData.hba1c) {
          testPromises.push(sendTest(bloodData));
        }
      }

      if (selectedCampType === "full-body") {
        let fullBodyData = { type: "full_body_checkup", value: 1, unit: "checkup" };

        if (formData.hemoglobin) { fullBodyData.hemoglobin = parseFloat(formData.hemoglobin); hasData = true; }
        if (formData.whiteBloodCells) { fullBodyData.whiteBloodCells = parseFloat(formData.whiteBloodCells); hasData = true; }
        if (formData.platelets) { fullBodyData.platelets = parseFloat(formData.platelets); hasData = true; }
        if (formData.cholesterol) { fullBodyData.cholesterol = parseFloat(formData.cholesterol); hasData = true; }
        if (formData.triglycerides) { fullBodyData.triglycerides = parseFloat(formData.triglycerides); hasData = true; }
        if (formData.hba1c) { fullBodyData.hba1c = parseFloat(formData.hba1c); hasData = true; }

        if (formData.weight && formData.height) {
          const h = parseFloat(formData.height) / 100;
          const bmiValue = (parseFloat(formData.weight) / (h * h)).toFixed(1);
          fullBodyData.bmi = parseFloat(bmiValue);
          hasData = true;
        }

        if (hasData) {
          testPromises.push(sendTest(fullBodyData));
        }
      }

      if (selectedCampType === "general" && hasData) {
        let generalData = { type: "general_checkup", value: 1, unit: "checkup" };

        if (formData.weight && formData.height) {
          const h = parseFloat(formData.height) / 100;
          const bmiValue = (parseFloat(formData.weight) / (h * h)).toFixed(1);
          generalData.bmi = parseFloat(bmiValue);
        }

        testPromises.push(sendTest(generalData));
      }

      if (!hasData) {
        setError("Please fill at least one health parameter");
        setLoading(false);
        return;
      }

      await Promise.all(testPromises);

      setSuccessMsg(`✅ ${testPromises.length} record(s) added successfully!`);
      clearForm();
      fetchTests();
      onSuccess();

      if (isModal) {
        setTimeout(() => { onClose(); }, 1500);
      }

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Submission Error:", err.response?.data || err);
      setError(err.response?.data?.error || "Failed to save records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (!formData.weight || !formData.height) return null;
    const h = parseFloat(formData.height) / 100;
    const bmiValue = (parseFloat(formData.weight) / (h * h)).toFixed(1);

    let category = "";
    let color = "";
    if (bmiValue < 18.5) { category = "Underweight"; color = "text-blue-600 bg-blue-50 border-blue-200"; }
    else if (bmiValue < 25) { category = "Healthy"; color = "text-emerald-600 bg-emerald-50 border-emerald-200"; }
    else if (bmiValue < 30) { category = "Overweight"; color = "text-amber-600 bg-amber-50 border-amber-200"; }
    else { category = "Obese"; color = "text-rose-600 bg-rose-50 border-rose-200"; }

    return { value: bmiValue, category, color };
  };

  const bmiData = calculateBMI();

  const formatTest = (t) => {
    let dateStr = "";
    try {
      if (t.date) {
        const dateObj = new Date(t.date);
        if (!isNaN(dateObj.getTime())) {
          dateStr = dateObj.toLocaleString();
        } else {
          dateStr = "Invalid Date";
        }
      } else {
        dateStr = "No Date";
      }
    } catch (e) {
      dateStr = "Invalid Date";
    }

    if (t.type === "bp") return `BP: ${t.value}/${t.value2} mmHg`;
    if (t.type === "sugar") return `Sugar: ${t.value} mg/dL`;
    if (t.type === "weight") return `Weight: ${t.value} kg`;
    if (t.type === "height") return `Height: ${t.value} cm`;
    if (t.type === "temperature") return `Temperature: ${t.value}°F`;
    if (t.type === "heart_rate") return `Heart Rate: ${t.value} bpm`;
    if (t.type === "oxygen") return `Oxygen: ${t.value}%`;
    return `${t.type.toUpperCase()}: ${t.value}`;
  };

  if (loadingPatient) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-600 border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-gray-500 font-medium text-sm mt-6">Loading camp details...</p>
      </div>
    );
  }

  return (
    <div className={`
      ${isModal ? 'bg-white rounded-2xl shadow-2xl' : 'bg-white rounded-3xl shadow-xl border border-slate-100 p-6 lg:p-8 mb-6'}
      transition-all duration-300
    `}>
      {/* Modal Header */}
      {isModal && (
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Add Medical Test</h3>
              <p className="text-xs text-slate-500 font-medium">Record patient health metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all duration-200 hover:scale-110"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className={isModal ? 'p-5 lg:p-6' : ''}>
        {/* Camp Information Banner */}
        <div className="bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4 lg:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="p-2.5 bg-indigo-100 rounded-xl flex-shrink-0">
              <Building2 size={20} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Active Camp</span>
              <h4 className="text-sm lg:text-base font-bold text-slate-800 truncate">{formData.campName || selectedCampDetails?.name || "General Camp"}</h4>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-slate-100 shadow-sm">
              <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
              <span className="font-medium text-slate-700 text-xs lg:text-sm truncate max-w-[100px] lg:max-w-none">{formData.campLocation || selectedCampDetails?.location || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-slate-100 shadow-sm">
              <Calendar size={14} className="text-indigo-500 flex-shrink-0" />
              <span className="font-medium text-slate-700 text-xs lg:text-sm whitespace-nowrap">
                {formData.campDate ? new Date(formData.campDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Test Type Selection */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Select Test Package</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
            {[
              { id: "general", icon: Stethoscope, label: "General", color: "indigo", bg: "bg-indigo-50", border: "border-indigo-500", text: "text-indigo-600" },
              { id: "eye", icon: Eye, label: "Eye", color: "emerald", bg: "bg-emerald-50", border: "border-emerald-500", text: "text-emerald-600" },
              { id: "blood", icon: Droplet, label: "Blood", color: "rose", bg: "bg-rose-50", border: "border-rose-500", text: "text-rose-600" },
              { id: "full-body", icon: Heart, label: "Full Body", color: "purple", bg: "bg-purple-50", border: "border-purple-500", text: "text-purple-600" }
            ].map(({ id, icon: Icon, label, color, bg, border, text }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleCampTypeChange(id)}
                className={`
                  group relative py-3 lg:py-4 px-3 lg:px-4 rounded-xl border-2 transition-all duration-300 
                  flex items-center justify-center gap-2 lg:gap-3 text-xs lg:text-sm font-semibold
                  hover:scale-[1.02] active:scale-[0.98]
                  ${selectedCampType === id
                    ? `${bg} ${border} ${text} shadow-lg shadow-${color}-500/10`
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                  }
                `}
              >
                <Icon size={16} className={selectedCampType === id ? text : "text-slate-400"} />
                <span className="truncate">{label}</span>
                {selectedCampType === id && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${color}-500 rounded-full flex items-center justify-center shadow-lg`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section Navigation */}
          <div className="flex gap-2 mb-5 border-b border-slate-100 pb-3 overflow-x-auto">
            {[
              { id: "vitals", label: "Vitals", icon: Activity },
              { id: "details", label: "Details", icon: ClipboardList },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`
                  px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-200 
                  flex items-center gap-1.5 lg:gap-2 whitespace-nowrap
                  ${activeSection === id
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Basic Vitals - Single Line Design */}
          <div className={`${activeSection === "vitals" ? "block" : "hidden"} transition-all duration-300`}>
            <div className="border-t border-slate-100 pt-5 mb-5">
              <h4 className="font-bold text-slate-800 text-xs lg:text-sm uppercase tracking-wider mb-4 flex items-center gap-3">
                <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                  <Activity size={14} />
                </span>
                Basic Vitals
              </h4>

              {/* Single Row - All Vitals in One Line */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 lg:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Weight size={12} className="text-slate-400" /> Weight
                  </label>
                  <div className="relative">
                    <input
                      name="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="70"
                      className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">kg</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Ruler size={12} className="text-slate-400" /> Height
                  </label>
                  <div className="relative">
                    <input
                      name="height"
                      type="number"
                      step="0.1"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="175"
                      className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">cm</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Droplet size={12} className="text-slate-400" /> Sugar
                  </label>
                  <div className="flex gap-1">
                    <div className="relative flex-1">
                      <input
                        name="sugar"
                        type="number"
                        value={formData.sugar}
                        onChange={handleInputChange}
                        placeholder="90"
                        className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">mg/dL</span>
                    </div>
                    <select
                      name="sugarType"
                      value={formData.sugarType}
                      onChange={handleInputChange}
                      className="bg-slate-50/70 border-2 border-slate-200 focus:border-indigo-500 rounded-xl text-[10px] px-1.5 outline-none text-slate-600 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer font-medium"
                    >
                      <option value="Fasting">F</option>
                      <option value="Random">R</option>
                      <option value="PPBS">P</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Heart size={12} className="text-slate-400" /> BP
                  </label>
                  <div className="flex gap-1 items-center">
                    <input
                      name="systolic"
                      type="number"
                      value={formData.systolic}
                      onChange={handleInputChange}
                      placeholder="120"
                      className="w-14 px-2 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400 text-center"
                    />
                    <span className="text-slate-400 text-sm font-medium">/</span>
                    <input
                      name="diastolic"
                      type="number"
                      value={formData.diastolic}
                      onChange={handleInputChange}
                      placeholder="80"
                      className="w-14 px-2 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400 text-center"
                    />
                    <span className="text-[8px] font-bold text-slate-400 ml-0.5">mmHg</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Thermometer size={12} className="text-slate-400" /> Temp
                  </label>
                  <div className="relative">
                    <input
                      name="temperature"
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      placeholder="98.6"
                      className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">°F</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Heart size={12} className="text-slate-400" /> Heart Rate
                  </label>
                  <div className="relative">
                    <input
                      name="heartRate"
                      type="number"
                      value={formData.heartRate}
                      onChange={handleInputChange}
                      placeholder="72"
                      className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">bpm</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Activity size={12} className="text-slate-400" /> Oxygen
                  </label>
                  <div className="relative">
                    <input
                      name="oxygenLevel"
                      type="number"
                      step="0.1"
                      value={formData.oxygenLevel}
                      onChange={handleInputChange}
                      placeholder="98"
                      className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Display - Compact */}
            {bmiData && (
              <div className={`
                mb-5 p-3 lg:p-4 rounded-2xl border-2 shadow-sm transition-all duration-300
                ${bmiData.category === 'Healthy' ? 'bg-emerald-50/70 border-emerald-200' :
                  bmiData.category === 'Obese' || bmiData.category === 'Underweight' ? 'bg-rose-50/70 border-rose-200' :
                  'bg-amber-50/70 border-amber-200'
                }
              `}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-xl
                      ${bmiData.category === 'Healthy' ? 'bg-emerald-100' :
                        bmiData.category === 'Obese' || bmiData.category === 'Underweight' ? 'bg-rose-100' :
                        'bg-amber-100'
                      }
                    `}>
                      <TrendingUp size={16} className={`
                        ${bmiData.category === 'Healthy' ? 'text-emerald-600' :
                          bmiData.category === 'Obese' || bmiData.category === 'Underweight' ? 'text-rose-600' :
                          'text-amber-600'
                        }
                      `} />
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">BMI</span>
                      <div className="text-xl lg:text-2xl font-extrabold tracking-tight text-slate-800">{bmiData.value}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${bmiData.color.split(' ')[0]}`}>{bmiData.category}</div>
                    <div className="text-[8px] text-slate-400">Normal: 18.5 - 24.9</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Camp Specific Fields */}
          {selectedCampType !== "general" && (
            <div className={`${activeSection === "details" ? "block" : "hidden"} transition-all duration-300`}>
              <div className="border-t border-slate-100 pt-5 mb-6">
                {selectedCampType === "eye" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 text-xs lg:text-sm uppercase tracking-wider mb-4 flex items-center gap-3">
                      <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">👁️</span>
                      Eye Examination
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Left Vision</label>
                        <input
                          name="eyeVisionLeft"
                          type="number"
                          step="0.1"
                          value={formData.eyeVisionLeft}
                          onChange={handleInputChange}
                          placeholder="6/6"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Right Vision</label>
                        <input
                          name="eyeVisionRight"
                          type="number"
                          step="0.1"
                          value={formData.eyeVisionRight}
                          onChange={handleInputChange}
                          placeholder="6/6"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Pressure (L) mmHg</label>
                        <input
                          name="eyePressureLeft"
                          type="number"
                          step="0.1"
                          value={formData.eyePressureLeft}
                          onChange={handleInputChange}
                          placeholder="15"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Pressure (R) mmHg</label>
                        <input
                          name="eyePressureRight"
                          type="number"
                          step="0.1"
                          value={formData.eyePressureRight}
                          onChange={handleInputChange}
                          placeholder="15"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Color Vision</label>
                        <select
                          name="eyeColorVision"
                          value={formData.eyeColorVision}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-sm text-slate-800 cursor-pointer font-medium"
                        >
                          <option value="normal">Normal</option>
                          <option value="deficient">Deficient</option>
                          <option value="blind">Blind</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Cataract</label>
                        <select
                          name="eyeCataract"
                          value={formData.eyeCataract}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-sm text-slate-800 cursor-pointer font-medium"
                        >
                          <option value="none">None</option>
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Glaucoma</label>
                        <select
                          name="eyeGlaucoma"
                          value={formData.eyeGlaucoma}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-sm text-slate-800 cursor-pointer font-medium"
                        >
                          <option value="no">No</option>
                          <option value="suspect">Suspect</option>
                          <option value="confirmed">Confirmed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCampType === "blood" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 text-xs lg:text-sm uppercase tracking-wider mb-4 flex items-center gap-3">
                      <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">🩸</span>
                      Blood Test Panel
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Hemoglobin (g/dL)</label>
                        <input
                          name="hemoglobin"
                          type="number"
                          step="0.1"
                          value={formData.hemoglobin}
                          onChange={handleInputChange}
                          placeholder="14.0"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">WBC (×10³/µL)</label>
                        <input
                          name="whiteBloodCells"
                          type="number"
                          step="0.1"
                          value={formData.whiteBloodCells}
                          onChange={handleInputChange}
                          placeholder="7.5"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Platelets (×10³/µL)</label>
                        <input
                          name="platelets"
                          type="number"
                          value={formData.platelets}
                          onChange={handleInputChange}
                          placeholder="250"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Cholesterol (mg/dL)</label>
                        <input
                          name="cholesterol"
                          type="number"
                          value={formData.cholesterol}
                          onChange={handleInputChange}
                          placeholder="180"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Triglycerides (mg/dL)</label>
                        <input
                          name="triglycerides"
                          type="number"
                          value={formData.triglycerides}
                          onChange={handleInputChange}
                          placeholder="150"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">HbA1c (%)</label>
                        <input
                          name="hba1c"
                          type="number"
                          step="0.1"
                          value={formData.hba1c}
                          onChange={handleInputChange}
                          placeholder="5.7"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCampType === "full-body" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 text-xs lg:text-sm uppercase tracking-wider mb-4 flex items-center gap-3">
                      <span className="p-1.5 bg-purple-50 rounded-lg text-purple-600">✨</span>
                      Full Body Checkup
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Hemoglobin (g/dL)</label>
                        <input
                          name="hemoglobin"
                          type="number"
                          step="0.1"
                          value={formData.hemoglobin}
                          onChange={handleInputChange}
                          placeholder="14.0"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-purple-500 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">WBC (×10³/µL)</label>
                        <input
                          name="whiteBloodCells"
                          type="number"
                          step="0.1"
                          value={formData.whiteBloodCells}
                          onChange={handleInputChange}
                          placeholder="7.5"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-purple-500 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Platelets (×10³/µL)</label>
                        <input
                          name="platelets"
                          type="number"
                          value={formData.platelets}
                          onChange={handleInputChange}
                          placeholder="250"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-purple-500 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Cholesterol (mg/dL)</label>
                        <input
                          name="cholesterol"
                          type="number"
                          value={formData.cholesterol}
                          onChange={handleInputChange}
                          placeholder="180"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-purple-500 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Triglycerides (mg/dL)</label>
                        <input
                          name="triglycerides"
                          type="number"
                          value={formData.triglycerides}
                          onChange={handleInputChange}
                          placeholder="150"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-purple-500 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">HbA1c (%)</label>
                        <input
                          name="hba1c"
                          type="number"
                          step="0.1"
                          value={formData.hba1c}
                          onChange={handleInputChange}
                          placeholder="5.7"
                          className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-purple-500 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-5 border-t-2 border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3.5 lg:py-4 px-6 lg:px-8 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Records...</span>
                </>
              ) : (
                <>
                  <Save size={18} className="group-hover:scale-110 transition-transform" />
                  <span>
                    {selectedCampType === "eye" ? "Save Eye Exam" :
                      selectedCampType === "blood" ? "Save Blood Test" :
                      selectedCampType === "full-body" ? "Save Full Body Checkup" :
                      "Save General Checkup"}
                  </span>
                </>
              )}
            </button>
            {isModal && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 lg:px-8 py-3.5 lg:py-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl font-semibold transition-all duration-200 text-sm active:scale-[0.98]"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mt-5 p-4 bg-rose-50/80 text-rose-700 rounded-2xl text-sm font-semibold border-2 border-rose-200 flex items-start gap-3">
              <div className="p-1.5 bg-rose-100 rounded-lg mt-0.5">
                <AlertCircle size={16} className="text-rose-600" />
              </div>
              <span className="flex-1">{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mt-5 p-4 bg-emerald-50/80 text-emerald-700 rounded-2xl text-sm font-semibold border-2 border-emerald-200 flex items-start gap-3">
              <div className="p-1.5 bg-emerald-100 rounded-lg mt-0.5">
                <CheckCircle size={16} className="text-emerald-600" />
              </div>
              <span className="flex-1">{successMsg}</span>
            </div>
          )}

          {/* Recent History - Compact */}
          {tests.length > 0 && (
            <div className="mt-6 pt-5 border-t-2 border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} />
                  Recent Entries
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">{tests.length} total</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {tests.slice().reverse().slice(0, 8).map((t, i) => (
                  <div key={i} className="text-xs text-slate-700 flex items-center gap-1.5 bg-slate-50 hover:bg-indigo-50/50 transition-all px-3 py-1.5 rounded-full border border-slate-100 hover:border-indigo-200">
                    <span className="font-medium">{formatTest(t)}</span>
                    <span className="text-[8px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                      {t.type?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AddTestForm;