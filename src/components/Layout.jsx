// import {
//   Menu,
//   X
// } from "lucide-react";
// import { useState } from "react";
// import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
// import TimelyHealthLogo from "../assets/Timelyhealth logo.png";
// import AIChat from "./AIChat";

// const Layout = ({ children }) => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const role = localStorage.getItem("role");
//   const dashboardPath = role === "user"
//     ? "/user-camps"
//     : role === "admin"
//       ? "/admin/dashboard"
//       : role === "partner"
//         ? "/doctor"
//         : "/dashboard";

//   // Hide Navbar on Login (path '/login'), Register (path '/register'), and Landing (path '/' or '/landing')
//   const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/landing";

//   // Pages with full-screen admin dashboard styling (no padding)
//   const isAdminDashPage = location.pathname === "/dashboard" || 
//                           location.pathname === "/my-camps" ||
//                           location.pathname === "/admin/dashboard";

//   if (isAuthPage) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <main className="w-full h-full">{children}</main>
//         {/* Optional: Show AIChat even on login? Maybe not. */}
//       </div>
//     );
//   }

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/");
//   };

//   const NavLinks = ({ mobile = false }) => {
//     const close = mobile ? () => setIsMobileMenuOpen(false) : () => { };

//     const baseClass = mobile
//       ? "flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all"
//       : "flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all";

//     const activeClass = mobile
//       ? "flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 font-semibold rounded-lg"
//       : "flex items-center gap-2 px-3 py-2 text-sm font-medium bg-indigo-50 text-indigo-600 rounded-lg";

//     const getLinkClass = ({ isActive }) => (isActive ? activeClass : baseClass);

//     return (
//       <>
//         {role === "user" ? (
//           <>
//             <NavLink to="/user-camps" className={getLinkClass} onClick={close}>
//               <span>Camp Update</span>
//             </NavLink>
//             <NavLink to="/our-volunteers" className={getLinkClass} onClick={close}>
//               <span>Our Volunteers</span>
//             </NavLink>
//             <NavLink to="/join-us" className={getLinkClass} onClick={close}>
//               <span>Join Us</span>
//             </NavLink>
//           </>
//         ) : (
//           <>
//             <NavLink
//               to={role === "admin" ? "/admin/dashboard" : role === "partner" ? "/doctor" : "/dashboard"}
//               className={getLinkClass}
//               onClick={close}
//             >
//               <span>Dashboard</span>
//             </NavLink>
//             {/* {role === "admin" && (
//               <NavLink to="/admin/applications" className={getLinkClass} onClick={close}>
//                 <span>Requests</span>
//               </NavLink>
//             )} */}
//             {(role === "employee" || role === "volunteer") ? (
//               <NavLink to="/my-camps" className={getLinkClass} onClick={close}>
//                 <span>My Camps</span>
//               </NavLink>
//             ) : role === "partner" ? (
//               <NavLink to="/doctor-camps" className={getLinkClass} onClick={close}>
//                 <span>My Camps</span>
//               </NavLink>
//             ) : (
//               <NavLink to="/camp" className={getLinkClass} onClick={close}>
//                 <span>Camps</span>
//               </NavLink>
//             )}
//             {role === "partner" && (
//            <NavLink to="/partner-volunteers" className={getLinkClass} onClick={close}>
//            <span>My Volunteers</span>
//            </NavLink>
//    )}
//              {role === "partner" && (
//            <NavLink to="/partner-all-reports" className={getLinkClass} onClick={close}>
//            <span>My Reports</span>
//            </NavLink>
//    )}
     
//             {/* <NavLink to="/add-patient" className={getLinkClass} onClick={close}>
//               <span>Add Patient</span>
//             </NavLink> */}
//             {/* Only show Partner Panel to partners and admins, not employees */}
//             {role === "admin" && (
//               <NavLink to="/partners" className={getLinkClass} onClick={close}>
//                 <span>Partners</span>
//               </NavLink>
//             )}
//             {role === "admin" && (
//               <NavLink to="/admin/teams" className={getLinkClass} onClick={close}>
//                 <span>Teams</span>
//               </NavLink>
//             )}
//             {role === "admin" && (
//               <NavLink to="/all-reports" className={getLinkClass} onClick={close}>
//                 <span>All Reports</span>
//               </NavLink>
//             )}
//           </>
//         )}

//         {/* Logout Button */}
//         <button
//           onClick={handleLogout}
//           className={`${mobile ? "flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50" : "flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"} transition-all`}
//         >
//           <span>Logout</span>
//         </button>
//       </>
//     );
//   };

//   return (
//     <div className={`min-h-screen flex flex-col ${isAdminDashPage ? 'bg-gray-50' : 'bg-gray-50'}`}>
//       {/* ================= TOP NAVBAR ================= */}
//       <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
//         <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">

//             {/* Logo - Clickable to Dashboard */}
//             <Link
//               to={dashboardPath}
//               className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity cursor-pointer active:scale-95 transform transition-all"
//             >
//               <div className="p-1">
//                 <img src={TimelyHealthLogo} alt="Timely Health Logo" className="h-10 w-auto object-contain" />
//               </div>
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center gap-2">
//               <NavLinks />
//             </nav>

//             {/* Mobile Menu Button */}
//             <div className="lg:hidden">
//               <button
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
//               >
//                 {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Navigation Dropdown */}
//         {isMobileMenuOpen && (
//           <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full z-50">
//             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//               <NavLinks mobile={true} />
//             </div>
//           </div>
//         )}
//       </header>

//       {/* ================= MAIN CONTENT ================= */}
//       <main className={`flex-1 w-full mx-auto ${isAdminDashPage ? 'bg-gray-50 p-0 min-h-full' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
//         {children}
//       </main>

//       {/* Footer (Optional, can be kept minimal) */}
//       <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
//         © 2025 Timely Health. All rights reserved.
//       </footer>

//       {/* ✅ FLOAT AI CHAT */}
//       <AIChat />
//     </div>
//   );
// };

// export default Layout;


import {
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  FileSpreadsheet,
  UserPlus,
  Users2,
  LogOut,
  UserCircle,
  ChevronDown
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import TimelyHealthLogo from "../assets/Timelyhealth logo.png";
import AIChat from "./AIChat";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("employeeName") || localStorage.getItem("name") || "User";
  const userEmail = localStorage.getItem("employeeEmail") || localStorage.getItem("email") || "user@timelyhealth.com";

  const dashboardPath = role === "user"
    ? "/user-camps"
    : role === "admin"
      ? "/admin/dashboard"
      : role === "partner"
        ? "/doctor"
        : "/dashboard";

  // Hide Navbar on Login/Register/Landing
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/landing";

  const isAdminDashPage = location.pathname === "/dashboard" || 
                          location.pathname === "/my-camps" ||
                          location.pathname === "/admin/dashboard";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="w-full h-full">{children}</main>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Navigation Items for Top Nav
  const getNavItems = () => {
    const items = [];

    if (role === "admin") {
      items.push(
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/camp", icon: Calendar, label: "Camps" },
        { path: "/partners", icon: Building2, label: "Partners" },
        { path: "/admin/teams", icon: Users, label: "Teams" },
        { path: "/all-reports", icon: FileSpreadsheet, label: "Reports" },
      );
    } else if (role === "partner") {
      items.push(
        { path: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/doctor-camps", icon: Calendar, label: "Camps" },
        { path: "/partner-volunteers", icon: Users2, label: "Volunteers" },
        { path: "/partner-all-reports", icon: FileSpreadsheet, label: "Reports" },
        // { path: "/add-patient", icon: UserPlus, label: "Add Patient" },
      );
    } else if (role === "employee" || role === "volunteer") {
      items.push(
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/my-camps", icon: Calendar, label: "Camps" },
        // { path: "/add-patient", icon: UserPlus, label: "Add Patient" },
      );
    } else if (role === "user") {
      items.push(
        { path: "/user-camps", icon: Calendar, label: "Camp Update" },
        { path: "/our-volunteers", icon: Users, label: "Our Volunteers" },
        { path: "/join-us", icon: UserPlus, label: "Join Us" },
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ================= TOP NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left: Logo */}
            <Link
              to={dashboardPath}
              className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src={TimelyHealthLogo} alt="Timely Health" className="h-10 w-auto object-contain" />
            </Link>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: Logout */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full z-50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className={`flex-1 w-full mx-auto ${isAdminDashPage ? 'bg-gray-50 p-0 min-h-full' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-3 text-center text-xs text-gray-400">
        © 2025 Timely Health. All rights reserved.
      </footer>

      {/* ✅ FLOATING AI CHAT */}
      <AIChat />
    </div>
  );
};

export default Layout;