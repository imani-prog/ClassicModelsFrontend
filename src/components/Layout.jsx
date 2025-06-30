import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Make sure you have this component
import Sidebar from "./Sidebar";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "false";
  });

  return (
    <>
      {/* Sidebar (fixed left) */}
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Top Navbar (fixed) */}
      <div className={`ml-${isOpen ? "60" : "16"}`}>
        <Navbar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </div>

      {/* Main Content */}
      <div
        className={`
          pt-20  
          ${isOpen ? "ml-60" : "ml-16"} 
          ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"} 
          h-screen overflow-hidden px-4 pb-4 transition-all duration-300
        `}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <Outlet context={{ darkMode, setDarkMode, isOpen, setIsOpen }} />
        </div>
      </div>
    </>
  );
};

export default Layout;
