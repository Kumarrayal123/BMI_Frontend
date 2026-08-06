// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import bmiChart from "../assets/bmi chart.jpg";
// import signature from "../assets/signature.png";
// import { generateMedicalReport } from "../utils/pdfGenerator";

// const HealthReport = () => {
//   const location = useLocation();
//   const [patient, setPatient] = useState(null);
//   const [tests, setTests] = useState(null);

//   useEffect(() => {
//     if (location.state?.patient && location.state?.tests) {
//       setPatient(location.state.patient);
//       setTests(location.state.tests);
//     }
//   }, [location.state]);

//   if (!patient || !tests) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         Loading Report...
//       </div>
//     );
//   }

//   /* ================= BMI ================= */
//   const calculateBMI = () => {
//     if (!tests.weight || !tests.height) return null;
//     const h = Number(tests.height) / 100;
//     const bmi = (Number(tests.weight) / (h * h)).toFixed(1);

//     let category = "Healthy";
//     if (bmi < 18.5) category = "Underweight";
//     else if (bmi >= 25 && bmi < 30) category = "Overweight";
//     else if (bmi >= 30) category = "Obese";

//     return { bmi, category };
//   };

//   const bmiData = calculateBMI();

//   /* ================= STATUS HELPERS ================= */
//   const getBPStatus = (sys, dia) => {
//     if (!sys || !dia) return "-";
//     if (sys < 90 || dia < 60) return "Low";
//     if (sys <= 120 && dia <= 80) return "Normal";
//     return "High";
//   };

//   const getSugarRange = (type) =>
//     (type || "Random").toLowerCase().includes("fasting")
//       ? "70-100"
//       : "70-140";

//   const getSugarStatus = (val, type) => {
//     if (!val) return "-";
//     const v = Number(val);
//     if (v < 70) return "Low";
//     if ((type || "Random").toLowerCase().includes("fasting"))
//       return v <= 100 ? "Normal" : "High";
//     return v <= 140 ? "Normal" : "High";
//   };

//   const statusClass = (s) =>
//     s === "Normal" || s === "Healthy"
//       ? "text-green-600 font-semibold"
//       : s === "-"
//       ? "text-gray-500"
//       : "text-red-600 font-semibold";

//   return (
//     <div className="flex flex-col items-center min-h-screen py-10 bg-gray-200">

//       {/* DOWNLOAD BUTTON */}
//       <div className="w-[210mm] flex justify-end mb-4">
//         <button
//           onClick={() => generateMedicalReport(patient, tests, bmiData)}
//           className="px-6 py-2 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700"
//         >
//           Download Official PDF
//         </button>
//       </div>

//       {/* ================= A4 PAGE ================= */}
//       <div className="bg-white w-[210mm] h-[297mm] shadow-xl relative">

//         {/* ================= HEADER ================= */}
//         <div className="bg-[#007A52] text-white px-8 py-6">
//           <h1 className="text-2xl font-bold">Timely Health</h1>
//           <p className="mt-1 text-sm">
//             Growth | Clinic | Lab | Pharmacy
//           </p>
//           <p className="mt-1 text-xs opacity-90">
//             3rd Floor, Sri Sai Balaji Avenue, VIP Hills, Madhapur, Hyderabad – 500081
//           </p>
//         </div>

//         {/* ================= CONTENT ================= */}
//         <div className="px-10 py-8 space-y-10 text-sm text-gray-800">

//           {/* ===== PATIENT INFO ===== */}
//           <section>
//             <div className="pt-3 mb-6 text-center border-t border-blue-500">
//               <h3 className="font-bold tracking-wide text-green-700">
//                 PATIENT INFORMATION
//               </h3>
//             </div>

//             <div className="grid grid-cols-3 gap-12">
//               <div>
//                 <p className="text-gray-500">Patient Name</p>
//                 <p className="text-lg font-bold">{patient.name}</p>
//               </div>
//               <div>
//                 <p className="text-gray-500">Patient ID</p>
//                 <p className="font-bold">{patient.id}</p>
//               </div>
//               <div>
//                 <p className="text-gray-500">Date</p>
//                 <p className="font-bold">{patient.date}</p>
//               </div>
//             </div>
//           </section>

