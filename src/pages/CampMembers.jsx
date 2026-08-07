// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import {
//   FiSearch,
//   FiUserPlus,
//   FiUserMinus,
//   FiUsers,
//   FiCheckCircle,
//   FiActivity,
//   FiArrowLeft,
//   FiX,
//   FiUser,
//   FiMail,
//   FiPhone,
//   FiMapPin,
//   FiCalendar,
//   FiClock,
//   FiFileText,
//   FiPlus,
//   FiEye,
//   FiTrash2,
//   FiAlertCircle
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import config from "../config";
// import "./Dashboard.css";

// const CampMembers = () => {
//   const navigate = useNavigate();
//   const [camps, setCamps] = useState([]);
//   const [selectedCampId, setSelectedCampId] = useState("");
//   const [campDetails, setCampDetails] = useState(null);
//   const [loadingCamps, setLoadingCamps] = useState(true);
//   const [loadingMembers, setLoadingMembers] = useState(false);
//   const [error, setError] = useState(null);

//   // Search and Filter States
//   const [searchQuery, setSearchQuery] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all"); // all, partner, volunteer

//   // Modal States
//   const [showViewProfileModal, setShowViewProfileModal] = useState(false);
//   const [selectedMember, setSelectedMember] = useState(null);
  
//   const [showAssignPartnerModal, setShowAssignPartnerModal] = useState(false);
//   const [showAssignVolunteersModal, setShowAssignVolunteersModal] = useState(false);
//   const [availableMembers, setAvailableMembers] = useState({ partners: [], volunteers: [] });
//   const [loadingAvailable, setLoadingAvailable] = useState(false);
//   const [submittingAssign, setSubmittingAssign] = useState(false);

//   // Assignment selection states
//   const [selectedAssignPartnerId, setSelectedAssignPartnerId] = useState("");
//   const [selectedAssignVolunteerIds, setSelectedAssignVolunteerIds] = useState([]);

//   // Logged-in User Identity
//   const role = localStorage.getItem("role");
//   const userId = localStorage.getItem("userId");

//   // Determine user ID correctly based on role
//   const getLoggedInUserId = () => {
//     try {
//       if (role === "admin") {
//         const data = JSON.parse(localStorage.getItem("adminData") || "{}");
//         return data._id || data.id || userId;
//       } else if (role === "partner") {
//         const userData = JSON.parse(localStorage.getItem("userData") || "{}");
//         return userData._id || userData.id || userId;
//       } else if (role === "volunteer" || role === "employee") {
//         const volunteerData = JSON.parse(localStorage.getItem("volunteerData") || "{}");
//         return volunteerData._id || volunteerData.id || userId;
//       }
//       return userId;
//     } catch (e) {
//       return userId;
//     }
//   };

//   const currentUserId = getLoggedInUserId();

//   // Load camps based on user role
//   useEffect(() => {
//     fetchCamps();
//   }, [role, currentUserId]);

//   const fetchCamps = async () => {
//     try {
//       setLoadingCamps(true);
//       setError(null);
      
//       let campsData = [];
//       if (role === "admin") {
//         const res = await axios.get(`${config.API_BASE_URL}/camps/allcamps`);
//         campsData = res.data?.data || res.data || [];
//       } else if (role === "partner") {
//         const res = await axios.get(`${config.API_BASE_URL}/camps/assigned-camps/${currentUserId}`);
//         campsData = res.data?.data || res.data || [];
//       } else {
//         // Volunteer / Employee - Fetch all and filter locally
//         const res = await axios.get(`${config.API_BASE_URL}/camps/allcamps`);
//         const allCamps = res.data?.data || res.data || [];
//         campsData = allCamps.filter(camp => 
//           (camp.volunteers || []).some(v => 
//             String(v) === String(currentUserId) || 
//             (v && String(v._id || v.id) === String(currentUserId))
//           )
//         );
//       }

//       setCamps(campsData);

//       if (campsData.length > 0) {
//         setSelectedCampId(campsData[0]._id);
//       } else {
//         setLoadingCamps(false);
//       }
//     } catch (err) {
//       console.error("Error fetching camps:", err);
//       setError("Failed to load health camps list.");
//       setLoadingCamps(false);
//     }
//   };

//   // Fetch camp members when selected camp changes
//   useEffect(() => {
//     if (selectedCampId) {
//       fetchCampMembers(selectedCampId);
//     } else {
//       setCampDetails(null);
//     }
//   }, [selectedCampId]);

//   const fetchCampMembers = async (campId) => {
//     try {
//       setLoadingMembers(true);
//       setError(null);
//       const res = await axios.get(`${config.API_BASE_URL}/camp-members/${campId}/members`);
//       if (res.data && res.data.data) {
//         setCampDetails(res.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching camp members:", err);
//       setError("Failed to load camp members details.");
//     } finally {
//       setLoadingMembers(false);
//       setLoadingCamps(false);
//     }
//   };

//   // Fetch available members for assigning
//   const fetchAvailableMembers = async () => {
//     if (!selectedCampId) return;
//     try {
//       setLoadingAvailable(true);
//       const res = await axios.get(`${config.API_BASE_URL}/camp-members/${selectedCampId}/available-members`);
//       if (res.data && res.data.data) {
//         setAvailableMembers(res.data.data);
//         if (res.data.data.partners.length > 0) {
//           setSelectedAssignPartnerId(res.data.data.partners[0].id);
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching candidates:", err);
//       alert("Failed to load available members for assignment.");
//     } finally {
//       setLoadingAvailable(false);
//     }
//   };

//   // Check if Partner has permission to manage volunteers
//   const partnerCanManageVolunteers = useMemo(() => {
//     if (role === "admin") return true;
//     if (role === "partner" && campDetails?.assignedPartner) {
//       const isAssigned = String(campDetails.assignedPartner.id) === String(currentUserId);
//       return isAssigned && campDetails.assignedPartner.canManageVolunteers;
//     }
//     return false;
//   }, [role, campDetails, currentUserId]);

//   // Combine members into single array for filter/search
//   const allMembers = useMemo(() => {
//     if (!campDetails) return [];
//     const list = [];
//     if (campDetails.assignedPartner) {
//       list.push(campDetails.assignedPartner);
//     }
//     if (campDetails.volunteers && campDetails.volunteers.length > 0) {
//       list.push(...campDetails.volunteers);
//     }
//     return list;
//   }, [campDetails]);

//   // Summary Statistics
//   const stats = useMemo(() => {
//     const totalVolunteers = campDetails?.volunteers?.length || 0;
//     const partnerCount = campDetails?.assignedPartner ? 1 : 0;
//     const totalMembers = totalVolunteers + partnerCount;
    
//     // Count active members (Partner if approved, volunteers who are active)
//     let activeMembers = 0;
//     if (campDetails?.assignedPartner && campDetails.assignedPartner.status !== "rejected") {
//       activeMembers += 1;
//     }
//     activeMembers += totalVolunteers; // Volunteers are active by default once assigned

//     return {
//       totalMembers,
//       partnerCount,
//       totalVolunteers,
//       activeMembers
//     };
//   }, [campDetails]);

//   // Filtered members list
//   const filteredMembers = useMemo(() => {
//     return allMembers.filter((m) => {
//       const matchesSearch =
//         m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         m.phone?.includes(searchQuery);

