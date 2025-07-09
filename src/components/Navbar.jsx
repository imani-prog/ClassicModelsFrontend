import {
  AlertCircle,
  Bell,
  CheckCircle,
  ChevronDown,
  Clock,
  HelpCircle,
  Info,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const Navbar = ({ isOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [lastClickTime, setLastClickTime] = useState({});

  // Helper functions to get user display data
  const getUserInitials = () => {
    if (!user) return 'U';
    
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

  const getUserRole = () => {
    return user?.role || user?.userType || 'User';
  };

  const handleLogout = () => {
    console.log('🔓 Logging out user...');
    logout();
    navigate('/login');
  };

  const handleViewProfile = () => {
    console.log('🔍 Attempting to navigate to /admin-profile');
    navigate('/admin-profile');
    console.log('🔍 Navigate call completed');
    setShowProfile(false); // Close dropdown
  };

  const handleAccountSettings = () => {
    console.log('🔧 Opening account settings...');
    // You can navigate to settings page or open a settings modal
    // navigate('/settings');
    alert('Account Settings - Feature coming soon!');
    setShowProfile(false);
  };

  const handleSecurity = () => {
    console.log('🔒 Opening security settings...');
    // You can navigate to security page or open a security modal
    alert('Security Settings - Feature coming soon!');
    setShowProfile(false);
  };

  const handleHelpSupport = () => {
    console.log('❓ Opening help & support...');
    // You can navigate to help page or open a help modal
    alert('Help & Support - Feature coming soon!');
    setShowProfile(false);
  };

  // Mock data for notifications
  const notifications = [
    { id: 1, type: 'order', message: 'New order #ORD-2166 received', time: '2 minutes ago', read: false },
    { id: 2, type: 'payment', message: 'Payment of $1,250 processed', time: '15 minutes ago', read: false },
    { id: 3, type: 'alert', message: 'Low stock alert: Product XYZ', time: '1 hour ago', read: true },
    { id: 4, type: 'info', message: 'System maintenance scheduled', time: '2 hours ago', read: true },
  ];

  // Mock data for messages
  const messages = [
    { id: 1, sender: 'John Smith', avatar: 'J', message: 'Order inquiry about product #123', time: '5 min ago', online: true },
    { id: 2, sender: 'Sarah Johnson', avatar: 'S', message: 'Payment confirmation needed', time: '12 min ago', online: false },
    { id: 3, sender: 'Mike Davis', avatar: 'M', message: 'Shipping update request', time: '1 hour ago', online: true },
  ];

  // Handle double click to close dropdowns
  const handleDropdownClick = (dropdownName) => {
    const now = Date.now();
    const lastClick = lastClickTime[dropdownName] || 0;
    const timeDiff = now - lastClick;

    if (timeDiff < 300) {
      // Close all dropdowns on double click
      setShowNotifications(false);
      setShowMessages(false);
      setShowProfile(false);
      setShowHelp(false);
    } else {
      // Single click - toggle specific dropdown
      switch (dropdownName) {
        case 'notifications':
          setShowNotifications(!showNotifications);
          setShowMessages(false);
          setShowProfile(false);
          setShowHelp(false);
          break;
        case 'messages':
          setShowMessages(!showMessages);
          setShowNotifications(false);
          setShowProfile(false);
          setShowHelp(false);
          break;
        case 'profile':
          setShowProfile(!showProfile);
          setShowNotifications(false);
          setShowMessages(false);
          setShowHelp(false);
          break;
        case 'help':
          setShowHelp(!showHelp);
          setShowNotifications(false);
          setShowMessages(false);
          setShowProfile(false);
          break;
      }
    }

    setLastClickTime(prev => ({ ...prev, [dropdownName]: now }));
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowMessages(false);
        setShowProfile(false);
        setShowHelp(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

 

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };


  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    // Add search logic here
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Handle search submission
      console.log('Searching for:', searchValue);
    }
  };

  const markNotificationAsRead = (id) => {
    // Logic to mark notification as read
    console.log('Marking notification as read:', id);
  };

  const clearAllNotifications = () => {
    // Logic to clear all notifications
    console.log('Clearing all notifications');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'payment': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'info': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm z-50 transition-all duration-300 ${
      isOpen ? 'left-60' : 'left-16'
    }`}>
      <div className="flex items-center justify-between px-6 h-full">
        
        {/* Left Section - Search with Enhanced Features */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders, customers, products..."
              value={searchValue}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section - Enhanced Actions */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 group-hover:text-yellow-500 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
            )}
          </button>

          {/* Help & Support */}
          <div className="relative dropdown-container">
            <button
              onClick={() => handleDropdownClick('help')}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              title="Help & Support"
            >
              <HelpCircle className="w-5 h-5 text-gray-600 group-hover:text-green-500 transition-colors" />
            </button>
            
            {/* Help Dropdown */}
            {showHelp && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Help & Support</h3>
                </div>
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Documentation
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Keyboard Shortcuts
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Contact Support
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Report Bug
                  </button>
                  <hr className="my-2 border-gray-100" />
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    System Status
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Notifications */}
          <div className="relative dropdown-container">
            <button
              onClick={() => handleDropdownClick('notifications')}
              className="relative p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{unreadCount}</span>
                </div>
              )}
            </button>
            
            {/* Enhanced Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        notification.read ? 'border-gray-200' : 'border-orange-500'
                      } ${!notification.read ? 'bg-orange-50/50' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Messages */}
          <div className="relative dropdown-container">
            <button
              onClick={() => handleDropdownClick('messages')}
              className="relative p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{messages.length}</span>
              </div>
            </button>
            
            {/* Enhanced Messages Dropdown */}
            {showMessages && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Messages</h3>
                  <button className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                    View All
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">{message.avatar}</span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            message.online ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-800">{message.sender}</p>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
                    Open Messages
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Profile */}
          <div className="relative dropdown-container">
            <button
              onClick={() => handleDropdownClick('profile')}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-800">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500">{getUserRole()}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>
            
            {/* Enhanced Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{getUserInitials()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500">{getUserEmail()}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button 
                    onClick={handleViewProfile}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  <button 
                    onClick={handleAccountSettings}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>
                  <button 
                    onClick={handleSecurity}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Security</span>
                  </button>
                  <button 
                    onClick={handleHelpSupport}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Help & Support</span>
                  </button>
                  <hr className="my-2 border-gray-100" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button 
            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
    </nav>
  );
};

export default Navbar;