//           {/* ===== CLINICAL VITALS ===== */}
//           <section>
//             <div className="pt-3 mb-6 text-center border-t border-blue-500">
//               <h3 className="font-bold tracking-wide text-green-700">
//                 CLINICAL VITALS
//               </h3>
//             </div>

//             <table className="w-full border border-gray-300">
//               <thead className="bg-[#007A52] text-white">
//                 <tr>
//                   <th className="p-3 text-left">Test Description</th>
//                   <th className="p-3 text-center">Observed Value</th>
//                   <th className="p-3 text-center">Unit</th>
//                   <th className="p-3 text-center">Reference Range</th>
//                   <th className="p-3 text-center">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="p-3 font-semibold">Body Weight</td>
//                   <td className="p-3 font-bold text-center">{tests.weight}</td>
//                   <td className="p-3 text-center">kg</td>
//                   <td className="p-3 text-center">-</td>
//                   <td className="p-3 text-center">-</td>
//                 </tr>

//                 <tr className="bg-gray-50">
//                   <td className="p-3 font-semibold">Height</td>
//                   <td className="p-3 font-bold text-center">{tests.height}</td>
//                   <td className="p-3 text-center">cm</td>
//                   <td className="p-3 text-center">-</td>
//                   <td className="p-3 text-center">-</td>
//                 </tr>

//                 <tr>
//                   <td className="p-3 font-semibold">Blood Pressure</td>
//                   <td className="p-3 font-bold text-center">
//                     {tests.systolic}/{tests.diastolic}
//                   </td>
//                   <td className="p-3 text-center">mmHg</td>
//                   <td className="p-3 text-center">120/80</td>
//                   <td className={`p-3 text-center ${statusClass(getBPStatus(tests.systolic, tests.diastolic))}`}>
//                     {getBPStatus(tests.systolic, tests.diastolic)}
//                   </td>
//                 </tr>

//                 <tr className="bg-gray-50">
//                   <td className="p-3 font-semibold">
//                     Blood Sugar ({tests.sugarType || "Random"})
//                   </td>
//                   <td className="p-3 font-bold text-center">{tests.sugar}</td>
//                   <td className="p-3 text-center">mg/dL</td>
//                   <td className="p-3 text-center">
//                     {getSugarRange(tests.sugarType)}
//                   </td>
//                   <td className={`p-3 text-center ${statusClass(getSugarStatus(tests.sugar, tests.sugarType))}`}>
//                     {getSugarStatus(tests.sugar, tests.sugarType)}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </section>

//           {/* ===== BMI ANALYSIS (IMAGE-1 EXACT) ===== */}
//           {bmiData && (
//             <section>
//               <div className="pt-3 mb-8 text-center border-t border-blue-500">
//                 <h3 className="font-bold tracking-wide text-green-700">
//                   BMI ANALYSIS
//                 </h3>
//               </div>

//               <div className="grid grid-cols-[260px_1fr] gap-12 items-start">
//                 {/* BMI CARD */}
//                 <div className="bg-[#2563EB] text-white rounded-2xl p-8 text-center shadow-lg">
//                   <p className="mb-2 text-sm opacity-90">Calculated BMI</p>
//                   <p className="text-5xl font-bold">{bmiData.bmi}</p>
//                   <p className="mt-3 text-lg font-semibold">
//                     {bmiData.category}
//                   </p>
//                 </div>

//                 {/* BMI CHART */}
//                 <div className="flex flex-col items-center">
//                   <img
//                     src={bmiChart}
//                     alt="BMI Chart"
//                     className="w-[380px] h-[220px] object-contain"
//                   />
//                   <p className="mt-2 text-xs text-gray-500">
//                     BMI Reference Chart
//                   </p>
//                 </div>
//               </div>
//             </section>
//           )}
//         </div>

