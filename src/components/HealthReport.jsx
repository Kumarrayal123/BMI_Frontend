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
import bmiChart from "../assets/bmi chart.jpg";
import signature from "../assets/signature.png";
import { generateMedicalReport } from "../utils/pdfGenerator";

const HealthReport = () => {
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [tests, setTests] = useState(null);

  useEffect(() => {
    if (location.state?.patient && location.state?.tests) {
      setPatient(location.state.patient);
      setTests(location.state.tests);
    }
  }, [location.state]);

  if (!patient || !tests) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Report...
      </div>
    );
  }

  /* ================= BMI ================= */
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

  /* ================= STATUS HELPERS ================= */
  const getBPStatus = (sys, dia) => {
    if (!sys || !dia) return "-";
    if (sys < 90 || dia < 60) return "Low";
    if (sys <= 120 && dia <= 80) return "Normal";
    return "High";
  };

  const getSugarRange = (type) =>
    (type || "Random").toLowerCase().includes("fasting")
      ? "70-100"
      : "70-140";

  const getSugarStatus = (val, type) => {
    if (!val) return "-";
    const v = Number(val);
    if (v < 70) return "Low";
    if ((type || "Random").toLowerCase().includes("fasting"))
      return v <= 100 ? "Normal" : "High";
    return v <= 140 ? "Normal" : "High";
  };

  const statusClass = (s) =>
    s === "Normal" || s === "Healthy"
      ? "text-green-600 font-semibold"
      : s === "-"
        ? "text-gray-500"
        : "text-red-600 font-semibold";

  /* ================= BMI UI HELPERS ================= */
  const getBmiColor = (category) => {
    const c = category?.toLowerCase();
    if (c.includes("underweight")) return "bg-blue-600";
    if (c.includes("healthy")) return "bg-green-600";
    if (c.includes("overweight")) return "bg-orange-500";
    if (c.includes("obese")) return "bg-red-600";
    return "bg-green-600";
  };

  const getBmiMarkerPosition = (bmi) => {
    const v = parseFloat(bmi);
    if (v < 18.5) return `${(v / 18.5) * 25}%`;
    if (v < 25) return `${25 + ((v - 18.5) / (25 - 18.5)) * 25}%`;
    if (v < 30) return `${50 + ((v - 25) / (30 - 25)) * 25}%`;
    return "92%";
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-6 bg-gray-200">

      {/* DOWNLOAD */}
      <div className="w-full md:w-[210mm] flex justify-end px-4 mb-4">
        <button
          onClick={() => generateMedicalReport(patient, tests, bmiData)}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700"
        >
          Download Official PDF
        </button>
      </div>

      {/* PAGE */}
      <div className="bg-white w-full md:w-[210mm] shadow-xl relative">

        {/* HEADER */}
        <div className="bg-[#4287C2] text-white px-8 py-6">
          <h1 className="text-4xl font-bold">Timely Health</h1>
          <p className="text-sm">Connecting Communities</p>

          <div className="mt-3 text-xs opacity-90">
            <p className="font-semibold uppercase tracking-wide">Office Address: 3rd Floor, Sri Sai Balaji Avenue,VIP Hills, Madhapur,Hyderabad – 500081</p>
            <p>
             
            </p>
          </div>
        </div>


        {/* CONTENT */}
        <div className="px-6 py-8 space-y-10 text-sm md:px-10">

          {/* PATIENT */}
          {/* <section>
            <div className="pt-3 mb-6 text-center border-t border-blue-500">
              <h3 className="font-bold text-green-700">
                PATIENT INFORMATION
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <p className="text-gray-500">Patient Name</p>
                <p className="font-bold">{patient.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Sample ID</p>
                <p className="font-bold">{patient.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-bold">{patient.date}</p>
              </div>
            </div>
          </section> */}
          <div className="grid grid-cols-3 md:grid-cols-2 gap-y-4 gap-x-10 text-sm">
            <div>
              <span className="text-gray-600">Name</span>
              <span className="ml-2 font-semibold text-black uppercase">
                : {patient.name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Age</span>
              <span className="ml-2 font-semibold text-black uppercase">
                : {patient.age}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Sample ID</span>
              <span className="ml-2 font-semibold text-black uppercase">
                : {patient.id}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Date</span>
              <span className="ml-2 font-semibold text-black uppercase">
                : {patient.date}
              </span>
            </div>

            

            <div>
              <span className="text-gray-600">Gender</span>
              <span className="ml-2 font-semibold text-black uppercase">
                : {patient.gender}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Location</span>
              <span className="ml-2 font-semibold text-black uppercase">
                : {patient.address}
              </span>
            </div>
          </div>




          {/* ===== CLINICAL VITALS (FIXED) ===== */}
          {/* <section>
            <div className="pt-3 mb-6 text-center border-t border-blue-500">
              <h3 className="font-bold text-green-700">
                CLINICAL VITALS
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-[#007A52] text-white">
                  <tr>
                    <th className="p-3 text-left">Test Description</th>
                    <th className="p-3 text-center">Observed Value</th>
                    <th className="p-3 text-center">Unit</th>
                    <th className="p-3 text-center">Reference Range</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-semibold">Body Weight</td>
                    <td className="p-3 font-bold text-center">{tests.weight}</td>
                    <td className="p-3 text-center">kg</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">-</td>
                  </tr>

                  <tr className="bg-gray-50">
                    <td className="p-3 font-semibold">Height</td>
                    <td className="p-3 font-bold text-center">{tests.height}</td>
                    <td className="p-3 text-center">cm</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">-</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold">Blood Pressure</td>
                    <td className="p-3 font-bold text-center">
                      {tests.systolic}/{tests.diastolic}
                    </td>
                    <td className="p-3 text-center">mmHg</td>
                    <td className="p-3 text-center">120/80</td>
                    <td className={`p-3 text-center ${statusClass(getBPStatus(tests.systolic, tests.diastolic))}`}>
                      {getBPStatus(tests.systolic, tests.diastolic)}
                    </td>
                  </tr>

                  <tr className="bg-gray-50">
                    <td className="p-3 font-semibold">
                      Blood Sugar ({tests.sugarType || "Random"})
                    </td>
                    <td className="p-3 font-bold text-center">{tests.sugar}</td>
                    <td className="p-3 text-center">mg/dL</td>
                    <td className="p-3 text-center">
                      {getSugarRange(tests.sugarType)}
                    </td>
                    <td className={`p-3 text-center ${statusClass(getSugarStatus(tests.sugar, tests.sugarType))}`}>
                      {getSugarStatus(tests.sugar, tests.sugarType)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section> */}
          <section>
            {/* SECTION HEADER */}
            <div className="pt-3 mb-6 text-center border-t border-blue-500">
              <h3 className="font-bold text-[#4287C2] uppercase">
                CLINICAL VITALS
              </h3>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-[#4287C2] text-white">
                  <tr>
                    <th className="p-3 text-left">TEST DESCRIPTION</th>
                    <th className="p-3 text-center">OBSERVED VALUE</th>
                    <th className="p-3 text-center">UNIT</th>
                    <th className="p-3 text-center">REFERENCE RANGE</th>
                    <th className="p-3 text-center">STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {/* 1. BLOOD SUGAR */}
                  <tr>
                    <td className="p-3 font-semibold">
                      BLOOD SUGAR ({tests.sugarType || "RANDOM"})
                    </td>
                    <td className="p-3 font-bold text-center">{tests.sugar}</td>
                    <td className="p-3 text-center">mg/dL</td>
                    <td className="p-3 text-center">
                      {getSugarRange(tests.sugarType)}
                    </td>
                    <td
                      className={`p-3 text-center ${statusClass(
                        getSugarStatus(tests.sugar, tests.sugarType)
                      )}`}
                    >
                      {getSugarStatus(tests.sugar, tests.sugarType)}
                    </td>
                  </tr>

                  {/* 2. BLOOD PRESSURE */}
                  <tr className="bg-gray-50">
                    <td className="p-3 font-semibold">BLOOD PRESSURE</td>
                    <td className="p-3 font-bold text-center">
                      {tests.systolic}/{tests.diastolic}
                    </td>
                    <td className="p-3 text-center">mmHg</td>
                    <td className="p-3 text-center">120/80</td>
                    <td
                      className={`p-3 text-center ${statusClass(
                        getBPStatus(tests.systolic, tests.diastolic)
                      )}`}
                    >
                      {getBPStatus(tests.systolic, tests.diastolic)}
                    </td>
                  </tr>

                  {/* 3. HEIGHT */}
                  <tr>
                    <td className="p-3 font-semibold">HEIGHT</td>
                    <td className="p-3 font-bold text-center">{tests.height}</td>
                    <td className="p-3 text-center">cm</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">-</td>
                  </tr>

                  {/* 4. BODY WEIGHT */}
                  <tr className="bg-gray-50">
                    <td className="p-3 font-semibold">WEIGHT</td>
                    <td className="p-3 font-bold text-center">{tests.weight}</td>
                    <td className="p-3 text-center">kg</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>


          {/* ===== BMI ANALYSIS ===== */}
          {bmiData && (
            <section>

              <div
                className={`rounded-lg text-white px-6 py-4 mb-8 flex items-center justify-between text-sm ${getBmiColor(
                  bmiData.category
                )}`}
              >
                {/* TITLE */}
                <div className="font-semibold uppercase tracking-wide">
                  BMI ANALYSIS
                </div>

                {/* VALUE */}
                <div className="font-semibold uppercase">
                  VALUE : <span className="font-bold">{bmiData.bmi}</span>
                </div>

                {/* STATUS */}
                <div className="font-semibold uppercase">
                  STATUS : <span className="font-bold">{bmiData.category}</span>
                </div>
              </div>


              <div className="relative mb-8 ">



                <div
                  className="absolute -top-6 transition-all duration-500 animate-bounce"
                  style={{ left: getBmiMarkerPosition(bmiData.bmi) }}
                >
                  <div
                    className="
      w-0 h-0
      border-l-[8px] border-r-[8px] border-b-[14px]
      border-l-transparent border-r-transparent border-b-gray-800
    "
                  />
                </div>



                <div className=" grid grid-cols-4 text-xs font-semibold text-center h-14 ">
                  <div className="flex items-center justify-center text-white bg-blue-600  ">
                    Underweight<br />&lt; 18.5
                  </div>
                  <div className="flex items-center justify-center text-white bg-green-600">
                    Healthy<br />18.5 – 24.9
                  </div>
                  <div className="flex items-center justify-center text-white bg-orange-500">
                    Overweight<br />25 – 29.9
                  </div>
                  <div className="flex items-center justify-center text-white bg-red-600">
                    Obese<br />&gt; 30
                  </div>
                </div>
              </div>



              <div className="mt-10 flex justify-center">
                <div className="text-center">
                  {/* HEADING */}
                  <h3 className="font-bold text-[#4287C2] uppercase">
                    BMI REFERENCE CHART
                  </h3><br />

                  {/* IMAGE */}
                  <img
                    src={bmiChart}
                    alt="BMI Reference Chart"
                    className="w-[400px]"
                  />

                  {/* CAPTION */}
                  <p className="mt-1 text-[11px] text-gray-500">
                    Standard BMI classification
                  </p>
                </div>
              </div>

            </section>
          )}
        </div>

        {/* FOOTER */}

        <div className="px-8 pb-6">
          <div className="flex items-end justify-between">
            <p className="text-xs text-gray-600">Consultant Physician</p>

            <div className="text-center">
              <img src={signature} alt="Signature" className="w-28 mx-auto" />
              <p className="text-xs text-gray-600 mt-1">Camp Incharge</p>
            </div>
          </div>

          <p className="text-[13px] text-gray-600 text-center mt-4">
            For consultation or further clarification, please contact us at +91 9010481048.

          </p>
        </div>

      </div>
    </div>
  );
};

export default HealthReport;


