import {
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import AIChat from "./AIChat";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const dashboardPath = role === "user" ? "/user-camps" : "/dashboard";

  // Hide Navbar on Login (path '/') and Register (path '/register')
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="w-full h-full">{children}</main>
        {/* Optional: Show AIChat even on login? Maybe not. */}
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const NavLinks = ({ mobile = false }) => {
    const close = mobile ? () => setIsMobileMenuOpen(false) : () => { };

    const baseClass = mobile
      ? "flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all"
      : "flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all";

    const activeClass = mobile
      ? "flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 font-semibold rounded-lg"
      : "flex items-center gap-2 px-3 py-2 text-sm font-medium bg-indigo-50 text-indigo-600 rounded-lg";

    const getLinkClass = ({ isActive }) => (isActive ? activeClass : baseClass);

    return (
      <>
        {role === "user" ? (
          <>
            <NavLink to="/user-camps" className={getLinkClass} onClick={close}>
              <span>Camp Update</span>
            </NavLink>
            <NavLink to="/our-volunteers" className={getLinkClass} onClick={close}>
              <span>Our Volunteers</span>
            </NavLink>
            <NavLink to="/join-us" className={getLinkClass} onClick={close}>
              <span>Join Us</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={getLinkClass} onClick={close}>
              <span>Dashboard</span>
            </NavLink>
            {role === "admin" && (
              <NavLink to="/admin/applications" className={getLinkClass} onClick={close}>
                <span>Requests</span>
              </NavLink>
            )}
            <NavLink to="/camp" className={getLinkClass} onClick={close}>
              <span>Camps</span>
            </NavLink>
            <NavLink to="/add-patient" className={getLinkClass} onClick={close}>
              <span>Add Patient</span>
            </NavLink>
            {/* Only show Partner Panel to partners and admins, not employees */}
            {(role === "partner" || role === "admin") && (
              <NavLink to="/doctor" className={getLinkClass} onClick={close}>
                <span>Partner Panel</span>
              </NavLink>
            )}
          </>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`${mobile ? "flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50" : "flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"} transition-all`}
        >
          <span>Logout</span>
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= TOP NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo - Clickable to Dashboard */}
            <Link
              to={dashboardPath}
              className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity cursor-pointer active:scale-95 transform transition-all"
            >
              <div className="p-1">
                <img src={logo} alt="Timely Health Logo" className="h-10 w-auto object-contain" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              <NavLinks />
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLinks mobile={true} />
            </div>
          </div>
        )}
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer (Optional, can be kept minimal) */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © 2025 Timely Health. All rights reserved.
      </footer>

      {/* ✅ FLOAT AI CHAT */}
      <AIChat />
    </div>
  );
};

export default Layout;
