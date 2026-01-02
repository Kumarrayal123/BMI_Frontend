


import axios from "axios";
import {
  Activity,
  MapPin,
  Phone,
  Search,
  Trash2,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [camps, setCamps] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCampId, setSelectedCampId] = useState("all");
  const [activeToday, setActiveToday] = useState(0);

  /* ================= FETCH ================= */

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "https://bim-backend-4i12.onrender.com/api/patients"
      );
      setPatients(res.data);

      const today = new Date().toDateString();
      setActiveToday(
        res.data.filter(
          (p) => new Date(p.createdAt).toDateString() === today
        ).length
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCamps = async () => {
    try {
      const res = await axios.get(
        "https://bim-backend-4i12.onrender.com/api/camps/allcamps"
      );
      setCamps(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchCamps();
  }, []);

  /* ================= DELETE ================= */

  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await axios.delete(
      `https://bim-backend-4i12.onrender.com/api/patients/${id}`
    );
    fetchPatients();
  };

  /* ================= FILTER ================= */

  const filteredPatients = patients.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCamp =
      selectedCampId === "all"
        ? true
        : p.campId?._id === selectedCampId;

    return matchSearch && matchCamp;
  });

  /* ================= STATS ================= */

  const totalCamps = camps.length;
  const totalPatients = patients.length;
  const recentPatients = activeToday;

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-white rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold">Dashboard</h2>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search patients"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none
              focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={() => setSelectedCampId("all")}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold
              ${
                selectedCampId === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
          >
            All Camps
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Camps"
          value={totalCamps}
          icon={MapPin}
          iconBg="bg-gradient-to-br from-purple-500 to-indigo-500"
        />
        <StatsCard
          title="Active Camps"
          value={camps.length}
          icon={Activity}
          iconBg="bg-gradient-to-br from-indigo-500 to-blue-500"
        />
        <StatsCard
          title="Total Patients"
          value={totalPatients}
          icon={Users}
          iconBg="bg-gradient-to-br from-sky-500 to-cyan-500"
        />
        <StatsCard
          title="Recent Additions"
          value={recentPatients}
          icon={Activity}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
      </div>

      {/* ================= CAMPS SECTION ================= */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Camps</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {camps.map((camp) => (
            <div
              key={camp._id}
              onClick={() => setSelectedCampId(camp._id)}
               className={`cursor-pointer p-4 rounded-2xl border transition-all
          ${selectedCampId === camp._id
            ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
            : "bg-white hover:border-indigo-300 hover:shadow-md"
                }`}
            >
              <h4 className="font-semibold text-lg">{camp.name}</h4>

              <p className="flex items-center gap-2 text-sm text-gray-00 mt-2">
                <MapPin size={14} />
                {camp.location}
              </p>

              <p className="mt-3 text-sm font-medium text-gray-800">
                Patients:{" "}
                {
                  patients.filter(
                    (p) => p.campId?._id === camp._id
                  ).length
                }
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PATIENTS ================= */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-4">Patients</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-2xl border shadow-sm p-6 relative"
              >
                <Trash2
                  size={18}
                  className="absolute top-5 right-5 text-red-400 cursor-pointer"
                  onClick={() => deletePatient(patient._id)}
                />

                <h3 className="font-semibold text-lg capitalize">
                  {patient.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Camp: {patient.campId?.name || "N/A"}
                </p>

                <p className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                  <Phone size={15} />
                  {patient.contact}
                </p>

                <Link
                  to={`/patient/${patient._id}`}
                  className="block mt-6 text-center bg-[#007A52]
                  hover:bg-[#007A52] transition text-white py-3 rounded-xl font-medium"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= STATS CARD ================= */

const StatsCard = ({ title, value, icon: Icon, iconBg }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        <Icon size={22} className="text-white" />
      </div>

      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;









