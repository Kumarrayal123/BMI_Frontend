// pages/PartnerVolunteers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Mail, Phone, Calendar, Building, Users, Plus, X, 
  UserCheck, Search, Filter, Edit, Trash2, Eye,
  User, Briefcase, Clock, ChevronRight, Download,
  Printer, RefreshCw, AlertCircle, Key
} from "lucide-react";
import config from "../config";

const PartnerVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partnerData, setPartnerData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    designation: "",
    joiningDate: "",
    address: "",
    gender: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        let user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log("🔍 User Data from localStorage:", user);
        
        let pId = user.partnerId || user._id || null;
        
        if (!pId) {
          const role = localStorage.getItem('role');
          const userId = localStorage.getItem('userId');
          if (role === 'partner' && userId) {
            pId = userId;
          }
        }
        
        if (!pId) {
          try {
            const sessionResponse = await axios.get(`${config.API_BASE_URL}/auth/session`);
            if (sessionResponse.data && sessionResponse.data.user) {
              const sessionUser = sessionResponse.data.user;
              pId = sessionUser.partnerId || sessionUser._id;
              localStorage.setItem('user', JSON.stringify({
                ...user,
                partnerId: pId,
                role: sessionUser.role || 'partner'
              }));
            }
          } catch (err) {
            console.log("Session fetch failed:", err);
          }
        }
        
        console.log("🆔 Final Partner ID:", pId);
        
        if (!pId) {
          setError("Partner ID not found. Please login again.");
          setLoading(false);
          return;
        }

        setPartnerData({
          id: pId,
          name: user.partnerName || user.name || "Your Organization",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || 'partner'
        });

        await fetchVolunteers(pId);
      } catch (err) {
        console.error("❌ Error:", err);
        setError("Failed to load partner data.");
        setLoading(false);
      }
    };

    fetchPartnerData();
  }, []);

  const fetchVolunteers = async (pId) => {
    setLoading(true);
    try {
      console.log("🔄 Fetching partner volunteers for ID:", pId);
      
      let volunteersData = [];
      
      const apis = [
        `${config.API_BASE_URL}/volunteers/partner-volunteers/${pId}`,
        `${config.API_BASE_URL}/volunteers/all-volunteers`,
        `${config.API_BASE_URL}/proxy/employees/get-employees`
      ];
      
      for (const apiUrl of apis) {
        try {
          console.log(`📡 Trying API: ${apiUrl}`);
          const response = await axios.get(apiUrl);
          console.log(`✅ Response from ${apiUrl}:`, response.data);
          
          let data = [];
          if (Array.isArray(response.data)) {
            data = response.data;
          } else if (response.data.volunteers) {
            data = response.data.volunteers;
          } else if (response.data.data) {
            data = response.data.data;
          } else if (response.data.employees) {
            data = response.data.employees;
          }
          
          if (apiUrl.includes('partner-volunteers')) {
            volunteersData = data;
            break;
          }
          
          if (data.length > 0 && volunteersData.length === 0) {
            volunteersData = data.filter(v => 
              v.assignedPartner === pId || 
              v.createdBy === pId ||
              v.partnerId === pId ||
              (v.createdByRole === 'partner' && v.createdBy === pId)
            );
            if (volunteersData.length > 0) break;
          }
        } catch (err) {
          console.log(`⚠️ API ${apiUrl} failed:`, err.message);
          continue;
        }
      }

      console.log("✅ Final volunteers data:", volunteersData);

      const formattedData = volunteersData.map(v => ({
        ...v,
        source: 'partner',
        _id: v._id || v.id || `partner_${Math.random()}`
      }));

      setVolunteers(formattedData);
      setFilteredVolunteers(formattedData);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching volunteers:", err);
      setError("Failed to load volunteers.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVolunteers(volunteers);
    } else {
      const search = searchTerm.toLowerCase().trim();
      const filtered = volunteers.filter(v => 
        v.name?.toLowerCase().includes(search) ||
        v.email?.toLowerCase().includes(search) ||
        v.phone?.includes(search) ||
        v.designation?.toLowerCase().includes(search)
      );
      setFilteredVolunteers(filtered);
    }
  }, [searchTerm, volunteers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partnerData?.id) {
      alert("Partner ID not found.");
      return;
    }

    try {
      const submitData = { ...formData };
      
      if (editingId) {
        if (!submitData.password) {
          delete submitData.password;
        }
        await axios.put(
          `${config.API_BASE_URL}/volunteers/update-volunteer/${partnerData.id}/${editingId}`,
          submitData
        );
        alert("Volunteer updated successfully!");
      } else {
        if (!submitData.password) {
          alert("Password is required!");
          return;
        }
        await axios.post(
          `${config.API_BASE_URL}/volunteers/create-by-partner/${partnerData.id}`,
          submitData
        );
        alert("Volunteer added successfully!");
      }
      
      await fetchVolunteers(partnerData.id);
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        designation: "",
        joiningDate: "",
        address: "",
        gender: ""
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("❌ Error:", err);
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEdit = (volunteer) => {
    setEditingId(volunteer._id);
    setFormData({
      name: volunteer.name || "",
      email: volunteer.email || "",
      phone: volunteer.phone || "",
      password: "",
      designation: volunteer.designation || "",
      joiningDate: volunteer.joiningDate?.split('T')[0] || "",
      address: volunteer.address || "",
      gender: volunteer.gender || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this volunteer?")) return;
    
    try {
      await axios.delete(`${config.API_BASE_URL}/volunteers/delete-volunteer/${partnerData.id}/${id}`);
      alert("Volunteer deleted successfully!");
      await fetchVolunteers(partnerData.id);
    } catch (err) {
      console.error("❌ Error:", err);
      alert(`Failed to delete: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleViewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDetails(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2563EB] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your volunteers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left">
            <p className="text-xs text-gray-500">💡 Debug Info:</p>
            <pre className="text-xs text-gray-600 mt-1 overflow-auto max-h-32">
              {JSON.stringify({
                localStorage: localStorage.getItem('user'),
                role: localStorage.getItem('role'),
                userId: localStorage.getItem('userId')
              }, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                My <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Volunteers</span>
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Building className="h-5 w-5 text-green-600" />
                <span className="text-gray-600 font-medium">{partnerData?.name || 'Your Organization'}</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">
                  <Users className="h-4 w-4 inline mr-1" />
                  {volunteers.length} volunteers
                </span>
                {partnerData?.role && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {partnerData.role}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    designation: "",
                    joiningDate: "",
                    address: "",
                    gender: ""
                  });
                  setEditingId(null);
                  setShowForm(!showForm);
                }}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                {showForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                {showForm ? 'Cancel' : 'Add Volunteer'}
              </button>
              <button
                onClick={() => fetchVolunteers(partnerData?.id)}
                className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search volunteers by name, email, phone or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Form with Password Field */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Volunteer' : 'Add New Volunteer'}
            </h2>
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
              
              {/* ✅ PASSWORD FIELD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {!editingId && '*'}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    required={!editingId}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={editingId ? 'Leave blank to keep current' : 'Enter password'}
                  />
                </div>
                {editingId && (
                  <p className="text-xs text-gray-400 mt-1">Leave blank to keep current password</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter address"
                />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingId ? 'Update Volunteer' : 'Save Volunteer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
            {searchTerm ? (
              <>
                <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600">No Results Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 text-green-600 hover:text-green-700"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600">No Volunteers Yet</h3>
                <p className="text-gray-500 mt-2">Click "Add Volunteer" to get started.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVolunteers.map((volunteer) => (
              <div
                key={volunteer._id || volunteer.id || Math.random()}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 hover:border-green-300 group"
              >
                <div className="h-20 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleViewDetails(volunteer)}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(volunteer)}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(volunteer._id)}
                      className="p-1.5 bg-white/20 hover:bg-red-500/50 rounded-lg text-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="px-5 pb-5 -mt-10">
                  <div className="relative mx-auto">
                    <div className="h-20 w-20 rounded-full border-4 border-white shadow-md bg-green-100 flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-green-600">
                        {volunteer.name ? volunteer.name.charAt(0).toUpperCase() : "V"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {volunteer.name || "Unknown Name"}
                    </h3>
                    <p className="text-sm font-medium text-green-600">
                      {volunteer.designation || volunteer.role || "Volunteer"}
                    </p>
                    
                    <div className="mt-2 space-y-1.5 text-left text-sm">
                      {volunteer.email && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{volunteer.email}</span>
                        </div>
                      )}
                      {volunteer.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                          <span>{volunteer.phone}</span>
                        </div>
                      )}
                      {volunteer.joiningDate && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                          <span>Joined: {formatDate(volunteer.joiningDate)}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewDetails(volunteer)}
                      className="mt-3 w-full py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-md transition-all duration-300 text-sm font-medium"
                    >
                      View Profile
                      <ChevronRight className="h-4 w-4 inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Volunteer Details Modal */}
        {showDetails && selectedVolunteer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Volunteer Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">
                      {selectedVolunteer.name?.charAt(0).toUpperCase() || "V"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedVolunteer.name || "Unknown"}</h3>
                    <p className="text-green-600 font-medium">{selectedVolunteer.designation || "Volunteer"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedVolunteer.email || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{selectedVolunteer.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium">{selectedVolunteer.gender || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Joining Date</p>
                    <p className="text-sm font-medium">{formatDate(selectedVolunteer.joiningDate)}</p>
                  </div>
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium">{selectedVolunteer.address || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-sm font-medium">{formatDate(selectedVolunteer.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleEdit(selectedVolunteer);
                    }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 inline mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleDelete(selectedVolunteer._id);
                    }}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 inline mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerVolunteers;