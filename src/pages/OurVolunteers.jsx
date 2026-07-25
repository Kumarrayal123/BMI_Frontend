import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, Calendar, Shield, Building, Users, Plus, X, UserCheck, Filter } from "lucide-react";
import config from "../config";

const OurVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('admin');
  const [partnerId, setPartnerId] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'admin', 'partner'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    joiningDate: ""
  });
  const [apiStats, setApiStats] = useState({
    adminCount: 0,
    partnerCount: 0,
    totalCount: 0
  });

  useEffect(() => {
    const fetchUserAndVolunteers = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log("🔍 Current User:", user);
        
        const role = user.role || 'admin';
        const pId = user.partnerId || user._id || null;
        const pName = user.partnerName || user.name || '';

        setUserRole(role);
        setPartnerId(pId);
        setPartnerName(pName);

        await fetchVolunteers(role, pId);
      } catch (err) {
        console.error("❌ Error:", err);
        setError("Failed to load data.");
        setLoading(false);
      }
    };

    fetchUserAndVolunteers();
  }, []);

  const fetchVolunteers = async (role, pId) => {
    setLoading(true);
    try {
      console.log("🔄 Fetching volunteers from both APIs...");
      
      let allVolunteers = [];
      let adminCount = 0;
      let partnerCount = 0;

      // ✅ API 1: Fetch Admin Employees
      try {
        console.log("📡 Fetching admin employees...");
        const adminResponse = await axios.get(
          `${config.API_BASE_URL}/proxy/employees/get-employees`
        );
        
        const adminData = Array.isArray(adminResponse.data) ? adminResponse.data : 
                        adminResponse.data.employees || adminResponse.data.data || [];

        const allowedRoles = ["Phlebotomist", "Staff Nurse", "Consultant"];
        const adminVolunteers = adminData
          .filter((emp) => {
            const role = (emp.designation || emp.role || "").trim();
            return allowedRoles.some(allowed => allowed.toLowerCase() === role.toLowerCase());
          })
          .map(v => ({ 
            ...v, 
            source: 'admin',
            _id: v._id || v.id || `admin_${Math.random()}`
          }));

        adminCount = adminVolunteers.length;
        allVolunteers = [...allVolunteers, ...adminVolunteers];
        console.log(`✅ Admin volunteers: ${adminCount}`);
      } catch (err) {
        console.error("❌ Error fetching admin employees:", err);
      }

      // ✅ API 2: Fetch All Volunteers (Partner volunteers)
      try {
        console.log("📡 Fetching partner volunteers...");
        const partnerResponse = await axios.get(
          `${config.API_BASE_URL}/volunteers/all-volunteers`
        );
        
        console.log("📦 Partner API Response:", partnerResponse.data);
        
        let partnerData = [];
        if (Array.isArray(partnerResponse.data)) {
          partnerData = partnerResponse.data;
        } else if (partnerResponse.data.volunteers) {
          partnerData = partnerResponse.data.volunteers;
        } else if (partnerResponse.data.data) {
          partnerData = partnerResponse.data.data;
        } else {
          partnerData = [];
        }

        const partnerVolunteers = partnerData.map(v => ({
          ...v,
          source: 'partner',
          _id: v._id || v.id || `partner_${Math.random()}`
        }));

        partnerCount = partnerVolunteers.length;
        allVolunteers = [...allVolunteers, ...partnerVolunteers];
        console.log(`✅ Partner volunteers: ${partnerCount}`);
      } catch (err) {
        console.error("❌ Error fetching partner volunteers:", err);
      }

      // If user is partner, filter only their volunteers
      let finalVolunteers = allVolunteers;
      if (role === 'partner' && pId) {
        console.log(`🔍 Filtering for partner: ${pId}`);
        finalVolunteers = allVolunteers.filter(v => {
          return v.assignedPartner === pId || 
                 v.createdBy === pId ||
                 v.partnerId === pId ||
                 (v.createdByRole === 'partner' && v.createdBy === pId) ||
                 (v.source === 'partner' && v.assignedPartner === pId);
        });
        console.log(`✅ Filtered partner volunteers: ${finalVolunteers.length}`);
      }

      setApiStats({
        adminCount: role === 'partner' ? 0 : adminCount,
        partnerCount: role === 'partner' ? finalVolunteers.length : partnerCount,
        totalCount: finalVolunteers.length
      });

      setVolunteers(finalVolunteers);
      setFilteredVolunteers(finalVolunteers);
      setActiveFilter('all');
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching volunteers:", err);
      setError(`Failed to load volunteers: ${err.message}`);
      setLoading(false);
    }
  };

  // Filter volunteers based on active filter
  const filterVolunteers = (filterType) => {
    setActiveFilter(filterType);
    
    if (filterType === 'all') {
      setFilteredVolunteers(volunteers);
    } else if (filterType === 'admin') {
      const adminList = volunteers.filter(v => 
        v.source === 'admin' || 
        v.createdByRole !== 'partner'
      );
      setFilteredVolunteers(adminList);
    } else if (filterType === 'partner') {
      const partnerList = volunteers.filter(v => 
        v.source === 'partner' || 
        v.createdByRole === 'partner' ||
        v.assignedPartner ||
        v.partnerId
      );
      setFilteredVolunteers(partnerList);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partnerId) {
      alert("Partner ID not found.");
      return;
    }

    try {
      await axios.post(
        `${config.API_BASE_URL}/volunteers/create-by-partner/${partnerId}`,
        formData
      );
      
      await fetchVolunteers(userRole, partnerId);
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        designation: "",
        joiningDate: ""
      });
      setShowForm(false);
      alert("Volunteer added successfully!");
    } catch (err) {
      console.error("❌ Error:", err);
      alert(`Failed to add volunteer: ${err.response?.data?.message || err.message}`);
    }
  };

  const getDisplayValue = (value) => {
    if (!value) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value.name || value._id || JSON.stringify(value);
    }
    return String(value);
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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-2xl w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              {userRole === 'partner' ? 'My ' : 'Our '}
              <span className={`bg-gradient-to-r ${
                userRole === 'partner' 
                  ? 'from-green-600 to-teal-600' 
                  : 'from-indigo-600 to-blue-600'
              } bg-clip-text text-transparent`}>
                Volunteers
              </span>
            </h1>
            <p className="mt-2 text-lg text-gray-600 max-w-2xl">
              {userRole === 'partner' 
                ? `${partnerName || 'Your organization'}'s dedicated volunteers`
                : 'Meet the dedicated individuals working tirelessly to make a difference in our community.'}
            </p>
          </div>

          {userRole === 'partner' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              {showForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
              {showForm ? 'Cancel' : 'Add Volunteer'}
            </button>
          )}
        </div>

        {/* Filter Tabs - Clickable Stats */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {/* All Volunteers Tab */}
            <button
              onClick={() => filterVolunteers('all')}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:shadow-md border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-semibold">All Volunteers</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
              }`}>
                {apiStats.totalCount}
              </span>
            </button>

            {/* Admin Tab */}
            <button
              onClick={() => filterVolunteers('admin')}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeFilter === 'admin'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:shadow-md border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Admin</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeFilter === 'admin' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {apiStats.adminCount}
              </span>
            </button>

            {/* Partner Tab */}
            <button
              onClick={() => filterVolunteers('partner')}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeFilter === 'partner'
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:shadow-md border-2 border-gray-200 hover:border-green-300'
              }`}
            >
              <Building className="h-5 w-5" />
              <span className="font-semibold">Partner</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeFilter === 'partner' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-600'
              }`}>
                {apiStats.partnerCount}
              </span>
            </button>

            {/* Active Filter Indicator */}
            <div className="ml-auto flex items-center text-sm text-gray-500">
              <Filter className="h-4 w-4 mr-1" />
              <span>
                Showing: <span className="font-semibold text-gray-700">
                  {activeFilter === 'all' ? 'All' : activeFilter === 'admin' ? 'Admin' : 'Partner'}
                </span>
                <span className="ml-1 text-gray-400">
                  ({filteredVolunteers.length} volunteers)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        {userRole === 'partner' && showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Volunteer</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter designation"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Volunteer
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Volunteers Grid */}
        {filteredVolunteers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Volunteers Found</h3>
            <p className="text-gray-500 mt-2">
              {activeFilter === 'all' 
                ? 'No volunteers registered yet.' 
                : activeFilter === 'admin' 
                  ? 'No admin volunteers found.' 
                  : 'No partner volunteers found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVolunteers.map((volunteer) => {
              const isPartnerVolunteer = volunteer.source === 'partner' || 
                                        volunteer.createdByRole === 'partner' ||
                                        volunteer.assignedPartner ||
                                        volunteer.partnerId;
              
              return (
                <div
                  key={volunteer._id || volunteer.id || Math.random()}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border flex flex-col ${
                    isPartnerVolunteer 
                      ? 'border-green-200 hover:border-green-400 hover:scale-[1.02]' 
                      : 'border-blue-200 hover:border-blue-400 hover:scale-[1.02]'
                  }`}
                >
                  <div className={`h-20 ${
                    isPartnerVolunteer 
                      ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500' 
                      : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500'
                  }`}>
                    <div className="flex justify-end p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isPartnerVolunteer ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isPartnerVolunteer ? (
                          <>
                            <Building className="h-3 w-3 mr-1" />
                            Partner
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="px-5 pb-5 -mt-10 flex-1 flex flex-col">
                    <div className="relative mx-auto">
                      <div className={`h-20 w-20 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                        isPartnerVolunteer ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        <span className="text-2xl font-bold text-gray-600">
                          {volunteer.name ? volunteer.name.charAt(0).toUpperCase() : "V"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-center flex-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {volunteer.name || "Unknown Name"}
                      </h3>
                      <p className="text-sm font-medium text-[#2563EB] mb-2">
                        {volunteer.designation || volunteer.role || "Volunteer"}
                      </p>

                      {isPartnerVolunteer && (
                        <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                          <Building className="h-3 w-3 mr-1" />
                          <span className="truncate">Partner: {getDisplayValue(volunteer.partnerName || volunteer.assignedPartner || volunteer.createdBy)}</span>
                        </div>
                      )}

                      <div className="space-y-2 text-left mt-2 border-t pt-2">
                        {volunteer.email && (
                          <div className="flex items-center text-gray-600 text-xs">
                            <Mail className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{volunteer.email}</span>
                          </div>
                        )}
                        {volunteer.phone && (
                          <div className="flex items-center text-gray-600 text-xs">
                            <Phone className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                            <span>{volunteer.phone}</span>
                          </div>
                        )}
                        {volunteer.joiningDate && (
                          <div className="flex items-center text-gray-600 text-xs">
                            <Calendar className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                            <span>Joined: {new Date(volunteer.joiningDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OurVolunteers;