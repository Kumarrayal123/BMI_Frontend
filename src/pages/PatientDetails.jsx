// import axios from 'axios';
// import jsPDF from 'jspdf';
// import { AlertTriangle, ArrowLeft, Calendar, CheckCircle, Clock, FileDown, MessageCircle, ShieldCheck } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import AddTestForm from '../components/AddTestForm';

// const PatientDetails = () => {
//     const { id } = useParams();
//     const [patient, setPatient] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const fetchPatient = async () => {
//         try {
//             const res = await axios.get(`https://bim-backend-4i12.onrender.com/api/patients/${id}`);
//             setPatient(res.data);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchPatient();
//     }, [id]);

//     const generatePDF = (test) => {
//         const doc = new jsPDF();

//         // Styling constants
//         const primaryColor = [79, 70, 229]; // Indigo 600

//         // Header
//         doc.setFillColor(...primaryColor);
//         doc.rect(0, 0, 210, 40, 'F');
//         doc.setTextColor(255, 255, 255);
//         doc.setFontSize(22);
//         doc.text("Medical Lab Report", 105, 25, null, null, "center");

//         // Patient Info Strip
//         doc.setFillColor(245, 247, 250);
//         doc.rect(15, 50, 180, 40, 'F'); // Increased height for Address
//         doc.setTextColor(50, 50, 50);

//         doc.setFontSize(14);
//         doc.setFont(undefined, 'bold');
//         doc.text(patient.name.toUpperCase(), 25, 65);

//         doc.setFontSize(10);
//         doc.setFont(undefined, 'normal');
//         doc.text(`Age: ${patient.age} | Gender: ${patient.gender}`, 25, 72);
//         doc.text(`Contact: ${patient.contact}`, 25, 78);
//         doc.text(`Address: ${patient.address || 'N/A'}`, 25, 84); // Added Address

//         doc.setFontSize(12);
//         doc.setFont(undefined, 'bold');
//         doc.text(`Date: ${new Date(test.date).toLocaleDateString()}`, 180, 65, null, null, "right");

//         // Report Status Tag
//         const isVerified = test.doctorVerification?.status === 'approved';
//         doc.setFillColor(isVerified ? 220 : 255, isVerified ? 255 : 240, isVerified ? 220 : 240); // Light Green or Light Red
//         doc.roundedRect(150, 75, 30, 8, 2, 2, 'F');
//         doc.setTextColor(isVerified ? 0 : 200, isVerified ? 128 : 50, isVerified ? 0 : 50);
//         doc.setFontSize(8);
//         doc.text(isVerified ? "VERIFIED" : "PENDING", 165, 80, null, null, "center");

//         // Table Header
//         let y = 110;
//         doc.setDrawColor(200, 200, 200);
//         doc.line(20, y, 190, y);
//         y += 10;

//         doc.setTextColor(0, 0, 0);
//         doc.setFontSize(11);
//         doc.setFont(undefined, 'bold');
//         doc.text("TEST PARAMETER", 25, y);
//         doc.text("RESULT", 90, y);
//         doc.text("STATUS", 130, y);
//         doc.text("NORMAL RANGE", 170, y);
//         y += 5;
//         doc.line(20, y, 190, y);
//         y += 10;
//         doc.setFont(undefined, 'normal');

//         const addRow = (label, value, status, normalRange) => {
//             doc.text(label, 25, y);
//             doc.text(String(value), 90, y);

//             if (status === 'Normal' || status === 'Healthy') doc.setTextColor(22, 163, 74); // Green
//             else if (status === 'Critical' || status === 'High' || status === 'Obese' || status === 'Low' || status === 'Underweight') doc.setTextColor(220, 38, 38); // Red
//             else doc.setTextColor(234, 88, 12); // Orange

//             doc.text(status, 130, y);
//             doc.setTextColor(100, 100, 100);
//             doc.text(normalRange, 170, y);
//             doc.setTextColor(0, 0, 0);
//             y += 10;
//             doc.setDrawColor(245, 245, 245);
//             doc.line(20, y - 5, 190, y - 5);
//         };

//         addRow("BMI", test.bmi, test.bmiCategory, "18.5 - 24.9");
//         addRow("Sugar (Fasting)", `${test.sugar} mg/dL`, test.analysis.sugarStatus, "70 - 100");
//         addRow("Blood Pressure", `${test.bpSystolic}/${test.bpDiastolic}`, test.analysis.bpStatus, "120/80");
//         addRow("RBS", `${test.rbs} mg/dL`, test.analysis.rbsStatus, "< 140");
//         addRow("Temperature", `${test.temperature} °F`, test.analysis.tempStatus, "97 - 99");

//         // Summary Box
//         y += 15;
//         doc.setFillColor(248, 250, 252);

//         // Verification & Signature Section
//         const pageHeight = doc.internal.pageSize.height;
//         y = Math.max(y, pageHeight - 60);

//         doc.setDrawColor(200, 200, 200);
//         doc.rect(20, y, 170, 40); // Doctor Box Status

//         doc.setFontSize(10);
//         doc.setTextColor(100, 100, 100);
//         doc.text("Doctor Verification:", 25, y + 10);

//         if (isVerified) {
//             doc.setFontSize(14);
//             doc.setTextColor(22, 163, 74);
//             doc.setFont(undefined, 'bold');
//             doc.text("APPROVED BY DOCTOR", 105, y + 25, null, null, "center");
//             doc.setFontSize(8);
//             doc.setTextColor(150, 150, 150);
//             doc.text(`Digitally Verified on ${new Date(test.doctorVerification.approvedAt).toLocaleString()}`, 105, y + 35, null, null, "center");
//         } else {
//             doc.setFontSize(14);
//             doc.setTextColor(200, 200, 200);
//             doc.setFont(undefined, 'bold');
//             doc.text("PENDING APPROVAL", 105, y + 25, null, null, "center");
//         }

//         doc.save(`${patient.name}_Report_${new Date(test.date).toISOString().split('T')[0]}.pdf`);
//     };

//     if (loading || !patient) return <div className="p-8 text-center">Loading...</div>;

//     return (
//         <div className="max-w-5xl mx-auto space-y-8">

//             {/* Header */}
//             <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//                 <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft /></Link>
//                 <div className="flex-1">
//                     <h2 className="text-3xl font-bold text-gray-800">{patient.name}</h2>
//                     <div className="text-gray-500 flex flex-wrap gap-4 text-sm mt-2">
//                         <span>Age: <span className="font-semibold text-gray-700">{patient.age}</span></span>
//                         <span>•</span>
//                         <span className="capitalize">Gender: <span className="font-semibold text-gray-700">{patient.gender}</span></span>
//                         <span>•</span>
//                         <span>Ph: <span className="font-semibold text-gray-700">{patient.contact}</span></span>
//                     </div>
//                     <div className="text-gray-500 text-sm mt-1">
//                         Address: <span className="font-semibold text-gray-700">{patient.address || 'N/A'}</span>
//                     </div>
//                 </div>
//             </div>

//             <AddTestForm patientId={patient._id} onSuccess={fetchPatient} />

//             {/* History */}
//             <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Medical History</h3>
//             <div className="space-y-4">
//                 {patient.tests.slice().reverse().map(test => {
//                     const isVerified = test.doctorVerification?.status === 'approved';
//                     return (
//                         <div key={test._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">

//                             {/* Date & Verification Status */}
//                             <div className="flex gap-4 items-center min-w-[180px]">
//                                 <div className={`p-3 rounded-lg ${test.healthStatus === 'Healthy' ? 'bg-green-50 text-green-600' : test.healthStatus === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
//                                     {test.healthStatus === 'Healthy' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
//                                 </div>
//                                 <div>
//                                     <div className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={12} /> {new Date(test.date).toLocaleDateString()}</div>
//                                     <div className="font-bold text-lg mb-1">{test.healthStatus}</div>
//                                     {isVerified ? (
//                                         <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
//                                             <ShieldCheck size={10} /> Verified
//                                         </span>
//                                     ) : (
//                                         <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
//                                             <Clock size={10} /> Pending
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Metrics Grid */}
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-sm flex-1 border-l pl-6 border-gray-100">
//                                 <div>
//                                     <span className="text-gray-400 text-xs block">BMI</span>
//                                     <span className="font-bold text-gray-700">{test.bmi}</span> <span className="text-xs text-gray-500">({test.bmiCategory})</span>
//                                 </div>
//                                 <div>
//                                     <span className="text-gray-400 text-xs block">BP</span>
//                                     <span className="font-semibold text-gray-700">{test.bpSystolic}/{test.bpDiastolic}</span>
//                                 </div>
//                                 <div>
//                                     <span className="text-gray-400 text-xs block">Sugar</span>
//                                     <span className="font-semibold text-gray-700">{test.sugar}</span>
//                                 </div>
//                                 <div>
//                                     <span className="text-gray-400 text-xs block">Temp</span>
//                                     <span className="font-semibold text-gray-700">{test.temperature}°</span>
//                                 </div>
//                             </div>

//                             {/* Actions */}
//                             <div className="flex gap-2">
//                                 <button onClick={() => {
//                                     const message = `Hello ${patient.name}, your Medical Report (Date: ${new Date(test.date).toLocaleDateString()}) is ready. Status: ${test.healthStatus}.`;
//                                     const whatsappUrl = `https://wa.me/${patient.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
//                                     window.open(whatsappUrl, '_blank');
//                                 }} className="min-w-[40px] h-[40px] flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 transition" title="Send via WhatsApp">
//                                     <MessageCircle size={20} />
//                                 </button>
//                                 <button onClick={() => generatePDF(test)} className="min-w-[40px] h-[40px] flex items-center justify-center bg-gray-50 text-indigo-600 rounded-lg hover:bg-indigo-50 border border-indigo-100 transition" title="Download Report">
//                                     <FileDown size={20} />
//                                 </button>
//                             </div>
//                         </div>
//                     )
//                 })}
//                 {patient.tests.length === 0 && <div className="text-center text-gray-400 py-10">No records found. Add a new clinical record above.</div>}
//             </div>
//         </div>
//     );
// };

// export default PatientDetails;

// import axios from "axios";
// import jsPDF from "jspdf";
// import { ArrowLeft, FileDown } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import AddTestForm from "../components/AddTestForm";

// import bmiChart from "../assets/bmi chart.jpg";
// import logo from "../assets/logo.png";

// /* ================= HELPERS ================= */

// const sugarStatus = (v) => {
//   if (!v) return "-";
//   if (v < 70) return "Low";
//   if (v <= 140) return "Normal";
//   return "High";
// };

// const bpStatus = (s, d) => {
//   if (!s || !d) return "-";
//   if (s < 90 || d < 60) return "Low";
//   if (s <= 120 && d <= 80) return "Normal";
//   return "High";
// };

// const bmiPointer = (bmi, min, max) => {
//   if (!bmi) return "";
//   return bmi >= min && bmi <= max ? " ←" : "";
// };

// /* 🔥 IMPORTANT FIX — latest vitals extractor */
// const extractLatestVitals = (tests = []) => {
//   const result = {
//     weight: null,
//     height: null,
//     sugar: null,
//     systolic: null,
//     diastolic: null,
//     bmi: null,
//     bmiCategory: null,
//     date: null,
//   };

//   tests.forEach((t) => {
//     result.date = t.date;

//     if (t.type === "weight") result.weight = t.value;
//     if (t.type === "height") result.height = t.value;
//     if (t.type === "sugar") result.sugar = t.value;
//     if (t.type === "bp") {
//       result.systolic = t.value;
//       result.diastolic = t.value2;
//     }
//     if (t.type === "bmi") {
//       result.bmi = t.value;
//       result.bmiCategory = t.category;
//     }
//   });

//   return result;
// };

// /* ================= COMPONENT ================= */

// const PatientDetails = () => {
//   const { id } = useParams();
//   const [patient, setPatient] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchPatient = async () => {
//     try {
//       const res = await axios.get(
//         `https://bim-backend-4i12.onrender.com/api/patients/${id}`
//       );
//       setPatient(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPatient();
//   }, [id]);

//   /* ================= PDF ================= */

//   const generatePDF = () => {
//     if (!patient?.tests?.length) {
//       alert("No test data available");
//       return;
//     }

//     const test = extractLatestVitals(patient.tests);
//     const doc = new jsPDF("p", "mm", "a4");

//     /* HEADER */
//     doc.addImage(logo, "PNG", 15, 10, 30, 30);
//     doc.setFontSize(18);
//     doc.text("Health Report", 105, 22, { align: "center" });

//     doc.setFontSize(10);
//     doc.text(
//       `Report Date: ${new Date(test.date).toLocaleString()}`,
//       150,
//       35
//     );

//     /* PATIENT INFO */
//     doc.rect(15, 45, 180, 35);
//     doc.setFontSize(11);

//     doc.text(`Patient Name : ${patient.name}`, 20, 55);
//     doc.text(`Age : ${patient.age} Years`, 20, 63);
//     doc.text(`Gender : ${patient.gender}`, 20, 71);

//     doc.text(`Phone : ${patient.contact}`, 110, 55);
//     doc.text(`Address : ${patient.address || "-"}`, 110, 63);

//     /* CLINICAL VITALS */
//     let y = 95;
//     doc.setFontSize(14);
//     doc.text("Clinical Vitals", 15, y);

//     doc.setFontSize(11);
//     y += 10;
//     doc.text(`Weight : ${test.weight ?? "-"} kg`, 20, y);
//     y += 8;
//     doc.text(`Height : ${test.height ?? "-"} cm`, 20, y);
//     y += 10;

//     /* BLOOD SUGAR */
//     doc.setFontSize(13);
//     doc.text("Blood Sugar Analysis", 15, y);
//     y += 6;

//     doc.setFontSize(11);
//     doc.rect(15, y, 180, 18);
//     doc.text("Test", 18, y + 6);
//     doc.text("Value", 70, y + 6);
//     doc.text("Normal Range", 110, y + 6);
//     doc.text("Status", 160, y + 6);

//     y += 12;
//     doc.text("Blood Sugar", 18, y);
//     doc.text(`${test.sugar ?? "-"} mg/dL`, 70, y);
//     doc.text("70 – 140", 110, y);
//     doc.text(sugarStatus(test.sugar), 160, y);

//     /* BLOOD PRESSURE */
//     y += 18;
//     doc.setFontSize(13);
//     doc.text("Blood Pressure Analysis", 15, y);
//     y += 6;

//     doc.setFontSize(11);
//     doc.rect(15, y, 180, 18);
//     doc.text("Test", 18, y + 6);
//     doc.text("Value", 70, y + 6);
//     doc.text("Normal Range", 110, y + 6);
//     doc.text("Status", 160, y + 6);

//     y += 12;
//     doc.text("Blood Pressure", 18, y);
//     doc.text(
//       `${test.systolic ?? "-"} / ${test.diastolic ?? "-"}`,
//       70,
//       y
//     );
//     doc.text("120 / 80", 110, y);
//     doc.text(bpStatus(test.systolic, test.diastolic), 160, y);

//     /* BMI */
//     y += 18;
//     doc.setFontSize(14);
//     doc.text("BMI Analysis", 15, y);

//     y += 8;
//     doc.setFontSize(11);
//     doc.text(`BMI Value : ${test.bmi ?? "-"}`, 20, y);
//     y += 6;
//     doc.text(`Category : ${test.bmiCategory ?? "-"}`, 20, y);

//     y += 6;
//     doc.rect(15, y, 90, 30);

//     doc.text("< 18.5", 18, y + 6);
//     doc.text("Underweight" + bmiPointer(test.bmi, 0, 18.4), 55, y + 6);

//     doc.text("18.5 – 24.9", 18, y + 12);
//     doc.text("Healthy" + bmiPointer(test.bmi, 18.5, 24.9), 55, y + 12);

//     doc.text("25 – 29.9", 18, y + 18);
//     doc.text("Overweight" + bmiPointer(test.bmi, 25, 29.9), 55, y + 18);

//     doc.text("≥ 30", 18, y + 24);
//     doc.text("Obese" + bmiPointer(test.bmi, 30, 100), 55, y + 24);

//     doc.addImage(bmiChart, "JPEG", 115, y - 4, 70, 45);

//     /* FOOTER */
//     doc.setFontSize(9);
//     doc.text(
//       "This report is system generated and does not require signature.",
//       105,
//       285,
//       { align: "center" }
//     );

//     doc.save(`${patient.name}_Health_Report.pdf`);
//   };

//   if (loading || !patient) {
//     return <div className="p-8 text-center">Loading...</div>;
//   }

//   return (
//     <div className="max-w-5xl mx-auto space-y-8">
//       {/* HEADER */}
//       <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow border">
//         <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
//           <ArrowLeft />
//         </Link>
//         <div>
//           <h2 className="text-3xl font-bold">{patient.name}</h2>
//           <p className="text-sm text-gray-500">
//             Age: {patient.age} | Gender: {patient.gender} | Ph: {patient.contact}
//           </p>
//           <p className="text-sm text-gray-500">
//             Address: {patient.address}
//           </p>
//         </div>
//       </div>

//       <AddTestForm patientId={patient._id} onSuccess={fetchPatient} />

//       <div className="flex justify-end">
//         <button
//           onClick={generatePDF}
//           className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:bg-indigo-700"
//         >
//           <FileDown size={18} />
//           Download Health Report
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PatientDetails;





// import axios from "axios";
// import jsPDF from "jspdf";
// import {
//     ArrowLeft,
//     Calendar,
//     FileDown
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import hospitalLogo from "../assets/logo.png";
// import AddTestForm from "../components/AddTestForm";

// const PatientDetails = () => {
//   const { id } = useParams();
//   const [patient, setPatient] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchPatient = async () => {
//     try {
//       const res = await axios.get(`https://bim-backend-4i12.onrender.com/api/patients/${id}`);
//       setPatient(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPatient();
//   }, [id]);

//   // ================= PDF GENERATOR =================
//   const generatePDF = (test) => {
//     const doc = new jsPDF();

//     const primaryColor = [79, 70, 229];

//     // ---------- HEADER ----------
//     doc.setFillColor(...primaryColor);
//     doc.rect(0, 0, 210, 40, "F");

//     // Logo
//     doc.addImage(hospitalLogo, "PNG", 15, 8, 24, 24);

//     // Hospital Name
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(16);
//     doc.setFont(undefined, "bold");
//     doc.text("CITY CARE MULTI SPECIALITY HOSPITAL", 105, 20, null, null, "center");

//     doc.setFontSize(9);
//     doc.setFont(undefined, "normal");
//     doc.text("Quality Care • Trusted Diagnostics", 105, 28, null, null, "center");

//     // ---------- PATIENT INFO ----------
//     doc.setFillColor(245, 247, 250);
//     doc.rect(15, 50, 180, 40, "F");

//     doc.setTextColor(40, 40, 40);
//     doc.setFontSize(14);
//     doc.setFont(undefined, "bold");
//     doc.text(patient.name.toUpperCase(), 25, 65);

//     doc.setFontSize(10);
//     doc.setFont(undefined, "normal");
//     doc.text(`Age: ${patient.age} | Gender: ${patient.gender}`, 25, 72);
//     doc.text(`Phone: ${patient.contact}`, 25, 78);
//     doc.text(`Address: ${patient.address || "N/A"}`, 25, 84);

