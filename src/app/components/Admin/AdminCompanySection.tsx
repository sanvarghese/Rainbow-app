// components/Admin/AdminCompanySection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Building, Mail, Phone, MapPin, FileText, Facebook, Instagram, Eye } from 'lucide-react';

interface Company {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  description?: string;
  companyLogo?: string;
  banner?: string;
  gstNumber?: string;
  facebookLink?: string;
  instagramLink?: string;
  isApproved: boolean;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const AdminCompanySection = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/admin/companies');
      const data = await res.json();
      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">All Companies</h2>
          <p className="text-gray-600 mt-1">
            {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} total
          </p>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Companies Found</h3>
          <p className="text-gray-600">There are no companies registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {companies.map((company) => (
            <div key={company._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Company Banner */}
              {company.banner && (
                <div className="h-32 bg-gray-100">
                  <img
                    src={company.banner}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {company.companyLogo ? (
                    <img
                      src={company.companyLogo}
                      alt={company.name}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {company.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        company.isApproved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {company.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>

                {company.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {company.description}
                  </p>
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

                <div className="border-t pt-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Owner</p>
                  <p className="text-sm font-medium text-gray-800">{company.userId.name}</p>
                  <p className="text-xs text-gray-600">{company.userId.email}</p>
                </div>

                {(company.facebookLink || company.instagramLink) && (
                  <div className="flex gap-2">
                    {company.facebookLink && (
                      <a
                        href={company.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Facebook className="w-3 h-3" />
                        Facebook
                      </a>
                    )}
                    {company.instagramLink && (
                      <a
                        href={company.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-sm"
                      >
                        <Instagram className="w-3 h-3" />
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCompanySection;