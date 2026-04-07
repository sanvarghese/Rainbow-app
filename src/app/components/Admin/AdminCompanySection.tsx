// components/Admin/AdminCompanySection.tsx (Fixed version)

'use client';

import React, { useState, useEffect } from 'react';
import {
    Building, Mail, Phone, MapPin, FileText, Facebook, Instagram,
    Plus, Edit, Eye, CheckCircle, XCircle, Clock, Search, Filter,
    Grid, List, ChevronLeft, ChevronRight, X, Users, Calendar,
    AlertCircle, Globe, Star, Award, TrendingUp, DollarSign, Info,
    Trash2
} from 'lucide-react';
import AdminCreateCompany from './AdminCreateCompanyForm';

interface Company {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    description?: string;
    companyLogo?: string;
    banner?: string;
    badges?: string;
    gstNumber?: string;
    facebookLink?: string;
    instagramLink?: string;
    website?: string;
    status: 'pending' | 'approved' | 'rejected' | 'removed';
    userId: {
        _id: string;
        name: string;
        email: string;
    } | null; 
    createdAt: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'removed';
type ViewMode = 'grid' | 'list';

const AdminCompanySection = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [showFilters, setShowFilters] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!showCreateForm && !editingCompany) {
            fetchCompanies();
        }
    }, [showCreateForm, editingCompany, filter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const statusParam = filter === 'all' ? 'all' : filter;
            const res = await fetch(`/api/admin/companies?status=${statusParam}`);
            const data = await res.json();

            if (data.success) {
                setCompanies(data.companies);
            } else {
                showNotification(data.error || 'Failed to fetch companies', 'error');
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            showNotification('Failed to fetch companies', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (companyId: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId, status }),
            });

            const data = await res.json();

            if (data.success) {
                showNotification(data.message, 'success');
                fetchCompanies();
                setSelectedCompany(null);
            } else {
                showNotification(data.error || 'Failed to update company status', 'error');
            }
        } catch (error) {
            console.error('Failed to update company:', error);
            showNotification('Failed to update company status', 'error');
        }
    };

    const handleEdit = async (company: Company) => {
        setEditingCompany(company);
        setShowCreateForm(true);
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        setEditingCompany(null);
        fetchCompanies();
    };

    const handleCancel = () => {
        setShowCreateForm(false);
        setEditingCompany(null);
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredCompanies = companies.filter((company) => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (company.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        return matchesSearch;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    const itemsPerPageOptions = [12, 24, 48, 96];

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'approved':
                return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' };
            case 'rejected':
                return { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' };
            case 'removed':
                return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Removed' };
            default:
                return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' };
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'approved': return 'border-green-500';
            case 'rejected': return 'border-red-500';
            case 'removed': return 'border-gray-500';
            default: return 'border-yellow-500';
        }
    };

    if (showCreateForm) {
    return (
        <div className="animate-fadeIn">
            <button
                onClick={handleCancel}
                className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
            >
                <ChevronLeft className="w-5 h-5" />
                Back to Companies
            </button>
            <AdminCreateCompany
                initialData={editingCompany}
                onSuccess={handleCreateSuccess}
                onCancel={handleCancel}  // Add this line
            />
        </div>
    );
}

    const stats = {
        total: companies.length,
        pending: companies.filter(c => c.status === 'pending').length,
        approved: companies.filter(c => c.status === 'approved').length,
        rejected: companies.filter(c => c.status === 'rejected').length,
        removed: companies.filter(c => c.status === 'removed').length,
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slideIn ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {notification.message}
                </div>
            )}

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Companies</p>
                            <p className="text-3xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <Building className="w-10 h-10 text-blue-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100 text-sm">Pending Approval</p>
                            <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Approved</p>
                            <p className="text-3xl font-bold mt-1">{stats.approved}</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Rejected</p>
                            <p className="text-3xl font-bold mt-1">{stats.rejected}</p>
                        </div>
                        <XCircle className="w-10 h-10 text-red-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-100 text-sm">Removed</p>
                            <p className="text-3xl font-bold mt-1">{stats.removed}</p>
                        </div>
                        <AlertCircle className="w-10 h-10 text-gray-200" />
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Create Company
                        </button>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'pending' ? 'bg-yellow-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Pending ({stats.pending})
                            </button>
                            <button
                                onClick={() => setFilter('approved')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'approved' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Approved ({stats.approved})
                            </button>
                            <button
                                onClick={() => setFilter('rejected')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'rejected' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Rejected ({stats.rejected})
                            </button>
                            <button
                                onClick={() => setFilter('removed')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'removed' ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Removed ({stats.removed})
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Companies Display */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading companies...</p>
                    </div>
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <Building className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Companies Found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm ? 'Try adjusting your search' :
                            filter === 'pending' ? 'No companies waiting for approval' :
                            filter === 'approved' ? 'No approved companies yet' :
                            filter === 'rejected' ? 'No rejected companies' :
                            filter === 'removed' ? 'No removed companies' :
                            'Get started by creating your first company'}
                    </p>
                    {!searchTerm && filter === 'all' && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Company
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Items per page and info */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="text-sm text-gray-600">
                            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCompanies.length)} of {filteredCompanies.length} companies
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            >
                                {itemsPerPageOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Grid View */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentCompanies.map((company) => {
                                const statusBadge = getStatusBadge(company.status);
                                const StatusIcon = statusBadge.icon;
                                return (
                                    <div key={company._id} className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${getStatusColor(company.status)}`}>
                                        {/* Banner */}
                                        {company.banner && (
                                            <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 relative">
                                                <img src={company.banner} alt="Banner" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        
                                        <div className="p-6">
                                            <div className="flex items-start gap-4 mb-4">
                                                {company.companyLogo ? (
                                                    <img src={company.companyLogo} alt={company.name} className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                                        <Building className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{company.name}</h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color} mt-1`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusBadge.text}
                                                    </span>
                                                </div>
                                            </div>

                                            {company.description && (
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{company.description}</p>
                                            )}

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">{company.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                                    {company.phoneNumber}
                                                </div>
                                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{company.address}</span>
                                                </div>
                                                {company.gstNumber && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FileText className="w-4 h-4 flex-shrink-0" />
                                                        GST: {company.gstNumber}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Owner Information - Fixed with null check */}
                                            <div className="border-t pt-3 mb-4">
                                                <p className="text-xs text-gray-500 mb-1">Owner</p>
                                                {company.userId ? (
                                                    <>
                                                        <p className="text-sm font-medium text-gray-800">{company.userId.name || 'N/A'}</p>
                                                        <p className="text-xs text-gray-600">{company.userId.email || 'N/A'}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium text-gray-800">User not found</p>
                                                        <p className="text-xs text-gray-600">User account may have been deleted</p>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mb-4">
                                                {company.facebookLink && (
                                                    <a href={company.facebookLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                                                        <Facebook className="w-3 h-3" />
                                                        Facebook
                                                    </a>
                                                )}
                                                {company.instagramLink && (
                                                    <a href={company.instagramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-sm">
                                                        <Instagram className="w-3 h-3" />
                                                        Instagram
                                                    </a>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setSelectedCompany(company)}
                                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(company)}
                                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                {company.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproval(company._id, 'approved')}
                                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(company._id, 'rejected')}
                                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {(company.status === 'approved' || company.status === 'rejected' || company.status === 'removed') && (
                                                    <button
                                                        onClick={() => handleApproval(company._id, 'rejected')}
                                                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // List View
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentCompanies.map((company) => {
                                            const statusBadge = getStatusBadge(company.status);
                                            const StatusIcon = statusBadge.icon;
                                            return (
                                                <tr key={company._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                {company.companyLogo ? (
                                                                    <img className="h-10 w-10 rounded-lg object-cover" src={company.companyLogo} alt="" />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                        <Building className="w-5 h-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                                                <div className="text-sm text-gray-500">{company.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{company.phoneNumber}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{company.address}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusBadge.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {company.userId ? (
                                                            <>
                                                                <div className="text-sm text-gray-900">{company.userId.name || 'N/A'}</div>
                                                                <div className="text-xs text-gray-500">{company.userId.email || 'N/A'}</div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-sm text-gray-500">User not found</div>
                                                                <div className="text-xs text-gray-400">Account deleted</div>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => setSelectedCompany(company)} className="text-gray-600 hover:text-gray-900" title="View">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleEdit(company)} className="text-blue-600 hover:text-blue-900" title="Edit">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            {company.status === 'pending' && (
                                                                <>
                                                                    <button onClick={() => handleApproval(company._id, 'approved')} className="text-green-600 hover:text-green-900" title="Approve">
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => handleApproval(company._id, 'rejected')} className="text-red-600 hover:text-red-900" title="Reject">
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                     </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                    <ChevronLeft className="w-4 h-4 -ml-2" />
                                </button>
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex gap-1">
                                    {getPageNumbers().map(pageNum => (
                                        <button key={pageNum} onClick={() => goToPage(pageNum)} className={`px-3 py-2 rounded-lg transition-all ${currentPage === pageNum ? 'bg-green-600 text-white shadow-md' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                    <ChevronRight className="w-4 h-4 -ml-2" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Go to:</span>
                                <input type="number" min={1} max={totalPages} value={currentPage} onChange={(e) => { const page = parseInt(e.target.value); if (!isNaN(page) && page >= 1 && page <= totalPages) goToPage(page); }} className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-green-500" />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Company Detail Modal */}
            {selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-8 rounded-full ${getStatusColor(selectedCompany.status)}`}></div>
                                <h3 className="text-xl font-bold text-gray-800">Company Details</h3>
                            </div>
                            <button onClick={() => setSelectedCompany(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Banner */}
                            {selectedCompany.banner && (
                                <div className="h-48 rounded-xl overflow-hidden mb-6">
                                    <img src={selectedCompany.banner} alt="Banner" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="flex items-start gap-6 mb-6">
                                {selectedCompany.companyLogo ? (
                                    <img src={selectedCompany.companyLogo} alt={selectedCompany.name} className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200" />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <Building className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-2">{selectedCompany.name}</h4>
                                    {(() => {
                                        const statusBadge = getStatusBadge(selectedCompany.status);
                                        const StatusIcon = statusBadge.icon;
                                        return (
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                {statusBadge.text}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>

                            {selectedCompany.description && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        Description
                                    </h5>
                                    <p className="text-gray-700">{selectedCompany.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h5 className="font-semibold text-blue-800 mb-3">Contact Information</h5>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                            <span>{selectedCompany.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                            <span>{selectedCompany.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <span>{selectedCompany.address}</span>
                                        </div>
                                        {selectedCompany.gstNumber && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                <span>GST: {selectedCompany.gstNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-xl p-4">
                                    <h5 className="font-semibold text-purple-800 mb-3">Owner Information</h5>
                                    <div className="space-y-2">
                                        {selectedCompany.userId ? (
                                            <>
                                                <p className="font-medium text-gray-800">{selectedCompany.userId.name || 'N/A'}</p>
                                                <p className="text-sm text-gray-600">{selectedCompany.userId.email || 'N/A'}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-medium text-gray-500">User not found</p>
                                                <p className="text-sm text-gray-400">User account may have been deleted</p>
                                            </>
                                        )}
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                            <Calendar className="w-3 h-3" />
                                            Registered on {new Date(selectedCompany.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {(selectedCompany.facebookLink || selectedCompany.instagramLink) && (
                                <div className="border rounded-xl p-4 mb-6">
                                    <h5 className="font-semibold text-gray-800 mb-3">Social Links</h5>
                                    <div className="flex gap-3">
                                        {selectedCompany.facebookLink && (
                                            <a href={selectedCompany.facebookLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                                <Facebook className="w-4 h-4" />
                                                Facebook
                                            </a>
                                        )}
                                        {selectedCompany.instagramLink && (
                                            <a href={selectedCompany.instagramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors">
                                                <Instagram className="w-4 h-4" />
                                                Instagram
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedCompany.status === 'pending' && (
                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => handleApproval(selectedCompany._id, 'approved')} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md">
                                        <CheckCircle className="w-5 h-5" />
                                        Approve Company
                                    </button>
                                    <button onClick={() => { if (confirm('Are you sure you want to reject this company?')) handleApproval(selectedCompany._id, 'rejected'); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md">
                                        <XCircle className="w-5 h-5" />
                                        Reject Company
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompanySection;