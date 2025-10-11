'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    Home, Users, Package, Bell, User, Edit, Lock, LogOut, RefreshCw, TrendingUp, TrendingDown,
    CreditCard, Monitor, Calendar, ChevronDown, Menu, X, ShoppingCart, ListOrdered, Plus
} from 'lucide-react';
import Image from 'next/image';
import logo from "../../../assets/images/mazhavillu_logo.png"
import '../MerchantDashboardView/main.css'
import CompanySection from './CompanySection';
import ProductsSection from './ProductsSection';
// import ProductsSection from './ProductsSection';

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
    const [activeSection, setActiveSection] = useState<'dashboard' | 'company' | 'products' | 'purchase' | 'order'>('dashboard');

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/auth/login' });
    };

    const handleSectionChange = (section: typeof activeSection) => {
        setActiveSection(section);
        setMobileMenuOpen(false);
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

    const ageDistribution = [
        { age: '17 - 30 Years old', percentage: '62%', color: 'bg-green-500' },
        { age: '31 - 50 Years old', percentage: '33%', color: 'bg-yellow-500' },
        { age: '>= 50 Years old', percentage: '10%', color: 'bg-orange-500' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#007F27] to-[#00bb38] px-4 sm:px-6 py-4">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between mb-4">
                <Image src={logo} alt="logo" className="w-14" />
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex gap-4 md:gap-6">
                {/* Sidebar */}
                <div className={`
          ${mobileMenuOpen ? 'block fixed inset-0 z-50 bg-white' : 'hidden'} 
          md:block w-full md:w-64
          bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 
          md:relative shadow-lg
        `}>
                    {mobileMenuOpen && (
                        <div className="flex items-center justify-between mb-6">
                            <Image src={logo} alt="logo" className="w-16" />
                            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 p-2">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    {!mobileMenuOpen && (
                        <div className="flex items-center mb-6">
                            <Image src={logo} alt="logo" className="w-16" />
                        </div>
                    )}

                    <div className="border-b border-gray-200 my-4"></div>

                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => handleSectionChange('dashboard')}
                                className={`flex items-center w-full p-3 rounded-lg font-medium transition-colors ${activeSection === 'dashboard'
                                    ? 'bg-green-50 text-green-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}>
                                <Home className="w-5 h-5 mr-3" />
                                <span>Dashboard</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleSectionChange('company')}
                                className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeSection === 'company'
                                    ? 'bg-green-50 text-green-700 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}>
                                <Users className="w-5 h-5 mr-3" />
                                <span>Company</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleSectionChange('products')}
                                className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeSection === 'products'
                                    ? 'bg-green-50 text-green-700 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}>
                                <Package className="w-5 h-5 mr-3" />
                                <span>Products</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleSectionChange('purchase')}
                                className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeSection === 'purchase'
                                    ? 'bg-green-50 text-green-700 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}>
                                <ShoppingCart className="w-5 h-5 mr-3" />
                                <span>Purchase</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleSectionChange('order')}
                                className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeSection === 'order'
                                    ? 'bg-green-50 text-green-700 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}>
                                <ListOrdered className="w-5 h-5 mr-3" />
                                <span>Order</span>
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
                            <span className="capitalize">{activeSection}</span>
                        </nav>

                        <div className="flex items-center gap-3 ml-auto">
                            <button className="relative p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

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

                    {/* Dynamic Content Based on Active Section */}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${stat.isPositive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {stat.change}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                                        <p className="text-gray-600 text-sm sm:text-base">{stat.title}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Charts sections - keeping existing code */}
                            {/* Add your existing chart sections here */}
                        </div>
                    )}

                    {activeSection === 'company' && <CompanySection />}
                    {activeSection === 'products' && <ProductsSection />}
                    {activeSection === 'purchase' && (
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Purchase Section</h2>
                            <p className="text-gray-600">Coming soon...</p>
                        </div>
                    )}
                    {activeSection === 'order' && (
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Section</h2>
                            <p className="text-gray-600">Coming soon...</p>
                        </div>
                    )}
                </div>
            </div>

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