//     doc.setFont(undefined, "bold");
//     doc.text(
//       `Report Date: ${new Date(test.date).toLocaleDateString()}`,
//       185,
//       65,
//       null,
//       null,
//       "right"
//     );

//     // ---------- STATUS TAG ----------
//     const isVerified = test.doctorVerification?.status === "approved";
//     doc.setFillColor(isVerified ? 220 : 255, isVerified ? 255 : 230, 220);
//     doc.roundedRect(150, 75, 30, 8, 2, 2, "F");
//     doc.setTextColor(isVerified ? 0 : 200, isVerified ? 130 : 60, 0);
//     doc.setFontSize(8);
//     doc.text(isVerified ? "VERIFIED" : "PENDING", 165, 80, null, null, "center");

//     // ---------- TABLE ----------
//     let y = 110;
//     doc.setFontSize(11);
//     doc.setFont(undefined, "bold");
//     doc.text("TEST", 25, y);
//     doc.text("RESULT", 90, y);
//     doc.text("STATUS", 130, y);
//     doc.text("NORMAL RANGE", 170, y);
//     y += 6;
//     doc.line(20, y, 190, y);
//     y += 10;

//     doc.setFont(undefined, "normal");

//     const row = (label, value, status, range) => {
//       doc.text(label, 25, y);
//       doc.text(String(value), 90, y);

//       if (status === "Healthy" || status === "Normal")
//         doc.setTextColor(22, 163, 74);
//       else if (
//         ["High", "Low", "Critical", "Obese", "Underweight"].includes(status)
//       )
//         doc.setTextColor(220, 38, 38);
//       else doc.setTextColor(234, 88, 12);

//       doc.text(status, 130, y);
//       doc.setTextColor(120, 120, 120);
//       doc.text(range, 170, y);
//       doc.setTextColor(0, 0, 0);
//       y += 10;
//     };

//     row("BMI", test.bmi, test.bmiCategory, "18.5 - 24.9");
//     row("Blood Sugar", `${test.sugar} mg/dL`, test.analysis?.sugarStatus || "-", "70 - 100");
//     row(
//       "Blood Pressure",
//       `${test.bpSystolic}/${test.bpDiastolic}`,
//       test.analysis?.bpStatus || "-",
//       "120/80"
//     );
//     row("Temperature", `${test.temperature} °F`, test.analysis?.tempStatus || "-", "97 - 99");

//     // ---------- DOCTOR VERIFICATION ----------
//     const pageHeight = doc.internal.pageSize.height;
//     y = pageHeight - 50;

//     doc.rect(20, y, 170, 35);
//     doc.setFontSize(10);
//     doc.setTextColor(100, 100, 100);
//     doc.text("Doctor Verification", 25, y + 10);

//     if (isVerified) {
//       doc.setFontSize(14);
//       doc.setTextColor(22, 163, 74);
//       doc.setFont(undefined, "bold");
//       doc.text("APPROVED", 105, y + 25, null, null, "center");
//     } else {
//       doc.setFontSize(14);
//       doc.setTextColor(180, 180, 180);
//       doc.text("PENDING APPROVAL", 105, y + 25, null, null, "center");
//     }

//     doc.save(
//       `${patient.name}_Health_Report_${new Date(test.date)
//         .toISOString()
//         .split("T")[0]}.pdf`
//     );
//   };

//   if (loading || !patient) return <div className="p-8 text-center">Loading...</div>;

//   return (
//     <div className="max-w-5xl mx-auto space-y-8">
//       <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
//         <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
//           <ArrowLeft />
//         </Link>
//         <div>
//           <h2 className="text-3xl font-bold">{patient.name}</h2>
//           <p className="text-sm text-gray-500">
//             {patient.age} yrs • {patient.gender} • {patient.contact}
//           </p>
//           <p className="text-sm text-gray-500">
//             Address: {patient.address || "N/A"}
//           </p>
//         </div>
//       </div>

//       <AddTestForm patientId={patient._id} onSuccess={fetchPatient} />

//       <h3 className="text-xl font-bold">Medical History</h3>

//       <div className="space-y-4">
//         {patient.tests
//           .slice()
//           .reverse()
//           .map((test) => (
//             <div
//               key={test._id}
//               className="bg-white p-6 rounded-xl border flex justify-between items-center"
//             >
//               <div>
//                 <div className="text-sm text-gray-500 flex gap-1 items-center">
//                   <Calendar size={14} />
//                   {new Date(test.date).toLocaleDateString()}
//                 </div>
//                 <div className="font-bold">{test.healthStatus}</div>
//               </div>

//               <button
//                 onClick={() => generatePDF(test)}
//                 className="bg-indigo-50 text-indigo-600 p-3 rounded-lg hover:bg-indigo-100"
//               >
//                 <FileDown />
//               </button>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default PatientDetails;


import axios from "axios";
import { ArrowLeft, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AddTestForm from "../components/AddTestForm";
import { generateMedicalReport } from "../utils/pdfGenerator";

/* ================= HELPERS ================= */



// ✅ BMI calculate (IMPORTANT FIX)
const calculateBMI = (weight, heightCm) => {
  if (!weight || !heightCm) return null;
  const heightM = heightCm / 100;
  return +(weight / (heightM * heightM)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (!bmi) return "-";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

/* 🔥 Latest vitals extractor */
const extractLatestVitals = (tests = []) => {
  const result = {
    weight: null,
    height: null,
    sugar: null,
    systolic: null,
    diastolic: null,
    bmi: null,
    bmiCategory: null,
    date: null,
  };

  tests.forEach((t) => {
    result.date = t.date;

    if (t.type === "weight") result.weight = t.value;
    if (t.type === "height") result.height = t.value;
    if (t.type === "sugar") result.sugar = t.value;
    if (t.type === "bp") {
      result.systolic = t.value;
      result.diastolic = t.value2;
    }
    if (t.type === "bmi") {
      result.bmi = t.value;
      result.bmiCategory = t.category;
    }
  });

  return result;
};

/* ================= COMPONENT ================= */

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPatient = async () => {
    try {
      const res = await axios.get(`https://bim-backend-4i12.onrender.com/api/patients/${id}`);
      setPatient(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  /* ================= PDF ================= */

  const generatePDF = () => {
    if (!patient?.tests?.length) {
      alert("No test data available");
      return;
    }

    const test = extractLatestVitals(patient.tests);

    // Calculate BMI if missing
    const bmiValue = test.bmi ?? calculateBMI(test.weight, test.height);
    const bmiCategory = test.bmiCategory ?? getBMICategory(bmiValue);

    // Map to expected utility format
    const patientData = {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      id: patient._id?.slice(-6).toUpperCase(),
      date: new Date(test.date).toLocaleDateString(),
      phone: patient.contact,
      address: patient.address,
    };

    const testsData = {
      weight: test.weight,
      height: test.height,
      sugar: test.sugar,
      sugarType: "Random", // Defaulting
      systolic: test.systolic,
      diastolic: test.diastolic,
      heartRate: "-",
    };

    const bmiData = {
      bmi: bmiValue,
      category: bmiCategory,
    };

    try {
      console.log("Generating with data:", { patientData, testsData, bmiData });
      generateMedicalReport(patientData, testsData, bmiData);
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  if (loading || !patient) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow border">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft />
        </Link>
        <div>
          <h2 className="text-3xl font-bold">{patient.name}</h2>
          <p className="text-sm text-gray-500">
            Age: {patient.age} | Gender: {patient.gender} | Ph: {patient.contact}
          </p>
          <p className="text-sm text-gray-500">Address: {patient.address}</p>
        </div>
      </div>

      <AddTestForm patientId={patient._id} onSuccess={fetchPatient} />

      <div className="flex justify-end">
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:bg-indigo-700"
        >
          <FileDown size={18} />
          Download Health Report
        </button>
      </div>
    </div>
  );
};

export default PatientDetails;
