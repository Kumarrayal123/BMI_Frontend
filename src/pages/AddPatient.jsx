// import axios from 'axios';
// import { ArrowLeft, Save } from 'lucide-react';
// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// const AddPatient = () => {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         name: '', age: '', gender: 'male', contact: '', address: ''
//     });
//     const [loading, setLoading] = useState(false);

//     const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             await axios.post('https://bim-backend-4i12.onrender.com/api/patients', formData);
//             navigate('/');
//         } catch (err) {
//             console.error(err);
//             alert('Error adding patient');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
//             <div className="flex items-center gap-4 mb-8">
//                 <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft /></Link>
//                 <h2 className="text-2xl font-bold text-gray-800">Add New Patient</h2>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
//                     <input required type="text" name="name" value={formData.name} onChange={handleChange}
//                         className="w-full p-3 border rounded-xl focus:ring-2 ring-indigo-500 outline-none" placeholder="Enter full name" />
//                 </div>

//                 <div className="grid grid-cols-2 gap-6">
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
//                         <input required type="number" name="age" value={formData.age} onChange={handleChange}
//                             className="w-full p-3 border rounded-xl focus:ring-2 ring-indigo-500 outline-none" placeholder="Years" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
//                         <select name="gender" value={formData.gender} onChange={handleChange}
//                             className="w-full p-3 border rounded-xl focus:ring-2 ring-indigo-500 outline-none">
//                             <option value="male">Male</option>
//                             <option value="female">Female</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
//                     <input required type="tel" name="contact" value={formData.contact} onChange={handleChange}
//                         className="w-full p-3 border rounded-xl focus:ring-2 ring-indigo-500 outline-none" placeholder="+91 9876543210" />
//                 </div>

//                 <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
//                     <textarea required name="address" rows="3" value={formData.address} onChange={handleChange}
//                         className="w-full p-3 border rounded-xl focus:ring-2 ring-indigo-500 outline-none" placeholder="Full residential address..." ></textarea>
//                 </div>

//                 <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30 flex justify-center items-center gap-2">
//                     {loading ? 'Saving...' : <><Save size={20} /> Register Patient</>}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default AddPatient;


// import axios from "axios";
// import { ArrowLeft, Save } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const API = "https://bim-backend-4i12.onrender.com/api";

// const AddPatient = () => {
//   const navigate = useNavigate();

//   const [camps, setCamps] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     age: "",
//     gender: "male",
//     contact: "",
//     address: "",
//     campId: "" // 🔥 IMPORTANT
//   });

//   useEffect(() => {
//     axios
//       .get(`${API}/camps/allcamps`)
//       .then(res => setCamps(res.data))
//       .catch(console.error);
//   }, []);

//   const handleChange = e =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await axios.post(`${API}/patients`, formData);
//       navigate("/");
//     } catch (err) {
//       alert("Error adding patient");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow border">
//       <div className="flex items-center gap-4 mb-8">
//         <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
//           <ArrowLeft />
//         </Link>
//         <h2 className="text-2xl font-bold">Add New Patient</h2>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-5">
//         <input
//           required
//           name="name"
//           placeholder="Patient Name"
//           onChange={handleChange}
//           className="w-full p-3 border rounded-xl"
//         />

//         <div className="grid grid-cols-2 gap-4">
//           <input
//             required
//             type="number"
//             name="age"
//             placeholder="Age"
//             onChange={handleChange}
//             className="p-3 border rounded-xl"
//           />

//           <select
//             name="gender"
//             onChange={handleChange}
//             className="p-3 border rounded-xl"
//           >
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//           </select>
//         </div>

//         <input
//           required
//           name="contact"
//           placeholder="WhatsApp Number"
//           onChange={handleChange}
//           className="w-full p-3 border rounded-xl"
//         />

//         <textarea
//           required
//           name="address"
//           placeholder="Address"
//           rows="3"
//           onChange={handleChange}
//           className="w-full p-3 border rounded-xl"
//         />

//         {/* 🔥 CAMP DROPDOWN */}
//         <select
//           required
//           name="campId"
//           onChange={handleChange}
//           className="w-full p-3 border rounded-xl bg-indigo-50"
//         >
//           <option value="">-- Select Camp --</option>
//           {camps.map(c => (
//             <option key={c._id} value={c._id}>
//               {c.name} ({c.location})
//             </option>
//           ))}
//         </select>

//         <button
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold"
//         >
//           {loading ? "Saving..." : <><Save size={18} /> Register Patient</>}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddPatient;

import axios from "axios";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API = "https://bim-backend-4i12.onrender.com/api";

const AddPatient = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultCampId = location.state?.campId || "";
  const [camps, setCamps] = useState([]);
  const [campId, setCampId] = useState(defaultCampId);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "female",
    contact: "",
    address: "",
    campId: "" // ✅ REQUIRED
  });



  /* -------------------------
     FETCH CAMPS
  ------------------------- */
  useEffect(() => {
    fetchCamps();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      campId: campId
    }));
  }, [campId]);

  useEffect(() => {
    if (defaultCampId && camps.length > 0) {
      setCampId(defaultCampId);
    }
  }, [defaultCampId, camps]);

  const fetchCamps = async () => {
    try {
      const res = await axios.get(`${API}/camps/allcamps`);
      console.log("CAMPS DATA 👉", res.data); // DEBUG
      setCamps(res.data);
    } catch (err) {
      console.error("Error fetching camps", err);
    }
  };

  /* -------------------------
     HANDLE CHANGE
  ------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* -------------------------
     SUBMIT
  ------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.campId) {
      alert("Please select a camp");
      return;
    }

    console.log("FINAL PAYLOAD 👉", formData); // ✅ MUST SEE campId here

    try {
      setLoading(true);
      await axios.post(`${API}/patients`, formData);
      navigate("/");
    } catch (err) {
      console.error("ADD PATIENT ERROR 👉", err.response?.data || err);
      alert(err.response?.data?.error || "Error adding patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow border">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft />
        </Link>
        <h2 className="text-2xl font-bold">Add New Patient</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ✅ CAMP DROPDOWN (FIXED) */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Select Camp
          </label>

          <select
            value={campId}
            onChange={(e) => setCampId(e.target.value)}
            className="w-full border rounded-xl px-4 py-2"
          >
            <option value="">Select Camp</option>

            {camps.map((camp) => (
              <option key={camp._id} value={camp._id}>
                {camp.name}
              </option>
            ))}
          </select>

        </div>

        <input
          required
          name="name"
          value={formData.name}
          placeholder="Patient Name"
          className="w-full p-3 border rounded-xl"
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            required
            name="age"
            type="number"
            value={formData.age}
            placeholder="Age"
            className="p-3 border rounded-xl"
            onChange={handleChange}
          />

          <select
            name="gender"
            value={formData.gender}
            className="p-3 border rounded-xl"
            onChange={handleChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <input
          required
          name="contact"
          value={formData.contact}
          placeholder="WhatsApp Number"
          className="w-full p-3 border rounded-xl"
          onChange={handleChange}
        />

        <textarea
          required
          name="address"
          value={formData.address}
          rows="3"
          placeholder="Address"
          className="w-full p-3 border rounded-xl"
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white p-4 rounded-xl font-bold flex justify-center gap-2 transition-colors"
        >
          <Save /> {loading ? "Saving..." : "Register Patient"}
        </button>
      </form>
    </div>
  );
};

export default AddPatient;



