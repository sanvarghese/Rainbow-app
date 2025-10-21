// components/Admin/CompanyApprovalSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Building, Mail, Phone, MapPin } from 'lucide-react';

interface Company {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  companyLogo?: string;
  isApproved: boolean;
  userId: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const CompanyApprovalSection = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/admin/approvals/companies');
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

  const handleApproval = async (companyId: string, isApproved: boolean) => {
    try {
      const res = await fetch('/api/admin/approvals/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, isApproved }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      fetchCompanies();
      alert(data.message);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    if (filter === 'pending') return !company.isApproved;
    if (filter === 'approved') return company.isApproved;
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Company Approvals</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({companies.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending ({companies.filter((c) => !c.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved ({companies.filter((c) => c.isApproved).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company._id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              {company.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={company.name}
                  className="w-16 h-16 rounded-lg object-cover"
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

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {company.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {company.phoneNumber}
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                {company.address}
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Owner Information</p>
              <p className="text-sm font-medium text-gray-800">{company.userId.name}</p>
              <p className="text-sm text-gray-600">{company.userId.email}</p>
            </div>

            {!company.isApproved && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApproval(company._id, false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleApproval(company._id, true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            )}

            {company.isApproved && (
              <button
                onClick={() => handleApproval(company._id, false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Revoke Approval
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'pending'
              ? 'No pending companies'
              : filter === 'approved'
              ? 'No approved companies'
              : 'No companies found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyApprovalSection;