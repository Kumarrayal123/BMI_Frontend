import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, User, Briefcase, Calendar } from "lucide-react";

const OurVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axios.get(
          "https://attendancebackend-5cgn.onrender.com/api/employees/get-employees"
        );
        // Handle if response.data is the array or response.data.employees etc.
        // Based on typical express apis and the node output which showed a direct object interaction
        // likely the array is response.data or response.data.employees
        // We will assume response.data is the array based on "get-employees" endpoint naming convention often returning list directly or in .data
        // Let's safe check common patterns
        const data = Array.isArray(response.data) ? response.data : response.data.employees || response.data.data || [];

        // Filter only specific roles: Phlebotomist, Staff Nurse, Consultant
        const allowedRoles = ["Phlebotomist", "Staff Nurse", "Consultant"];
        const filteredData = data.filter((emp) => {
          const role = (emp.designation || emp.role || "").trim();
          return allowedRoles.some(allowed => allowed.toLowerCase() === role.toLowerCase());
        });

        setVolunteers(filteredData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching volunteers:", err);
        setError("Failed to load volunteers.");
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

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
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Our <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Volunteers</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the dedicated individuals working tirelessly to make a difference in our community.
          </p>
        </div>

        {volunteers.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">No volunteers found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {volunteers.map((volunteer) => (
              <div
                key={volunteer._id || Math.random()}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
              >
                <div className="h-24 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
                <div className="px-6 pb-6 -mt-12 flex-1 flex flex-col">
                  {/* Avatar / Image placeholder since likely no image URL in simple data, or use functional placeholder */}
                  <div className="relative mx-auto">
                    <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow-md">
                      {volunteer.profileImage || volunteer.image ? (
                        <img src={volunteer.profileImage || volunteer.image} alt={volunteer.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-gray-400">
                          {volunteer.name ? volunteer.name.charAt(0).toUpperCase() : "V"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-center flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {volunteer.name || "Unknown Name"}
                    </h3>
                    <p className="text-sm font-medium text-[#2563EB] mb-4">
                      {volunteer.designation || volunteer.role || "Volunteer"}
                    </p>

                    <div className="space-y-3 text-left">



                      {volunteer.joiningDate && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Joined: {new Date(volunteer.joiningDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OurVolunteers;