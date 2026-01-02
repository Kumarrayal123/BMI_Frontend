import axios from "axios";
import { Activity, Save } from "lucide-react";
import { useEffect, useState } from "react";

const AddTestForm = ({ patientId, onSuccess = () => { } }) => {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);

  // Unified Form State
  const [values, setValues] = useState({
    weight: "",
    height: "",
    sugar: "",
    sugarType: "Random", // Default sugar type
    systolic: "",
    diastolic: "",
    temperature: "",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all tests for history & Pre-fill
  const fetchTests = async () => {
    try {
      const res = await axios.get(
        `https://bim-backend-4i12.onrender.com/api/patients/${patientId}/tests`
      );
      const testHistory = res.data || [];
      setTests(testHistory);
    } catch (err) {
      console.log(err);
    }
  };

  const preFillLatestValues = (history) => {
    if (!history || history.length === 0) return;

    // Helper to find latest non-null value for a type
    const findLatest = (type) => {
      return [...history]
        .filter(t => t.type === type)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    };

    const latestWeight = findLatest("weight");
    const latestHeight = findLatest("height");
    const latestSugar = findLatest("sugar");
    const latestBP = findLatest("bp");

    setValues(prev => ({
      ...prev,
      weight: latestWeight ? latestWeight.value : "",
      height: latestHeight ? latestHeight.value : "",
      sugar: latestSugar ? latestSugar.value : "",
      sugarType: latestSugar?.sugarType || "Random",
      systolic: latestBP ? latestBP.value : "",
      diastolic: latestBP ? latestBP.value2 : "",
    }));
  };

  useEffect(() => {
    if (patientId) {
      // Fetch tests and pre-fill only on initial load
      const loadData = async () => {
        try {
          const res = await axios.get(
            `https://bim-backend-4i12.onrender.com/api/patients/${patientId}/tests`
          );
          const testHistory = res.data || [];
          setTests(testHistory);
          preFillLatestValues(testHistory);
        } catch (err) {
          console.log(err);
        }
      };
      loadData();
    }
  }, [patientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setValues({
      weight: "",
      height: "",
      sugar: "",
      sugarType: "Random",
      systolic: "",
      diastolic: "",
      temperature: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const requests = [];

    // 1. Check Weight
    if (values.weight) {
      requests.push(
        axios.post(`https://bim-backend-4i12.onrender.com/api/patients/${patientId}/test`, {
          type: "weight",
          value: parseFloat(values.weight),
        })
      );
    }

    // 2. Check Height
    if (values.height) {
      requests.push(
        axios.post(`https://bim-backend-4i12.onrender.com/api/patients/${patientId}/test`, {
          type: "height",
          value: parseFloat(values.height),
        })
      );
    }

    // 3. Check Sugar
    if (values.sugar) {
      requests.push(
        axios.post(`https://bim-backend-4i12.onrender.com/api/patients/${patientId}/test`, {
          type: "sugar",
          value: parseFloat(values.sugar),
          sugarType: values.sugarType,
        })
      );
    }

    // 4. Check BP
    if (values.systolic && values.diastolic) {
      requests.push(
        axios.post(`https://bim-backend-4i12.onrender.com/api/patients/${patientId}/test`, {
          type: "bp",
          value: parseInt(values.systolic),
          value2: parseInt(values.diastolic),
        })
      );
    }

    if (requests.length === 0) {
      setError("Please enter at least one value to save.");
      setLoading(false);
      return;
    }

    try {
      await Promise.all(requests);
      setSuccessMsg(`Successfully updated ${requests.length} record(s)!`);

      // Clear the form after successful submission
      clearForm();

      // Fetch updated tests to refresh history
      fetchTests();
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to save some records. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // Real-time BMI Calculation
  const calculateBMI = () => {
    if (!values.weight || !values.height) return null;
    const h = values.height / 100;
    const bmiValue = (values.weight / (h * h)).toFixed(1);

    let category = "";
    if (bmiValue < 18.5) category = "Underweight";
    else if (bmiValue < 25) category = "Healthy";
    else if (bmiValue < 30) category = "Overweight";
    else category = "Obese";

    return { value: bmiValue, category };
  };

  const bmiData = calculateBMI();

  const formatTest = (t) => {
    let date = new Date(t.date).toLocaleString();
    if (t.type === "bp")
      return `${date} — BP: ${t.value}/${t.value2}`;
    if (t.type === "sugar")
      return `${date} — Sugar: ${t.value}`;
    if (t.type === "weight") return `${date} — Weight: ${t.value} kg`;
    if (t.type === "height") return `${date} — Height: ${t.value} cm`;
    return `${date} — ${t.type.toUpperCase()}: ${t.value}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-indigo-500" /> Clinical Vitals
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Weight */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Weight (kg)</label>
            <input
              name="weight"
              type="number"
              step="0.1"
              value={values.weight}
              onChange={handleInputChange}
              placeholder="e.g. 70"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Height (cm)</label>
            <input
              name="height"
              type="number"
              step="0.1"
              value={values.height}
              onChange={handleInputChange}
              placeholder="e.g. 175"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition"
            />
          </div>

          {/* BMI Card (Calculated Real-time) */}
          {bmiData && (
            <div className={`md:col-span-2 lg:col-span-2 p-3 rounded-xl border flex items-center justify-between
                ${bmiData.category === 'Healthy' ? 'bg-green-50 border-green-100 text-green-700' :
                bmiData.category === 'Obese' || bmiData.category === 'Underweight' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
              <div>
                <span className="text-xs font-bold uppercase opacity-70">Current BMI</span>
                <div className="text-2xl font-bold">{bmiData.value}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{bmiData.category}</div>
                <div className="text-xs opacity-75">18.5 - 24.9 is Healthy</div>
              </div>
            </div>
          )}

          {/* Sugar */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Sugar (mg/dL)</label>
            <div className="flex gap-2">
              <input
                name="sugar"
                type="number"
                value={values.sugar}
                onChange={handleInputChange}
                placeholder="e.g. 90"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition"
              />
              <select
                name="sugarType"
                value={values.sugarType}
                onChange={handleInputChange}
                className="bg-gray-100 border-none rounded-xl text-xs font-medium px-2 outline-none text-gray-600"
              >
                <option value="Fasting">Fasting</option>
                <option value="Random">Random</option>
                <option value="PPBS">PPBS</option>
              </select>
            </div>
          </div>

          {/* BP */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">BP (Sys/Dia)</label>
            <div className="flex gap-2">
              <input
                name="systolic"
                type="number"
                value={values.systolic}
                onChange={handleInputChange}
                placeholder="120"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-center"
              />
              <span className="self-center text-gray-400">/</span>
              <input
                name="diastolic"
                type="number"
                value={values.diastolic}
                onChange={handleInputChange}
                placeholder="80"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition text-center"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-200"
          >
            {loading ? "Saving..." : <><Save size={20} /> Update Vitals</>}
          </button>
        </div>

        {/* Feedback Messages */}
        {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
        {successMsg && <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium">{successMsg}</div>}

        {/* Recent History Preview */}
        {tests.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Recent Entries</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {tests.slice().reverse().map((t, i) => (
                <div key={i} className="text-sm text-gray-600 flex justify-between bg-gray-50 p-2 rounded-lg">
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