//       const matchesRole =
//         roleFilter === "all" || m.role === roleFilter;

//       return matchesSearch && matchesRole;
//     });
//   }, [allMembers, searchQuery, roleFilter]);

//   // View Member Details
//   const handleViewProfile = (member) => {
//     setSelectedMember(member);
//     setShowViewProfileModal(true);
//   };

//   // Assign Partner Action
//   const handleAssignPartner = async (e) => {
//     e.preventDefault();
//     if (!selectedAssignPartnerId) {
//       alert("Please select a partner first.");
//       return;
//     }
//     try {
//       setSubmittingAssign(true);
//       const res = await axios.post(`${config.API_BASE_URL}/camp-members/${selectedCampId}/assign-partner`, {
//         partnerId: selectedAssignPartnerId
//       });
//       if (res.data.success) {
//         setShowAssignPartnerModal(false);
//         fetchCampMembers(selectedCampId);
//         alert("Partner assigned successfully! ✅");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to assign partner");
//     } finally {
//       setSubmittingAssign(false);
//     }
//   };

//   // Remove Partner Action
//   const handleRemovePartner = async () => {
//     if (!window.confirm("Are you sure you want to remove the assigned doctor/partner from this camp?")) return;
//     try {
//       const res = await axios.post(`${config.API_BASE_URL}/camp-members/${selectedCampId}/remove-partner`);
//       if (res.data.success) {
//         fetchCampMembers(selectedCampId);
//         alert("Partner removed successfully! ✅");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to remove partner");
//     }
//   };

//   // Assign Volunteers Action
//   const handleAssignVolunteers = async (e) => {
//     e.preventDefault();
//     if (selectedAssignVolunteerIds.length === 0) {
//       alert("Please select at least one volunteer.");
//       return;
//     }
//     try {
//       setSubmittingAssign(true);
//       const res = await axios.post(`${config.API_BASE_URL}/camp-members/${selectedCampId}/assign-volunteers`, {
//         volunteerIds: selectedAssignVolunteerIds
//       });
//       if (res.data.success) {
//         setShowAssignVolunteersModal(false);
//         setSelectedAssignVolunteerIds([]);
//         fetchCampMembers(selectedCampId);
//         alert("Volunteers assigned successfully! ✅");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to assign volunteers");
//     } finally {
//       setSubmittingAssign(false);
//     }
//   };

//   // Remove Volunteer Action
//   const handleRemoveVolunteer = async (volunteerId, volunteerName) => {
//     if (!window.confirm(`Are you sure you want to remove volunteer "${volunteerName}" from this camp?`)) return;
//     try {
//       const res = await axios.post(`${config.API_BASE_URL}/camp-members/${selectedCampId}/remove-volunteer`, {
//         volunteerId
//       });
//       if (res.data.success) {
//         fetchCampMembers(selectedCampId);
//         alert("Volunteer removed successfully! ✅");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to remove volunteer");
//     }
//   };

//   // Toggle volunteer checkbox in assignment modal
//   const handleToggleAssignVolunteer = (vId) => {
//     setSelectedAssignVolunteerIds(prev => 
//       prev.includes(vId) ? prev.filter(id => id !== vId) : [...prev, vId]
//     );
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "-";
//     const d = new Date(dateStr);
//     return d.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric"
//     });
//   };

//   const getCampStatusClass = (status) => {
//     switch (status) {
//       case "active":
//         return "bg-emerald-50 text-emerald-600 border border-emerald-100";
//       case "completed":
//         return "bg-blue-50 text-blue-600 border border-blue-100";
//       case "cancelled":
//         return "bg-red-50 text-red-600 border border-red-100";
//       case "archived":
//         return "bg-gray-100 text-gray-600 border border-gray-200";
//       default:
//         return "bg-gray-50 text-gray-500";
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return "?";
//     return name
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase())
//       .slice(0, 2)
//       .join("");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
//       {/* Upper Navigation Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//         <div>
//           <div className="flex items-center gap-3">
//             <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
//               <FiUsers className="text-2xl" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Camp Members</h1>
//               <p className="text-gray-500 text-sm mt-0.5">
//                 View and manage doctor and volunteer assignments for BMI health camps.
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate(role === "admin" ? "/admin/dashboard" : role === "partner" ? "/doctor" : "/dashboard")}
//             className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold shadow-sm transition active:scale-95 cursor-pointer"
//           >
//             <FiArrowLeft /> Back to Dashboard
//           </button>
//         </div>
//       </div>

//       {/* Main Panel grid: Left Selector/Details, Right Stats & Table */}
//       {loadingCamps ? (
//         <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
//           <FiActivity className="animate-spin text-indigo-600 text-4xl mb-4" />
//           <p className="text-gray-500 font-medium">Loading camps list...</p>
//         </div>
//       ) : camps.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-4">
//           <FiAlertCircle size={48} className="text-gray-300 mb-4" />
//           <h3 className="text-xl font-bold text-gray-800">No Camps Available</h3>
//           <p className="text-gray-500 max-w-sm mt-1">
//             {role === "partner" 
//               ? "You do not have any assigned health camps currently." 
//               : role === "volunteer" 
//                 ? "You are not assigned to any camp as a volunteer yet." 
//                 : "No health camps have been created in the system."}
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* Camp Selection Banner */}
//           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div className="flex-1 max-w-md">
//               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
//                 Select Health Camp
//               </label>
//               <select
//                 value={selectedCampId}
//                 disabled={role === "volunteer" || role === "employee"}
//                 onChange={(e) => setSelectedCampId(e.target.value)}
//                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold text-gray-800 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
//               >
//                 {camps.map((camp) => (
//                   <option key={camp._id} value={camp._id}>
//                     {camp.name} ({camp.location})
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {campDetails?.camp && (
//               <div className="flex flex-wrap gap-2 md:self-end">
//                 <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getCampStatusClass(campDetails.camp.status)}`}>
//                   Camp: {campDetails.camp.status}
//                 </span>
//                 {role === "partner" && (
//                   <span className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
//                     {partnerCanManageVolunteers ? "Can Manage Volunteers" : "Read-Only Member"}
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Camp Details and Stats Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Camp Information Card */}
//             <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
//                   Camp Details
//                 </h3>
//                 {loadingMembers ? (
//                   <div className="py-10 text-center text-gray-400">Loading camp information...</div>
//                 ) : campDetails?.camp ? (
//                   <div className="space-y-4">
//                     <div>
//                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Camp Name</span>
//                       <p className="font-bold text-indigo-700 text-lg mt-0.5">{campDetails.camp.name}</p>
//                     </div>
//                     <div className="flex items-start gap-2.5">
//                       <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
//                       <div>
//                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Location</span>
//                         <p className="font-semibold text-gray-800 text-sm mt-0.5">{campDetails.camp.location}</p>
//                         <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{campDetails.camp.address || "No complete address specified"}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2.5">
//                       <FiCalendar className="text-gray-400 flex-shrink-0" />
//                       <div>
//                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Schedule Date</span>
//                         <p className="font-semibold text-gray-800 text-sm mt-0.5">{campDetails.camp.date || "Date unscheduled"}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2.5">
//                       <FiClock className="text-gray-400 flex-shrink-0" />
//                       <div>
//                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Time slot</span>
//                         <p className="font-semibold text-gray-800 text-sm mt-0.5">{campDetails.camp.time || "Not specified"}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="py-10 text-center text-gray-400">Select a camp to view details.</div>
//                 )}
//               </div>
//             </div>

//             {/* Summary Cards */}
//             <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
//               {/* Total Members */}
//               <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
//                 <div>
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
//                     Total Members
//                   </span>
//                   <h3 className="text-3xl font-extrabold text-indigo-700 mt-2">
//                     {loadingMembers ? "-" : stats.totalMembers}
//                   </h3>
//                 </div>
//                 <div className="self-end p-2 bg-indigo-50 text-indigo-600 rounded-xl mt-4">
//                   <FiUsers size={20} />
//                 </div>
//               </div>

//               {/* Partner (Doctor) Card */}
//               <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
//                 <div>
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
//                     Partner (Doctor)
//                   </span>
//                   <h3 className="text-3xl font-extrabold text-purple-700 mt-2">
//                     {loadingMembers ? "-" : `${stats.partnerCount}/1`}
//                   </h3>
//                 </div>
//                 <div className="self-end p-2 bg-purple-50 text-purple-600 rounded-xl mt-4">
//                   <FiUser size={20} />
//                 </div>
//               </div>

//               {/* Total Volunteers */}
//               <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
//                 <div>
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
//                     Volunteers
//                   </span>
//                   <h3 className="text-3xl font-extrabold text-emerald-700 mt-2">
//                     {loadingMembers ? "-" : stats.totalVolunteers}
//                   </h3>
//                 </div>
//                 <div className="self-end p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-4">
//                   <FiUsers size={20} />
//                 </div>
//               </div>

//               {/* Active Members */}
//               <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
//                 <div>
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
//                     Active Members
//                   </span>
//                   <h3 className="text-3xl font-extrabold text-blue-700 mt-2">
//                     {loadingMembers ? "-" : stats.activeMembers}
//                   </h3>
//                 </div>
//                 <div className="self-end p-2 bg-blue-50 text-blue-600 rounded-xl mt-4">
//                   <FiCheckCircle size={20} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Members Table section */}
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//             {/* Header and filters bar */}
//             <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gray-50/30">
//               <div>
//                 <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
//                   <span>Assigned Members</span>
//                   {!loadingMembers && (
//                     <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
//                       {filteredMembers.length}
//                     </span>
//                   )}
//                 </h3>
//                 <p className="text-gray-400 text-xs mt-1">List of doctors and volunteers assigned to this camp</p>
//               </div>

//               <div className="flex flex-wrap items-center gap-3">
//                 {/* Search query */}
//                 <div className="relative max-w-xs">
//                   <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by name, email..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-xs"
//                   />
//                 </div>

//                 {/* Role Filters */}
//                 <div className="flex items-center border border-gray-200 rounded-xl p-0.5 bg-gray-100/50">
//                   <button
//                     onClick={() => setRoleFilter("all")}
//                     className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
//                       roleFilter === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
//                     }`}
//                   >
//                     All
//                   </button>
//                   <button
//                     onClick={() => setRoleFilter("partner")}
//                     className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
//                       roleFilter === "partner" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
//                     }`}
//                   >
//                     Partners
//                   </button>
//                   <button
//                     onClick={() => setRoleFilter("volunteer")}
//                     className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
//                       roleFilter === "volunteer" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
//                     }`}
//                   >
//                     Volunteers
//                   </button>
//                 </div>

//                 {/* Assign buttons */}
//                 {role === "admin" && (
//                   <button
//                     onClick={() => {
//                       fetchAvailableMembers();
//                       setShowAssignPartnerModal(true);
//                     }}
//                     className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
//                   >
//                     <FiPlus /> Assign Partner
//                   </button>
//                 )}
                
//                 {(role === "admin" || partnerCanManageVolunteers) && (
//                   <button
//                     onClick={() => {
//                       fetchAvailableMembers();
//                       setShowAssignVolunteersModal(true);
//                     }}
//                     className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition active:scale-95 cursor-pointer"
//                   >
//                     <FiPlus /> Assign Volunteers
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Table layout */}
//             {loadingMembers ? (
//               <div className="py-20 text-center text-gray-400">
//                 <FiActivity className="animate-spin text-indigo-600 text-3xl mx-auto mb-3" />
//                 Loading camp members data...
//               </div>
//             ) : filteredMembers.length === 0 ? (
//               <div className="py-16 text-center text-gray-400 px-4">
//                 <FiUsers size={40} className="mx-auto mb-3 text-gray-300" />
//                 <p className="font-semibold text-gray-600 text-sm">No members matched the filter criteria</p>
//                 <p className="text-xs text-gray-400 mt-1">Try resetting the filter or assign new members to the camp.</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="border-b border-gray-100 bg-gray-50/20 text-xs font-bold text-gray-400 uppercase tracking-wider">
//                       <th className="p-4 pl-6">Name</th>
//                       <th className="p-4">Role</th>
//                       <th className="p-4">Email</th>
//                       <th className="p-4">Phone</th>
//                       <th className="p-4">Status</th>
//                       <th className="p-4">Assigned Date</th>
//                       <th className="p-4 text-center pr-6">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {filteredMembers.map((member) => (
//                       <tr key={`${member.role}_${member.id}`} className="hover:bg-gray-50/50 transition-colors">
//                         <td className="p-4 pl-6">
//                           <div className="flex items-center gap-3">
//                             <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${
//                               member.role === "partner" 
//                                 ? "bg-purple-100 text-purple-700" 
//                                 : "bg-emerald-100 text-emerald-700"
//                             }`}>
//                               {getInitials(member.name)}
//                             </div>
//                             <div>
//                               <p className="font-bold text-gray-800 text-sm">{member.name}</p>
//                               {member.role === "partner" && member.clinicName && (
//                                 <p className="text-xs text-gray-400">{member.clinicName}</p>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="p-4 text-xs font-semibold">
//                           <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
//                             member.role === "partner" 
//                               ? "bg-purple-50 text-purple-700 border border-purple-100" 
//                               : "bg-emerald-50 text-emerald-700 border border-emerald-100"
//                           }`}>
//                             {member.role === "partner" ? "Partner (Doctor)" : "Volunteer"}
//                           </span>
//                         </td>
//                         <td className="p-4 text-xs font-medium text-gray-600 truncate max-w-[150px]">
//                           {member.email}
//                         </td>
//                         <td className="p-4 text-xs font-medium text-gray-600">
//                           {member.phone || "-"}
//                         </td>
//                         <td className="p-4 text-xs font-semibold">
//                           <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
//                             member.role === "partner" 
//                               ? (member.status === "approved" || member.status === "accepted" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")
//                               : "bg-emerald-50 text-emerald-600"
//                           }`}>
//                             {member.role === "partner" ? member.status : "active"}
//                           </span>
//                         </td>
//                         <td className="p-4 text-xs font-medium text-gray-500">
//                           {formatDate(member.assignedDate)}
//                         </td>
//                         <td className="p-4 text-center pr-6">
//                           <div className="flex items-center justify-center gap-2">
//                             {/* View Profile */}
//                             <button
//                               onClick={() => handleViewProfile(member)}
//                               className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
//                               title="View Profile Details"
//                             >
//                               <FiEye size={15} />
//                             </button>

