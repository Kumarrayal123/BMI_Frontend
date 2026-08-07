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
  ChevronDown,
  Phone,
  MapPin,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import TimelyHealthLogo from "../assets/Timelyhealth logo.png";
import AIChat from "./AIChat";
import ProfileModal from "./ProfileModal";
import config from "../config";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const role = localStorage.getItem("role");

  const getUserData = () => {
    let name = "User";
    let email = "user@timelyhealth.com";
    try {
      if (role === "admin") {
        const localVal = localStorage.getItem("adminData");
        const data = localVal ? JSON.parse(localVal) : {};
        name = data.name || "Admin";
        email = data.email || "admin@timelyhealth.com";
      } else if (role === "partner") {
        const localVal = localStorage.getItem("userData");
        const data = localVal ? JSON.parse(localVal) : {};
        name = data.name || "Partner";
        email = data.email || "partner@timelyhealth.com";
      } else if (role === "employee") {
        const localVal = localStorage.getItem("employeeData");
        const data = localVal ? JSON.parse(localVal) : {};
        name = data.name || localStorage.getItem("employeeName") || "Employee";
        email = data.email || localStorage.getItem("employeeEmail") || "employee@company.com";
      } else if (role === "volunteer") {
        const localVal = localStorage.getItem("volunteerData");
        const data = localVal ? JSON.parse(localVal) : {};
        name = data.name || localStorage.getItem("employeeName") || "Volunteer";
        email = data.email || localStorage.getItem("employeeEmail") || "volunteer@company.com";
      } else {
        name = localStorage.getItem("employeeName") || localStorage.getItem("name") || "User";
        email = localStorage.getItem("employeeEmail") || localStorage.getItem("email") || "user@timelyhealth.com";
      }
    } catch (e) {
      console.error("Error parsing user data in layout:", e);
      name = localStorage.getItem("employeeName") || localStorage.getItem("name") || "User";
      email = localStorage.getItem("employeeEmail") || localStorage.getItem("email") || "user@timelyhealth.com";
    }
    return { name, email };
  };

  const { name: userName, email: userEmail } = getUserData();

  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userClinicName, setUserClinicName] = useState("");
  const [userGender, setUserGender] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [syncError, setSyncError] = useState("");

  const getUserId = () => {
    try {
      if (role === "admin") {
        const data = JSON.parse(localStorage.getItem("adminData") || "{}");
        return data._id || data.id;
      } else if (role === "employee") {
        return localStorage.getItem("employeeId");
      } else if (role === "partner") {
        return localStorage.getItem("userId");
      } else if (role === "volunteer") {
        return localStorage.getItem("userId");
      } else {
        return localStorage.getItem("userId");
      }
    } catch (e) {
      return localStorage.getItem("userId");
    }
  };

  const userId = getUserId();

  const loadOfflineDetails = () => {
    try {
      let localData = {};
      if (role === "admin") {
        localData = JSON.parse(localStorage.getItem("adminData") || "{}");
      } else if (role === "employee") {
        localData = JSON.parse(localStorage.getItem("employeeData") || "{}");
      } else if (role === "partner") {
        localData = JSON.parse(localStorage.getItem("userData") || "{}");
      } else if (role === "volunteer") {
        localData = JSON.parse(localStorage.getItem("volunteerData") || "{}");
      }

      setUserPhone(localData.phone || localData.mobile || "");
      setUserAddress(localData.address || "");
      setUserClinicName(localData.clinicName || "");
      setUserGender(localData.gender || "");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOfflineDetails();
  }, [role, isProfileModalOpen]);

  const fetchLiveDetails = async () => {
    if (!userId || !role) return;
    setLoadingDetails(true);
    setSyncError("");
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/profile/${userId}?role=${role}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const data = result.data;
        setUserPhone(data.phone || data.mobile || "");
        setUserAddress(data.address || "");
        setUserClinicName(data.clinicName || "");
        setUserGender(data.gender || "");
        
        // Also update local storage to keep it in sync!
        if (role === "admin") {
          const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
          localStorage.setItem("adminData", JSON.stringify({ ...adminData, ...data }));
        } else if (role === "employee") {
          const employeeData = JSON.parse(localStorage.getItem("employeeData") || "{}");
          localStorage.setItem("employeeData", JSON.stringify({ ...employeeData, ...data }));
        } else if (role === "partner") {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          localStorage.setItem("userData", JSON.stringify({ ...userData, ...data }));
        } else if (role === "volunteer") {
          const volunteerData = JSON.parse(localStorage.getItem("volunteerData") || "{}");
          localStorage.setItem("volunteerData", JSON.stringify({ ...volunteerData, ...data }));
        }
      } else {
        setSyncError("Failed to sync live details.");
      }
    } catch (err) {
      console.error(err);
      setSyncError("Offline mode active.");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (isProfileDropdownOpen) {
      fetchLiveDetails();
    }
  }, [isProfileDropdownOpen]);

  const getRoleBadgeClass = () => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm";
      case "partner":
        return "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm";
      case "volunteer":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm";
      case "employee":
        return "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm";
      default:
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm";
    }
  };

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
        { path: "/camp-members", icon: Users, label: "Camp Members" },
        { path: "/all-reports", icon: FileSpreadsheet, label: "Reports" },
        {path:'/common-volunteer', icon: Users2, label: 'Volunteers'}
      );
    } else if (role === "partner") {
      items.push(
        { path: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/doctor-camps", icon: Calendar, label: "Camps" },
        { path: "/camp-members", icon: Users, label: "Camp Members" },
        { path: "/partner-volunteers", icon: Users2, label: "Volunteers" },
        { path: "/partner-all-reports", icon: FileSpreadsheet, label: "Reports" },
      );
    } else if (role === "employee" || role === "volunteer") {
      items.push(
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/my-camps", icon: Calendar, label: "Camps" },
        { path: "/camp-members", icon: Users, label: "Camp Members" },
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

            {/* Right: Profile Dropdown Menu & Mobile Menu Button */}
            <div className="flex items-center gap-2">
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200 outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm select-none">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold">{userName}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
                    {/* User Summary */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden flex-1 text-left">
                        <h4 className="font-bold text-gray-900 truncate">{userName}</h4>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                        <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeClass()}`}>
                          {role}
                        </span>
                      </div>
                    </div>

                    {/* Sync Error */}
                    {syncError && (
                      <div className="mb-3 bg-red-50 border-l-4 border-red-500 p-2 rounded-lg flex items-start">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-1.5 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-red-700 font-medium">{syncError}</span>
                      </div>
                    )}

                    {/* Details List */}
                    <div className="border-t border-gray-100 py-3 space-y-2.5 text-sm text-gray-600 text-left">
                      {loadingDetails ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="animate-spin text-indigo-600 h-5 w-5" />
                        </div>
                      ) : (
                        <>
                          {/* Phone */}
                          {userPhone ? (
                            <div className="flex items-center gap-2.5">
                              <Phone size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate text-gray-700">{userPhone}</span>
                            </div>
                          ) : null}
                          
                          {/* Address */}
                          {userAddress ? (
                            <div className="flex items-start gap-2.5">
                              <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-xs leading-snug line-clamp-2">{userAddress}</span>
                            </div>
                          ) : null}

                          {/* Clinic Name (Partner only) */}
                          {role === "partner" && userClinicName ? (
                            <div className="flex items-center gap-2.5">
                              <Building2 size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate text-gray-700">{userClinicName}</span>
                            </div>
                          ) : null}

                          {/* Gender (Volunteer only) */}
                          {role === "volunteer" && userGender ? (
                            <div className="flex items-center gap-2.5">
                              <Users2 size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate text-gray-700">{userGender}</span>
                            </div>
                          ) : null}

                          {/* Fallback if no details */}
                          {!userPhone && !userAddress && (!userClinicName || role !== 'partner') && (!userGender || role !== 'volunteer') && (
                            <p className="text-xs text-gray-400 italic text-center py-1">No profile details set.</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-semibold text-xs text-center transition duration-200"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition duration-200"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
              {/* Mobile Profile Link */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span>My Profile</span>
              </button>

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

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};

export default Layout;