import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Clock, Stethoscope, Users, Sparkles, ChevronRight, Bookmark } from 'lucide-react';

function UpcomingCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sampleCamps = [
    {
      _id: 'sc-1',
      name: 'Hyderabad Mega Community Health Drive',
      date: '2026-08-25T09:00:00.000Z',
      time: '09:00 AM - 04:00 PM IST',
      location: 'Hitec City Community Center, Madhapur, Hyderabad',
      category: 'General Checkup',
      services: ['Free BMI & BP', 'Blood Sugar Test', 'Doctor Advice', 'Free Meds'],
      doctors: 'Dr. Ananya Sharma & Dr. Rajesh Rao',
      volunteersNeeded: 20,
      volunteersRegistered: 16
    },
    {
      _id: 'sc-2',
      name: 'Secunderabad Cardiology & Child Wellness Drive',
      date: '2026-09-02T08:30:00.000Z',
      time: '08:30 AM - 02:30 PM IST',
      location: "St. Mary's Grounds, Secunderabad",
      category: 'Cardiology',
      services: ['ECG Screening', 'Child Growth Check', 'Vitals Check', 'Free Supplements'],
      doctors: 'Dr. Vikramaditya Reddy (Cardiologist) & Dr. Sneha K',
      volunteersNeeded: 15,
      volunteersRegistered: 12
    },
    {
      _id: 'sc-3',
      name: 'Cyberabad Vision & Dental Diagnostic Camp',
      date: '2026-09-10T10:00:00.000Z',
      time: '10:00 AM - 05:00 PM IST',
      location: 'Gachibowli Stadium Health Hub, Hyderabad',
      category: 'Eye & Dental',
      services: ['Vision Check', 'Dental Screening', 'Free Spectacles', 'Oral Care Kits'],
      doctors: 'Dr. Priya Mehta (Ophthalmologist) & Dental Team',
      volunteersNeeded: 25,
      volunteersRegistered: 22
    }
  ];

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await axios.get('http://62.72.29.27:5000/api/camps/allcamps');
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          setCamps(data);
        } else if (data && Array.isArray(data.data) && data.data.length > 0) {
          setCamps(data.data);
        } else {
          setCamps(sampleCamps);
        }
      } catch (err) {
        console.error('Failed to fetch upcoming camps', err);
        setCamps(sampleCamps);
      } finally {
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  const getCampDateTile = (dateStr) => {
    if (!dateStr) return { month: 'AUG', day: '25', year: '2026', dayName: 'TUE' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { month: 'AUG', day: '25', year: '2026', dayName: 'TUE' };
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return { month, day, year, dayName };
  const isUpcoming = (camp) => {
    const dateStr = camp.date || camp.campDate || camp.startDate || camp.scheduledDate;
    if (!dateStr) return true;
    const campDate = new Date(dateStr);
    if (isNaN(campDate.getTime())) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return campDate >= today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        <span className="ml-3 text-sm font-semibold text-slate-600">Loading health drives…</span>
      </div>
    );
  }

  const apiUpcomingCamps = (camps && camps.length > 0) ? camps.filter(isUpcoming) : [];
  const activeCamps = apiUpcomingCamps.length > 0 ? apiUpcomingCamps : sampleCamps.filter(isUpcoming);

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Healthcare Drives</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Upcoming <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Health Camps</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Free consultations, live vitals evaluation, and digital health records.
          </p>
        </div>

        {/* Camp Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeCamps.map((camp, idx) => {
            const dateTile = getCampDateTile(camp.date || camp.campDate);
            const services = camp.services || ['Free BMI & BP', 'Doctor Advice', 'Blood Sugar Test'];

            return (
              <div
                key={camp._id || idx}
                className="group bg-white/95 backdrop-blur-md rounded-[2rem] border border-slate-200 hover:border-indigo-400 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold px-3 py-1 rounded-full">
                      {camp.category || 'General Checkup'}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Open
                    </span>
                  </div>

                  {/* Title & Date Tile */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 bg-gradient-to-b from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-2.5 text-center min-w-[60px]">
                      <span className="block text-[10px] font-black text-indigo-600 uppercase">{dateTile.month}</span>
                      <span className="block text-2xl font-black text-slate-900 leading-none my-0.5">{dateTile.day}</span>
                      <span className="block text-[9px] font-bold text-slate-500">{dateTile.dayName}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                        {camp.name || camp.title || 'Health Drive'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{camp.location || 'Hyderabad'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Services Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {services.map((s, sIdx) => (
                      <span key={sIdx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Info details */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{camp.time || '09:00 AM - 04:00 PM'}</span>
                    </div>
                    {camp.doctors && (
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="truncate">{camp.doctors}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-6 pt-3 border-t border-slate-100">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-1.5 shadow-sm">
                    <span>Register for Drive</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default UpcomingCamps;
