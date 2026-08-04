import axios from "axios";
import {
    FiSearch,
    FiUserCheck,
    FiMail,
    FiPhone,
    FiHome,
    FiCalendar,
    FiEye,
    FiEdit,
    FiMessageCircle,
    FiMapPin,
    FiX,
    FiSave,
    FiUser,
    FiBriefcase,
    FiTrash2,
} from "react-icons/fi";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import config from "../config";
import "./Dashboard.css";

const Partners = () => {
    const navigate = useNavigate();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // TABLE SEARCH STATES
    const [filterType, setFilterType] = useState("name");
    const [tableSearchQuery, setTableSearchQuery] = useState("");
    
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // 🔥 NEW
    
    // EDIT FORM STATES
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        clinicName: '',
        specialization: '',
        address: '',
        bio: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // 🔥 NEW

    // REFS to track which input is focused
    const activeFieldRef = useRef(null);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${config.API_BASE_URL}/auth/partners`);
            setPartners(res.data || []);
        } catch (err) {
            console.error("Failed to fetch partners:", err);
        } finally {
            setLoading(false);
        }
    };

    // SCROLL LOCK
    const lockScroll = () => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    };

    const unlockScroll = () => {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.width = 'auto';
    };

    // Filter Options
    const filterOptions = [
        { value: "name", label: "Name" },
        { value: "email", label: "Email" },
        { value: "center", label: "Center" },
        { value: "phone", label: "Phone" }
    ];

    // Filter Partners
    const filteredPartners = useMemo(() => {
        if (!tableSearchQuery.trim()) return partners;
        const searchLower = tableSearchQuery.toLowerCase();
        return partners.filter((p) => {
            switch(filterType) {
                case "name":
                    return p.name?.toLowerCase().includes(searchLower);
                case "email":
                    return p.email?.toLowerCase().includes(searchLower);
                case "center":
                    return p.clinicName?.toLowerCase().includes(searchLower);
                case "phone":
                    return p.mobile?.toLowerCase().includes(searchLower);
                default:
                    return p.name?.toLowerCase().includes(searchLower);
            }
        });
    }, [partners, tableSearchQuery, filterType]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle Edit Partner
    const handleEditPartner = useCallback((partner) => {
        lockScroll();
        setSelectedPartner(partner);
        setEditFormData({
            name: partner.name || '',
            email: partner.email || '',
            mobile: partner.mobile || '',
            clinicName: partner.clinicName || '',
            specialization: partner.specialization || '',
            address: partner.address || '',
            bio: partner.bio || '',
            canManageVolunteers: partner.canManageVolunteers !== false
        });
        setShowEditModal(true);
        setUpdateMessage('');
        setUpdateSuccess(false);
    }, []);

    // Handle View Partner
    const handleViewPartner = useCallback((partner) => {
        lockScroll();
        setSelectedPartner(partner);
        setShowViewModal(true);
    }, []);

    // 🔥 Handle Delete Partner - Open Delete Modal
    const handleDeletePartner = useCallback((partner) => {
        lockScroll();
        setSelectedPartner(partner);
        setShowDeleteModal(true);
    }, []);

    // 🔥 Confirm Delete Partner
    const confirmDeletePartner = async () => {
        if (!selectedPartner) {
            alert("No partner selected!");
            return;
        }

        setIsDeleting(true);

        try {
            const response = await axios.delete(
                `${config.API_BASE_URL}/auth/partner/${selectedPartner._id}`
            );

            console.log("Delete response:", response);

            if (response.data) {
                alert("Partner deleted successfully! ✅");
                await fetchPartners();
                closeDeleteModal();
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert(
                err.response?.data?.message || 
                err.response?.data?.error || 
                'Failed to delete partner. Please try again.'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    // Input change handler with focus preservation
    const handleEditInputChange = useCallback((e) => {
        const { name, value } = e.target;
        activeFieldRef.current = name;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // On blur, clear active field
    const handleInputBlur = useCallback(() => {
        activeFieldRef.current = null;
    }, []);

    // On focus, store field name
    const handleInputFocus = useCallback((e) => {
        activeFieldRef.current = e.target.name;
    }, []);

    // Handle Update Partner
    const handleUpdatePartner = async () => {
        if (!selectedPartner) {
            alert("No partner selected!");
            return;
        }

        setIsUpdating(true);
        setUpdateMessage('');
        setUpdateSuccess(false);

        try {
            const updateData = {
                name: editFormData.name,
                email: editFormData.email,
                mobile: editFormData.mobile || '',
                clinicName: editFormData.clinicName,
                specialization: editFormData.specialization || '',
                address: editFormData.address || '',
                bio: editFormData.bio || '',
                canManageVolunteers: editFormData.canManageVolunteers
            };

            const response = await axios.put(
                `${config.API_BASE_URL}/auth/update-partner/${selectedPartner._id}`,
                updateData
            );

            if (response.data) {
                setUpdateSuccess(true);
                setUpdateMessage('Partner updated successfully! ✅');
                await fetchPartners();
                setTimeout(() => closeEditModal(), 1500);
            }
        } catch (err) {
            console.error("Update error:", err);
            setUpdateSuccess(false);
            setUpdateMessage(
                err.response?.data?.message || 
                err.response?.data?.error || 
                'Failed to update partner. Please try again.'
            );
        } finally {
            setIsUpdating(false);
        }
    };

    // Close Edit Modal
    const closeEditModal = () => {
        unlockScroll();
        setShowEditModal(false);
        setSelectedPartner(null);
        setEditFormData({
            name: '',
            email: '',
            mobile: '',
            clinicName: '',
            specialization: '',
            address: '',
            bio: '',
            canManageVolunteers: true
        });
        setUpdateMessage('');
        setUpdateSuccess(false);
        activeFieldRef.current = null;
    };

    // Close View Modal
    const closeViewModal = () => {
        unlockScroll();
        setShowViewModal(false);
        setSelectedPartner(null);
    };

    // 🔥 Close Delete Modal
    const closeDeleteModal = () => {
        unlockScroll();
        setShowDeleteModal(false);
        setSelectedPartner(null);
        setIsDeleting(false);
    };

    // Handle WhatsApp
    const handleWhatsAppChat = (mobile) => {
        if (mobile) {
            const cleanPhone = String(mobile).replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        }
    };

    // ============ DELETE MODAL ============
    const DeletePartnerModal = useMemo(() => {
        if (!showDeleteModal || !selectedPartner) return null;

        return ReactDOM.createPortal(
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) {
                        closeDeleteModal();
                    }
                }}
            >
                <div 
                    className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-t-3xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <FiTrash2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Delete Partner</h3>
                                <p className="text-sm text-red-100">This action cannot be undone</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-gray-700 text-center py-4">
                            Are you sure you want to delete <br />
                            <strong className="text-red-600 text-lg">{selectedPartner.name}</strong>?
                        </p>
                        <p className="text-xs text-gray-400 text-center">
                            Partner ID: {selectedPartner._id}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="flex-1 min-w-[120px] py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition shadow-sm active:scale-[0.98]"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeletePartner}
                                disabled={isDeleting}
                                className="flex-1 min-w-[120px] py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 size={16} className="inline mr-2" />
                                        Delete Partner
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }, [showDeleteModal, selectedPartner, isDeleting]);

    // ============ EDIT MODAL ============
    const EditPartnerModal = useMemo(() => {
        if (!showEditModal || !selectedPartner) return null;

        return ReactDOM.createPortal(
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) {
                        closeEditModal();
                    }
                }}
            >
                <div 
                    className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white sticky top-0 z-10">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <FiEdit size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Edit Partner</h3>
                                    <p className="text-sm text-purple-100">Update partner information</p>
                                    <p className="text-xs text-purple-200 mt-1">
                                        Editing: <strong>{selectedPartner.name}</strong>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeEditModal}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-6">
                        {updateMessage && (
                            <div className={`p-4 rounded-xl text-sm font-medium ${
                                updateSuccess 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                                {updateMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    <FiUser className="inline mr-1" size={14} />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditInputChange}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    <FiMail className="inline mr-1" size={14} />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditInputChange}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    <FiPhone className="inline mr-1" size={14} />
                                    Mobile *
                                </label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={editFormData.mobile}
                                    onChange={handleEditInputChange}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                                    placeholder="Enter mobile number"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    <FiBriefcase className="inline mr-1" size={14} />
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={editFormData.specialization}
                                    onChange={handleEditInputChange}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                                    placeholder="e.g., Cardiologist"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                <FiHome className="inline mr-1" size={14} />
                                Center Name *
                            </label>
                            <input
                                type="text"
                                name="clinicName"
                                value={editFormData.clinicName}
                                onChange={handleEditInputChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                                placeholder="Enter center name"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                            <input
                                type="checkbox"
                                name="canManageVolunteers"
                                id="canManageVolunteers"
                                checked={editFormData.canManageVolunteers}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, canManageVolunteers: e.target.checked }))}
                                className="h-4.5 w-4.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <label htmlFor="canManageVolunteers" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                                Enable Volunteer Management (Allow Partner to assign/remove volunteers)
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                <FiMapPin className="inline mr-1" size={14} />
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={editFormData.address}
                                onChange={handleEditInputChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                rows="3"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition resize-none"
                                placeholder="Enter clinic address"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                About / Bio
                            </label>
                            <textarea
                                name="bio"
                                value={editFormData.bio}
                                onChange={handleEditInputChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                rows="3"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition resize-none"
                                placeholder="Enter bio or description"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="flex-1 min-w-[120px] py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition shadow-sm active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdatePartner}
                                disabled={isUpdating}
                                className="flex-1 min-w-[120px] py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FiSave size={16} className="inline mr-2" />
                                        Update Partner
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }, [showEditModal, selectedPartner, editFormData, updateMessage, updateSuccess, isUpdating, handleEditInputChange, handleInputFocus, handleInputBlur]);

    // ============ VIEW MODAL ============
    const ViewPartnerModal = useMemo(() => {
        if (!showViewModal || !selectedPartner) return null;

        const partner = selectedPartner;

        return ReactDOM.createPortal(
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        closeViewModal();
                    }
                }}
            >
                <div 
                    className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white sticky top-0 z-10">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white backdrop-blur-sm">
                                    {partner.name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{partner.name || 'N/A'}</h3>
                                    <p className="text-sm text-purple-100">{partner.specialization || 'Healthcare Professional'}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeViewModal}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                <p className="mt-1 font-medium text-gray-700 flex items-center gap-2 break-all">
                                    <FiMail className="text-gray-400 flex-shrink-0" size={16} />
                                    <span className="break-all">{partner.email || 'N/A'}</span>
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</p>
                                <p className="mt-1 font-medium text-gray-700 flex items-center gap-2">
                                    <FiPhone className="text-gray-400 flex-shrink-0" size={16} />
                                    <span>{partner.mobile || 'N/A'}</span>
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Center</p>
                                <p className="mt-1 font-medium text-gray-700 flex items-center gap-2">
                                    <FiHome className="text-gray-400 flex-shrink-0" size={16} />
                                    {partner.clinicName || 'N/A'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</p>
                                <p className="mt-1 font-medium text-gray-700 flex items-center gap-2">
                                    <FiCalendar className="text-gray-400 flex-shrink-0" size={16} />
                                    {formatDate(partner.createdAt)}
                                </p>
                            </div>
                        </div>

                        {partner.address && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                <p className="mt-1 text-gray-700 flex items-start gap-2">
                                    <FiMapPin className="text-gray-400 flex-shrink-0 mt-1" size={16} />
                                    <span className="whitespace-pre-line">{partner.address}</span>
                                </p>
                            </div>
                        )}

                        {partner.bio && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">About</p>
                                <p className="mt-1 text-gray-700">{partner.bio}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    closeViewModal();
                                    setTimeout(() => handleEditPartner(partner), 100);
                                }}
                                className="flex-1 min-w-[120px] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm active:scale-[0.98]"
                            >
                                <FiEdit size={16} className="inline mr-2" />
                                Edit Partner
                            </button>
                            <button
                                onClick={() => {
                                    closeViewModal();
                                    setTimeout(() => handleDeletePartner(partner), 100);
                                }}
                                className="flex-1 min-w-[120px] py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-sm active:scale-[0.98]"
                            >
                                <FiTrash2 size={16} className="inline mr-2" />
                                Delete
                            </button>
                            {partner.mobile && (
                                <button
                                    onClick={() => handleWhatsAppChat(partner.mobile)}
                                    className="flex-1 min-w-[120px] py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-sm active:scale-[0.98]"
                                >
                                    <FiMessageCircle size={16} className="inline mr-2" />
                                    WhatsApp
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }, [showViewModal, selectedPartner, handleEditPartner, handleDeletePartner]);

    return (
        <div className="admin-dash">
            {/* Header */}
            <div className="admin-dash__header">
                <div>
                    <h1 className="admin-dash__greeting">
                        Partners <span>Dashboard</span>
                    </h1>
                    <p className="admin-dash__subtitle">
                        Manage and view all registered healthcare partners.
                    </p>
                </div>
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
            </div>

            <div className="space-y-10">
                <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                        <h3 className="admin-dash__card-title">Registered Partners</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setTableSearchQuery("");
                                    }}
                                    className="px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                                >
                                    {filterOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative partner-search-container w-full sm:w-64">
                                <FiSearch
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                                />
                                <input
                                    type="text"
                                    placeholder={`Search by ${filterOptions.find(o => o.value === filterType)?.label || 'Name'}...`}
                                    value={tableSearchQuery}
                                    onChange={(e) => setTableSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="admin-dash__card-body p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                <p className="text-gray-500">Loading partners...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Name</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Email</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Center</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Mobile</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Joined</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPartners.length > 0 ? (
                                            filteredPartners.map((partner) => (
                                                <tr key={partner._id} className="transition-colors group hover:bg-gray-50/80">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-violet-700 rounded-full bg-gradient-to-br from-violet-100 to-purple-100">
                                                                {partner.name?.charAt(0)?.toUpperCase() || 'P'}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{partner.name || 'N/A'}</p>
                                                                <p className="text-xs text-gray-500">{partner.specialization || 'Healthcare Professional'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm font-medium text-gray-700">{partner.email || "N/A"}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">
                                                            {partner.clinicName || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {partner.mobile || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-gray-500">{formatDate(partner.createdAt)}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleViewPartner(partner)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                            >
                                                                <FiEye size={14} /> View
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditPartner(partner)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                            >
                                                                <FiEdit size={14} /> Edit
                                                            </button>
                                                            {/* 🔥 DELETE BUTTON IN TABLE */}
                                                            <button
                                                                onClick={() => handleDeletePartner(partner)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                                            >
                                                                <FiTrash2 size={14} /> Delete
                                                            </button>
                                                            {partner.mobile && (
                                                                <button
                                                                    onClick={() => handleWhatsAppChat(partner.mobile)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                                                >
                                                                    <FiMessageCircle size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                                        <FiUserCheck size={48} className="opacity-20" />
                                                        <p className="text-lg font-medium">No partners found</p>
                                                        <p className="text-sm">Try adjusting your search.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {EditPartnerModal}
            {ViewPartnerModal}
            {DeletePartnerModal}
        </div>
    );
};

export default Partners;