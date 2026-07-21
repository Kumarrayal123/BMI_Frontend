import axios from "axios";
import { Activity, Save, Eye, Heart, Droplet, Stethoscope, Thermometer, Weight, Ruler, Calendar, MapPin, FileText, X, Building2, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import config from "../config";

const AddTestForm = ({ patientId, onSuccess = () => {}, isModal = false, onClose = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [selectedCampType, setSelectedCampType] = useState("general");
  const [selectedCampDetails, setSelectedCampDetails] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  
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

  // Helper function to safely format date
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
    // Safe date handling
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
    if (bmiValue < 18.5) category = "Underweight";
    else if (bmiValue < 25) category = "Healthy";
    else if (bmiValue < 30) category = "Overweight";
    else category = "Obese";
    
    return { value: bmiValue, category };
  };

  const bmiData = calculateBMI();

  const formatTest = (t) => {
    // SAFE DATE FORMATTING
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
    
    if (t.type === "bp") return `${dateStr} — BP: ${t.value}/${t.value2} mmHg`;
    if (t.type === "sugar") return `${dateStr} — Sugar: ${t.value} mg/dL`;
    if (t.type === "weight") return `${dateStr} — Weight: ${t.value} kg`;
    if (t.type === "height") return `${dateStr} — Height: ${t.value} cm`;
    if (t.type === "temperature") return `${dateStr} — Temperature: ${t.value}°F`;
    if (t.type === "heart_rate") return `${dateStr} — Heart Rate: ${t.value} bpm`;
    if (t.type === "oxygen") return `${dateStr} — Oxygen: ${t.value}%`;
    return `${dateStr} — ${t.type.toUpperCase()}: ${t.value}`;
  };

  if (loadingPatient) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
        <p className="text-gray-500 font-medium text-sm">Loading camp details...</p>
      </div>
    );
  }

  return (
    <div className={`${isModal ? '' : 'bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6'}`}>
      {isModal && (
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <Activity size={20} className="text-indigo-600" />
            Add Medical Test
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
            <X size={22} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Camp Details - Clean Card */}
      {selectedCampDetails && (
        <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Building2 size={16} className="text-gray-500" />
              <span className="font-medium text-gray-700 text-sm">Camp:</span>
              <span className="font-semibold text-gray-900 text-sm">{selectedCampDetails.name}</span>
            </div>
            {selectedCampDetails.location && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin size={14} /> 
                <span>{selectedCampDetails.location}</span>
              </div>
            )}
            {selectedCampDetails.date && (
              <div className="flex items-center gap-2 text-gray-500 text-sm ml-auto">
                <Calendar size={14} /> 
                <span>{new Date(selectedCampDetails.date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Type Selection */}
      <div className="mb-8">
        <label className="text-sm font-semibold text-gray-700 block mb-4">Select Test Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            type="button" 
            onClick={() => handleCampTypeChange("general")} 
            className={`py-3.5 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2.5 text-sm font-medium ${
              selectedCampType === "general" 
                ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Stethoscope size={18} /> General
          </button>
          <button 
            type="button" 
            onClick={() => handleCampTypeChange("eye")} 
            className={`py-3.5 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2.5 text-sm font-medium ${
              selectedCampType === "eye" 
                ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Eye size={18} /> Eye
          </button>
          <button 
            type="button" 
            onClick={() => handleCampTypeChange("blood")} 
            className={`py-3.5 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2.5 text-sm font-medium ${
              selectedCampType === "blood" 
                ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Droplet size={18} /> Blood
          </button>
          <button 
            type="button" 
            onClick={() => handleCampTypeChange("full-body")} 
            className={`py-3.5 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2.5 text-sm font-medium ${
              selectedCampType === "full-body" 
                ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Heart size={18} /> Full Body
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Camp Name, Location, Date - Read Only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={15} className="text-gray-400" /> Camp Name
            </label>
            <input 
              name="campName" 
              type="text" 
              value={formData.campName} 
              placeholder="Camp Name" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm cursor-not-allowed"
              readOnly
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin size={15} className="text-gray-400" /> Camp Location
            </label>
            <input 
              name="campLocation" 
              type="text" 
              value={formData.campLocation} 
              placeholder="Location" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm cursor-not-allowed"
              readOnly
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={15} className="text-gray-400" /> Camp Date
            </label>
            <input 
              name="campDate" 
              type="date" 
              value={formData.campDate} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm cursor-not-allowed"
              readOnly
            />
          </div>
        </div>

        {/* Basic Vitals */}
        <div className="border-t-2 border-gray-100 pt-8 mb-8">
          <h4 className="font-semibold text-gray-700 text-base mb-5">Basic Vitals</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Weight size={15} className="text-gray-400" /> Weight (kg)
              </label>
              <input 
                name="weight" 
                type="number" 
                step="0.1" 
                value={formData.weight} 
                onChange={handleInputChange} 
                placeholder="e.g. 70" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Ruler size={15} className="text-gray-400" /> Height (cm)
              </label>
              <input 
                name="height" 
                type="number" 
                step="0.1" 
                value={formData.height} 
                onChange={handleInputChange} 
                placeholder="e.g. 175" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Droplet size={15} className="text-gray-400" /> Sugar (mg/dL)
              </label>
              <div className="flex gap-2">
                <input 
                  name="sugar" 
                  type="number" 
                  value={formData.sugar} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 90" 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                />
                <select 
                  name="sugarType" 
                  value={formData.sugarType} 
                  onChange={handleInputChange} 
                  className="bg-gray-50 border border-gray-200 rounded-xl text-xs px-4 outline-none text-gray-600"
                >
                  <option value="Fasting">Fasting</option>
                  <option value="Random">Random</option>
                  <option value="PPBS">PPBS</option>
                </select>
              </div>
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Heart size={15} className="text-gray-400" /> BP (Sys/Dia)
              </label>
              <div className="flex gap-2">
                <input 
                  name="systolic" 
                  type="number" 
                  value={formData.systolic} 
                  onChange={handleInputChange} 
                  placeholder="Sys" 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm text-center"
                />
                <span className="self-center text-gray-400 text-base font-medium">/</span>
                <input 
                  name="diastolic" 
                  type="number" 
                  value={formData.diastolic} 
                  onChange={handleInputChange} 
                  placeholder="Dia" 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BMI Display */}
        {bmiData && (
          <div className={`mb-8 p-5 rounded-2xl border-2 flex items-center justify-between ${
            bmiData.category === 'Healthy' ? 'bg-green-50 border-green-200 text-green-700' :
            bmiData.category === 'Obese' || bmiData.category === 'Underweight' ? 'bg-red-50 border-red-200 text-red-700' : 
            'bg-orange-50 border-orange-200 text-orange-700'
          }`}>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">BMI</span>
              <div className="text-3xl font-bold">{bmiData.value}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-base">{bmiData.category}</div>
              <div className="text-xs opacity-75">18.5-24.9 Healthy</div>
            </div>
          </div>
        )}

        {/* Camp Specific Fields */}
        <div className="border-t-2 border-gray-100 pt-8 mb-8">
          {selectedCampType === "eye" && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 text-base mb-5">👁️ Eye Camp Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Left Vision</label>
                  <input 
                    name="eyeVisionLeft" 
                    type="number" 
                    step="0.1" 
                    value={formData.eyeVisionLeft} 
                    onChange={handleInputChange} 
                    placeholder="6/6" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Right Vision</label>
                  <input 
                    name="eyeVisionRight" 
                    type="number" 
                    step="0.1" 
                    value={formData.eyeVisionRight} 
                    onChange={handleInputChange} 
                    placeholder="6/6" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Pressure (L)</label>
                  <input 
                    name="eyePressureLeft" 
                    type="number" 
                    step="0.1" 
                    value={formData.eyePressureLeft} 
                    onChange={handleInputChange} 
                    placeholder="mmHg" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Pressure (R)</label>
                  <input 
                    name="eyePressureRight" 
                    type="number" 
                    step="0.1" 
                    value={formData.eyePressureRight} 
                    onChange={handleInputChange} 
                    placeholder="mmHg" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Color Vision</label>
                  <select 
                    name="eyeColorVision" 
                    value={formData.eyeColorVision} 
                    onChange={handleInputChange} 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="deficient">Deficient</option>
                    <option value="blind">Blind</option>
                  </select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Cataract</label>
                  <select 
                    name="eyeCataract" 
                    value={formData.eyeCataract} 
                    onChange={handleInputChange} 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Glaucoma</label>
                  <select 
                    name="eyeGlaucoma" 
                    value={formData.eyeGlaucoma} 
                    onChange={handleInputChange} 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
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
              <h4 className="font-semibold text-gray-700 text-base mb-5">🩸 Blood Test Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Hemoglobin (g/dL)</label>
                  <input 
                    name="hemoglobin" 
                    type="number" 
                    step="0.1" 
                    value={formData.hemoglobin} 
                    onChange={handleInputChange} 
                    placeholder="14" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">WBC (×10³/µL)</label>
                  <input 
                    name="whiteBloodCells" 
                    type="number" 
                    step="0.1" 
                    value={formData.whiteBloodCells} 
                    onChange={handleInputChange} 
                    placeholder="7.5" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Platelets (×10³/µL)</label>
                  <input 
                    name="platelets" 
                    type="number" 
                    value={formData.platelets} 
                    onChange={handleInputChange} 
                    placeholder="250" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Cholesterol (mg/dL)</label>
                  <input 
                    name="cholesterol" 
                    type="number" 
                    value={formData.cholesterol} 
                    onChange={handleInputChange} 
                    placeholder="180" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Triglycerides (mg/dL)</label>
                  <input 
                    name="triglycerides" 
                    type="number" 
                    value={formData.triglycerides} 
                    onChange={handleInputChange} 
                    placeholder="150" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">HbA1c (%)</label>
                  <input 
                    name="hba1c" 
                    type="number" 
                    step="0.1" 
                    value={formData.hba1c} 
                    onChange={handleInputChange} 
                    placeholder="5.7" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Clean */}
        <div className="flex items-center gap-4 pt-2">
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-indigo-600 text-white py-4 px-12 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 flex items-center gap-3 text-sm flex-1 justify-center shadow-sm hover:shadow-md"
          >
            {loading ? "Saving..." : <><Save size={18} /> Update Vitals</>}
          </button>
          {isModal && (
            <button 
              type="button" 
              onClick={onClose} 
              className="px-10 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-6 p-5 bg-red-50 text-red-600 rounded-xl text-sm font-medium border-2 border-red-100">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mt-6 p-5 bg-green-50 text-green-600 rounded-xl text-sm font-medium border-2 border-green-100">
            {successMsg}
          </div>
        )}

        {/* Recent History Preview */}
        {tests.length > 0 && (
          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Entries</h4>
            <div className="space-y-3 max-h-44 overflow-y-auto pr-2">
              {tests.slice().reverse().map((t, i) => (
                <div key={i} className="text-sm text-gray-700 flex justify-between items-center bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                  <span>{formatTest(t)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddTestForm;