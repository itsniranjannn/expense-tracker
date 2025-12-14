import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  DollarSign, 
  PieChart, 
  User, 
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search,
  Sparkles,
  Wallet,
  Calendar,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load profile image
  useEffect(() => {
    if (user?.profile_picture) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let imageUrl;
      
      if (user.profile_picture.startsWith('http')) {
        imageUrl = user.profile_picture;
      } else if (user.profile_picture.startsWith('/uploads/')) {
        imageUrl = `${baseUrl}${user.profile_picture}`;
      } else {
        imageUrl = `${baseUrl}/uploads/${user.profile_picture}`;
      }
      
      // Add cache busting
      const timestamp = new Date().getTime();
      setProfileImage(`${imageUrl}?t=${timestamp}`);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ACTUAL SEARCH FUNCTIONALITY
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to expenses page with search query
      navigate(`/expenses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/expenses', icon: DollarSign, label: 'Expenses' },
    { path: '/budgets', icon: Wallet, label: 'Budgets' },
    { path: '/analysis', icon: BarChart3, label: 'Analytics' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const userMenuItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    { icon: LogOut, label: 'Logout', action: handleLogout },
  ];

  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null;
    const name = user?.name || 'User';
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&bold=true&size=256`;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <Link to="/dashboard" className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  scrolled 
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600' 
                    : 'bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm'
                }`}
              >
                <Sparkles className={`w-6 h-6 ${scrolled ? 'text-white' : 'text-white'}`} />
              </motion.div>
              <div>
                <motion.h1 
                  className={`text-xl font-bold tracking-tight ${
                    scrolled ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  BudgetPro
                </motion.h1>
                <motion.p 
                  className={`text-xs font-medium tracking-wide ${
                    scrolled ? 'text-gray-500' : 'text-violet-200'
                  }`}
                >
                  Smart Financial Analytics
                </motion.p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path || 
                              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    to={item.path}
                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? scrolled
                          ? 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 shadow-sm'
                          : 'bg-white/10 backdrop-blur-sm text-white'
                        : scrolled
                          ? 'text-gray-600 hover:text-violet-700 hover:bg-violet-50'
                          : 'text-violet-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span className="font-medium text-sm tracking-tight">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className={`absolute bottom-0 left-4 right-4 h-0.5 ${
                          scrolled ? 'bg-gradient-to-r from-violet-600 to-purple-600' : 'bg-white'
                        }`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar with ACTUAL FUNCTIONALITY */}
            <motion.form 
              onSubmit={handleSearch}
              className="hidden md:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className={`pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                    scrolled
                      ? 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500'
                      : 'bg-white/10 border border-white/20 text-white placeholder-violet-200 focus:ring-white focus:border-white/30 backdrop-blur-sm'
                  }`}
                />
                <Search className={`absolute left-3 top-2.5 w-4 h-4 ${
                  scrolled ? 'text-gray-400' : 'text-violet-300'
                }`} />
                {searchQuery && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1.5 px-2 py-1 bg-violet-600 text-white text-xs rounded hover:bg-violet-700 transition-colors"
                  >
                    Search
                  </button>
                )}
              </div>
            </motion.form>

            {/* User Profile Menu */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
            >
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-3 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-300 ${
                  scrolled
                    ? 'hover:bg-gray-50 border border-gray-200 hover:border-violet-200'
                    : 'hover:bg-white/10 border border-white/20 hover:border-white/30 backdrop-blur-sm'
                }`}
              >
                <div className="relative">
                  {profileImage ? (
                    <motion.img
                      src={profileImage}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={handleImageError}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-semibold ${
                    scrolled ? 'text-gray-900' : 'text-white'
                  }`}>
                    {user?.name || 'User'}
                  </p>
                  <p className={`text-xs ${
                    scrolled ? 'text-gray-500' : 'text-violet-200'
                  }`}>
                    {user?.email?.split('@')[0] || 'user'}@...
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                  showUserMenu ? 'rotate-180' : ''
                } ${scrolled ? 'text-gray-400' : 'text-violet-300'}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center space-x-3">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={user?.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{user?.name || 'User'}</p>
                          <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {userMenuItems.map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                        >
                          {item.action ? (
                            <button
                              onClick={item.action}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="font-medium">{item.label}</span>
                            </button>
                          ) : (
                            <Link
                              to={item.path}
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-all duration-200"
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                scrolled
                  ? 'text-gray-600 hover:text-violet-700 hover:bg-violet-50'
                  : 'text-violet-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-gray-200/20">
                {/* Mobile Search with ACTUAL FUNCTIONALITY */}
                <form onSubmit={handleSearch} className="px-2 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search expenses..."
                      className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white/30"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-violet-300" />
                    {searchQuery && (
                      <button
                        type="submit"
                        className="absolute right-2 top-2.5 px-2 py-1 bg-violet-600 text-white text-xs rounded hover:bg-violet-700 transition-colors"
                      >
                        Go
                      </button>
                    )}
                  </div>
                </form>

                {/* Mobile Navigation Items */}
                <div className="space-y-1 px-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          location.pathname === item.path
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                            : 'text-violet-200 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile User Menu */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="space-y-1 px-2">
                    {userMenuItems.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                      >
                        {item.action ? (
                          <button
                            onClick={() => {
                              item.action();
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300"
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        ) : (
                          <Link
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-violet-200 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;