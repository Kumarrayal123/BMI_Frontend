import React, { useState, useEffect } from "react";
import { X, Mail, Phone, MapPin, Building, Lock, User, UserCheck, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import config from "../config";

const ProfileModal = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const role = localStorage.getItem("role") || "user";
  const token = localStorage.getItem("token") || "";

  // Get ID based on role
  const getUserId = () => {
    if (role === "admin") {
      const data = JSON.parse(localStorage.getItem("adminData") || "{}");
      return data._id || data.id;
    } else if (role === "employee") {
      return localStorage.getItem("employeeId");
    } else if (role === "partner") {
      return localStorage.getItem("userId");
    } else if (role === "volunteer") {
      return localStorage.getItem("userId");
    } else {
      return localStorage.getItem("userId");
    }
  };

  const userId = getUserId();

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setIsEditing(true);
    setPassword("");
    setConfirmPassword("");

    try {
      const url = `${config.API_BASE_URL}/auth/profile/${userId}?role=${role}`;
      console.log("Fetching profile from:", url);
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch profile");
      }

      const data = result.data;
      setProfileData(data);
      
      // Initialize edit fields
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || data.mobile || "");
      setAddress(data.address || "");
      setClinicName(data.clinicName || "");
      setGender(data.gender || "Male");
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Fallback to local storage if API fails or isn't reachable
      setError("Unable to sync live profile from server. Showing offline details.");
      loadOfflineData();
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineData = () => {
    let localData = {};
    if (role === "admin") {
      localData = JSON.parse(localStorage.getItem("adminData") || "{}");
    } else if (role === "employee") {
      localData = JSON.parse(localStorage.getItem("employeeData") || "{}");
    } else if (role === "partner") {
      localData = JSON.parse(localStorage.getItem("userData") || "{}");
    } else if (role === "volunteer") {
      localData = JSON.parse(localStorage.getItem("volunteerData") || "{}");
    }

    const nameVal = localData.name || localStorage.getItem("employeeName") || "";
    const emailVal = localData.email || localStorage.getItem("employeeEmail") || "";
    const phoneVal = localData.phone || localData.mobile || "";
    const addressVal = localData.address || "";
    const clinicNameVal = localData.clinicName || "";
    const genderVal = localData.gender || "Male";

    const data = {
      id: userId,
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      mobile: phoneVal,
      address: addressVal,
      clinicName: clinicNameVal,
      gender: genderVal,
      role: role
    };

    setProfileData(data);
    setName(nameVal);
    setEmail(emailVal);
    setPhone(phoneVal);
    setAddress(addressVal);
    setClinicName(clinicNameVal);
    setGender(genderVal);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: userId,
          role,
          name,
          email,
          mobile: phone,
          phone,
          address,
          clinicName,
          gender,
          password: password || undefined
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      const updated = result.data;
      setSuccess("Profile updated successfully!");
      setIsEditing(true);
      setPassword("");
      setConfirmPassword("");
      
      // Refresh state
      setProfileData({ ...profileData, ...updated });

      // Update LocalStorage based on role
      if (role === "admin") {
        const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
        const newAdminData = { ...adminData, ...updated };
        localStorage.setItem("adminData", JSON.stringify(newAdminData));
        localStorage.setItem("name", updated.name);
        localStorage.setItem("email", updated.email);
      } else if (role === "employee") {
        const employeeData = JSON.parse(localStorage.getItem("employeeData") || "{}");
        const newEmployeeData = { ...employeeData, ...updated };
        localStorage.setItem("employeeData", JSON.stringify(newEmployeeData));
        localStorage.setItem("employeeName", updated.name);
        localStorage.setItem("employeeEmail", updated.email);
      } else if (role === "partner") {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const newUserData = { ...userData, ...updated };
        localStorage.setItem("userData", JSON.stringify(newUserData));
        localStorage.setItem("name", updated.name);
        localStorage.setItem("email", updated.email);
      } else if (role === "volunteer") {
        const volunteerData = JSON.parse(localStorage.getItem("volunteerData") || "{}");
        const newVolunteerData = { ...volunteerData, ...updated };
        localStorage.setItem("volunteerData", JSON.stringify(newVolunteerData));
        localStorage.setItem("employeeName", updated.name);
        localStorage.setItem("employeeEmail", updated.email);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const getRoleBadgeClass = () => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm";
      case "partner":
        return "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm";
      case "volunteer":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm";
      case "employee":
        return "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm";
      default:
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className={`h-28 bg-gradient-to-tr ${
          role === 'admin' ? 'from-rose-500 to-red-600' :
          role === 'partner' ? 'from-indigo-500 to-violet-600' :
          role === 'volunteer' ? 'from-emerald-400 to-teal-600' :
          'from-blue-500 to-indigo-600'
        } relative flex items-end px-6 pb-4`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all outline-none"
          >
            <X size={18} />
          </button>
          
          <div className="absolute -bottom-10 left-6 flex items-end">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-3xl font-bold text-indigo-600 overflow-hidden">
              {profileData?.name ? profileData.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="ml-4 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${getRoleBadgeClass()}`}>
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-14 pb-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">{profileData?.name || "Loading..."}</h3>
            <p className="text-sm text-gray-500">{profileData?.email || "loading..."}</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="animate-spin text-indigo-600 h-8 w-8 mb-2" />
              <p className="text-sm text-gray-500">Syncing profile data...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-xl flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-700 font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-xl flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-emerald-700 font-medium">{success}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Name (Editable) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-75 disabled:cursor-not-allowed text-sm text-gray-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only for safety) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone (Editable) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-75 disabled:cursor-not-allowed text-sm text-gray-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Address (Editable) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <textarea
                        disabled={!isEditing}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-75 disabled:cursor-not-allowed text-sm text-gray-800 font-medium resize-none"
                      />
                    </div>
                  </div>

                  {/* Clinic Name (Partner only) */}
                  {role === "partner" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Clinic Name</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-75 disabled:cursor-not-allowed text-sm text-gray-800 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* Gender (Volunteer only) */}
                  {role === "volunteer" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gender</label>
                      <select
                        disabled={!isEditing}
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-75 disabled:cursor-not-allowed text-sm text-gray-800 font-medium"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}

                  {/* Assigned Partner (Volunteer only - read-only) */}
                  {role === "volunteer" && profileData?.assignedPartner && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Assigned Partner</label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          disabled
                          value={profileData.assignedPartner.name || "N/A"}
                          className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password update section during edit */}
                  {isEditing && (
                    <div className="pt-2 border-t border-gray-100 space-y-4">
                      <h4 className="text-sm font-bold text-gray-700">Change Password (Optional)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm text-gray-800"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm text-gray-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