//         {/* ================= FOOTER ================= */}
//         <div className="absolute w-full px-12 bottom-8">
//           <div className="flex items-end justify-between">
//             <p className="text-xs text-gray-500">Consultant Physician</p>
//             <img src={signature} alt="Signature" className="w-32" />
//           </div>

//           <p className="text-[10px] text-gray-400 text-center mt-6">
//             This report is electronically generated and is valid without a physical signature.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HealthReport;

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaChevronLeft, FaDownload, FaCloudUploadAlt } from "react-icons/fa";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";
import bmiChart from "../assets/bmi chart.jpg";
import timelyLogo from "../assets/Timelyhealth logo.png";
import companyStamp from "../assets/company-stamp-1780465131172.png";
import signature from "../assets/signature.png";

const HealthReport = () => {
    const location = useLocation();
    const [patient, setPatient] = useState(null);
    const [tests, setTests] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (location.state?.patient && location.state?.tests) {
            setPatient(location.state.patient);
            setTests(location.state.tests);
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.patient?._id) {
            const fetchLatestPatient = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/patients/${location.state.patient._id}`);
                    const data = await res.json();
                    if (data && data._id) {
                        console.log("Fresh Patient Data from Backend:", data);
                        setPatient(data);
                        setTests(data.tests || location.state.tests);
                    }
                } catch (error) {
                    console.error("Error fetching latest patient:", error);
                }
            };
            fetchLatestPatient();
        }
    }, [location.state]);

    if (!patient || !tests) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-base font-bold text-gray-800">Loading Report...</p>
                </div>
            </div>
        );
    }

    const calculateBMI = () => {
        if (!tests.weight || !tests.height) return null;
        const h = Number(tests.height) / 100;
        const bmi = (Number(tests.weight) / (h * h)).toFixed(1);
        let category = "Healthy";
        if (bmi < 18.5) category = "Underweight";
        else if (bmi >= 25 && bmi < 30) category = "Overweight";
        else if (bmi >= 30) category = "Obese";
        return { bmi, category };
    };

    const bmiData = calculateBMI();

    const getBPStatus = (sys, dia) => {
        if (!sys || !dia) return "-";
        if (sys < 90 || dia < 60) return "Low";
        if (sys <= 120 && dia <= 80) return "Normal";
        return "High";
    };

    const getSugarRange = (type) =>
        (type || "Random").toLowerCase().includes("fasting") ? "70-100" : "70-140";

    const getSugarStatus = (val, type) => {
        if (!val) return "-";
        const v = Number(val);
        if (v < 70) return "Low";
        if ((type || "Random").toLowerCase().includes("fasting")) return v <= 100 ? "Normal" : "High";
        return v <= 140 ? "Normal" : "High";
    };

    const statusClass = (s) =>
        s === "Normal" || s === "Healthy"
            ? "text-green-600 font-bold"
            : s === "-" ? "text-gray-500" : "text-red-600 font-bold";

    const handleDownload = () => {
        setLoading(true);
        try {
            generateMedicalReport(patient, tests, bmiData);
            alert("PDF Downloaded successfully!");
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadToDB = async () => {
        setUploading(true);
        try {
            const pdfFile = generateMedicalReportFile(patient, tests, bmiData);
            const formData = new FormData();
            formData.append("pdfReport", pdfFile);
            const idToSend = patient._id ? patient._id.toString() : patient.id?.toString();
            formData.append("patientId", idToSend);

            const response = await fetch("http://localhost:5000/api/uploads/upload-report", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ Success! URL: ${data.fileUrl}`);
                window.location.reload();
            } else {
                alert(`❌ Backend Error: ${data.message}`);
            }

        } catch (error) {
            console.error("❌ Upload Error:", error);
            alert("Error: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 px-4">
                    <button 
                        onClick={() => window.history.back()} 
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                    >
                        <FaChevronLeft /> Back
                    </button>

                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownload} 
                            disabled={loading} 
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 shadow-sm disabled:opacity-50"
                        >
                            <FaDownload /> {loading ? "..." : "Download PDF"}
                        </button>
                        <button 
                            onClick={handleUploadToDB} 
                            disabled={uploading} 
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm disabled:opacity-50"
                        >
                            <FaCloudUploadAlt /> {uploading ? "Saving..." : "Save to DB"}
                        </button>
                    </div>
                </div>

                {/* EXACT PDF LIKE - With Logo, Stamp, Signature */}
                <div className="bg-white shadow-lg rounded-lg px-12 py-10 font-serif text-gray-800">
                    
                    {/* HEADER - Logo Left, Report Right */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <img src={timelyLogo} alt="Timely Health" className="h-14 w-auto object-contain" />
                            {/* <div>
                                <h1 className="text-2xl font-bold text-blue-700 tracking-wide">TIMELY HEALTH</h1>
                                <p className="text-xs text-blue-500 font-medium tracking-wider">Country Consultancy</p>
                            </div> */}
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-blue-700 tracking-wide">HEALTH REPORT</h2>
                            <p className="text-sm text-gray-600 mt-1">Date: {patient.date}</p>
                        </div>
                    </div>
                    
                    <div className="border-b-2 border-blue-700 mb-6"></div>

                    {/* PATIENT INFO */}
                    <div className="mb-6 grid grid-cols-2 gap-y-2.5 text-sm font-sans text-gray-800">
                        <div className="flex items-baseline">
                            <span className="w-20 font-semibold">Name</span>
                            <span className="font-medium">: {patient.name}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-16 font-semibold">Age</span>
                            <span className="font-medium">: {patient.age}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-20 font-semibold">Sample ID</span>
                            <span className="font-medium">: {patient.id}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-16 font-semibold">Date</span>
                            <span className="font-medium">: {patient.date}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-20 font-semibold">Gender</span>
                            <span className="font-medium">: {patient.gender}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-16 font-semibold">Location</span>
                            <span className="font-medium">: {patient.location || patient.address}</span>
                        </div>
                    </div>

                    {/* CLINICAL VITALS */}
                    <h3 className="text-center text-[22px] font-bold text-[#3B7AB3] mb-2 tracking-wide font-[Arial]">
    
                        CLINICAL VITALS
                    </h3>
                    <div className="border-b-2 border-blue-500 mb-5"></div>

                    {/* TABLE */}
                    <div className="mb-6 overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm font-sans">
                            <thead className="bg-[#3B7AB3] text-white">
                                <tr>
                                    <th className="border border-gray-300 py-2.5 px-3 text-left font-bold text-xs uppercase tracking-wider">
                                        TEST DESCRIPTION
                                    </th>
                                    <th className="border border-gray-300 py-2.5 px-3 text-center font-bold text-xs uppercase tracking-wider">
                                        OBSERVED VALUE
                                    </th>
                                    <th className="border border-gray-300 py-2.5 px-3 text-center font-bold text-xs uppercase tracking-wider">
                                        UNIT
                                    </th>
                                    <th className="border border-gray-300 py-2.5 px-3 text-center font-bold text-xs uppercase tracking-wider">
                                        REFERENCE RANGE
                                    </th>
                                    <th className="border border-gray-300 py-2.5 px-3 text-center font-bold text-xs uppercase tracking-wider">
                                        STATUS
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2 font-semibold text-sm">
                                        BLOOD SUGAR ({tests.sugarType || "RANDOM"})
                                    </td>
                                    <td className="border border-gray-300 text-center font-medium">
                                        {tests.sugar}
                                    </td>
                                    <td className="border border-gray-300 text-center">
                                        mg/dL
                                    </td>
                                    <td className="border border-gray-300 text-center">
                                        {getSugarRange(tests.sugarType)}
                                    </td>
                                    <td className={`border border-gray-300 text-center font-semibold ${statusClass(getSugarStatus(tests.sugar, tests.sugarType))}`}>
                                        {getSugarStatus(tests.sugar, tests.sugarType)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2 font-semibold text-sm">
                                        BLOOD PRESSURE
                                    </td>
                                    <td className="border border-gray-300 text-center font-medium">
                                        {tests.systolic || "-"} / {tests.diastolic || "-"}
                                    </td>
                                    <td className="border border-gray-300 text-center">
                                        mmHg
                                    </td>
                                    <td className="border border-gray-300 text-center">
                                        120/80
                                    </td>
                                    <td className={`border border-gray-300 text-center font-semibold ${statusClass(getBPStatus(tests.systolic, tests.diastolic))}`}>
                                        {getBPStatus(tests.systolic, tests.diastolic)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2 font-semibold text-sm">
                                        HEIGHT
                                    </td>
                                    <td className="border border-gray-300 text-center font-medium">
                                        {tests.height}
                                    </td>
                                    <td className="border border-gray-300 text-center">
                                        cm
                                    </td>
                                    <td className="border border-gray-300 text-center">-</td>
                                    <td className="border border-gray-300 text-center">-</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2 font-semibold text-sm">
                                        WEIGHT
                                    </td>
                                    <td className="border border-gray-300 text-center font-medium">
                                        {tests.weight}
                                    </td>
                                    <td className="border border-gray-300 text-center">
                                        kg
                                    </td>
                                    <td className="border border-gray-300 text-center">-</td>
                                    <td className="border border-gray-300 text-center">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* BMI ANALYSIS */}
                    {bmiData && (
                        <>
                            <div className="bg-orange-500 text-white flex justify-between items-center px-4 py-2.5 rounded-sm text-sm font-bold mb-6">
                                <span>BMI ANALYSIS</span>
                                <span>VALUE : {bmiData.bmi}</span>
                                <span>STATUS : {bmiData.category.toUpperCase()}</span>
                            </div>

                            <div className="flex justify-center -mt-3 mb-2">
                                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-gray-700"></div>
                            </div>

                            <div className="grid grid-cols-4 text-xs font-bold text-center overflow-hidden rounded-sm">
                                <div className="bg-blue-600 text-white py-3 px-2">
                                    <div>Underweight</div>
                                    <div className="font-normal text-[11px]">&lt;18.5</div>
                                </div>
                                <div className="bg-green-600 text-white py-3 px-2">
                                    <div>Healthy</div>
                                    <div className="font-normal text-[11px]">18.5 – 24.9</div>
                                </div>
                                <div className="bg-orange-500 text-white py-3 px-2">
                                    <div>Overweight</div>
                                    <div className="font-normal text-[11px]">25 – 29.9</div>
                                </div>
                                <div className="bg-red-600 text-white py-3 px-2">
                                    <div>Obese</div>
                                    <div className="font-normal text-[11px]">&gt;30</div>
                                </div>
                            </div>

                            <div className="text-center mt-6">
                                <p className="text-xs font-bold text-gray-600 mb-1 tracking-wide">BMI REFERENCE CHART</p>
                                <img 
                                    src={bmiChart} 
                                    alt="BMI Reference Chart" 
                                    className="mx-auto max-w-full h-52 object-contain border border-gray-200 rounded bg-white p-2" 
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Standard BMI classification</p>
                            </div>
                        </>
                    )}
                    
                    <div className="border-b border-gray-300 my-8"></div>

                    {/* SIGNATURE */}
                    <div className="flex justify-between items-end mb-8 px-2">
                        <div>
                            <p className="font-bold text-sm text-gray-700">Doctor's Signature</p>
                            {/* <img src={signature} alt="Signature" className="w-32 mt-1" /> */}
                        </div>
                        <div className="text-center">
                            <img src={companyStamp} alt="Company Stamp" className="w-24 h-24 mx-auto" />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="-mx-12 -mb-10 mt-6 bg-teal-600 text-white py-4 px-6 text-center rounded-b-lg">
                        <div className="text-xs font-sans">
                            <p className="mb-1 font-bold tracking-wide">Timely Healthtech Private Limited</p>
                            <p className="text-[10px] leading-relaxed">
                                Flat No:301, H.No:1-68/22, Plot No. 54 & 55, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, Telangana-500081
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 mt-2 text-[10px]">
                                <span> timelyglobal.in@gmail.com</span>
                                <span>90 1048 1048</span>
                                <span>timelyhealth.in</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthReport;