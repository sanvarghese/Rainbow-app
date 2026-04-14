// components/Admin/BannerSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoveUp, MoveDown, X, Save } from 'lucide-react';
import Image from 'next/image';
import ImageUpload from './ImageUpload';

interface Banner {
  _id: string;
  title?: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
}

const BannerSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '/shop',
    isActive: true
  });
  const [deleteOldImage, setDeleteOldImage] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banner');
      const data = await response.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Please upload an image');
      return;
    }
    
    const url = editingBanner 
      ? `/api/banner/${editingBanner._id}`
      : '/api/banner';
    
    const method = editingBanner ? 'PUT' : 'POST';
    
    const submitData = {
      title: formData.title,
      image: formData.image,
      link: formData.link,
      isActive: formData.isActive,
      order: editingBanner ? editingBanner.order : banners.length
    };
    
    // Add flag to delete old image if updating
    if (editingBanner && deleteOldImage) {
      Object.assign(submitData, { deleteOldImage: true });
    }
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBanners();
        setShowModal(false);
        resetForm();
      } else {
        alert(data.error || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const response = await fetch(`/api/banner/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        fetchBanners();
      } else {
        alert(data.error || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Failed to delete banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b._id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= banners.length) return;
    
    const newBanners = [...banners];
    [newBanners[currentIndex], newBanners[newIndex]] = [newBanners[newIndex], newBanners[currentIndex]];
    
    // Update order numbers
    const updatedBanners = newBanners.map((banner, idx) => ({
      ...banner,
      order: idx
    }));
    
    // Save to database
    try {
      await Promise.all(
        updatedBanners.map(banner =>
          fetch(`/api/banner/${banner._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: banner.order })
          })
        )
      );
      setBanners(updatedBanners);
    } catch (error) {
      console.error('Failed to reorder banners:', error);
      alert('Failed to reorder banners');
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      link: '/shop',
      isActive: true
    });
    setDeleteOldImage(false);
  };

  const editBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      image: banner.image,
      link: banner.link || '/shop',
      isActive: banner.isActive
    });
    setDeleteOldImage(false);
    setShowModal(true);
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
    if (editingBanner) {
      setDeleteOldImage(true);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    if (editingBanner) {
      setDeleteOldImage(true);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading banners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Banners</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {banners.map((banner, index) => (
              <tr key={banner._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{index + 1}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleReorder(banner._id, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleReorder(banner._id, 'down')}
                        disabled={index === banners.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative w-16 h-16">
                    <Image
                      src={banner.image}
                      alt={banner.title || 'Banner'}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{banner.title || 'No title'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{banner.link || '/shop'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => editBanner(banner)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Banner */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
              <h3 className="text-xl font-semibold">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image *
                </label>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  currentImage={formData.image}
                  onRemove={handleRemoveImage}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter banner title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="/shop"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use default: /shop</p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={!formData.image}
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSection;