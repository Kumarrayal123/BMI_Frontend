// import { Activity, LayoutDashboard, ShieldCheck, UserPlus } from 'lucide-react';
// import { NavLink } from 'react-router-dom';

// const Layout = ({ children }) => {
//     return (
//         <div className="flex h-screen font-sans bg-gray-50">
//             {/* Sidebar */}
//             <aside className="flex flex-col w-64 text-white shadow-2xl bg-gradient-to-b from-indigo-900 to-indigo-700">
//                 <div className="flex items-center gap-3 p-6 border-b border-indigo-600/30">
//                     <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
//                         <Activity size={28} className="text-pink-400" />
//                     </div>
//                     <div>
//                         <h1 className="text-xl font-bold tracking-tight">MediTrack</h1>
//                         <p className="text-xs text-indigo-300">BMI & Health System</p>
//                     </div>
//                 </div>

//                 <nav className="flex-1 p-4 space-y-2">
//                     <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 shadow-lg border-l-4 border-pink-500 font-semibold' : 'hover:bg-white/5 hover:translate-x-1 text-indigo-100'}`}>
//                         <LayoutDashboard size={20} /> Dashboard
//                     </NavLink>
//                     <NavLink to="/add-patient" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 shadow-lg border-l-4 border-pink-500 font-semibold' : 'hover:bg-white/5 hover:translate-x-1 text-indigo-100'}`}>
//                         <UserPlus size={20} /> Add Patient
//                     </NavLink>
//                     <NavLink to="/doctor" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 shadow-lg border-l-4 border-pink-500 font-semibold' : 'hover:bg-white/5 hover:translate-x-1 text-indigo-100'}`}>
//                         <ShieldCheck size={20} /> Doctor Panel
//                     </NavLink>
//                 </nav>

//                 <div className="p-4 text-xs text-center text-indigo-300 border-t border-indigo-600/30">
//                     <p>&copy; 2025 MediTrack Systems</p>
//                 </div>
//             </aside>

//             {/* Main Content */}
//             <main className="flex-1 overflow-y-auto">
//                 <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white shadow-sm">
//                     <h2 className="text-xl font-semibold text-gray-800">Welcome Back, Dr.</h2>
//                     <div className="flex items-center gap-4">
//                         <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full shadow-md bg-gradient-to-tr from-purple-500 to-pink-500">
//                             Dr
//                         </div>
//                     </div>
//                 </header>
//                 <div className="p-8">
//                     {children}
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default Layout;


// import { LayoutDashboard, Menu, ShieldCheck, UserPlus } from 'lucide-react';
// import { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import logo from "../assets/logo.png";

// const Layout = ({ children }) => {
//     const [open, setOpen] = useState(false);

//     return (
//         <div className="flex h-screen font-sans bg-gray-50">

//             {/* ======= MOBILE SIDEBAR OVERLAY ======= */}
//             {open && (
//                 <div
//                     className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
//                     onClick={() => setOpen(false)}
//                 />
//             )}

//             {/* ======= SIDEBAR ======= */}
//             <aside className={`
//                 fixed lg:static top-0 left-0 h-full w-64 
//                 bg-[#007A52] text-white shadow-2xl flex flex-col 
//                 transition-transform duration-300 z-40
//                 ${open ? "translate-x-0" : "-translate-x-64 lg:translate-x-0"}
//             `}>
//                 {/* logo */}
//                 <div className="flex items-center gap-3 p-6 border-b border-indigo-600/30">
//                     <div className="p-2 bg-white rounded-lg backdrop-blur-sm">
//                         <img src={logo} alt="Logo" className="object-contain w-8 h-8" />
//                     </div>
//                     <div>
//                         <h1 className="text-xl font-bold tracking-tight">Timely Health</h1>
//                         <p className="text-xs text-[#ffff]">BMI & Camp Update </p>
//                     </div>
//                 </div>

//                 {/* MENU */}
//                 <nav className="flex-1 p-4 space-y-2">
//                     <MenuItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
//                     <MenuItem to="/add-patient" icon={<UserPlus size={20} />} label="Add Patient" />
//                     <MenuItem to="/doctor" icon={<ShieldCheck size={20} />} label="Partner Panel" />
//                     <MenuItem to="/camp" icon={<ShieldCheck size={20} />} label="Camp Update" />
//                 </nav>

//                 <div className="p-4 text-xs text-center text-[#ffff] border-t border-indigo-600/30">
//                     <p>&copy; 2025 Timely Health</p>
//                 </div>
//             </aside>

