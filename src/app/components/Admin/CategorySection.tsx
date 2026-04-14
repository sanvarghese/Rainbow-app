'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, Image as ImageIcon, X, Eye, EyeOff, Trash, RotateCcw, Save } from 'lucide-react';

interface ChildSubCategory {
  name: string;
  image?: string;
}

interface SubCategory {
  name: string;
  image?: string;
  hasChildSubCategories: boolean;
  childSubCategories: ChildSubCategory[];
}

interface Category {
  _id: string;
  name: string;
  image?: string;
  hasSubCategories: boolean;
  subCategories: SubCategory[];
  status: 'pending' | 'approved' | 'removed';
  createdAt: string;
}

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    hasSubCategories: false,
    subCategories: [] as SubCategory[],
    status: 'pending' as 'pending' | 'approved' | 'removed',
  });

  const [newSubCategory, setNewSubCategory] = useState({
    name: '',
    image: '',
    hasChildSubCategories: false,
    childSubCategories: [] as ChildSubCategory[],
  });

  const [newChildSubCategory, setNewChildSubCategory] = useState({ name: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadingChildForIndex, setUploadingChildForIndex] = useState<number | null>(null);

  // State for editing subcategories
  const [editingSubCategoryIndex, setEditingSubCategoryIndex] = useState<number | null>(null);
  const [editingSubCategoryData, setEditingSubCategoryData] = useState<SubCategory | null>(null);
  const [editingChildSubCategory, setEditingChildSubCategory] = useState<{ subIndex: number; childIndex: number } | null>(null);
  const [editingChildData, setEditingChildData] = useState<ChildSubCategory | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/category';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await fetch('/api/admin/category/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      return data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      setFormData({ ...formData, image: imageUrl });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubCategoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      setNewSubCategory({ ...newSubCategory, image: imageUrl });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleChildSubCategoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>, subIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingChildForIndex(subIndex);
    try {
      const imageUrl = await uploadImage(file);
      setNewChildSubCategory({ ...newChildSubCategory, image: imageUrl });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploadingChildForIndex(null);
    }
  };

  // Edit Subcategory Handlers
  const startEditSubCategory = (index: number) => {
    setEditingSubCategoryIndex(index);
    setEditingSubCategoryData({ ...formData.subCategories[index] });
  };

  const saveSubCategoryEdit = () => {
    if (!editingSubCategoryData || editingSubCategoryIndex === null) return;
    
    if (!editingSubCategoryData.name) {
      alert('Subcategory name is required');
      return;
    }

    const updatedSubCategories = [...formData.subCategories];
    updatedSubCategories[editingSubCategoryIndex] = editingSubCategoryData;
    
    setFormData({ ...formData, subCategories: updatedSubCategories });
    cancelSubCategoryEdit();
  };

  const cancelSubCategoryEdit = () => {
    setEditingSubCategoryIndex(null);
    setEditingSubCategoryData(null);
  };

  const handleEditSubCategoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSubCategoryData) return;

    try {
      const imageUrl = await uploadImage(file);
      setEditingSubCategoryData({ ...editingSubCategoryData, image: imageUrl });
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Edit Child Subcategory Handlers
  const startEditChildSubCategory = (subIndex: number, childIndex: number) => {
    setEditingChildSubCategory({ subIndex, childIndex });
    setEditingChildData({ ...formData.subCategories[subIndex].childSubCategories[childIndex] });
  };

  const saveChildSubCategoryEdit = () => {
    if (!editingChildSubCategory || !editingChildData) return;
    
    if (!editingChildData.name) {
      alert('Child subcategory name is required');
      return;
    }

    const { subIndex, childIndex } = editingChildSubCategory;
    const updatedSubCategories = [...formData.subCategories];
    updatedSubCategories[subIndex].childSubCategories[childIndex] = editingChildData;
    
    setFormData({ ...formData, subCategories: updatedSubCategories });
    cancelChildSubCategoryEdit();
  };

  const cancelChildSubCategoryEdit = () => {
    setEditingChildSubCategory(null);
    setEditingChildData(null);
  };

  const handleEditChildImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingChildData) return;

    try {
      const imageUrl = await uploadImage(file);
      setEditingChildData({ ...editingChildData, image: imageUrl });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Category name is required');
      return;
    }

    try {
      const url = '/api/admin/category';
      const method = editingCategory ? 'PUT' : 'POST';

      const payload = editingCategory
        ? { ...formData, id: editingCategory._id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Operation failed');

      fetchCategories();
      resetForm();
      alert(data.message);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string, hardDelete: boolean = false) => {
    const message = hardDelete
      ? 'Are you sure you want to permanently delete this category? This action cannot be undone!'
      : 'Are you sure you want to move this category to trash?';

    if (!confirm(message)) return;

    try {
      const url = hardDelete
        ? `/api/admin/category?id=${id}&hardDelete=true`
        : `/api/admin/category?id=${id}`;

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Delete failed');

      fetchCategories();
      alert(data.message);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Are you sure you want to restore this category?')) return;

    try {
      const res = await fetch('/api/admin/category', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: categories.find(c => c._id === id)?.name,
          status: 'pending',
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Restore failed');

      fetchCategories();
      alert('Category restored successfully');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: category.image || '',
      hasSubCategories: category.hasSubCategories,
      subCategories: category.subCategories.map(sub => ({
        name: sub.name,
        image: sub.image || '',
        hasChildSubCategories: sub.hasChildSubCategories || false,
        childSubCategories: sub.childSubCategories || [],
      })),
      status: category.status,
    });
    setShowForm(true);
  };

  const addSubCategory = () => {
    if (!newSubCategory.name) {
      alert('Subcategory name is required');
      return;
    }

    setFormData({
      ...formData,
      subCategories: [...formData.subCategories, { ...newSubCategory }],
    });

    setNewSubCategory({
      name: '',
      image: '',
      hasChildSubCategories: false,
      childSubCategories: [],
    });
  };

  const removeSubCategory = (index: number) => {
    setFormData({
      ...formData,
      subCategories: formData.subCategories.filter((_, i) => i !== index),
    });
  };

  const addChildSubCategory = (subIndex: number) => {
    if (!newChildSubCategory.name) {
      alert('Child subcategory name is required');
      return;
    }

    const updatedSubCategories = [...formData.subCategories];
    const sub = updatedSubCategories[subIndex];

    sub.childSubCategories.push({ ...newChildSubCategory });
    sub.hasChildSubCategories = true;

    setFormData({ ...formData, subCategories: updatedSubCategories });
    setNewChildSubCategory({ name: '', image: '' });
  };

  const removeChildSubCategory = (subIndex: number, childIndex: number) => {
    const updatedSubCategories = [...formData.subCategories];
    updatedSubCategories[subIndex].childSubCategories.splice(childIndex, 1);

    if (updatedSubCategories[subIndex].childSubCategories.length === 0) {
      updatedSubCategories[subIndex].hasChildSubCategories = false;
    }

    setFormData({ ...formData, subCategories: updatedSubCategories });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      hasSubCategories: false,
      subCategories: [],
      status: 'pending',
    });
    setNewSubCategory({
      name: '',
      image: '',
      hasChildSubCategories: false,
      childSubCategories: [],
    });
    setNewChildSubCategory({ name: '', image: '' });
    setEditingCategory(null);
    setShowForm(false);
    setEditingSubCategoryIndex(null);
    setEditingSubCategoryData(null);
    setEditingChildSubCategory(null);
    setEditingChildData(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'removed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Removed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="removed">Removed</option>
          </select>

          {statusFilter !== 'removed' && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter category name"
                />
              </div>

              {/* Category Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="removed">Removed</option>
                </select>
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <div className="relative">
                      <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                      <button
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                      className="hidden"
                      id="category-image"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="category-image"
                      className="cursor-pointer px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Has Subcategories */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasSub"
                  checked={formData.hasSubCategories}
                  onChange={(e) => setFormData({ ...formData, hasSubCategories: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="hasSub" className="text-sm font-medium text-gray-700">Has Subcategories</label>
              </div>

              {/* Subcategories Section */}
              {formData.hasSubCategories && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Subcategories</h4>

                  {/* Existing Subcategories */}
                  {formData.subCategories.map((sub, subIndex) => (
                    <div key={subIndex} className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
                      {editingSubCategoryIndex === subIndex ? (
                        // Edit Mode for Subcategory
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-blue-600">Editing Subcategory</h5>
                            <button onClick={cancelSubCategoryEdit} className="text-gray-500 hover:text-gray-700">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            value={editingSubCategoryData?.name || ''}
                            onChange={(e) => setEditingSubCategoryData({ ...editingSubCategoryData!, name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Subcategory name"
                          />
                          
                          <div className="flex items-center gap-3">
                            {editingSubCategoryData?.image && (
                              <img src={editingSubCategoryData.image} className="w-16 h-16 object-cover rounded-lg" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditSubCategoryImageChange}
                              className="hidden"
                              id={`edit-sub-image-${subIndex}`}
                            />
                            <label
                              htmlFor={`edit-sub-image-${subIndex}`}
                              className="cursor-pointer px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                            >
                              {uploading ? 'Uploading...' : 'Change Image'}
                            </label>
                            <button
                              onClick={saveSubCategoryEdit}
                              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" /> Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode for Subcategory
                        <>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 flex-1">
                              {sub.image && <img src={sub.image} className="w-12 h-12 object-cover rounded-lg" />}
                              <div>
                                <p className="font-medium text-gray-800">{sub.name}</p>
                                {sub.hasChildSubCategories && (
                                  <p className="text-xs text-blue-600">Has child subcategories ({sub.childSubCategories.length})</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => startEditSubCategory(subIndex)} 
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Edit subcategory"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => removeSubCategory(subIndex)} 
                                className="text-red-600 hover:text-red-700 p-1"
                                title="Remove subcategory"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Child Subcategories */}
                          {sub.hasChildSubCategories && sub.childSubCategories.length > 0 && (
                            <div className="ml-8 mt-3 space-y-2">
                              {sub.childSubCategories.map((child, childIndex) => (
                                <div key={childIndex} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                  {editingChildSubCategory?.subIndex === subIndex && 
                                   editingChildSubCategory?.childIndex === childIndex ? (
                                    // Edit Mode for Child
                                    <div className="flex-1 space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-blue-600">Editing Child</span>
                                        <button onClick={cancelChildSubCategoryEdit} className="text-gray-500">
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        value={editingChildData?.name || ''}
                                        onChange={(e) => setEditingChildData({ ...editingChildData!, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder="Child name"
                                      />
                                      <div className="flex items-center gap-2">
                                        {editingChildData?.image && (
                                          <img src={editingChildData.image} className="w-10 h-10 object-cover rounded" />
                                        )}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleEditChildImageChange}
                                          className="hidden"
                                          id={`edit-child-image-${subIndex}-${childIndex}`}
                                        />
                                        <label
                                          htmlFor={`edit-child-image-${subIndex}-${childIndex}`}
                                          className="cursor-pointer px-3 py-1 border rounded text-sm hover:bg-gray-50"
                                        >
                                          {uploading ? 'Uploading...' : 'Change Image'}
                                        </label>
                                        <button
                                          onClick={saveChildSubCategoryEdit}
                                          className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1"
                                        >
                                          <Save className="w-3 h-3" /> Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    // View Mode for Child
                                    <>
                                      <div className="flex items-center gap-3">
                                        {child.image && <img src={child.image} className="w-8 h-8 object-cover rounded" />}
                                        <span className="text-sm">{child.name}</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => startEditChildSubCategory(subIndex, childIndex)}
                                          className="text-blue-600 hover:text-blue-700"
                                          title="Edit child"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => removeChildSubCategory(subIndex, childIndex)}
                                          className="text-red-600 hover:text-red-700"
                                          title="Remove child"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Child Subcategory */}
                          <div className="ml-8 mt-4 p-4 bg-white border rounded-lg">
                            <p className="text-sm font-medium mb-3 text-gray-700">Add Child Subcategory (Optional)</p>
                            <input
                              type="text"
                              value={newChildSubCategory.name}
                              onChange={(e) => setNewChildSubCategory({ ...newChildSubCategory, name: e.target.value })}
                              placeholder="Child subcategory name"
                              className="w-full px-4 py-2 border rounded-lg mb-3"
                            />

                            <div className="flex items-center gap-3">
                              {newChildSubCategory.image && (
                                <img src={newChildSubCategory.image} className="w-10 h-10 object-cover rounded" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleChildSubCategoryImageChange(e, subIndex)}
                                className="hidden"
                                id={`child-image-${subIndex}`}
                              />
                              <label
                                htmlFor={`child-image-${subIndex}`}
                                className="cursor-pointer px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                              >
                                {uploadingChildForIndex === subIndex ? 'Uploading...' : 'Upload Image'}
                              </label>

                              <button
                                onClick={() => addChildSubCategory(subIndex)}
                                className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                              >
                                Add Child
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add New Subcategory */}
                  <div className="p-5 bg-blue-50 rounded-xl space-y-4 border border-blue-100">
                    <h5 className="font-medium text-gray-700">Add New Subcategory</h5>
                    <input
                      type="text"
                      value={newSubCategory.name}
                      onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                      placeholder="Subcategory name *"
                      className="w-full px-4 py-3 border rounded-lg"
                    />

                    <div className="flex items-center gap-3">
                      {newSubCategory.image && <img src={newSubCategory.image} className="w-12 h-12 object-cover rounded mt-2" />}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSubCategoryImageChange}
                        className="hidden"
                        id="sub-image"
                      />
                      <label
                        htmlFor="sub-image"
                        className="cursor-pointer px-4 py-2 mt-2 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload Sub Image (optional)'}
                      </label>
                    </div>

                    <button
                      onClick={addSubCategory}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add Subcategory
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-white rounded-xl shadow-sm p-6 relative">
            {/* Status Badge - Top Right Corner */}
            <div className="absolute top-4 right-4">
              {getStatusBadge(category.status)}
            </div>

            {/* Created Date */}
            <div className="absolute top-4 left-4">
              <span className="text-xs text-gray-400">
                {new Date(category.createdAt).toLocaleDateString()}
              </span>
            </div>

            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-32 object-cover rounded-lg mb-4 mt-6"
              />
            )}

            {!category.image && (
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 mt-6 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}

            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
              </div>
              <div className="flex gap-2">
                {category.status !== 'removed' ? (
                  <>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, false)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Move to trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleRestore(category._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Restore category"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, true)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Permanently delete"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Status info text */}
            <div className="mb-3">
              <p className="text-xs text-gray-500">
                Status: <span className="font-medium">
                  {category.status === 'approved' && '✓ Approved'}
                  {category.status === 'pending' && '⏳ Pending Approval'}
                  {category.status === 'removed' && '🗑️ In Trash'}
                </span>
              </p>
            </div>

            {category.hasSubCategories && category.subCategories.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">
                  Subcategories ({category.subCategories.length})
                </p>
                <div className="space-y-3">
                  {category.subCategories.map((sub, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-center gap-2 font-medium text-gray-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {sub.name}
                      </div>
                      {sub.hasChildSubCategories && sub.childSubCategories.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {sub.childSubCategories.map((child, cidx) => (
                            <div key={cidx} className="text-xs text-gray-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              {child.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No subcategories message */}
            {!category.hasSubCategories && (
              <div className="border-t pt-3">
                <p className="text-xs text-gray-400">No subcategories</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {statusFilter === 'removed'
              ? 'No categories in trash'
              : statusFilter === 'pending'
                ? 'No pending categories'
                : statusFilter === 'approved'
                  ? 'No approved categories'
                  : 'No categories yet. Create your first category!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategorySection;