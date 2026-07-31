import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiCheckCircle,
  FiArrowLeft,
  FiX,
  FiActivity,
  FiUser
} from "react-icons/fi";
import config from "../config";
import "./Dashboard.css";

const AdminTeams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leadId: "",
    memberIds: [],
    status: "active"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, candidatesRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/teams`),
        axios.get(`${config.API_BASE_URL}/teams/candidates`)
      ]);

      if (teamsRes.data && teamsRes.data.data) {
        setTeams(teamsRes.data.data);
      }
      if (candidatesRes.data && candidatesRes.data.data) {
        setCandidates(candidatesRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching teams data:", error);
      alert("Failed to fetch teams data.");
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const activeTeams = teams.filter((t) => t.status === "active").length;
    const totalMembers = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
    return { totalTeams, activeTeams, totalMembers };
  }, [teams]);

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.lead?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        statusFilter === "all" || team.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teams, searchQuery, statusFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      leadId: "",
      memberIds: [],
      status: "active"
    });
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || "",
      leadId: team.lead?.id || "",
      memberIds: team.members?.map((m) => m.id) || [],
      status: team.status || "active"
    });
    setShowEditModal(true);
  };

  // Handle Form Change
  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Multi-Select Members
  const handleToggleMember = (candidateId) => {
    const isSelected = formData.memberIds.includes(candidateId);
    if (isSelected) {
      setFormData({
        ...formData,
        memberIds: formData.memberIds.filter((id) => id !== candidateId)
      });
    } else {
      setFormData({
        ...formData,
        memberIds: [...formData.memberIds, candidateId]
      });
    }
  };

  // Process Lead and Members Payload
  const getPayload = () => {
    const selectedLead = candidates.find((c) => c.id === formData.leadId);
    if (!selectedLead) {
      alert("Please select a valid Team Lead");
      return null;
    }

    const leadPayload = {
      id: selectedLead.id,
      name: selectedLead.name,
      role: selectedLead.role
    };

    const membersPayload = formData.memberIds
      .map((mId) => {
        const c = candidates.find((cand) => cand.id === mId);
        return c ? { id: c.id, name: c.name, role: c.role } : null;
      })
      .filter(Boolean);

    return {
      name: formData.name.trim(),
      description: formData.description.trim(),
      lead: leadPayload,
      members: membersPayload,
      status: formData.status
    };
  };

  // Create Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const payload = getPayload();
    if (!payload) return;

    try {
      const res = await axios.post(`${config.API_BASE_URL}/teams/create`, payload);
      if (res.data.success) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error creating team:", error);
      alert(error.response?.data?.message || "Failed to create team");
    }
  };

  // Edit Team
  const handleEditTeam = async (e) => {
    e.preventDefault();
    const payload = getPayload();
    if (!payload) return;

    try {
      const res = await axios.put(
        `${config.API_BASE_URL}/teams/update/${selectedTeam._id}`,
        payload
      );
      if (res.data.success) {
        setShowEditModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating team:", error);
      alert(error.response?.data?.message || "Failed to update team");
    }
  };

  // Delete Team
  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      const res = await axios.delete(`${config.API_BASE_URL}/teams/delete/${id}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team");
    }
  };

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Get Initials Helper
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <FiUsers className="text-indigo-600 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-800">Team Management</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage teams for better collaboration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Teams */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Teams
            </span>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-2">
              {stats.totalTeams}
            </h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FiUsers size={24} />
          </div>
        </div>

        {/* Active Teams */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Active Teams
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">
              {stats.activeTeams}
            </h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <FiCheckCircle size={24} />
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Members
            </span>
            <h3 className="text-3xl font-extrabold text-indigo-500 mt-2">
              {stats.totalMembers}
            </h3>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <FiUsers size={24} />
          </div>
        </div>
      </div>

      {/* Filters & Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex flex-1 w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm text-gray-600 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-750 text-white rounded-xl font-bold shadow-md shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
        >
          <FiPlus /> Create Team
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FiUsers className="text-indigo-500" /> All Teams
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                {filteredTeams.length}
              </span>
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              {filteredTeams.length} team(s) available
            </p>
          </div>
          <button
            onClick={fetchData}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <FiActivity className="animate-spin text-indigo-600 text-3xl mx-auto mb-3" />
            Loading teams data...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiUsers size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-lg">No teams found</p>
            <p className="text-sm mt-1">Try creating a team or adjusting your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Team Name</th>
                  <th className="p-4">Team Lead</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeams.map((team) => (
                  <tr key={team._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white font-bold text-sm flex items-center justify-center">
                          {getInitials(team.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{team.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5 max-w-xs truncate">
                            {team.description || team.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                          {getInitials(team.lead?.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">
                            {team.lead?.name}
                          </p>
                          <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold uppercase">
                            {team.lead?.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                        <FiUsers size={14} className="text-gray-400" />
                        {team.members?.length || 0} members
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          team.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {team.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-500">
                      {formatDate(team.createdAt)}
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(team)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Team"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Team"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg">Create New Team</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Team Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleTextChange}
                    placeholder="e.g. Nursing Team, Admin Volunteers"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleTextChange}
                    placeholder="Describe the purpose or responsibilities of this team..."
                    rows="2"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm resize-none"
                  />
                </div>

                {/* Lead Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Select Team Lead <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    name="leadId"
                    value={formData.leadId}
                    onChange={handleTextChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                  >
                    <option value="">-- Choose Team Lead --</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role.toUpperCase()}) - {c.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Members Checklist */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Select Team Members
                  </label>
                  <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                    {candidates.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No candidates available</p>
                    ) : (
                      candidates.map((c) => (
                        <label
                          key={c.id}
                          className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={formData.memberIds.includes(c.id)}
                            onChange={() => handleToggleMember(c.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{c.name}</span>
                            <span className="text-[10px] text-gray-400">
                              {c.role.toUpperCase()} | {c.email}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleTextChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg">Edit Team Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditTeam}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Team Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleTextChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleTextChange}
                    rows="2"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm resize-none"
                  />
                </div>

                {/* Lead Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Select Team Lead <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    name="leadId"
                    value={formData.leadId}
                    onChange={handleTextChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                  >
                    <option value="">-- Choose Team Lead --</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role.toUpperCase()}) - {c.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Members Checklist */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Select Team Members
                  </label>
                  <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                    {candidates.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={formData.memberIds.includes(c.id)}
                          onChange={() => handleToggleMember(c.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{c.name}</span>
                          <span className="text-[10px] text-gray-400">
                            {c.role.toUpperCase()} | {c.email}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleTextChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeams;