//                             {/* Remove Partner (Admin only, cannot remove itself if logged-in Partner) */}
//                             {member.role === "partner" && role === "admin" && (
//                               <button
//                                 onClick={handleRemovePartner}
//                                 className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
//                                 title="Remove Partner"
//                               >
//                                 <FiUserMinus size={15} />
//                               </button>
//                             )}

//                             {/* Remove Volunteer (Admin, or Partner if permission is enabled. Volunteer role cannot delete) */}
//                             {member.role === "volunteer" && (role === "admin" || partnerCanManageVolunteers) && (
//                               <button
//                                 onClick={() => handleRemoveVolunteer(member.id, member.name)}
//                                 className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
//                                 title="Remove Volunteer"
//                               >
//                                 <FiTrash2 size={15} />
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* VIEW MEMBER PROFILE MODAL */}
//       {showViewProfileModal && selectedMember && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//           <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
//             <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//               <h3 className="font-bold text-gray-800 text-md">Member Profile</h3>
//               <button
//                 onClick={() => setShowViewProfileModal(false)}
//                 className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 cursor-pointer"
//               >
//                 <FiX size={18} />
//               </button>
//             </div>
//             <div className="p-6 text-center">
//               <div className={`w-20 h-20 rounded-full font-bold text-2xl mx-auto flex items-center justify-center shadow-sm ${
//                 selectedMember.role === "partner" 
//                   ? "bg-purple-100 text-purple-700" 
//                   : "bg-emerald-100 text-emerald-700"
//               }`}>
//                 {getInitials(selectedMember.name)}
//               </div>
//               <h4 className="text-xl font-bold text-gray-900 mt-4">{selectedMember.name}</h4>
//               <p className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase mt-1 tracking-wider ${
//                 selectedMember.role === "partner"
//                   ? "bg-purple-50 text-purple-600 border border-purple-100"
//                   : "bg-emerald-50 text-emerald-600 border border-emerald-100"
//               }`}>
//                 {selectedMember.role === "partner" ? "Partner (Doctor)" : "Volunteer"}
//               </p>

//               <div className="border-t border-gray-100 mt-6 pt-5 space-y-4 text-left text-sm text-gray-600">
//                 <div className="flex items-center gap-3">
//                   <FiMail className="text-gray-400 flex-shrink-0" />
//                   <div className="overflow-hidden">
//                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email Address</span>
//                     <span className="font-medium text-gray-800 block truncate">{selectedMember.email}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <FiPhone className="text-gray-400 flex-shrink-0" />
//                   <div>
//                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Phone Contact</span>
//                     <span className="font-medium text-gray-800 block">{selectedMember.phone || "No phone listed"}</span>
//                   </div>
//                 </div>

//                 {selectedMember.role === "partner" && selectedMember.clinicName && (
//                   <div className="flex items-center gap-3">
//                     <FiFileText className="text-gray-400 flex-shrink-0" />
//                     <div>
//                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Center / Clinic</span>
//                       <span className="font-medium text-gray-800 block">{selectedMember.clinicName}</span>
//                     </div>
//                   </div>
//                 )}

//                 {selectedMember.address && (
//                   <div className="flex items-start gap-3">
//                     <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
//                     <div>
//                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Address</span>
//                       <span className="font-medium text-gray-700 block text-xs leading-relaxed">{selectedMember.address}</span>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex items-center gap-3">
//                   <FiCalendar className="text-gray-400 flex-shrink-0" />
//                   <div>
//                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Assigned On</span>
//                     <span className="font-medium text-gray-800 block">{formatDate(selectedMember.assignedDate)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="p-4 border-t border-gray-100 flex items-center justify-center bg-gray-50/50">
//               <button
//                 onClick={() => setShowViewProfileModal(false)}
//                 className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 transition cursor-pointer"
//               >
//                 Close Profile
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ASSIGN PARTNER MODAL */}
//       {showAssignPartnerModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//           <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
//             <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//               <h3 className="font-bold text-gray-800 text-md">Assign Partner (Doctor)</h3>
//               <button
//                 onClick={() => setShowAssignPartnerModal(false)}
//                 className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 cursor-pointer"
//               >
//                 <FiX size={18} />
//               </button>
//             </div>
//             {loadingAvailable ? (
//               <div className="py-20 text-center text-gray-400">
//                 <FiActivity className="animate-spin text-indigo-600 text-3xl mx-auto mb-2" />
//                 Loading candidates...
//               </div>
//             ) : availableMembers.partners.length === 0 ? (
//               <div className="p-8 text-center text-gray-500">
//                 <p className="font-semibold text-gray-600">No Partners Available</p>
//                 <p className="text-xs text-gray-400 mt-1">All registered partners are already assigned or none exist.</p>
//                 <button
//                   type="button"
//                   onClick={() => setShowAssignPartnerModal(false)}
//                   className="mt-4 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             ) : (
//               <form onSubmit={handleAssignPartner}>
//                 <div className="p-6 space-y-4">
//                   <div>
//                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
//                       Choose Partner (Doctor) <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={selectedAssignPartnerId}
//                       onChange={(e) => setSelectedAssignPartnerId(e.target.value)}
//                       className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-semibold text-gray-800"
//                     >
//                       {availableMembers.partners.map((p) => (
//                         <option key={p.id} value={p.id}>
//                           {p.name} ({p.clinicName}) - {p.email}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//                 <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
//                   <button
//                     type="button"
//                     onClick={() => setShowAssignPartnerModal(false)}
//                     className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={submittingAssign}
//                     className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
//                   >
//                     {submittingAssign ? "Assigning..." : "Assign Partner"}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ASSIGN VOLUNTEERS MODAL */}
//       {showAssignVolunteersModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//           <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
//             <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//               <h3 className="font-bold text-gray-800 text-md">Assign Volunteers</h3>
//               <button
//                 onClick={() => setShowAssignVolunteersModal(false)}
//                 className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 cursor-pointer"
//               >
//                 <FiX size={18} />
//               </button>
//             </div>
//             {loadingAvailable ? (
//               <div className="py-20 text-center text-gray-400">
//                 <FiActivity className="animate-spin text-indigo-600 text-3xl mx-auto mb-2" />
//                 Loading volunteers...
//               </div>
//             ) : availableMembers.volunteers.length === 0 ? (
//               <div className="p-8 text-center text-gray-500">
//                 <p className="font-semibold text-gray-600">No Volunteers Available</p>
//                 <p className="text-xs text-gray-400 mt-1">All volunteers in the database are already assigned to this camp.</p>
//                 <button
//                   type="button"
//                   onClick={() => setShowAssignVolunteersModal(false)}
//                   className="mt-4 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             ) : (
//               <form onSubmit={handleAssignVolunteers}>
//                 <div className="p-5 space-y-3">
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//                     Select Volunteers <span className="text-red-500">*</span>
//                   </label>
//                   <div className="border border-gray-200 rounded-xl p-3 max-h-56 overflow-y-auto space-y-2.5 bg-gray-50/50">
//                     {availableMembers.volunteers.map((v) => (
//                       <label
//                         key={v.id}
//                         className="flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-100 cursor-pointer text-xs"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={selectedAssignVolunteerIds.includes(v.id)}
//                           onChange={() => handleToggleAssignVolunteer(v.id)}
//                           className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
//                         />
//                         <div className="flex flex-col">
//                           <span className="font-bold text-gray-800">{v.name}</span>
//                           <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
//                             {v.designation} | {v.email}
//                           </span>
//                         </div>
//                       </label>
//                     ))}
//                   </div>
//                   <p className="text-[10px] text-gray-400 italic">
//                     {selectedAssignVolunteerIds.length} volunteer(s) selected
//                   </p>
//                 </div>
//                 <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
//                   <button
//                     type="button"
//                     onClick={() => setShowAssignVolunteersModal(false)}
//                     className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={submittingAssign}
//                     className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
//                   >
//                     {submittingAssign ? "Assigning..." : `Assign (${selectedAssignVolunteerIds.length})`}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CampMembers;


