'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Mail, Phone, MapPin, FileText, Facebook, Instagram, Building } from 'lucide-react';
import CreateCompanyForm from '../BecomeSeller/CreateCompanyForm';

const CompanySection = () => {
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const res = await fetch('/api/merchant/company');
            const data = await res.json();
            if (data.success) {
                setCompany(data.company);
            }
        } catch (error) {
            console.error('Failed to fetch company:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSuccess = () => {
        setIsEditing(false);
        fetchCompany();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Loading company details...</div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div>
                <button
                    onClick={() => setIsEditing(false)}
                    className="mb-4 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    ← Back to Company Details
                </button>
                <CreateCompanyForm onSuccess={handleEditSuccess} />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Company Profile Found</h3>
                <p className="text-gray-600 mb-6">Create your company profile to get started</p>
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Create Company Profile
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 m-0">Company Profile</h2>
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit Company
                </button>
            </div>

            {/* Company Banner */}
            {company.banner && (
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <img
                        src={company.banner}
                        alt="Company Banner"
                        className="w-full h-48 object-cover"
                    />
                </div>
            )}

            {/* Main Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Logo */}
                    {company.companyLogo && (
                        <div className="flex-shrink-0">
                            <img
                                src={company.companyLogo}
                                alt="Company Logo"
                                className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                            />
                        </div>
                    )}

                    {/* Company Details */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{company.name}</h3>
                            {company.description && (
                                <p className="text-gray-600">{company.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-800 font-medium">{company.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-gray-800 font-medium">{company.phoneNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 md:col-span-2">
                                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-gray-800 font-medium">{company.address}</p>
                                </div>
                            </div>

                            {company.gstNumber && (
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">GST Number</p>
                                        <p className="text-gray-800 font-medium">{company.gstNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        {(company.facebookLink || company.instagramLink) && (
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Social Media</p>
                                <div className="flex gap-3">
                                    {company.facebookLink && (
                                        <a
                                            href={company.facebookLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                            <Facebook className="w-4 h-4" />
                                            Facebook
                                        </a>
                                    )}
                                    {company.instagramLink && (
                                        <a
                                            href={company.instagramLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors">
                                            <Instagram className="w-4 h-4" />
                                            Instagram
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Badges */}
                    {company.badges && (
                        <div className="flex-shrink-0">
                            <img
                                src={company.badges}
                                alt="Badges"
                                className="w-24 h-24 object-contain"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4">Company Status</h4>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${company.isApproved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {company.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CompanySection;