import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
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
      <div className={`transition-all duration-300 ${isOpen ? "ml-60" : "ml-16"}`}>
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
          transition-all duration-300
          ${isOpen ? "ml-60" : "ml-16"} 
          ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"} 
          h-screen overflow-hidden px-4 pb-4
        `}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {children ? children : <Outlet context={{ darkMode, setDarkMode, isOpen, setIsOpen }} />}
        </div>
      </div>
    </>
  );
};

export default Layout;
