import axios from "axios";
import { Loader2, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState("user"); // 'user' | 'partner'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        mobile: "",
        address: "",
        clinicName: "", // Only for partner
    });

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // ✅ Adjust URL to your local backend
            const url = "https://attendancebackend-5cgn.onrender.com/api/auth/register";
            // NOTE: User requested this feature in BMI_Backend but Login.jsx implies remote backend.
            // I am pointing to the EXPECTED local endpoint if we were running cleanly.
            // However, if the user works on the deployed backend, I cannot push there.
            // Assuming localhost for now:
            const localUrl = "http://localhost:5000/api/auth/register";

            const payload = { ...formData, role };
            if (role !== "partner") delete payload.clinicName;

            await axios.post(localUrl, payload);
            navigate("/"); // Redirect to Login
            alert("Registration successful! Please login.");

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                        <UserPlus className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="mt-1 text-sm text-gray-500">Join as a Partner or User</p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setRole("user")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === "user" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Normal User
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("partner")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === "partner" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Partner
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            name="name"
                            required
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            name="email"
                            required
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            name="password"
                            required
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                            name="mobile"
                            required
                            type="tel"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="+91 9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            name="address"
                            required
                            rows="2"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="123 Main St, City"
                        />
                    </div>

                    {/* Conditional Input for Partner */}
                    {role === "partner" && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                            <input
                                name="clinicName"
                                required
                                type="text"
                                value={formData.clinicName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-indigo-200 bg-indigo-50/30 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Health Care Clinic"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to="/" className="text-indigo-600 font-semibold hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
