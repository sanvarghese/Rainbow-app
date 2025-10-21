'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Users, Package, Bell, User, Edit, Lock, LogOut, Menu, X,
  Building, CheckSquare, FolderTree, ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

import logo from "@/assets/images/mazhavillu_logo.png";
import CategorySection from '@/app/components/Admin/CategorySection';
import CompanyApprovalSection from '@/app/components/Admin/CompanyApprovalSection';
import AdminCompanySection from '@/app/components/Admin/AdminCompanySection';
import ProductApprovalSection from '@/app/components/Admin/ProductApprovalSection';
import AdminProductSection from '@/app/components/Admin/AdminProductsSection';

type SectionType = 'dashboard' | 'companies' | 'products' | 'approvals-companies' | 'approvals-products' | 'categories';

const AdminDashboardView = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    pendingCompanies: 0,
    totalProducts: 0,
    pendingProducts: 0,
  });

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        if (data.user.role !== 'admin') {
          router.push('/');
          return;
        }
        setUserData(data.user);
      } else {
        router.push('/auth/admin/login');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      router.push('/auth/admin/login');
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [companiesRes, productsRes] = await Promise.all([
        fetch('/api/admin/approvals/companies'),
        fetch('/api/admin/approvals/products'),
      ]);

      const companiesData = await companiesRes.json();
      const productsData = await productsRes.json();

      if (companiesData.success && productsData.success) {
        setStats({
          totalCompanies: companiesData.companies.length,
          pendingCompanies: companiesData.companies.filter((c: any) => !c.isApproved).length,
          totalProducts: productsData.products.length,
          pendingProducts: productsData.products.filter((p: any) => !p.isApproved).length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/admin/login' });
  };

  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

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
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-800">Admin Panel</span>
                </div>
              </div>
            </div>
          )}

          <div className="border-b border-gray-200 my-4"></div>

          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleSectionChange('dashboard')}
                className={`flex items-center w-full p-3 rounded-lg font-medium transition-colors ${
                  activeSection === 'dashboard'
                    ? 'bg-green-50 text-green-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Home className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </button>
            </li>

            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-gray-500 px-3">MANAGEMENT</p>
            </div>

            <li>
              <button
                onClick={() => handleSectionChange('categories')}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeSection === 'categories'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FolderTree className="w-5 h-5 mr-3" />
                <span>Categories</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleSectionChange('companies')}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeSection === 'companies'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Building className="w-5 h-5 mr-3" />
                <span>Companies</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleSectionChange('products')}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeSection === 'products'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Package className="w-5 h-5 mr-3" />
                <span>Products</span>
              </button>
            </li>

            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-gray-500 px-3">APPROVALS</p>
            </div>

            <li>
              <button
                onClick={() => handleSectionChange('approvals-companies')}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeSection === 'approvals-companies'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">Company Approvals</span>
                {stats.pendingCompanies > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                    {stats.pendingCompanies}
                  </span>
                )}
              </button>
            </li>

            <li>
              <button
                onClick={() => handleSectionChange('approvals-products')}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeSection === 'approvals-products'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">Product Approvals</span>
                {stats.pendingProducts > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                    {stats.pendingProducts}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-slate-100 rounded-2xl md:rounded-3xl p-4 md:p-6 min-h-screen">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <nav className="hidden sm:flex items-center text-sm text-gray-600">
              <span className="text-green-700 font-medium">Admin</span>
              <span className="mx-2">/</span>
              <span className="capitalize">{activeSection.replace('-', ' ')}</span>
            </nav>

            <div className="flex items-center gap-3 ml-auto">
              <button className="relative p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {(stats.pendingCompanies + stats.pendingProducts) > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={handleProfileMenuOpen}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {userData?.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                </button>

                {anchorEl && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={handleProfileMenuClose}></div>
                    
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-200">
                        <div className="font-semibold text-gray-800">
                          {userData?.name || 'Admin'}
                        </div>
                        <div className="text-sm text-gray-600">{userData?.email || ''}</div>
                        <div className="text-xs text-green-600 mt-1">Administrator</div>
                      </div>

                      <div className="p-1">
                        <button
                          onClick={() => {
                            handleProfileMenuClose();
                            router.push('/profile');
                          }}
                          className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            handleProfileMenuClose();
                            router.push('/profile/edit');
                          }}
                          className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Account
                        </button>
                        <button
                          onClick={() => {
                            handleProfileMenuClose();
                            router.push('/profile/password');
                          }}
                          className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Reset Password
                        </button>
                      </div>

                      <div className="border-t border-gray-200 p-1">
                        <button
                          onClick={() => {
                            handleProfileMenuClose();
                            handleLogout();
                          }}
                          className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Admin Overview</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalCompanies}</h3>
                  <p className="text-gray-600">Total Companies</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <CheckSquare className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.pendingCompanies}</h3>
                  <p className="text-gray-600">Pending Companies</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalProducts}</h3>
                  <p className="text-gray-600">Total Products</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <CheckSquare className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.pendingProducts}</h3>
                  <p className="text-gray-600">Pending Products</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleSectionChange('categories')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <FolderTree className="w-8 h-8 text-green-600 mb-2" />
                    <p className="font-semibold text-gray-800">Manage Categories</p>
                    <p className="text-sm text-gray-600 mt-1">Create and edit categories</p>
                  </button>

                  <button
                    onClick={() => handleSectionChange('approvals-companies')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all"
                  >
                    <Building className="w-8 h-8 text-yellow-600 mb-2" />
                    <p className="font-semibold text-gray-800">Company Approvals</p>
                    <p className="text-sm text-gray-600 mt-1">{stats.pendingCompanies} pending approval</p>
                  </button>

                  <button
                    onClick={() => handleSectionChange('approvals-products')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                  >
                    <Package className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="font-semibold text-gray-800">Product Approvals</p>
                    <p className="text-sm text-gray-600 mt-1">{stats.pendingProducts} pending approval</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'categories' && <CategorySection />}
          {activeSection === 'companies' && <AdminCompanySection/>}
          {activeSection === 'products' && <AdminProductSection />}
          {activeSection === 'approvals-companies' && <CompanyApprovalSection />}
          {activeSection === 'approvals-products' && <ProductApprovalSection />}
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

export default AdminDashboardView;