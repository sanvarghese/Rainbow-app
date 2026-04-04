'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Building, Mail, Phone, MapPin, User } from 'lucide-react';

interface Company {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  companyLogo?: string;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  userId: {
    name?: string;
    email?: string;
  } | null;
  createdAt: string;
}

const CompanyApprovalSection = () => {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);     // Store all companies
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Fetch ALL companies once when component mounts
  useEffect(() => {
    fetchAllCompanies();
  }, []);

  // Filter companies whenever filter or allCompanies changes
  useEffect(() => {
    filterCompanies();
  }, [filter, allCompanies]);

  const fetchAllCompanies = async () => {
    try {
      const res = await fetch('/api/admin/approvals/companies?status=all');
      const data = await res.json();

      if (data.success) {
        setAllCompanies(data.companies || []);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let result = [...allCompanies];

    if (filter === 'pending') {
      result = allCompanies.filter(c => c.status === 'pending');
    } else if (filter === 'approved') {
      result = allCompanies.filter(c => c.status === 'approved');
    } else if (filter === 'rejected') {
      result = allCompanies.filter(c => c.status === 'rejected');
    }
    // 'all' shows everything

    setFilteredCompanies(result);
  };

  const handleApproval = async (companyId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/approvals/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        // Refresh all data after approval/rejection
        fetchAllCompanies();
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  // Calculate counts from allCompanies (always accurate)
  const pendingCount = allCompanies.filter((c) => c.status === 'pending').length;
  const approvedCount = allCompanies.filter((c) => c.status === 'approved').length;
  const rejectedCount = allCompanies.filter((c) => c.status === 'rejected').length;
  const totalCount = allCompanies.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Company Approvals</h2>
          <p className="text-gray-600 mt-1">Manage company verification and approvals</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('pending')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setFilter('rejected')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected ({rejectedCount})
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({totalCount})
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company._id} className="bg-white rounded-xl shadow-sm p-6">
            {/* Logo + Name + Status */}
            <div className="flex items-start gap-4 mb-5">
              {company.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={company.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                  {company.name}
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    company.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : company.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {company.status === 'approved' ? 'Approved' : 
                   company.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2.5 mb-6 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{company.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{company.phoneNumber}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{company.address}</span>
              </div>
            </div>

            {/* Owner Information */}
            <div className="border-t pt-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">REGISTERED BY</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {company.userId?.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {company.userId?.email || 'No email available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {company.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApproval(company._id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
                <button
                  onClick={() => handleApproval(company._id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
              </div>
            )}

            {company.status === 'approved' && (
              <button
                onClick={() => handleApproval(company._id, 'rejected')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
              >
                <XCircle className="w-5 h-5" />
                Revoke Approval
              </button>
            )}

            {company.status === 'rejected' && (
              <button
                onClick={() => handleApproval(company._id, 'approved')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Again
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Companies Found</h3>
          <p className="text-gray-500">
            {filter === 'pending'
              ? 'No pending companies for approval'
              : filter === 'approved'
              ? 'No approved companies yet'
              : filter === 'rejected'
              ? 'No rejected companies'
              : 'No companies registered yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyApprovalSection;