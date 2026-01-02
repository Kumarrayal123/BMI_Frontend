import axios from "axios";
import { Send, User, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const JoinUs = () => {
    const location = useLocation();
    const campData = location.state; // Get camp data from navigation

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        location: "",
        type: campData ? "camp" : "volunteer", // Set to camp if coming from camps page
        message: "",
        campName: campData?.campName || "",
    });

    // Pre-fill message when camp data is available
    useEffect(() => {
        if (campData) {
            setFormData(prev => ({
                ...prev,
                message: `I want to participate in ${campData.campName} at ${campData.campLocation}`,
                campName: campData.campName
            }));
        }
    }, [campData]);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get logged in user ID if available
            const userData = JSON.parse(localStorage.getItem("userData") || "{}");
            const userId = userData.id || null;

            const payload = { ...formData, userId };

            await axios.post("http://localhost:5000/api/applications", payload);

            alert("Application submitted successfully! We will contact you soon.");
            setFormData({ name: "", mobile: "", location: "", type: "volunteer", message: "" });
        } catch (err) {
            console.error(err);
            alert("Failed to submit application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <UserPlus className="text-cyan-300" size={32} />
                    Join Our Mission
                </h1>
                <p className="text-indigo-100 mt-2">
                    Apply to Organize a Camp or Volunteer with us.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                required
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#007A52] outline-none"
                                placeholder="+91 98765 43210"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#007A52] outline-none"
                                placeholder="City, State"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            I want to...
                        </label>
                        <select
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none bg-white"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >

                            <option value="camp">Participate in  Medical Camp</option>
                            <option value="volunteer">Become a Volunteer</option>
                            <option value="camp">Organize a Medical Camp</option>
                        </select>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message / Details (Optional)
                        </label>
                        <textarea 
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none h-32 resize-none"
                            placeholder="Tell us more about your interest..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? "Submitting..." : (
                            <>
                                <Send size={18} /> Submit Application
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinUs;
