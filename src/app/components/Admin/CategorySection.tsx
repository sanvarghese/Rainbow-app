'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, Image as ImageIcon, X } from 'lucide-react';

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
  createdAt: string;
}

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    hasSubCategories: false,
    subCategories: [] as SubCategory[],
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/category');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Function
  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formDataUpload,
    });

    const data = await res.json();
    setUploading(false);

    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.url;
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

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Category name is required');
      return;
    }

    try {
      const url = editingCategory ? '/api/admin/category' : '/api/admin/category';
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/admin/category?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Delete failed');

      fetchCategories();
      alert(data.message);
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

    // If no more children, set flag to false
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
  };

  if (loading) {
    return <div className="text-center py-12">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
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
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {sub.image && <img src={sub.image} className="w-12 h-12 object-cover rounded-lg" />}
                          <div>
                            <p className="font-medium text-gray-800">{sub.name}</p>
                            {sub.hasChildSubCategories && (
                              <p className="text-xs text-blue-600">Has child subcategories ({sub.childSubCategories.length})</p>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeSubCategory(subIndex)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Child Subcategories */}
                      {sub.hasChildSubCategories && sub.childSubCategories.length > 0 && (
                        <div className="ml-8 mt-3 space-y-2">
                          {sub.childSubCategories.map((child, childIndex) => (
                            <div key={childIndex} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                {child.image && <img src={child.image} className="w-8 h-8 object-cover rounded" />}
                                <span className="text-sm">{child.name}</span>
                              </div>
                              <button
                                onClick={() => removeChildSubCategory(subIndex, childIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                        Upload Sub Image (optional)
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
          <div key={category._id} className="bg-white rounded-xl shadow-sm p-6">
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}

            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(category._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No categories yet. Create your first category!</p>
        </div>
      )}
    </div>
  );
};

export default CategorySection;