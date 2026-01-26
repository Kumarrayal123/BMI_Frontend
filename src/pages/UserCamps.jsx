import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { CampStatusBadge, getCampStatus, sortCampsByStatus } from "../utils/campStatus";

const UserCamps = () => {
    const [activeCamps, setActiveCamps] = useState([]);
    const [upcomingCamps, setUpcomingCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCamps();
    }, []);

    const fetchCamps = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/camps/allcamps`);
            const allCamps = sortCampsByStatus(response.data);
            processCamps(allCamps);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching camps:", err);
            setError("Failed to load camps.");
            setLoading(false);
        }
    };

    const [completedCamps, setCompletedCamps] = useState([]);

    const processCamps = (data) => {
        const active = [];
        const upcoming = [];
        const completed = [];

        data.forEach(camp => {
            const { status } = getCampStatus(camp.date, camp.time);
            if (status === 'live' || status === 'today') {
                active.push(camp);
            } else if (status === 'upcoming') {
                upcoming.push(camp);
            } else if (status === 'completed') {
                completed.push(camp);
            }
        });

        setActiveCamps(active);
        setUpcomingCamps(upcoming);
        setCompletedCamps(completed);
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

    const CampCard = ({ camp }) => (
        <div
            key={camp._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
        >
            {/* Header Gradient */}
            <div className="h-32 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 relative">
                <div className="absolute top-4 right-4">
                    <CampStatusBadge date={camp.date} time={camp.time} className="bg-white/20 border-white/30 text-white" />
                </div>
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
    );

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

                {/* Active Camps Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1.5 bg-green-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-800">Active Camps</h2>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Happening Today</span>
                    </div>

                    {activeCamps.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500">No active camps today.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {activeCamps.map(camp => <CampCard key={camp._id} camp={camp} />)}
                        </div>
                    )}
                </div>

                {/* Upcoming Camps Section */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-800">Upcoming Camps</h2>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Future Events</span>
                    </div>

                    {upcomingCamps.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500">No upcoming camps scheduled.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcomingCamps.map(camp => <CampCard key={camp._id} camp={camp} />)}
                        </div>
                    )}
                </div>

                {/* Completed Camps Section */}
                {completedCamps.length > 0 && (
                    <div className="mt-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-8 w-1.5 bg-gray-400 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-gray-800">Completed Camps</h2>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">Past Events</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {completedCamps.map(camp => <CampCard key={camp._id} camp={camp} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCamps;
