// import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
// import Layout from './components/Layout';
// import AddPatient from './pages/AddPatient';
// import Dashboard from './pages/Dashboard';
// import DoctorDashboard from './pages/DoctorDashboard';
// import PatientDetails from './pages/PatientDetails';

// function App() {
//     return (
//         <Router>
//             <Layout>
//                 <Routes>
//                     <Route path="/" element={<Dashboard />} />
//                     <Route path="/add-patient" element={<AddPatient />} />
//                     <Route path="/patient/:id" element={<PatientDetails />} />
//                     <Route path="/doctor" element={<DoctorDashboard />} />
//                 </Routes>
//             </Layout>
//         </Router>
//     );
// }

// export default App;

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HealthReport from "./components/HealthReport";
import Layout from "./components/Layout";
import AddPatient from "./pages/AddPatient";
import Camp from "./pages/Camp";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDetails from "./pages/PatientDetails";
import OurVolunteers from "./pages/OurVolunteers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import JoinUs from "./pages/JoinUs";
import AdminApplications from "./pages/AdminApplications";
import UserCamps from "./pages/UserCamps";
import MyCamps from "./pages/MyCamps";
import DoctorCamps from "./pages/DoctorCamps";
import AdminDashboard from "./pages/AdminDashboard";
import Partners from "./pages/Partners";

import AIChatBox from "./components/AIChatBox";
import ADashboard from "./pages/ADashboard";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/patient/:id" element={<PatientDetails />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/camp" element={<Camp />} />
          <Route path="/my-camps" element={<MyCamps />} />
          <Route path="/doctor-camps" element={<DoctorCamps />} />
          <Route path="/user-camps" element={<UserCamps />} />
          {/* ✅ Health Report Download Page */}
          <Route path="/health-report" element={<HealthReport />} />
          <Route path="/our-volunteers" element={<OurVolunteers />} />
          {/* <Route path="/join-us" element={<JoinUs />} /> */}
          <Route path="/admin/applications" element={<AdminApplications />} /> {/* ✅ Admin Applications */}
          <Route path="/partners" element={<Partners />} /> {/* ✅ Partners Page */}
          <Route path="/employeedashboard" element={<EmployeeDashboard />} />
          <Route path="/adashboard" element={<ADashboard />} />
        </Routes>
      </Layout>
      {/* <AIChatBox /> */}
    </Router>
  );
}

export default App;

