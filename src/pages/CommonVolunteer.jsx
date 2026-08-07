import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Phone,
  Mail,
  Calendar,
  MapPin,
  CheckCircle2,
  Trash2,
  Printer,
  Eye,
  X, ArrowLeft,
  Search,
  Download,
  Building,
  ShieldCheck,
  Clock
} from 'lucide-react';
import "./Dashboard.css";
import axios from 'axios';
import config from '../config';

function CommonVolunteer() {
  const [volunteers, setVolunteers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampFilter, setSelectedCampFilter] = useState('All');
  const [selectedVolunteerSlip, setSelectedVolunteerSlip] = useState(null);

  const loadVolunteers = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/common-volunteers`);
      const rawList = Array.isArray(res.data)
        ? res.data
        : (res.data && Array.isArray(res.data.volunteers) ? res.data.volunteers : null);

      if (rawList) {
        const normalized = rawList.map(v => ({
          ...v,
          id: v.id || v._id,
        }));
        setVolunteers(normalized);
        try {
          localStorage.setItem('common_volunteers', JSON.stringify(normalized));
        } catch (e) {
          console.error('Error updating localStorage cache:', e);
        }
        return;
      }
    } catch (err) {
      console.error('Error fetching volunteers from backend, falling back to localStorage:', err);
      try {
        const storedStr = localStorage.getItem('common_volunteers');
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          if (Array.isArray(parsed)) {
            setVolunteers(parsed.map(v => ({ ...v, id: v.id || v._id })));
            return;
          }
        }
      } catch (e) {
        console.error('Error loading volunteers from localStorage:', e);
      }
    }
    setVolunteers([]);
  };

  useEffect(() => {
    loadVolunteers();

    const handleStorageChange = () => {
      loadVolunteers();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDeleteVolunteer = async (id) => {
    try {
      await axios.delete(`${config.API_BASE_URL}/common-volunteers/${id}`);
    } catch (err) {
      console.error('Error deleting from backend, falling back to localStorage:', err);
    }
    const updated = volunteers.filter(v => v.id !== id && v._id !== id);
    setVolunteers(updated);
    try {
      localStorage.setItem('common_volunteers', JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating localStorage:', e);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'TBD' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return 'Just now';
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Unique camp names for filter
  const campNames = ['All', ...Array.from(new Set(volunteers.map(v => v.campName).filter(Boolean)))];

  // Filtered volunteers
  const filteredVolunteers = volunteers.filter(v => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (v.name || '').toLowerCase().includes(q);
    const phoneMatch = (v.phone || '').toLowerCase().includes(q);
    const campMatch = (v.campName || '').toLowerCase().includes(q) || (v.campLocation || '').toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || phoneMatch || campMatch;

    const matchesCamp = selectedCampFilter === 'All' || v.campName === selectedCampFilter;

    return matchesSearch && matchesCamp;
  });

  const getInitials = (name) => {
    if (!name) return 'V';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const exportCSV = () => {
    const headers = ['ID,Name,Phone,Email,Camp Name,Location,Camp Date,Registered At,Status'];
    const rows = filteredVolunteers.map(v => 
      `"${v.id}","${v.name}","${v.phone}","${v.email}","${v.campName}","${v.campLocation}","${formatDate(v.campDate)}","${formatTimestamp(v.registeredAt)}","${v.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Common_Volunteers_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-dash pb-20">
      
      {/* Header */}
      <div className="admin-dash__header">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Return to Landing Page"
          >
            <ArrowLeft className="h-4 w-4 text-indigo-600" />
          </Link>
          <div>
            <h1 className="admin-dash__greeting">
              Common Camp <span>Volunteers</span>
            </h1>
            <p className="admin-dash__subtitle">
              Manage and view all registered healthcare camp volunteers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-xs"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            <span>Export CSV</span>
          </button>
          
          <div className="admin-dash__date-pill">
            <Calendar className="h-4 w-4 text-indigo-600" />
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
      </div>

      <div className="space-y-10">
        
        {/* Metric Cards Banner */}
        <div className="admin-dash__stats">
          
          <div className="admin-dash__stat">
            <div className="admin-dash__stat-top">
              <span className="admin-dash__stat-label">Total Volunteers</span>
              <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="admin-dash__stat-value">{volunteers.length}</div>
            <div className="admin-dash__stat-meta">Active across drives</div>
          </div>

          <div className="admin-dash__stat">
            <div className="admin-dash__stat-top">
              <span className="admin-dash__stat-label">Camps Covered</span>
              <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                <Building className="h-5 w-5" />
              </div>
            </div>
            <div className="admin-dash__stat-value">{campNames.length - 1 || 0}</div>
            <div className="admin-dash__stat-meta">Community locations</div>
          </div>

          <div className="admin-dash__stat">
            <div className="admin-dash__stat-top">
              <span className="admin-dash__stat-label">Verification Rate</span>
              <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="admin-dash__stat-value">100%</div>
            <div className="admin-dash__stat-meta">Verified entries</div>
          </div>

          <div className="admin-dash__stat">
            <div className="admin-dash__stat-top">
              <span className="admin-dash__stat-label">Latest Registration</span>
              <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="admin-dash__stat-value font-semibold text-lg line-clamp-1" style={{ minHeight: '35px', display: 'flex', alignItems: 'center' }}>
              {volunteers.length > 0 ? volunteers[0].name : 'None'}
            </div>
            <div className="admin-dash__stat-meta">
              {volunteers.length > 0 ? formatTimestamp(volunteers[0].registeredAt) : '-'}
            </div>
          </div>

        </div>

        {/* Volunteers Table Card */}
        <div className="admin-dash__card">
          <div className="admin-dash__card-header">
            <h3 className="admin-dash__card-title">Registered Volunteers</h3>
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Camp Filter Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCampFilter}
                  onChange={(e) => setSelectedCampFilter(e.target.value)}
                  className="px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white font-medium text-gray-700"
                >
                  {campNames.map(cName => (
                    <option key={cName} value={cName}>{cName === 'All' ? 'All Camps' : cName}</option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="relative partner-search-container w-full sm:w-64">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search by name, phone or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

            </div>
          </div>

          <div className="admin-dash__card-body p-0">
            {filteredVolunteers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
                <Users size={48} className="opacity-20" />
                <p className="text-lg font-medium">No volunteers found</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Volunteer Profile</th>
                      <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Contact Details</th>
                      <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Assigned Health Camp</th>
                      <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp Location</th>
                      <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Registered On</th>
                      <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase text-center">Status</th>
                      <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVolunteers.map((vol) => (
                      <tr key={vol.id} className="transition-colors group hover:bg-gray-50/80">
                        
                        {/* Profile Info */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-violet-700 rounded-full bg-gradient-to-br from-violet-100 to-purple-100">
                              {getInitials(vol.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{vol.name}</p>
                              <p className="text-xs text-gray-500">{vol.role || 'Camp Volunteer'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contacts */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              {vol.phone}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              {vol.email || 'N/A'}
                            </p>
                          </div>
                        </td>

                        {/* Health Camp */}
                        <td className="p-4">
                          <p className="font-semibold text-gray-900 max-w-xs">{vol.campName}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(vol.campDate)}
                          </p>
                        </td>

                        {/* Location */}
                        <td className="p-4 max-w-xs">
                          <p className="text-sm text-gray-700 flex items-start gap-1 font-medium">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{vol.campLocation}</span>
                          </p>
                        </td>

                        {/* Date Registered */}
                        <td className="p-4 text-sm text-gray-500">
                          {formatTimestamp(vol.registeredAt)}
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {vol.status || 'Confirmed'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedVolunteerSlip(vol)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              title="View Badge Slip"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              {/* <span>View Badge</span> */}
                            </button>
                            <button
                              onClick={() => handleDeleteVolunteer(vol.id)}
                              className="flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                              title="Delete Registration"
                            >
                              <Trash2 className="h-4 w-4" />
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
        </div>

      </div>

      {/* ── MODAL: VOLUNTEER BADGE SLIP ── */}
      {selectedVolunteerSlip && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedVolunteerSlip(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white text-center relative">
              <button
                onClick={() => setSelectedVolunteerSlip(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/35 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="w-16 h-16 rounded-full bg-white text-indigo-600 font-black text-xl flex items-center justify-center mx-auto shadow-lg mb-3">
                {getInitials(selectedVolunteerSlip.name)}
              </div>
              <h3 className="text-lg font-black">{selectedVolunteerSlip.name}</h3>
              <p className="text-xs text-white/80 font-medium mt-0.5">Camp Volunteer ID Card</p>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-400">Volunteer ID</span>
                <span className="font-bold text-slate-900">{selectedVolunteerSlip.id}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-400">Phone</span>
                <span className="font-bold text-slate-900">{selectedVolunteerSlip.phone}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-400">Camp</span>
                <span className="font-bold text-slate-900 text-right max-w-[180px]">{selectedVolunteerSlip.campName}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-400">Location</span>
                <span className="font-bold text-slate-900 text-right max-w-[180px]">{selectedVolunteerSlip.campLocation}</span>
              </div>

              <div className="flex justify-between pb-1">
                <span className="font-bold text-slate-400">Status</span>
                <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">VERIFIED</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Slip</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CommonVolunteer;