//             {/* ======= MAIN CONTENT ======= */}
//             <main className="flex-1 overflow-y-auto">

//                 {/* Top Navbar */}
//                 {/* <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white shadow-sm">


//                     <button
//                         className="p-2 bg-gray-100 rounded-lg shadow-sm lg:hidden"
//                         onClick={() => setOpen(true)}
//                     >
//                         <Menu size={24} className="text-gray-700" />
//                     </button>

//                     <h2 className="text-xl font-semibold text-gray-800">Welcome Back,</h2>

//                     <div className="flex items-center gap-4">
//                         <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-md overflow-hidden bg-white">
//                             <img src={logo} alt="Logo" className="object-contain w-8 h-8" />
//                         </div>
//                     </div>

//                 </header> */}

//                 {/* Main Page Content */}
//                 <div className="p-8">
//                     {children}
//                 </div>
//             </main>
//         </div>
//     );
// };

// /* ======= MENU ITEM COMPONENT ======= */
// const MenuItem = ({ to, icon, label }) => (
//     <NavLink
//         to={to}
//         className={({ isActive }) =>
//             `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 
//             ${isActive
//                 ? "bg-white/10 shadow-lg border-l-4 border-pink-500 font-semibold"
//                 : "hover:bg-white/5 hover:translate-x-1 text-[#ffff]"
//             }`
//         }
//     >
//         {icon} {label}
//     </NavLink>
// );

// export default Layout;



import {
  LayoutDashboard,
  Menu,
  ShieldCheck,
  User,
  UserPlus,
  Users
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar on Login (path '/') and Register (path '/register')
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="w-full h-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full
          w-52
          bg-[#007A52] text-white
          flex flex-col
          transition-transform duration-300 z-40
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* LOGO — MAX TIGHT */}
        <div className="p-3 border-b border-white/20 flex justify-center">
          <div className="bg-white px-1 py-2 rounded-lg">
            <img
              src={logo}
              alt="Timely Health"
              className="w-22 object-contain"
            />
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 mt-5 space-y-4 px-2">
          {/* LOGIC: Check Role */}
          {(() => {
            const role = localStorage.getItem("role"); // 'user', 'partner', 'employee', 'admin'

            if (role === "user") {
              // === NORMAL USER MENU ===
              return (
                <>
                  <MenuItem to="/user-camps" icon={<ShieldCheck size={25} />} label="Camp Update" close={() => setOpen(false)} />
                  <MenuItem to="/our-volunteers" icon={<Users size={25} />} label="Our Volunteers" close={() => setOpen(false)} />
                  <MenuItem to="/join-us" icon={<UserPlus size={25} />} label="Join Us" close={() => setOpen(false)} />
                </>
              );
            }

            // === DEFAULT / FULL MENU (Admin, Employee, Partner) ===
            return (
              <>
                <MenuItem to="/dashboard" icon={<LayoutDashboard size={25} />} label="Dashboard" close={() => setOpen(false)} />
                {role === "admin" && (
                  <MenuItem to="/admin/applications" icon={<User size={25} />} label="Requests" close={() => setOpen(false)} />
                )}
                <MenuItem to="/camp" icon={<ShieldCheck size={25} />} label="Camp Update" close={() => setOpen(false)} />
                <MenuItem to="/add-patient" icon={<UserPlus size={25} />} label="Add Patient" close={() => setOpen(false)} />
                <MenuItem to="/doctor" icon={<ShieldCheck size={25} />} label="Partner Panel" close={() => setOpen(false)} />
                <MenuItem to="/our-volunteers" icon={<Users size={25} />} label="Our Volunteers" close={() => setOpen(false)} />
                <MenuItem to="/join-us" icon={<UserPlus size={25} />} label="Join Us" close={() => setOpen(false)} />
              </>
            );
          })()}
        </nav>

        <div className="p-2 text-[11px] text-center border-t border-white/20 text-white/80">
          © 2025 Timely Health
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">

        <header className="sticky top-0 z-20 flex items-center gap-3 p-4 bg-white border-b lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg bg-gray-100"
          >
            <Menu size={22} />
          </button>
          <img src={logo} alt="Timely Health" className="h-8 object-contain" />
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

/* MENU ITEM — ULTRA TIGHT */
const MenuItem = ({ to, icon, label, close }) => (
  <NavLink
    to={to}
    onClick={close}
    className={({ isActive }) =>
      `flex items-center gap-3
       px-2 py-2.5 rounded-xl transition-all
       ${isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`
    }
  >
    {icon}
    <span className="text-sm leading-none">{label}</span>
  </NavLink>
);

export default Layout;








