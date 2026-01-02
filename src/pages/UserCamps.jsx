import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserCamps = () => {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCamps();
    }, []);

    const fetchCamps = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/camps/allcamps");
            setCamps(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching camps:", err);
            setError("Failed to load camps.");
            setLoading(false);
        }
    };

    const handleParticipate = (camp) => {
        navigate("/join-us", {
            state: {
                campName: camp.name,
                campLocation: camp.location,
                campId: camp._id
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2563EB]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 text-red-600 text-xl font-semibold">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-2 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Medical <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Camps</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Join our upcoming health camps and get free health checkups in your area.
                    </p>
                </div>

                {/* Camps Grid */}
                {camps.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-700">No Camps Available</h3>
                            <p className="text-gray-500 mt-2">New camps will be announced soon. Check back later!</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {camps.map((camp) => (
                            <div
                                key={camp._id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
                            >
                                {/* Header Gradient */}
                                <div className="h-32 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 relative">
                                    <div className="absolute bottom-4 left-6">
                                        <h3 className="text-2xl font-bold text-white">{camp.name}</h3>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-4 flex-1">
                                        {/* Location */}
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{camp.location}</p>
                                                {camp.address && (
                                                    <p className="text-sm text-gray-600 mt-1">{camp.address}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Date */}
                                        {camp.date && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-[#2563EB]" />
                                                <p className="text-gray-700">{camp.date}</p>
                                            </div>
                                        )}

                                        {/* Time */}
                                        {camp.time && (
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-[#2563EB]" />
                                                <p className="text-gray-700">{camp.time}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Participate Button */}
                                    <button
                                        onClick={() => handleParticipate(camp)}
                                        className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        <Users size={20} />
                                        Participate in Camp
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCamps;
