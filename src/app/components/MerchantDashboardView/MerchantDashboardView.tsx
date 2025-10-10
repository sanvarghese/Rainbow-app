'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  Home, 
  Users, 
  Package, 
  Bell, 
  User, 
  Edit, 
  Lock, 
  LogOut,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Monitor,
  Calendar,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface MerchantDashboardViewProps {
  onBackToPreview?: () => void;
  isStandalone?: boolean;
}

const MerchantDashboardView: React.FC<MerchantDashboardViewProps> = ({ 
  onBackToPreview, 
  isStandalone = false 
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const handleBackToPreviewClick = () => {
    if (isStandalone) {
      router.refresh();
    } else if (onBackToPreview) {
      onBackToPreview();
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  // Stats data
  const statsData = [
    {
      title: 'Total Employees',
      value: '4,710',
      change: '+33%',
      isPositive: true,
      icon: Users,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Compensation',
      value: '3,721',
      change: '-2%',
      isPositive: false,
      icon: CreditCard,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Annual Compensation',
      value: '2,149',
      change: '+12%',
      isPositive: true,
      icon: Monitor,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Annual Reports',
      value: '152,040',
      change: '+22%',
      isPositive: true,
      icon: User,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  // Age distribution data
  const ageDistribution = [
    { age: '17 - 30 Years old', percentage: '62%', color: 'bg-green-500' },
    { age: '31 - 50 Years old', percentage: '33%', color: 'bg-yellow-500' },
    { age: '>= 50 Years old', percentage: '10%', color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#007F27] to-[#00bb38] px-4 sm:px-6 py-4">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <img className="w-14" src="/images/fakers/xenployeelogo.svg" alt="logo" />
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex gap-4 md:gap-6">
        {/* Sidebar */}
        <div className={`
          ${mobileMenuOpen ? 'block fixed inset-0 z-50 bg-white' : 'hidden'} 
          md:block w-full md:w-64
          bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 
          md:relative
          shadow-lg
        `}>
          {mobileMenuOpen && (
            <div className="flex items-center justify-between mb-6">
              <img className="w-16" src="/images/fakers/xenployeelogo.svg" alt="logo" />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
          
          {!mobileMenuOpen && (
            <div className="flex items-center mb-6">
              <img className="w-16" src="/images/fakers/xenployeelogo.svg" alt="logo" />
            </div>
          )}

          <div className="border-b border-gray-200 my-4"></div>

          <ul className="space-y-2">
            <li>
              <button className="flex items-center w-full p-3 rounded-lg bg-green-50 text-green-700 font-medium transition-colors">
                <Home className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={handleBackToPreviewClick}
                className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                <Users className="w-5 h-5 mr-3" />
                <span>Company</span>
              </button>
            </li>
            <li>
              <button 
                onClick={handleBackToPreviewClick}
                className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                <Package className="w-5 h-5 mr-3" />
                <span>Products</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-slate-100 rounded-2xl md:rounded-3xl p-4 md:p-6 min-h-screen">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <nav className="hidden sm:flex items-center text-sm text-gray-600">
              <span className="text-green-700 font-medium">Xeventure</span>
              <span className="mx-2">/</span>
              <span>Dashboard</span>
            </nav>

            <div className="flex items-center gap-3 ml-auto">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button 
                  onClick={handleProfileMenuOpen}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                  <img 
                    src="/images/fakers/profile-5.jpg" 
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {/* Profile Dropdown */}
                {anchorEl && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200">
                      <div className="font-semibold text-gray-800">Theertha Biju</div>
                      <div className="text-sm text-gray-600">Frontend Developer</div>
                    </div>
                    
                    <div className="p-1">
                      <button className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </button>
                      <button className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Account
                      </button>
                      <button className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                        <Lock className="w-4 h-4 mr-2" />
                        Reset Password
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-200 p-1">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="space-y-6">
            {/* General Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">General Report</h2>
              <button className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors text-sm sm:text-base">
                <RefreshCw className="w-4 h-4" />
                <span>Reload Data</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statsData.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 sm:p-3 ${stat.bgColor} rounded-lg`}>
                      <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      stat.isPositive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Report */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Project Report</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="appearance-none pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option>All Categories</option>
                        <option>PC & Laptop</option>
                        <option>Smartphone</option>
                        <option>Electronic</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-6">
                  <div>
                    <h4 className="text-xl sm:text-2xl font-bold text-green-700">$15,000</h4>
                    <p className="text-gray-600 text-sm">This Month</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-500">$10,000</h4>
                    <p className="text-gray-600 text-sm">Last Month</p>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="h-48 sm:h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-gray-500 text-sm">Project revenue chart</p>
                    <p className="text-gray-400 text-xs">Chart visualization will appear here</p>
                  </div>
                </div>
              </div>

              {/* Weekly Reports */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Weekly Reports</h3>
                  <button className="text-green-700 text-sm hover:text-green-800 transition-colors">
                    Show More
                  </button>
                </div>
                
                {/* Chart Placeholder */}
                <div className="h-48 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-gray-500 text-sm">Age distribution chart</p>
                    <p className="text-gray-400 text-xs">Pie chart visualization</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {ageDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-gray-600 text-sm">{item.age}</span>
                      </div>
                      <span className="font-medium text-sm">{item.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Work Report */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Work Report</h3>
                  <button className="text-green-700 text-sm hover:text-green-800 transition-colors">
                    Show More
                  </button>
                </div>
                
                {/* Chart Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Monitor className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-500 text-sm">Work distribution chart</p>
                    <p className="text-gray-400 text-xs">Donut chart visualization</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {ageDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-gray-600 text-sm">{item.age}</span>
                      </div>
                      <span className="font-medium text-sm">{item.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">Add Employee</span>
                  </button>
                  <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                    <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">New Product</span>
                  </button>
                  <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                    <CreditCard className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">Process Payroll</span>
                  </button>
                  <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center">
                    <Monitor className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">Generate Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MerchantDashboardView;