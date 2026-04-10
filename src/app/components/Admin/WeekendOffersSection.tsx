'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';

interface WeekendOffer {
  _id: string;
  title: string;
  images: string[];        // Safe-guarded as string[]
  isActive: boolean;
  order: number;
}

const WeekendOffersSection = () => {
  const [offers, setOffers] = useState<WeekendOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    order: 0,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/admin/weekend-offers');
      const data = await res.json();
      
      if (data.success) {
        // Safely normalize images field
        const normalizedOffers = data.offers.map((offer: any) => ({
          ...offer,
          images: Array.isArray(offer.images) ? offer.images : 
                 offer.image ? [offer.image] : []   // Support old single image field
        }));
        setOffers(normalizedOffers);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Handle multiple file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove preview
  const removePreview = (index: number) => {
    const urlToRevoke = previewUrls[index];
    URL.revokeObjectURL(urlToRevoke);

    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images
const uploadImages = async (): Promise<string[]> => {
  if (selectedFiles.length === 0) return [];

  setUploading(true);
  const uploadedUrls: string[] = [];

  for (const file of selectedFiles) {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);   // Must match API: 'file'

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.success && data.urls && Array.isArray(data.urls)) {
        uploadedUrls.push(...data.urls);   // Spread the array
      } else if (data.success && data.url) {
        uploadedUrls.push(data.url);       // Fallback for old single upload
      } else {
        console.error('Upload failed:', data.error);
      }
    } catch (error) {
      console.error('Upload failed for file:', file.name, error);
    }
  }

  setUploading(false);
  return uploadedUrls;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    const uploadedImageUrls = await uploadImages();

    if (uploadedImageUrls.length === 0) {
      alert("Failed to upload images. Please try again.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      images: uploadedImageUrls,
      order: formData.order,
    };

    try {
      const res = await fetch('/api/admin/weekend-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormData({ title: '', order: 0 });
        setSelectedFiles([]);
        setPreviewUrls([]);
        setShowForm(false);
        fetchOffers();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save offer");
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert("Something went wrong while saving");
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const res = await fetch(`/api/admin/weekend-offers/${id}`, { 
        method: 'DELETE' 
      });
      
      if (res.ok) {
        fetchOffers();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert("Failed to delete offer");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading Weekend Offers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Weekend Offers Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Offer
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Big Weekend Sale"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (You can select multiple)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            {/* Previews */}
            {previewUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Images ({previewUrls.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={140}
                        className="w-full h-36 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? 'Uploading Images...' : 'Save Offer'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedFiles([]);
                setPreviewUrls([]);
                setFormData({ title: '', order: 0 });
              }}
              className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const safeImages = Array.isArray(offer.images) ? offer.images : [];
          
          return (
            <div key={offer._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-52 bg-gray-100">
                {safeImages.length > 0 ? (
                  <Image
                    src={safeImages[0]}
                    alt={offer.title || 'Weekend Offer'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                {safeImages.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                    +{safeImages.length - 1}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">
                  {offer.title || 'Untitled Offer'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {safeImages.length} image{safeImages.length !== 1 ? 's' : ''}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {/* TODO: Implement Edit later */}}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteOffer(offer._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-xl text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {offers.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-500">
            No weekend offers found.<br />Click "Add New Offer" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekendOffersSection;