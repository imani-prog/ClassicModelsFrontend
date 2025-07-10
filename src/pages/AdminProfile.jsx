import { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaBell,
    FaChartLine,
    FaClock,
    FaCog,
    FaDownload,
    FaEdit,
    FaKey,
    FaSave,
    FaShieldAlt,
    FaUser,
    FaUserShield
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminProfile = () => {
  console.log('AdminProfile component is loading!');
  const { user, logout, isLoading } = useAuth();
  console.log('AdminProfile - user:', user, 'isLoading:', isLoading);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    location: '',
    bio: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC'
  });
  const [activityLog, setActivityLog] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalLogins: 0,
    lastLogin: null,
    accountCreated: null,
    permissionsLevel: 'Administrator',
    systemAccess: ['Dashboard', 'User Management', 'Reports', 'Settings']
  });

  useEffect(() => {
    if (user) {
      console.log('User data available:', user);
      setProfileData({
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'Administration',
        position: user.position || 'System Administrator',
        location: user.location || '',
        bio: user.bio || ''
      });

      setAdminStats({
        totalLogins: user.totalLogins || user.login_count || 0,
        lastLogin: user.lastLogin || user.last_login || new Date().toISOString(),
        accountCreated: user.createdAt || user.created_at || user.dateCreated || new Date().toISOString(),
        permissionsLevel: user.role === 'ADMIN' ? 'Administrator' : user.role || 'User',
        systemAccess: ['Dashboard', 'User Management', 'Reports', 'Settings', 'System Logs']
      });

      fetchUserActivityLog();
    }
  }, [user]);

  const fetchUserActivityLog = async () => {
    try {
     
      setActivityLog([
        { action: 'Logged in to dashboard', timestamp: new Date().toISOString(), ip: '192.168.1.100' },
        { action: 'Viewed customer records', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.100' },
        { action: 'Exported sales report', timestamp: new Date(Date.now() - 7200000).toISOString(), ip: '192.168.1.100' },
        { action: 'Updated system settings', timestamp: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.100' },
        { action: 'Performed data backup', timestamp: new Date(Date.now() - 172800000).toISOString(), ip: '192.168.1.100' }
      ]);
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
      setActivityLog([]);
    }
  };

  const handleSaveProfile = () => {
 
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));

    console.log('Updated preference:', key, value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDaysActive = (createdDate) => {
    if (!createdDate) return 0;
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUserInitials = () => {
    const firstName = profileData.firstName || user?.firstName || user?.first_name || '';
    const lastName = profileData.lastName || user?.lastName || user?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A';
  };

  const exportActivityLog = () => {
    const csvContent = activityLog.map(log => 
      `${log.timestamp},${log.action},${log.ip}`
    ).join('\n');
    const blob = new Blob([`Timestamp,Action,IP Address\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_activity_log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
                  title="Back to Dashboard"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{getUserInitials()}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName} {!profileData.firstName && !profileData.lastName && (user?.email || 'Admin User')}
                  </h1>
                  <p className="text-blue-600 font-medium">{adminStats.permissionsLevel}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <FaShieldAlt className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">System Administrator</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isEditing 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-600 hover:bg-slate-700 text-white shadow-md'
                  }`}
                >
                  {isEditing ? <FaSave className="w-4 h-4" /> : <FaEdit className="w-4 h-4" />}
                  <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium shadow-md"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'profile', label: 'Profile', icon: FaUser },
                { id: 'settings', label: 'Settings', icon: FaCog },
                { id: 'activity', label: 'Activity', icon: FaClock },
                { id: 'permissions', label: 'Permissions', icon: FaUserShield }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors font-medium ${
                    activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => setProfileData(prev => ({...prev, department: e.target.value}))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => setProfileData(prev => ({...prev, position: e.target.value}))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                    disabled={!isEditing}
                    rows={5}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-50' : 'bg-white'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Account Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaChartLine className="w-6 h-6 mr-3 text-blue-600" />
                  Account Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center bg-blue-50 rounded-lg p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{adminStats.totalLogins || 0}</div>
                    <div className="text-sm text-gray-600">Total Logins</div>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatDateShort(adminStats.lastLogin)}
                    </div>
                    <div className="text-sm text-gray-600">Last Login</div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {adminStats.systemAccess.length}
                    </div>
                    <div className="text-sm text-gray-600">System Access</div>
                  </div>
                  <div className="text-center bg-orange-50 rounded-lg p-6">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{calculateDaysActive(adminStats.accountCreated)}</div>
                    <div className="text-sm text-gray-600">Days Active</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Account created: {formatDate(adminStats.accountCreated)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Account Settings</h2>
                
                {/* Notification Preferences */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <FaBell className="w-5 h-5 mr-2 text-blue-600" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-700">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-700">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Receive browser notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.pushNotifications}
                          onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <FaKey className="w-5 h-5 mr-2 text-red-600" />
                    Security Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-700">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.twoFactorAuth}
                          onChange={(e) => handlePreferenceChange('twoFactorAuth', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="pt-4 border-t">
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                        <FaKey className="w-4 h-4" />
                        <span>Change Password</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Display Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="CST">Central Time</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Recent Activity</h2>
                <button
                  onClick={exportActivityLog}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>Export Log</span>
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {activityLog.map((log, index) => (
                  <div key={index} className="py-6 hover:bg-gray-50 transition-colors rounded-lg px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaClock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-lg">{log.action}</p>
                          <p className="text-sm text-gray-500">IP: {log.ip}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">System Permissions</h2>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <FaUserShield className="w-5 h-5 mr-2 text-green-600" />
                    Access Level: {adminStats.permissionsLevel}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminStats.systemAccess.map((access, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-800">{access}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Administrative Capabilities</h3>
                  <div className="space-y-4">
                    {[
                      'User Management - Create, edit, and delete users',
                      'System Configuration - Modify system settings',
                      'Data Export - Export sensitive business data',
                      'Audit Logs - View system audit trails',
                      'Backup Management - Manage system backups',
                      'Security Settings - Configure security policies'
                    ].map((capability, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <FaShieldAlt className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span className="text-gray-700">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminProfile;