import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FiSearch,
  FiUserPlus,
  FiUserMinus,
  FiUsers,
  FiCheckCircle,
  FiActivity,
  FiArrowLeft,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiFileText,
  FiPlus,
  FiEye,
  FiTrash2,
  FiAlertCircle,
  FiEdit,
  FiChevronRight
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "./Dashboard.css";

const CampMembers = () => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState("");
  const [campDetails, setCampDetails] = useState(null);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal States
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const [showAssignPartnerModal, setShowAssignPartnerModal] = useState(false);
  const [showAssignVolunteersModal, setShowAssignVolunteersModal] = useState(false);
  const [availableMembers, setAvailableMembers] = useState({ partners: [], volunteers: [] });
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const [selectedAssignPartnerId, setSelectedAssignPartnerId] = useState("");
  const [selectedAssignVolunteerIds, setSelectedAssignVolunteerIds] = useState([]);

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const getLoggedInUserId = () => {
    try {
      if (role === "admin") {
        const data = JSON.parse(localStorage.getItem("adminData") || "{}");
        return data._id || data.id || userId;
      } else if (role === "partner") {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        return userData._id || userData.id || userId;
      } else if (role === "volunteer" || role === "employee") {
        const volunteerData = JSON.parse(localStorage.getItem("volunteerData") || "{}");
        return volunteerData._id || volunteerData.id || userId;
      }
      return userId;
    } catch (e) {
      return userId;
    }
  };

  const currentUserId = getLoggedInUserId();

  useEffect(() => {
    fetchCamps();
  }, [role, currentUserId]);

  const fetchCamps = async () => {
    try {
      setLoadingCamps(true);
      setError(null);
      
      let campsData = [];
      if (role === "admin") {
        const res = await axios.get(`${config.API_BASE_URL}/camps/allcamps`);
        campsData = res.data?.data || res.data || [];
      } else if (role === "partner") {
        const res = await axios.get(`${config.API_BASE_URL}/camps/assigned-camps/${currentUserId}`);
        campsData = res.data?.data || res.data || [];
      } else {
        const res = await axios.get(`${config.API_BASE_URL}/camps/allcamps`);
        const allCamps = res.data?.data || res.data || [];
        campsData = allCamps.filter(camp => 
          (camp.volunteers || []).some(v => 
            String(v) === String(currentUserId) || 
            (v && String(v._id || v.id) === String(currentUserId))
          )
        );
      }

      setCamps(campsData);

      if (campsData.length > 0) {
        setSelectedCampId(campsData[0]._id);
      } else {
        setLoadingCamps(false);
      }
    } catch (err) {
      console.error("Error fetching camps:", err);
      setError("Failed to load health camps list.");
      setLoadingCamps(false);
    }
  };

  useEffect(() => {
    if (selectedCampId) {
      fetchCampMembers(selectedCampId);
    } else {
      setCampDetails(null);
    }
  }, [selectedCampId]);

  const fetchCampMembers = async (campId) => {
    try {
      setLoadingMembers(true);
      setError(null);
      const res = await axios.get(`${config.API_BASE_URL}/camp-members/${campId}/members`);
      if (res.data && res.data.data) {
        setCampDetails(res.data.data);
      } else {
        setCampDetails({ camp: null, assignedPartner: null, volunteers: [] });
      }
    } catch (err) {
      console.error("Error fetching camp members:", err);
      setError("Failed to load camp members details.");
      setCampDetails({ camp: null, assignedPartner: null, volunteers: [] });
    } finally {
      setLoadingMembers(false);
      setLoadingCamps(false);
    }
  };

  // 🔥 FIXED: fetchAvailableMembers - Shows all volunteers for admin, partner-specific for partner
  const fetchAvailableMembers = async () => {
    if (!selectedCampId) return;
    try {
      setLoadingAvailable(true);
      
      // Get current user role and ID
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");
      
      let allPartners = [];
      let allVolunteers = [];
      
      // 🔥 1. FETCH PARTNERS - Same for both admin and partner
      try {
        const partnersRes = await axios.get(`${config.API_BASE_URL}/auth/partners`).catch(() => ({ data: [] }));
        let partnersData = partnersRes.data || [];
        if (!Array.isArray(partnersData)) {
          partnersData = partnersData.data || partnersData.partners || [];
          if (!Array.isArray(partnersData)) partnersData = [];
        }
        allPartners = partnersData;
        console.log("✅ Partners loaded:", allPartners.length);
      } catch (err) {
        console.error("Error fetching partners:", err);
      }
      
      // 🔥 2. FETCH VOLUNTEERS - Different based on role
      if (role === "admin") {
        // 🔥 ADMIN: Fetch ALL volunteers (Employees + Partner Volunteers)
        
        // 2a. Fetch employees from proxy
        try {
          const employeesRes = await axios.get(`${config.API_BASE_URL}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
          const empData = employeesRes.data || [];
          const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
          
          // Filter employees by department
          const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
          const filteredEmployees = allEmployees.filter(emp => {
            const dept = (emp.department || "").trim();
            return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
          });
          
          allVolunteers = filteredEmployees.map(emp => ({
            _id: emp._id,
            id: emp._id,
            name: emp.name,
            email: emp.email || emp.workEmail || '',
            phone: emp.phone || emp.mobile || '',
            designation: emp.designation || emp.role || 'Staff',
            source: 'employee',
            department: emp.department
          }));
          console.log("✅ Employees loaded:", filteredEmployees.length);
        } catch (err) {
          console.error("Error fetching employees:", err);
        }
        
        // 2b. Fetch all partner volunteers
        try {
          const partnersRes = await axios.get(`${config.API_BASE_URL}/auth/partners`).catch(() => ({ data: [] }));
          let partnersData = partnersRes.data || [];
          if (!Array.isArray(partnersData)) {
            partnersData = partnersData.data || partnersData.partners || [];
            if (!Array.isArray(partnersData)) partnersData = [];
          }
          
          for (const partner of partnersData) {
            try {
              const partnerVolRes = await axios.get(`${config.API_BASE_URL}/volunteers/partner-volunteers/${partner._id}`).catch(() => ({ data: [] }));
              let pvData = partnerVolRes.data || [];
              if (!Array.isArray(pvData)) {
                pvData = pvData.volunteers || pvData.data || [];
                if (!Array.isArray(pvData)) pvData = [];
              }
              
              pvData.forEach(pv => {
                // Check if already exists
                const exists = allVolunteers.some(v => String(v._id) === String(pv._id));
                if (!exists && pv._id) {
                  allVolunteers.push({
                    _id: pv._id,
                    id: pv._id,
                    name: pv.name || 'Unknown Volunteer',
                    email: pv.email || '',
                    phone: pv.phone || '',
                    designation: pv.designation || 'Volunteer',
                    source: 'partner',
                    partnerId: partner._id,
                    partnerName: partner.name || partner.clinicName
                  });
                }
              });
              console.log(`✅ Partner volunteers for ${partner.name || partner.clinicName}: ${pvData.length}`);
            } catch (err) {
              console.log(`⚠️ No volunteers for partner ${partner._id}`);
            }
          }
        } catch (err) {
          console.error("Error fetching partner volunteers:", err);
        }
        
      } else if (role === "partner") {
        // 🔥 PARTNER: Fetch ONLY their own partner volunteers
        try {
          const partnerVolRes = await axios.get(`${config.API_BASE_URL}/volunteers/partner-volunteers/${userId}`).catch(() => ({ data: [] }));
          let pvData = partnerVolRes.data || [];
          if (!Array.isArray(pvData)) {
            pvData = pvData.volunteers || pvData.data || [];
            if (!Array.isArray(pvData)) pvData = [];
          }
          
          allVolunteers = pvData.map(pv => ({
            _id: pv._id,
            id: pv._id,
            name: pv.name || 'Unknown Volunteer',
            email: pv.email || '',
            phone: pv.phone || '',
            designation: pv.designation || 'Volunteer',
            source: 'partner',
            partnerId: userId
          }));
          console.log("✅ Partner volunteers loaded:", allVolunteers.length);
        } catch (err) {
          console.error("Error fetching partner volunteers:", err);
        }
      } else {
        // 🔥 OTHER ROLES: Fetch employees only
        try {
          const employeesRes = await axios.get(`${config.API_BASE_URL}/proxy/employees/get-employees`).catch(() => ({ data: [] }));
          const empData = employeesRes.data || [];
          const allEmployees = Array.isArray(empData) ? empData : empData.employees || empData.data || empData.value || [];
          
          const allowedDepts = ["Laboratory Medicine", "Nursing", "Medical"];
          const filteredEmployees = allEmployees.filter(emp => {
            const dept = (emp.department || "").trim();
            return allowedDepts.some(d => d.toLowerCase() === dept.toLowerCase());
          });
          
          allVolunteers = filteredEmployees.map(emp => ({
            _id: emp._id,
            id: emp._id,
            name: emp.name,
            email: emp.email || emp.workEmail || '',
            phone: emp.phone || emp.mobile || '',
            designation: emp.designation || emp.role || 'Staff',
            source: 'employee'
          }));
          console.log("✅ Employees loaded:", filteredEmployees.length);
        } catch (err) {
          console.error("Error fetching employees:", err);
        }
      }
      
      // Filter out already assigned members
      const assignedPartnerId = campDetails?.assignedPartner?.id;
      const assignedVolunteerIds = (campDetails?.volunteers || []).map(v => String(v.id));
      
      const availablePartners = allPartners.filter(p => 
        String(p._id || p.id) !== String(assignedPartnerId)
      );
      
      const availableVolunteers = allVolunteers.filter(v => 
        !assignedVolunteerIds.includes(String(v._id || v.id))
      );
      
      console.log("📊 Available Partners:", availablePartners.length);
      console.log("📊 Available Volunteers:", availableVolunteers.length);
      
      setAvailableMembers({ 
        partners: availablePartners.map(p => ({ 
          id: p._id || p.id, 
          name: p.name, 
          clinicName: p.clinicName || p.organization,
          email: p.email 
        })),
        volunteers: availableVolunteers.map(v => ({ 
          id: v._id || v.id, 
          name: v.name, 
          designation: v.designation || 'Volunteer', 
          email: v.email,
          source: v.source || 'employee'
        }))
      });
      
      if (availablePartners.length > 0) {
        setSelectedAssignPartnerId(availablePartners[0]._id || availablePartners[0].id);
      }
      setSelectedAssignVolunteerIds([]);
      
    } catch (err) {
      console.error("Error fetching candidates:", err);
      alert("Failed to load available members. Please try again.");
      setAvailableMembers({ partners: [], volunteers: [] });
    } finally {
      setLoadingAvailable(false);
    }
  };

  const partnerCanManageVolunteers = useMemo(() => {
    if (role === "admin") return true;
    if (role === "partner" && campDetails?.assignedPartner) {
      const isAssigned = String(campDetails.assignedPartner.id) === String(currentUserId);
      return isAssigned && campDetails.assignedPartner.canManageVolunteers;
    }
    return false;
  }, [role, campDetails, currentUserId]);

  const allMembers = useMemo(() => {
    if (!campDetails) return [];
    const list = [];
    if (campDetails.assignedPartner) {
      list.push(campDetails.assignedPartner);
    }
    if (campDetails.volunteers && campDetails.volunteers.length > 0) {
      list.push(...campDetails.volunteers);
    }
    return list;
  }, [campDetails]);

  const stats = useMemo(() => {
    const totalVolunteers = campDetails?.volunteers?.length || 0;
    const partnerCount = campDetails?.assignedPartner ? 1 : 0;
    const totalMembers = totalVolunteers + partnerCount;
    
    let activeMembers = 0;
    if (campDetails?.assignedPartner && campDetails.assignedPartner.status !== "rejected") {
      activeMembers += 1;
    }
    activeMembers += totalVolunteers;

    return {
      totalMembers,
      partnerCount,
      totalVolunteers,
      activeMembers
    };
  }, [campDetails]);

  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone?.includes(searchQuery);

      const matchesRole =
        roleFilter === "all" || m.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [allMembers, searchQuery, roleFilter]);

  const handleViewProfile = (member) => {
    setSelectedMember(member);
    setShowViewProfileModal(true);
  };

  const handleAssignPartner = async (e) => {
    e.preventDefault();
    if (!selectedAssignPartnerId) {
      alert("Please select a partner first.");
      return;
    }
    try {
      setSubmittingAssign(true);
      const res = await axios.post(`${config.API_BASE_URL}/camp-members/${selectedCampId}/assign-partner`, {
        partnerId: selectedAssignPartnerId
      });
      if (res.data.success) {
        setShowAssignPartnerModal(false);
        fetchCampMembers(selectedCampId);
        alert("Partner assigned successfully!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to assign partner");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleRemovePartner = async () => {
    if (!window.confirm("Are you sure you want to remove the assigned doctor/partner from this camp?")) return;
    try {
      const res = await axios.post(`${config.API_BASE_URL}/camp-members/${selectedCampId}/remove-partner`);
      if (res.data.success) {
        fetchCampMembers(selectedCampId);
        alert("Partner removed successfully!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to remove partner");
    }
  };

  const handleAssignVolunteers = async (e) => {
    e.preventDefault();
    if (selectedAssignVolunteerIds.length === 0) {
      alert("Please select at least one volunteer.");
      return;
    }
    try {
      setSubmittingAssign(true);
      const res = await axios.post(`${config.API_BASE_URL}/camp-members/${selectedCampId}/assign-volunteers`, {
        volunteerIds: selectedAssignVolunteerIds
      });
      if (res.data.success) {
        setShowAssignVolunteersModal(false);
        setSelectedAssignVolunteerIds([]);
        fetchCampMembers(selectedCampId);
        alert("Volunteers assigned successfully!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to assign volunteers");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleRemoveVolunteer = async (volunteerId, volunteerName) => {
    if (!window.confirm(`Are you sure you want to remove volunteer "${volunteerName}" from this camp?`)) return;
    try {
      const res = await axios.post(`${config.API_BASE_URL}/camp-members/${selectedCampId}/remove-volunteer`, {
        volunteerId
      });
      if (res.data.success) {
        fetchCampMembers(selectedCampId);
        alert("Volunteer removed successfully!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to remove volunteer");
    }
  };

  const handleToggleAssignVolunteer = (vId) => {
    setSelectedAssignVolunteerIds(prev => 
      prev.includes(vId) ? prev.filter(id => id !== vId) : [...prev, vId]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getCampStatusClass = (status) => {
    switch (status) {
      case "active":
        return "admin-dash__badge--emerald";
      case "completed":
        return "admin-dash__badge--blue";
      case "cancelled":
        return "admin-dash__badge--rose";
      case "archived":
        return "admin-dash__badge--gray";
      default:
        return "admin-dash__badge--gray";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // 🔥 Helper to get volunteer source badge
  const getVolunteerSourceBadge = (source) => {
    if (source === 'partner') {
      return <span className="ml-1.5 text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">⭐ Partner</span>;
    }
    return <span className="ml-1.5 text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">🏢 Employee</span>;
  };

  return (
    <div className="admin-dash">
      <div className="admin-dash__header">
        <div>
          <h1 className="admin-dash__greeting">
            Camp <span>Members</span>
          </h1>
          <p className="admin-dash__subtitle">
            View and manage doctor and volunteer assignments for BMI health camps.
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="admin-dash__date-pill">
            <FiCalendar />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <button
            onClick={() => navigate(role === "admin" ? "/admin/dashboard" : role === "partner" ? "/doctor" : "/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
          >
            <FiArrowLeft size={18} />
            Dashboard
          </button>
        </div>
      </div>

      {loadingCamps ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <FiActivity className="animate-spin text-indigo-600 text-4xl mb-4" />
          <p className="text-gray-500 font-medium">Loading camps list...</p>
        </div>
      ) : camps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-4">
          <FiAlertCircle size={48} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Camps Available</h3>
          <p className="text-gray-500 max-w-sm mt-1">
            {role === "partner" 
              ? "You do not have any assigned health camps currently." 
              : role === "volunteer" 
                ? "You are not assigned to any camp as a volunteer yet." 
                : "No health camps have been created in the system."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Camp Selection */}
          <div className="admin-dash__card">
            <div className="admin-dash__card-header">
              <h3 className="admin-dash__card-title">Select Health Camp</h3>
              <div className="flex items-center gap-3">
                {campDetails?.camp && (
                  <span className={`admin-dash__badge ${getCampStatusClass(campDetails.camp.status)}`}>
                    Camp: {campDetails.camp.status}
                  </span>
                )}
                {role === "partner" && (
                  <span className="admin-dash__badge admin-dash__badge--indigo">
                    {partnerCanManageVolunteers ? "Can Manage Volunteers" : "Read-Only Member"}
                  </span>
                )}
              </div>
            </div>
            <div className="admin-dash__card-body">
              <select
                value={selectedCampId}
                disabled={role === "volunteer" || role === "employee"}
                onChange={(e) => setSelectedCampId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold text-gray-800 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {camps.map((camp) => (
                  <option key={camp._id} value={camp._id}>
                    {camp.name} ({camp.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="admin-dash__stats">
            <div className="admin-dash__stat">
              <div className="admin-dash__stat-top">
                <span className="admin-dash__stat-label">Total Members</span>
                <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                  <FiUsers />
                </div>
              </div>
              <div className="admin-dash__stat-value">{loadingMembers ? "-" : stats.totalMembers}</div>
              <div className="admin-dash__stat-meta">assigned to camp</div>
            </div>

            <div className="admin-dash__stat">
              <div className="admin-dash__stat-top">
                <span className="admin-dash__stat-label">Partner (Doctor)</span>
                <div className="admin-dash__stat-icon admin-dash__stat-icon--purple">
                  <FiUser />
                </div>
              </div>
              <div className="admin-dash__stat-value">{loadingMembers ? "-" : `${stats.partnerCount}/1`}</div>
              <div className="admin-dash__stat-meta">assigned doctor</div>
            </div>

            <div className="admin-dash__stat">
              <div className="admin-dash__stat-top">
                <span className="admin-dash__stat-label">Volunteers</span>
                <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                  <FiUsers />
                </div>
              </div>
              <div className="admin-dash__stat-value">{loadingMembers ? "-" : stats.totalVolunteers}</div>
              <div className="admin-dash__stat-meta">assigned volunteers</div>
            </div>

            <div className="admin-dash__stat">
              <div className="admin-dash__stat-top">
                <span className="admin-dash__stat-label">Active Members</span>
                <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                  <FiCheckCircle />
                </div>
              </div>
              <div className="admin-dash__stat-value">{loadingMembers ? "-" : stats.activeMembers}</div>
              <div className="admin-dash__stat-meta">currently active</div>
            </div>
          </div>

          {/* Camp Details Card */}
          <div className="admin-dash__card">
            <div className="admin-dash__card-header">
              <h3 className="admin-dash__card-title">
                Camp Details
                {!loadingMembers && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    • {filteredMembers.length} members
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm w-48"
                  />
                </div>

                <div className="flex items-center border border-gray-200 rounded-xl p-0.5 bg-gray-100/50">
                  <button
                    onClick={() => setRoleFilter("all")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      roleFilter === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setRoleFilter("partner")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      roleFilter === "partner" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Partners
                  </button>
                  <button
                    onClick={() => setRoleFilter("volunteer")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      roleFilter === "volunteer" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Volunteers
                  </button>
                </div>

                {role === "admin" && (
                  <button
                    onClick={() => {
                      fetchAvailableMembers();
                      setShowAssignPartnerModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-100 active:scale-95"
                  >
                    <FiPlus size={14} /> Assign Partner
                  </button>
                )}
                
                {(role === "admin" || partnerCanManageVolunteers) && (
                  <button
                    onClick={() => {
                      fetchAvailableMembers();
                      setShowAssignVolunteersModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    <FiPlus size={14} /> Assign Volunteers
                  </button>
                )}
              </div>
            </div>

            <div className="admin-dash__card-body p-0">
              {loadingMembers ? (
                <div className="py-20 text-center text-gray-400">
                  <FiActivity className="animate-spin text-indigo-600 text-3xl mx-auto mb-3" />
                  Loading camp members data...
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-16 text-center text-gray-400 px-4">
                  <FiUsers size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-600 text-sm">No members assigned to this camp yet</p>
                  <p className="text-xs text-gray-400 mt-1">Use the buttons above to assign a partner or volunteers.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/20 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="p-4 pl-6">Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Assigned Date</th>
                        <th className="p-4 text-center pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMembers.map((member) => (
                        <tr key={`${member.role}_${member.id}`} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${
                                member.role === "partner" 
                                  ? "bg-purple-100 text-purple-700" 
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {getInitials(member.name)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                                {member.role === "partner" && member.clinicName && (
                                  <p className="text-xs text-gray-400">{member.clinicName}</p>
                                )}
                                {member.role === "volunteer" && member.source && (
                                  <span className="text-[8px] text-gray-400">
                                    {member.source === 'partner' ? '⭐ Partner Volunteer' : '🏢 Employee'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`admin-dash__badge ${
                              member.role === "partner" 
                                ? "admin-dash__badge--purple" 
                                : "admin-dash__badge--emerald"
                            }`}>
                              {member.role === "partner" ? "Partner (Doctor)" : "Volunteer"}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-600 truncate max-w-[150px]">
                            {member.email}
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-600">
                            {member.phone || "-"}
                          </td>
                          <td className="p-4">
                            <span className={`admin-dash__badge ${
                              member.role === "partner" 
                                ? (member.status === "approved" || member.status === "accepted" 
                                    ? "admin-dash__badge--emerald" 
                                    : "admin-dash__badge--amber")
                                : "admin-dash__badge--emerald"
                            }`}>
                              {member.role === "partner" ? member.status : "active"}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-500">
                            {formatDate(member.assignedDate)}
                          </td>
                          <td className="p-4 text-center pr-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewProfile(member)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="View Profile Details"
                              >
                                <FiEye size={15} />
                              </button>

                              {member.role === "partner" && role === "admin" && (
                                <button
                                  onClick={handleRemovePartner}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remove Partner"
                                >
                                  <FiUserMinus size={15} />
                                </button>
                              )}

                              {member.role === "volunteer" && (role === "admin" || partnerCanManageVolunteers) && (
                                <button
                                  onClick={() => handleRemoveVolunteer(member.id, member.name)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remove Volunteer"
                                >
                                  <FiTrash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewProfileModal && selectedMember && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Member Profile</h3>
                <button
                  onClick={() => setShowViewProfileModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className={`w-20 h-20 rounded-full font-bold text-2xl mx-auto flex items-center justify-center shadow-sm ${
                selectedMember.role === "partner" 
                  ? "bg-purple-100 text-purple-700" 
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {getInitials(selectedMember.name)}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mt-4">{selectedMember.name}</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase mt-1 tracking-wider ${
                selectedMember.role === "partner"
                  ? "bg-purple-50 text-purple-600 border border-purple-100"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}>
                {selectedMember.role === "partner" ? "Partner (Doctor)" : "Volunteer"}
              </span>

              <div className="border-t border-gray-100 mt-6 pt-5 space-y-4 text-left text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email Address</span>
                    <span className="font-medium text-gray-800 block truncate">{selectedMember.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiPhone className="text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Phone Contact</span>
                    <span className="font-medium text-gray-800 block">{selectedMember.phone || "No phone listed"}</span>
                  </div>
                </div>

                {selectedMember.role === "partner" && selectedMember.clinicName && (
                  <div className="flex items-center gap-3">
                    <FiFileText className="text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Center / Clinic</span>
                      <span className="font-medium text-gray-800 block">{selectedMember.clinicName}</span>
                    </div>
                  </div>
                )}

                {selectedMember.address && (
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Address</span>
                      <span className="font-medium text-gray-700 block text-xs leading-relaxed">{selectedMember.address}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <FiCalendar className="text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Assigned On</span>
                    <span className="font-medium text-gray-800 block">{formatDate(selectedMember.assignedDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setShowViewProfileModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-100 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Partner Modal */}
      {showAssignPartnerModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Assign Partner (Doctor)</h3>
                <button
                  onClick={() => setShowAssignPartnerModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
            {loadingAvailable ? (
              <div className="py-20 text-center text-gray-400">
                <FiActivity className="animate-spin text-indigo-600 text-3xl mx-auto mb-2" />
                Loading candidates...
              </div>
            ) : availableMembers.partners.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="font-semibold text-gray-600">No Partners Available</p>
                <p className="text-xs text-gray-400 mt-1">All registered partners are already assigned or none exist.</p>
                <button
                  type="button"
                  onClick={() => setShowAssignPartnerModal(false)}
                  className="mt-4 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignPartner}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Choose Partner (Doctor) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedAssignPartnerId}
                      onChange={(e) => setSelectedAssignPartnerId(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-semibold text-gray-800"
                    >
                      {availableMembers.partners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.clinicName || "No Clinic"}) - {p.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => setShowAssignPartnerModal(false)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAssign}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-100 disabled:opacity-50 transition cursor-pointer"
                  >
                    {submittingAssign ? "Assigning..." : "Assign Partner"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Assign Volunteers Modal - SHOWS ALL VOLUNTEERS FOR ADMIN, PARTNER-SPECIFIC FOR PARTNER */}
      {showAssignVolunteersModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {role === "admin" ? "Assign Volunteers (All)" : "Assign Volunteers (Your Partner Volunteers)"}
                </h3>
                <button
                  onClick={() => setShowAssignVolunteersModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <FiX size={18} />
                </button>
              </div>
              {role === "admin" && (
                <p className="text-xs text-indigo-200 mt-1">Showing all employees + partner volunteers</p>
              )}
              {role === "partner" && (
                <p className="text-xs text-indigo-200 mt-1">Showing volunteers created by you</p>
              )}
            </div>
            {loadingAvailable ? (
              <div className="py-20 text-center text-gray-400">
                <FiActivity className="animate-spin text-indigo-600 text-3xl mx-auto mb-2" />
                Loading volunteers...
              </div>
            ) : availableMembers.volunteers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="font-semibold text-gray-600">No Volunteers Available</p>
                <p className="text-xs text-gray-400 mt-1">
                  {role === "admin" 
                    ? "No employees or partner volunteers available to assign." 
                    : "You have not created any volunteers yet. Add volunteers from your dashboard."}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAssignVolunteersModal(false)}
                  className="mt-4 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignVolunteers}>
                <div className="p-5 space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Select Volunteers <span className="text-red-500">*</span>
                    {role === "admin" && (
                      <span className="text-xs font-normal text-gray-400 ml-2">
                        (Employees + Partner Volunteers)
                      </span>
                    )}
                  </label>
                  <div className="border border-gray-200 rounded-xl p-3 max-h-56 overflow-y-auto space-y-2.5 bg-gray-50/50">
                    {availableMembers.volunteers.map((v) => (
                      <label
                        key={v.id}
                        className="flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-100 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssignVolunteerIds.includes(v.id)}
                          onChange={() => handleToggleAssignVolunteer(v.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                        />
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{v.name}</span>
                            {v.source === 'partner' && (
                              <span className="text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">⭐ Partner</span>
                            )}
                            {v.source === 'employee' && (
                              <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">🏢 Employee</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 font-semibold mt-0.5">
                            {v.designation || "Volunteer"} | {v.email}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 italic">
                      {selectedAssignVolunteerIds.length} volunteer(s) selected
                    </p>
                    {role === "admin" && (
                      <p className="text-[8px] text-gray-400">
                        Showing {availableMembers.volunteers.filter(v => v.source === 'employee').length} employees + {availableMembers.volunteers.filter(v => v.source === 'partner').length} partner volunteers
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => setShowAssignVolunteersModal(false)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAssign}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-100 disabled:opacity-50 transition cursor-pointer"
                  >
                    {submittingAssign ? "Assigning..." : `Assign (${selectedAssignVolunteerIds.length})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampMembers;