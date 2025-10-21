// components/Admin/CategorySection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, Image as ImageIcon, X } from 'lucide-react';

interface SubCategory {
  name: string;
  image?: string;
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
  const [newSubCategory, setNewSubCategory] = useState({ name: '', image: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/category');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingCategory
        ? '/api/admin/category'
        : '/api/admin/category';
      
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

      if (!res.ok) {
        throw new Error(data.error || 'Operation failed');
      }

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
      const res = await fetch(`/api/admin/category?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Delete failed');
      }

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
      subCategories: category.subCategories || [],
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
    setNewSubCategory({ name: '', image: '' });
  };

  const removeSubCategory = (index: number) => {
    setFormData({
      ...formData,
      subCategories: formData.subCategories.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      hasSubCategories: false,
      subCategories: [],
    });
    setNewSubCategory({ name: '', image: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
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

      {/* Category Form Modal */}
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasSubCategories"
                  checked={formData.hasSubCategories}
                  onChange={(e) => setFormData({ ...formData, hasSubCategories: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <label htmlFor="hasSubCategories" className="text-sm font-medium text-gray-700">
                  Has Subcategories
                </label>
              </div>

              {formData.hasSubCategories && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Subcategories</h4>

                  <div className="space-y-3 mb-4">
                    {formData.subCategories.map((sub, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{sub.name}</p>
                          {sub.image && <p className="text-xs text-gray-600 truncate">{sub.image}</p>}
                        </div>
                        <button
                          onClick={() => removeSubCategory(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <input
                      type="text"
                      value={newSubCategory.name}
                      onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Subcategory name"
                    />
                    <input
                      type="text"
                      value={newSubCategory.image}
                      onChange={(e) => setNewSubCategory({ ...newSubCategory, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Subcategory image URL (optional)"
                    />
                    <button
                      onClick={addSubCategory}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Subcategory
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {category.hasSubCategories && category.subCategories.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">
                  Subcategories ({category.subCategories.length})
                </p>
                <div className="space-y-1">
                  {category.subCategories.map((sub, index) => (
                    <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {sub.name}
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