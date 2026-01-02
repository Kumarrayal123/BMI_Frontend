import axios from 'axios';
import { Stethoscope } from 'lucide-react';
import { useState } from 'react';

const HealthForm = ({ onReportGenerated }) => {
    const [formData, setFormData] = useState({
        name: '', age: '', gender: 'male',
        weight: '', height: '',
        sugar: '', bpSystolic: '', bpDiastolic: '',
        rbs: '', temperature: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Assuming backend runs on 5000
            const response = await axios.post('https://bim-backend-4i12.onrender.com/api/patients', formData);
            onReportGenerated(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-700">
                <Stethoscope /> Patient Health Entry
            </h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Info */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" placeholder="Full Name" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input required type="number" name="age" value={formData.age} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" placeholder="Years" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                {/* Body Metrics */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input required type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                    <input required type="number" step="0.1" name="height" value={formData.height} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" />
                </div>

                {/* Vitals */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fasting Sugar (mg/dL)</label>
                    <input required type="number" name="sugar" value={formData.sugar} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">RBS (mg/dL)</label>
                    <input required type="number" name="rbs" value={formData.rbs} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <div className="col-span-2 text-sm font-semibold text-gray-600">Blood Pressure</div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Systolic</label>
                        <input required type="number" name="bpSystolic" placeholder="120" value={formData.bpSystolic} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Diastolic</label>
                        <input required type="number" name="bpDiastolic" placeholder="80" value={formData.bpDiastolic} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Temperature (°F)</label>
                    <input required type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 ring-indigo-500 outline-none" />
                </div>

                <button type="submit" disabled={loading} className="col-span-1 md:col-span-2 bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 font-bold transition shadow-lg mt-2">
                    {loading ? 'Analyzing...' : 'Generate Health Report'}
                </button>
            </form>
        </div>
    );
};

export default HealthForm;
