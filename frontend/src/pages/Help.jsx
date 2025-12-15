// frontend/src/pages/Help.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  MessageCircle,
  Search,
  Users,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  Globe,
  Wifi,
  Server,
  Database,
  Lock,
  Bell,
  Settings
} from 'lucide-react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 1,
      question: "How do I reset my password?",
      answer: "Go to Profile → Security Settings → Change Password. Enter current password and set new one (min 8 characters with uppercase, lowercase, and numbers)."
    },
    {
      id: 2,
      question: "How do I upload a receipt image?",
      answer: "When adding/editing expense, click 'Choose File' button. Supported: JPG, PNG, GIF up to 5MB. Receipts are stored securely."
    },
    {
      id: 3,
      question: "What payment methods are supported?",
      answer: "Cash, Card, Esewa, Khalti, and Other. Each has specific icon. Filter expenses by payment method in Expenses page."
    },
    {
      id: 4,
      question: "How does the K-Means analysis work?",
      answer: "System uses K-Means clustering to analyze spending patterns. Groups similar expenses based on amount, category, frequency to identify trends."
    },
    {
      id: 5,
      question: "Can I export my expense data?",
      answer: "Yes! Expenses page → Click 'Export CSV' button. Downloads all expenses in CSV format for Excel/Google Sheets."
    },
    {
      id: 6,
      question: "How do budgets work?",
      answer: "Budgets are set per category per month. System tracks spending vs budget with color status: Green (Under), Blue (On Track), Yellow (Warning), Red (Exceeded)."
    },
    {
      id: 7,
      question: "Is my data secure?",
      answer: "Yes! 256-bit encryption, bcrypt password hashing, JWT tokens. No plain text passwords stored."
    },
    {
      id: 8,
      question: "Can I use the app on mobile?",
      answer: "Yes! Fully responsive design works on desktop, tablet, and mobile. Interface adapts to screen size."
    },
    {
      id: 9,
      question: "How do I set up recurring expenses?",
      answer: "When adding expense, check 'Recurring' option and select frequency: Daily, Weekly, Monthly, or Yearly."
    },
    {
      id: 10,
      question: "What happens if I delete my account?",
      answer: "All your data (expenses, budgets, analysis) will be permanently deleted and cannot be recovered."
    }
  ];

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "General inquiries & support",
      details: "support@smartbudget.com",
      responseTime: "Within 12 hours",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Call for urgent issues",
      details: "+977 98 1234 5678",
      responseTime: "9 AM - 7 PM NPT",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "WhatsApp Support",
      description: "Quick chat support",
      details: "+977 98 7654 3210",
      responseTime: "10 AM - 6 PM NPT",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Technical Support",
      description: "Technical issues only",
      details: "tech@smartbudget.com",
      responseTime: "Within 24 hours",
      color: "from-orange-500 to-amber-500"
    }
  ];

  const quickGuides = [
    {
      title: "Getting Started",
      steps: ["1. Create account", "2. Add your first expense", "3. Set monthly budget", "4. Check dashboard"]
    },
    {
      title: "Budget Tips",
      steps: ["1. Set realistic budgets", "2. Review weekly", "3. Adjust as needed", "4. Use alerts"]
    },
    {
      title: "Save Money",
      steps: ["1. Track daily spending", "2. Identify waste", "3. Set savings goal", "4. Use analysis"]
    }
  ];

  const quickLinks = [
    { name: "Dashboard", url: "/dashboard", icon: "📊" },
    { name: "Expenses", url: "/expenses", icon: "💰" },
    { name: "Budgets", url: "/budgets", icon: "🎯" },
    { name: "Profile", url: "/profile", icon: "👤" },
    { name: "Analysis", url: "/analysis", icon: "📈" },
    { name: "Settings", url: "/settings", icon: "⚙️" }
  ];

  const systemStatus = [
    { service: "API Server", status: "operational", icon: <Server className="w-4 h-4" /> },
    { service: "Database", status: "operational", icon: <Database className="w-4 h-4" /> },
    { service: "File Upload", status: "operational", icon: <Wifi className="w-4 h-4" /> },
    { service: "Notifications", status: "operational", icon: <Bell className="w-4 h-4" /> }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Help & Support</h1>
              <p className="text-blue-100 mt-2">Find answers and get support</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-blue-200 text-sm mt-2">
              {filteredFaqs.length} FAQ results
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Call Us</h3>
                <p className="text-sm text-slate-600">Direct phone support</p>
              </div>
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">+977 98 1234 5678</p>
            <p className="text-sm text-slate-500">Mon-Fri: 9AM-7PM</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Email</h3>
                <p className="text-sm text-slate-600">Send us an email</p>
              </div>
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">support@smartbudget.com</p>
            <p className="text-sm text-slate-500">Response within 12h</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">WhatsApp</h3>
                <p className="text-sm text-slate-600">Chat with us</p>
              </div>
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">+977 98 7654 3210</p>
            <p className="text-sm text-slate-500">10AM-6PM NPT</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Technical</h3>
                <p className="text-sm text-slate-600">Technical issues</p>
              </div>
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">tech@smartbudget.com</p>
            <p className="text-sm text-slate-500">Bug reports & tech issues</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - FAQs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-600 text-sm mt-1">Quick answers to common questions</p>
              </div>
              
              <div className="divide-y divide-slate-200">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                        className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex justify-between items-center"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 w-2 h-2 rounded-full ${openFaq === faq.id ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                          <div>
                            <h3 className="font-medium text-slate-800">{faq.question}</h3>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              2 min read
                            </p>
                          </div>
                        </div>
                        {openFaq === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      
                      {openFaq === faq.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-6 pb-4"
                        >
                          <div className="pl-6 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-lg p-4">
                            <p className="text-slate-700">{faq.answer}</p>
                            <div className="flex gap-2 mt-3">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                Updated Dec 2024
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700">No results found</h3>
                    <p className="text-slate-500 mt-1">Try a different search term or contact support</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Guides */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Guides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickGuides.map((guide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-slate-800 mb-4">{guide.title}</h4>
                    <ul className="space-y-2">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                            {stepIndex + 1}
                          </div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contact Options
              </h3>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all hover:shadow-sm">
                      <div className={`p-3 bg-gradient-to-r ${method.color} rounded-xl text-white`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {method.title}
                            </h4>
                            <p className="text-sm text-slate-500">{method.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-slate-700">{method.details}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {method.responseTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{link.icon}</span>
                      <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {link.name}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                System Status
              </h3>
              <div className="space-y-4">
                {systemStatus.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-300">
                        {service.icon}
                      </div>
                      <span>{service.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${service.status === 'operational' ? 'bg-green-400' : 'bg-rose-400'}`} />
                      <span className="text-sm capitalize">{service.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Overall Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="font-medium">All Systems Operational</span>
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-300" />
                </div>
              </div>
            </div>

            {/* Security & Privacy */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Security & Privacy</h3>
                  <p className="text-sm text-emerald-100 mt-1">Your data is protected</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">256-bit encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">Secure backups</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Privacy controls</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note - Removed as requested */}
      </div>
    </div>
  );
};

export default Help;