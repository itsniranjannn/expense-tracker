import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/common/Toast'; 
import {
  User,
  Mail,
  Shield,
  DollarSign,
  Calendar,
  Eye,
  EyeOff,
  Save,
  Camera,
  Download,
  Trash2,
  Edit2,
  Bell,
  Receipt,
  CheckCircle,
  AlertTriangle,
  LogOut,
  ChevronRight,
  RefreshCw,
  Key,
  Lock
} from 'lucide-react';
import { PaymentIcon } from '../components/common/ImageAssets';

const Profile = () => {
  const { user: authUser, updateProfile, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [deleteAccountMode, setDeleteAccountMode] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [stats, setStats] = useState({
    expenseCount: 0,
    totalAmount: 0
  });
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef(null);
  const toast = useToast(); // Initialize toast hook

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (authUser) {
      loadUserData();
      loadRecentExpenses();
      loadStats();
    }
  }, [authUser]);

 const loadUserData = async () => {
  try {
    const response = await authService.getProfile();
    if (response.success && response.user) {
      const userData = response.user;
      console.log('User data loaded:', userData);
      
      setUser(userData);
      setEditForm({
        name: userData.name || '',
        email: userData.email || ''
      });
      
      // Set profile image with full URL
   // Set profile image with full URL
if (userData.profile_picture) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  console.log('Profile picture path from DB:', userData.profile_picture);

  let finalImageUrl;

  if (userData.profile_picture && !userData.profile_picture.includes('/')) {
    finalImageUrl = `${baseUrl}/uploads/${userData.profile_picture}`;
  } 
  else if (userData.profile_picture && userData.profile_picture.startsWith('/')) {
    finalImageUrl = `${baseUrl}${userData.profile_picture}`;
  }
  else if (userData.profile_picture && userData.profile_picture.startsWith('http')) {
    finalImageUrl = userData.profile_picture;
  }

  // Cache busting
  const timestamp = new Date().getTime();
  const cacheBustedUrl = `${finalImageUrl}?t=${timestamp}`;

  console.log('Final image URL:', cacheBustedUrl);
  setProfileImage(cacheBustedUrl);
} else {
  const name = userData.name || 'User';
  setProfileImage(
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=256`
  );
}

    }
  } catch (error) {
    console.error('Error loading user data:', error);
    toast.error('Failed to load profile data');
  } finally {
    setLoading(false);
  }
};

  const loadRecentExpenses = async () => {
    try {
      const response = await expenseService.getRecentExpenses(5);
      if (response.success) {
        setRecentExpenses(response.expenses || []);
      }
    } catch (error) {
      console.error('Error loading recent expenses:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Get all expenses to calculate stats
      const response = await expenseService.getAllExpenses();
      if (response.success && response.expenses) {
        const expenses = response.expenses || [];
        
        // Calculate stats
        const expenseCount = expenses.length;
        const totalAmount = expenses.reduce((sum, expense) => {
          return sum + (parseFloat(expense.amount) || 0);
        }, 0);
        
        console.log('Calculated stats:', { expenseCount, totalAmount });
        
        setStats({
          expenseCount,
          totalAmount
        });
      } else {
        setStats({
          expenseCount: 0,
          totalAmount: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load statistics');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Update profile with image
      await updateProfileWithImage(file);
    } catch (error) {
      console.error('Error in image upload:', error);
      toast.error('Failed to upload image');
    }
  };

const updateProfileWithImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    const response = await authService.updateProfile(formData);
    if (response.success) {
      toast.success('Profile picture updated successfully!');
      
      // Update user in context
      updateProfile(response.user);
      
      // Update local state with cache busting
      if (response.user.profile_picture) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const timestamp = new Date().getTime();
        let imageUrl;
        
        if (response.user.profile_picture.startsWith('http')) {
          imageUrl = response.user.profile_picture;
        } else if (response.user.profile_picture.startsWith('/uploads/')) {
          imageUrl = `${baseUrl}${response.user.profile_picture}`;
        } else {
          imageUrl = `${baseUrl}/uploads/${response.user.profile_picture}`;
        }
        
        // Force browser to reload image by adding timestamp
        setProfileImage(`${imageUrl}?t=${timestamp}`);
        console.log('Updated profile image URL:', `${imageUrl}?t=${timestamp}`);
      }
      
      // Refresh user data
      setTimeout(() => {
        loadUserData();
      }, 1000);
    } else {
      toast.error(response.message || 'Failed to update profile picture');
    }
  } catch (error) {
    console.error('Update profile picture error:', error);
    toast.error('Failed to update profile picture');
  }
};

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('name', editForm.name.trim());
      
      const response = await authService.updateProfile(formData);
      if (response.success) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
        updateProfile(response.user);
        loadUserData(); // Refresh user data
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      const response = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.success) {
        toast.success('Password changed successfully!');
        setChangePasswordMode(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm account deletion');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePassword })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Account deleted successfully');
        setTimeout(() => {
          authService.logout();
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleExportData = async () => {
    try {
      toast.loading('Preparing your data for export...');
      const response = await expenseService.getAllExpenses();
      
      if (response.success && response.expenses) {
        const dataStr = JSON.stringify(response.expenses, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `expense_data_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Data exported successfully!');
      } else {
        toast.error('No data to export');
      }
    } catch (error) {
      console.error('Export data error:', error);
      toast.error('Failed to export data');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'Rs 0.00';
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 'Rs 0.00';
    
    const formattedAmount = numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `Rs ${formattedAmount}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Fix for member since date
  const getMemberSince = () => {
    if (!user?.created_at) return 'N/A';
    
    try {
      const dateStr = user.created_at;
      let date;
      
      // Handle different date formats
      if (typeof dateStr === 'string') {
        // Try ISO format first
        date = new Date(dateStr);
        
        // If invalid, try MySQL format
        if (isNaN(date.getTime())) {
          // MySQL format: '2024-12-13 10:30:00'
          const mysqlDate = dateStr.replace(' ', 'T') + 'Z';
          date = new Date(mysqlDate);
        }
        
        // If still invalid, try direct parsing
        if (isNaN(date.getTime())) {
          date = new Date(dateStr.replace(' GMT', ''));
        }
      } else if (dateStr instanceof Date) {
        date = dateStr;
      }
      
      if (!date || isNaN(date.getTime())) {
        console.log('Invalid date string:', dateStr);
        return 'N/A';
      }
      
      // Format as "December 2023"
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date parsing error:', error, 'Date string:', user.created_at);
      return 'N/A';
    }
  };

  // Fix for image error fallback
// Fix for image error fallback - KEEP THIS ONE
const handleImageError = (e) => {
  e.target.onerror = null;
  const name = user?.name || 'User';
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=256`;
};

// NEW: Add these functions for better debugging:

// Track successful image loads
const handleImageLoad = (e) => {
  console.log('✅ Image loaded successfully from:', e.target.src);
};

// Better error handling
const handleImageErrorDetailed = (e) => {
  console.error('❌ Image failed to load:', e.target.src);
  console.log('User object:', user);
  console.log('Profile image state:', profileImage);
  
  e.target.onerror = null;
  const name = user?.name || 'User';
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=256`;
  console.log('🔄 Setting fallback URL:', fallbackUrl);
  e.target.src = fallbackUrl;
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto" />
          <p className="mt-4 text-gray-600">No user data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="relative mb-6">
                <div className="relative w-32 h-32 mx-auto">
<img
  src={profileImage}
  alt={user.name}
  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
  onLoad={handleImageLoad}
  onError={handleImageErrorDetailed}
/>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all shadow-lg"
                  >
                    <Camera size={18} />
                  </motion.button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center mt-6">
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600 flex items-center justify-center gap-1 mt-1">
                    <Mail size={16} />
                    {user.email}
                  </p>
                  
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <CheckCircle size={14} />
                      Account Active
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mt-4">
                    <span className="font-medium">Member since:</span> {getMemberSince()}
                  </p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="space-y-4">
                {/* Number of Expenses */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 text-white">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Number of Expenses</p>
                      <p className="font-bold text-gray-900">
                        {stats.expenseCount} {stats.expenseCount === 1 ? 'expense' : 'expenses'}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Total Amount */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 text-white">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(stats.totalAmount)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4"
            >
              <nav className="space-y-2">
                {[
                  { id: 'profile', icon: User, label: 'Profile Information' },
                  { id: 'security', icon: Shield, label: 'Security' },
                  { id: 'expenses', icon: Receipt, label: 'Recent Expenses' },
                  { id: 'preferences', icon: Bell, label: 'Preferences' }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <tab.icon size={20} className="mr-3" />
                    {tab.label}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Edit2 size={18} />
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </motion.button>
                  </div>

                  {!editMode ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center text-gray-500 mb-2">
                            <User size={16} className="mr-2" />
                            <span className="text-sm font-medium">Full Name</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center text-gray-500 mb-2">
                            <Mail size={16} className="mr-2" />
                            <span className="text-sm font-medium">Email</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center text-gray-500 mb-2">
                            <DollarSign size={16} className="mr-2" />
                            <span className="text-sm font-medium">Currency</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{user.currency || 'Rs'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center text-gray-500 mb-2">
                            <Shield size={16} className="mr-2" />
                            <span className="text-sm font-medium">Account Type</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">Premium User</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleEditSubmit}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500"
                          />
                          <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <RefreshCw size={18} className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>
                  
                  {!changePasswordMode ? (
                    <div className="space-y-6">
                      <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-start">
                          <Shield className="text-blue-600 mt-1 mr-3" size={24} />
                          <div>
                            <h4 className="font-semibold text-gray-900">Account Security</h4>
                            <p className="text-gray-600 mt-2">Manage your password and security settings</p>
                            <div className="mt-4 flex items-center space-x-4">
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Password Strength</span>
                                  <span className="text-sm font-medium text-green-600">Strong</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setChangePasswordMode(true)}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Key size={20} />
                        <span className="font-medium">Change Password</span>
                      </motion.button>
                      
                      <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-start">
                          <AlertTriangle className="text-red-600 mt-1 mr-3" size={24} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Danger Zone</h4>
                            <p className="text-gray-600 mt-2">Permanently delete your account and all data</p>
                            <button
                              onClick={() => setDeleteAccountMode(true)}
                              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                            >
                              <Trash2 size={18} />
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handlePasswordChange}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                              passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                                ? 'border-red-300'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                          <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setChangePasswordMode(false);
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 transition-all"
                        >
                          <Lock size={18} />
                          Update Password
                        </button>
                      </div>
                    </motion.form>
                  )}
                </motion.div>
              )}

              {/* Delete Account Modal */}
              <AnimatePresence>
                {deleteAccountMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setDeleteAccountMode(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-2xl p-6 max-w-md w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="text-red-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
                        <p className="text-gray-600 mt-2">
                          This action cannot be undone. All your data will be permanently deleted.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter your password to confirm
                          </label>
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Your password"
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={() => {
                              setDeleteAccountMode(false);
                              setDeletePassword('');
                            }}
                            className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent Expenses Tab */}
              {activeTab === 'expenses' && (
                <motion.div
                  key="expenses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Expenses</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExportData}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                    >
                      <Download size={18} />
                      Export Data
                    </motion.button>
                  </div>
                  
                  {recentExpenses.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="w-16 h-16 text-gray-400 mx-auto" />
                      <p className="text-gray-600 mt-4">No recent expenses found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentExpenses.map((expense, index) => (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                              <PaymentIcon method={expense.payment_method || 'Cash'} className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{expense.title}</h4>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {expense.category}
                                </span>
                                <span className="mx-2">•</span>
                                <span>{formatDate(expense.expense_date)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">
                              {formatCurrency(expense.amount)}
                            </p>
                            {expense.is_recurring && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Recurring
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Bell size={20} />
                            Notification Settings
                          </h4>
                          <p className="text-gray-600 mt-2">Manage how you receive notifications</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-4">
                        {[
                          { label: 'Email notifications for large expenses', defaultChecked: true },
                          { label: 'Monthly spending reports', defaultChecked: true },
                          { label: 'Budget limit alerts', defaultChecked: false },
                          { label: 'Weekly summary emails', defaultChecked: true }
                        ].map((setting, index) => (
                          <motion.label
                            key={setting.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center p-3 hover:bg-white/50 rounded-lg transition-all"
                          >
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              defaultChecked={setting.defaultChecked}
                            />
                            <span className="ml-3 text-gray-700">{setting.label}</span>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <DollarSign size={20} />
                            Currency Preferences
                          </h4>
                          <p className="text-gray-600 mt-2">Your default currency for all transactions</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="p-4 bg-white border border-gray-300 rounded-xl">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-lg font-bold">Rs</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Nepalese Rupee (Rs)</p>
                              <p className="text-sm text-gray-600">Default currency for all expenses</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Account Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account Management</h3>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-4 text-white">
                      <Download size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Export All Data</h4>
                      <p className="text-sm text-gray-600">Download your expense history as JSON</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </motion.button>
                
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => logout()}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center mr-4 text-white">
                      <LogOut size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Logout</h4>
                      <p className="text-sm text-gray-600">Sign out from your account</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </motion.button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Account ID</p>
                    <p className="text-sm font-medium text-gray-900">{user.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Last updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.updated_at ? formatDate(user.updated_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;