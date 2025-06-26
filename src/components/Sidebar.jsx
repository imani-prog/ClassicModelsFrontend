import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome, FaBox, FaUsers, FaClipboardCheck, FaMoneyCheck, FaUserTie, FaBuilding
} from 'react-icons/fa';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const navigate = useNavigate();

  const handleTabClick = (tabName, path) => {
    setActiveTab(tabName);
    navigate(path);
  };

  const menuItems = [
    { name: 'Home', icon: <FaHome />, path: '/' },
    { name: 'Products', icon: <FaBox />, path: '/products' },
    { name: 'Customers', icon: <FaUsers />, path: '/customers' },
    { name: 'Orders', icon: <FaClipboardCheck />, path: '/orders' },
    { name: 'Payments', icon: <FaMoneyCheck />, path: '/payments' },
    { name: 'Employees', icon: <FaUserTie />, path: '/employees' },
    { name: 'Offices', icon: <FaBuilding />, path: '/offices' },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-[#1a2f43] text-white shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-left justify-left px-4 py-3 border-b border-gray-700">
        <h1 className="text-lg text-left font-bold text-[#4a90e2]">Classic<span className="text-white">Models</span></h1>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.name}>
              <button
                onClick={() => handleTabClick(item.name, item.path)}
                className={`flex items-center gap-4 w-full px-4 py-2 text-[#4a90e2] hover:bg-gray-700 font-semibold text-lg transition-all duration-150 
                  ${activeTab === item.name ? 'bg-gray-700' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
