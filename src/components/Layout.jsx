import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar"; // ✅ Make sure you have this component

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
          pt-16  // Push below navbar
          ${isOpen ? "ml-60" : "ml-16"} 
          ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"} 
          min-h-screen p-4 transition-all duration-300
        `}
      >
        <Outlet context={{ darkMode, setDarkMode, isOpen, setIsOpen }} />
      </div>
    </>
  );
};

export default Layout;
