import axios from "axios";
import { Activity, FileDown, Calendar, User, Phone, MapPin, Ruler, Weight, Heart, Droplet, Thermometer, PlusCircle, X, Building2, Clock, Stethoscope, Eye, CheckCircle, AlertCircle, TrendingDown } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import AddTestForm from "../components/AddTestForm";
import { generateMedicalReport } from "../utils/pdfGenerator";
import config from "../config";

/* ================= HELPERS ================= */

const calculateBMI = (weight, heightCm) => {
  if (!weight || !heightCm) return null;
  const heightM = heightCm / 100;
  return +(weight / (heightM * heightM)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (!bmi) return "-";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

const extractLatestVitals = (tests = []) => {
  const result = {
    weight: null,
    height: null,
    sugar: null,
    systolic: null,
    diastolic: null,
    bmi: null,
    bmiCategory: null,
    date: null,
  };

  tests.forEach((t) => {
    result.date = t.date;
    if (t.type === "weight") result.weight = t.value;
    if (t.type === "height") result.height = t.value;
    if (t.type === "sugar") result.sugar = t.value;
    if (t.type === "bp") {
      result.systolic = t.value;
      result.diastolic = t.value2;
    }
    if (t.type === "bmi") {
      result.bmi = t.value;
      result.bmiCategory = t.category;
    }
  });

  return result;
};

const getTestIcon = (type) => {
  switch(type) {
    case 'bp': return <Heart size={18} className="text-red-500" />;
    case 'sugar': return <Droplet size={18} className="text-blue-500" />;
    case 'weight': return <Weight size={18} className="text-purple-500" />;
    case 'height': return <Ruler size={18} className="text-green-500" />;
    case 'temperature': return <Thermometer size={18} className="text-orange-500" />;
    case 'heart_rate': return <Heart size={18} className="text-pink-500" />;
    case 'oxygen': return <Droplet size={18} className="text-cyan-500" />;
    case 'eye_exam': return <Eye size={18} className="text-indigo-500" />;
    case 'general_checkup': return <Stethoscope size={18} className="text-teal-500" />;
    case 'blood_test': return <Droplet size={18} className="text-red-600" />;
    case 'full_body_checkup': return <Activity size={18} className="text-purple-600" />;
    default: return <Activity size={18} className="text-indigo-500" />;
  }
};

const getTestDisplay = (test) => {
  switch(test.type) {
    case 'bp': return `${test.value || "-"}/${test.value2 || "-"} mmHg`;
    case 'sugar': return `${test.value || "-"} ${test.sugarType || 'Random'} mg/dL`;
    case 'weight': return `${test.value || "-"} kg`;
    case 'height': return `${test.value || "-"} cm`;
    case 'temperature': return `${test.value || "-"} °F`;
    case 'heart_rate': return `${test.value || "-"} bpm`;
    case 'oxygen': return `${test.value || "-"} %`;
    case 'eye_exam': return `Vision: ${test.eyeVisionLeft || "-"}/${test.eyeVisionRight || "-"}`;
    case 'general_checkup': return `Checkup Complete`;
    case 'blood_test': return `Hb: ${test.hemoglobin || "-"} g/dL`;
    case 'full_body_checkup': return `Full Checkup`;
    default: return `${test.value || "-"} ${test.unit || ''}`;
  }
};

/* ================= COMPONENT ================= */

const PatientDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [campDetails, setCampDetails] = useState(null);

  const [vitals, setVitals] = useState({
    weight: "",
    height: "",
    sugar: "",
    systolic: "",
    diastolic: "80"
  });
  const [vitalsLoading, setVitalsLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setVitals({
        weight: patient.vitals?.weight || "",
        height: patient.vitals?.height || "",
        sugar: patient.vitals?.sugar || "",
        systolic: patient.vitals?.bpSys || "",
        diastolic: patient.vitals?.bpDia || "80"
      });
    }
  }, [patient]);

  useEffect(() => {
    if (location.state?.openAddTest) {
      setShowAddTestModal(true);
      // Clear state so it doesn't open again on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchPatient = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/patients/${id}`);
      setPatient(res.data);
      
      if (res.data.campId) {
        try {
          const campRes = await axios.get(`${config.API_BASE_URL}/camps/${res.data.campId}`);
          setCampDetails(campRes.data);
        } catch (err) {
          console.log("Error fetching camp details:", err);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVitals = async () => {
    setVitalsLoading(true);
    try {
      const testPromises = [];

      const sendVitalTest = async (type, value, value2 = null, sugarType = "Random") => {
        const payload = {
          type,
          value: parseFloat(value),
          date: new Date()
        };
        if (type === "bp") {
          payload.value2 = parseFloat(value2);
        }
        if (type === "sugar") {
          payload.sugarType = sugarType;
        }
        await axios.post(`${config.API_BASE_URL}/patients/${id}/tests`, payload);
      };

      if (vitals.weight) {
        testPromises.push(sendVitalTest("weight", vitals.weight));
      }
      if (vitals.height) {
        testPromises.push(sendVitalTest("height", vitals.height));
      }
      if (vitals.sugar) {
        testPromises.push(sendVitalTest("sugar", vitals.sugar));
      }
      if (vitals.systolic && vitals.diastolic) {
        testPromises.push(sendVitalTest("bp", vitals.systolic, vitals.diastolic));
      }

      if (testPromises.length === 0) {
        alert("Please fill at least one vital parameter");
        setVitalsLoading(false);
        return;
      }

      await Promise.all(testPromises);
      alert("✅ Vitals updated successfully!");
      fetchPatient(); // Reload patient data
    } catch (err) {
      console.error(err);
      alert("Error updating vitals: " + (err.response?.data?.error || err.message));
    } finally {
      setVitalsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const latestTests = useMemo(() => {
    if (!patient?.tests) return [];
    return [...patient.tests].reverse();
  }, [patient?.tests]);

  const generatePDF = () => {
    if (!patient?.tests?.length) {
      alert("No test data available");
      return;
    }

    const test = extractLatestVitals(patient.tests);
    const bmiValue = test.bmi ?? calculateBMI(test.weight, test.height);
    const bmiCategory = test.bmiCategory ?? getBMICategory(bmiValue);

    const patientData = {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      id: patient._id?.slice(-6).toUpperCase(),
      date: new Date(test.date).toLocaleDateString(),
      phone: patient.contact,
      address: patient.address,
      campName: campDetails?.name || patient.campName || "N/A",
      campLocation: campDetails?.location || patient.campLocation || "N/A",
    };

    const testsData = {
      weight: test.weight,
      height: test.height,
      sugar: test.sugar,
      sugarType: "Random",
      systolic: test.systolic,
      diastolic: test.diastolic,
      heartRate: "-",
    };

    const bmiData = {
      bmi: bmiValue,
      category: bmiCategory,
    };

    try {
      generateMedicalReport(patientData, testsData, bmiData);
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading patient details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* ============================================ */}
        {/* PATIENT HEADER - Clean Design */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <User size={16} className="text-gray-400" />
                  {patient.age} yrs
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity size={16} className="text-gray-400" />
                  {patient.gender || "N/A"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={16} className="text-gray-400" />
                  {patient.contact}
                </span>
                {patient.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-gray-400" />
                    {patient.address}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddTestModal(true)} 
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm text-sm font-medium"
              >
                <PlusCircle size={18} />
                Add More Test
              </button>
              <button 
                onClick={generatePDF} 
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
              >
                <FileDown size={18} />
                Download Report
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CAMP DETAILS - Clean Card */}
        {/* ============================================ */}
        {(campDetails || patient.campId) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">Camp:</span>
                <span className="text-gray-900 font-medium">{campDetails?.name || patient.campName || "N/A"}</span>
              </div>
              {campDetails?.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600">{campDetails.location}</span>
                </div>
              )}
              {campDetails?.date && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600">{new Date(campDetails.date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-400 text-xs">Registered: {new Date(patient.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* CLINICAL VITALS - Clean Form */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Clinical Vitals</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Weight */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Weight size={14} className="text-gray-400" /> Weight (kg)
              </label>
              <input 
                type="number" 
                step="0.1" 
                name="weight"
                value={vitals.weight}
                onChange={handleVitalChange}
                placeholder="e.g. 70" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-indigo-500 outline-none transition text-sm"
              />
            </div>
            
            {/* Height */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Ruler size={14} className="text-gray-400" /> Height (cm)
              </label>
              <input 
                type="number" 
                step="0.1" 
                name="height"
                value={vitals.height}
                onChange={handleVitalChange}
                placeholder="e.g. 175" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-indigo-500 outline-none transition text-sm"
              />
            </div>
            
            {/* Sugar */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Droplet size={14} className="text-gray-400" /> Sugar (mg/dL)
              </label>
              <input 
                type="number" 
                name="sugar"
                value={vitals.sugar}
                onChange={handleVitalChange}
                placeholder="e.g. 90" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-indigo-500 outline-none transition text-sm"
              />
            </div>
            
            {/* BP */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Heart size={14} className="text-gray-400" /> BP (Sys/Dia)
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  name="systolic"
                  value={vitals.systolic}
                  onChange={handleVitalChange}
                  placeholder="Sys" 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-indigo-500 outline-none transition text-sm text-center"
                />
                <span className="self-center text-gray-400">/</span>
                <input 
                  type="number" 
                  name="diastolic"
                  value={vitals.diastolic}
                  onChange={handleVitalChange}
                  placeholder="Dia" 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-indigo-500 outline-none transition text-sm text-center"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleUpdateVitals}
            disabled={vitalsLoading}
            className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Activity size={18} />
            {vitalsLoading ? "Updating..." : "Update Vitals"}
          </button>
        </div>

        {/* ============================================ */}
        {/* MEDICAL HISTORY */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Medical History</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {latestTests.length} Records
            </span>
          </div>

          {latestTests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {latestTests.map((test, index) => {
                    const isLatest = index === 0;
                    return (
                      <tr key={test._id} className={`hover:bg-gray-50/50 transition-colors ${isLatest ? 'bg-indigo-50/20' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <div>
                              <span className="text-sm text-gray-700">
                                {new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">
                                {new Date(test.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {isLatest && (
                              <span className="ml-2 text-[10px] font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                Latest
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getTestIcon(test.type)}
                            <span className="text-sm text-gray-800 capitalize">
                              {test.type === 'eye_exam' ? 'Eye Exam' :
                               test.type === 'general_checkup' ? 'General Checkup' :
                               test.type === 'blood_test' ? 'Blood Test' :
                               test.type === 'full_body_checkup' ? 'Full Body' :
                               test.type === 'heart_rate' ? 'Heart Rate' :
                               test.type === 'oxygen' ? 'Oxygen' :
                               test.type === 'temperature' ? 'Temp' :
                               test.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{getTestDisplay(test)}</span>
                        </td>
                        <td className="px-6 py-4">
                          {test.type === 'bp' && test.value && test.value2 ? (
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              test.value > 140 || test.value2 > 90 ? 'bg-red-100 text-red-700' :
                              test.value > 120 || test.value2 > 80 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {test.value > 140 || test.value2 > 90 ? 'High' : 
                               test.value > 120 || test.value2 > 80 ? 'Elevated' : 'Normal'}
                            </span>
                          ) : test.type === 'sugar' && test.value ? (
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              test.value > 200 ? 'bg-red-100 text-red-700' :
                              test.value > 140 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {test.value > 200 ? 'High' : test.value > 140 ? 'Borderline' : 'Normal'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <Activity size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No medical records found</p>
              <p className="text-sm text-gray-300 mt-1">Add a test to start tracking health data</p>
              <button 
                onClick={() => setShowAddTestModal(true)} 
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-2 mx-auto"
              >
                <PlusCircle size={16} />
                Add First Test
              </button>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* ADD TEST MODAL */}
        {/* ============================================ */}
        {showAddTestModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setShowAddTestModal(false); }}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
              <AddTestForm patientId={patient._id} onSuccess={() => { fetchPatient(); }} isModal={true} onClose={() => setShowAddTestModal(false)} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientDetails;