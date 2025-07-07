import { useState } from 'react';
import {
  FaBars,
  FaBox,
  FaBuilding,
  FaClipboardCheck,
  FaHome,
  FaMoneyCheck,
  FaUsers,
  FaUserTie
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
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
    <aside className={`fixed top-0 left-0 h-full bg-[#1a2f43] text-white shadow-lg transition-all duration-300 z-40 ${
      isOpen ? 'w-60' : 'w-16'
    }`}>
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
          <h1 className="text-lg font-bold text-[#4a90e2] whitespace-nowrap">
            Classic<span className="text-white">Models</span>
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex-shrink-0"
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <FaBars className="w-4 h-4 text-[#4a90e2]" />
        </button>
      </div>
      
      {/* Business Management subtitle */}
      <div className={`px-4 py-2 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <p className="text-sm text-slate-400 mt-1">Business Management</p>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.name}>
              <button
                onClick={() => handleTabClick(item.name, item.path)}
                className={`flex items-center gap-4 w-full px-4 py-3 text-[#4a90e2] hover:bg-gray-700 font-semibold transition-all duration-200 group relative
                  ${activeTab === item.name ? 'bg-gray-700 border-r-2 border-[#4a90e2]' : ''}`}
                title={!isOpen ? item.name : ''}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                <span className={`transition-all duration-300 whitespace-nowrap ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 w-0 overflow-hidden'
                }`}>
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
