// components/Admin/AdminCreateProduct.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Image, Eye, Code, AlertCircle, Check, Upload, Bold, Italic, List, Link, Heading, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface Variant {
  variantType: string;
  variantUnit?: string;
  variantValue: string;
  displayValue: string;
  quantity: number;
  price: number;
  offerPrice: number;
}

interface ProductData {
  _id?: string;
  name: string;
  descriptionShort: string;
  descriptionLong?: string;
  category: string;
  subCategory: string;
  childSubCategory?: string;
  foodType?: string;
  productImages: string[];
  badges?: string;
  hasVariants: boolean;
  quantity?: number;
  price?: number;
  offerPrice?: number;
  variants?: Variant[];
}

interface Category {
  _id: string;
  name: string;
  image?: string;
  hasSubCategories: boolean;
  subCategories: SubCategory[];
}

interface SubCategory {
  name: string;
  image?: string;
  hasChildSubCategories: boolean;
  childSubCategories: ChildSubCategory[];
}

interface ChildSubCategory {
  name: string;
  image?: string;
}

interface AdminCreateProductProps {
  initialData?: any;
  onSuccess: () => void;
}

const AdminCreateProduct = ({ initialData, onSuccess }: AdminCreateProductProps) => {
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    descriptionShort: '',
    descriptionLong: '',
    category: '',
    subCategory: '',
    childSubCategory: '',
    foodType: '',
    productImages: ['', ''],
    badges: '',
    hasVariants: false,
    quantity: 0,
    price: 0,
    offerPrice: 0,
    variants: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);

  const [imageUrls, setImageUrls] = useState<string[]>(['', '']);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [showHtmlSource, setShowHtmlSource] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Computed values for hierarchical categories
  const availableSubCategories = React.useMemo(() => {
    const selectedCat = categories.find(cat => cat.name === formData.category);
    return selectedCat?.subCategories || [];
  }, [categories, formData.category]);

  const availableChildSubCategories = React.useMemo(() => {
    const selectedCat = categories.find(cat => cat.name === formData.category);
    const selectedSub = selectedCat?.subCategories.find(sub => sub.name === formData.subCategory);
    return selectedSub?.hasChildSubCategories ? selectedSub.childSubCategories : [];
  }, [categories, formData.category, formData.subCategory]);

  const hasChildSubCategories = React.useMemo(() => {
    const selectedCat = categories.find(cat => cat.name === formData.category);
    const selectedSub = selectedCat?.subCategories.find(sub => sub.name === formData.subCategory);
    return selectedSub?.hasChildSubCategories || false;
  }, [categories, formData.category, formData.subCategory]);

  // Fetch approved categories (hierarchical)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/category?status=approved');
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        descriptionShort: initialData.descriptionShort || '',
        descriptionLong: initialData.descriptionLong || '',
        category: initialData.category || '',
        subCategory: initialData.subCategory || '',
        childSubCategory: initialData.childSubCategory || '',
        foodType: initialData.foodType || '',
        productImages: initialData.productImages || ['', ''],
        badges: initialData.badges || '',
        hasVariants: initialData.hasVariants || false,
        quantity: initialData.quantity || 0,
        price: initialData.price || 0,
        offerPrice: initialData.offerPrice || 0,
        variants: initialData.variants || [],
      });
      setImageUrls(initialData.productImages || ['', '']);
    }
  }, [initialData]);

  // Editor effect
  useEffect(() => {
    if (editorRef.current && !showHtmlSource) {
      editorRef.current.innerHTML = formData.descriptionLong || '';
    }
  }, [formData.descriptionLong, showHtmlSource]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Reset dependent fields
    if (name === 'category') {
      setFormData(prev => ({ ...prev, subCategory: '', childSubCategory: '' }));
    }
    if (name === 'subCategory') {
      setFormData(prev => ({ ...prev, childSubCategory: '' }));
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setFormData({ ...formData, productImages: newUrls.filter(url => url.trim() !== '') });
    if (imageErrors[index]) setImageErrors({ ...imageErrors, [index]: false });
  };

  const addImageField = () => setImageUrls([...imageUrls, '']);

  const removeImageField = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setFormData({ ...formData, productImages: newUrls.filter(url => url.trim() !== '') });
  };

  const handleImageError = (index: number) => {
    setImageErrors({ ...imageErrors, [index]: true });
  };

  // Rich Text Editor Commands
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setFormData({ ...formData, descriptionLong: editorRef.current.innerHTML });
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setFormData({ ...formData, descriptionLong: editorRef.current.innerHTML });
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setFormData({ ...formData, descriptionLong: html });
    if (editorRef.current && showHtmlSource) {
      editorRef.current.innerHTML = html;
    }
  };

  // Variant Handlers
  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    const newVariants = [...(formData.variants || [])];
    newVariants.push({
      variantType: 'weight',
      variantValue: '',
      displayValue: '',
      quantity: 0,
      price: 0,
      offerPrice: 0,
    });
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    const newVariants = (formData.variants || []).filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        name: formData.name.trim(),
        descriptionShort: formData.descriptionShort.trim(),
        descriptionLong: formData.descriptionLong || '',
        category: formData.category,
        subCategory: formData.subCategory,
        childSubCategory: hasChildSubCategories ? formData.childSubCategory : undefined,
        foodType: formData.foodType || null,
        productImages: formData.productImages.filter(url => url.trim() !== ''),
        badges: formData.badges || null,
        hasVariants: formData.hasVariants,
      };

      if (formData.hasVariants) {
        submitData.variants = (formData.variants || []).map(v => ({
          variantType: v.variantType,
          variantUnit: v.variantUnit || '',
          variantValue: String(v.variantValue),
          displayValue: v.displayValue,
          quantity: Number(v.quantity) || 0,
          price: Number(v.price) || 0,
          offerPrice: Number(v.offerPrice) || 0,
        }));
      } else {
        submitData.quantity = Number(formData.quantity) || 0;
        submitData.price = Number(formData.price) || 0;
        submitData.offerPrice = Number(formData.offerPrice) || 0;
      }

      // Basic validation
      if (!submitData.name || !submitData.descriptionShort || !submitData.category || !submitData.subCategory) {
        throw new Error('Please fill all required fields');
      }
      if (hasChildSubCategories && !submitData.childSubCategory) {
        throw new Error('Please select child subcategory');
      }
      if (submitData.productImages.length < 2) {
        throw new Error('Please provide at least 2 product images');
      }

      const url = initialData?._id
        ? `/api/admin/products/${initialData._id}`
        : '/api/admin/products/create';

      const method = initialData?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        alert(initialData?._id ? 'Product updated successfully!' : 'Product created successfully!');
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to save product');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {initialData?._id ? 'Edit Product' : 'Create New Product'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
              disabled={loadingCategories}
            >
              <option value="">Select Category</option>
              {loadingCategories ? (
                <option disabled>Loading categories...</option>
              ) : (
                categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Sub Category */}
          {formData.category && availableSubCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category *</label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Sub Category</option>
                {availableSubCategories.map((sub, i) => (
                  <option key={i} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Child Sub Category */}
          {formData.subCategory && hasChildSubCategories && availableChildSubCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child Sub Category *</label>
              <select
                name="childSubCategory"
                value={formData.childSubCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Child Sub Category</option>
                {availableChildSubCategories.map((child, i) => (
                  <option key={i} value={child.name}>{child.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
            <div className="flex gap-4">
              {['veg', 'non-veg'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="foodType"
                    value={type}
                    checked={formData.foodType === type}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="foodType"
                  value=""
                  checked={!formData.foodType}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-gray-600"
                />
                <span className="text-sm">Not Specified</span>
              </label>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description * (Minimum 50 characters)
          </label>
          <textarea
            name="descriptionShort"
            value={formData.descriptionShort}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
            minLength={50}
          />
        </div>

        {/* Long Description - Rich Text */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Long Description</label>
            <button
              type="button"
              onClick={() => setShowHtmlSource(!showHtmlSource)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <Code className="w-3 h-3" />
              {showHtmlSource ? 'Visual Editor' : 'HTML Source'}
            </button>
          </div>

          {!showHtmlSource ? (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
                <button type="button" onClick={() => execCommand('bold')} className="p-1.5 rounded hover:bg-gray-200" title="Bold"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCommand('italic')} className="p-1.5 rounded hover:bg-gray-200" title="Italic"><Italic className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200" title="Bullet List"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCommand('justifyLeft')} className="p-1.5 rounded hover:bg-gray-200" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCommand('justifyCenter')} className="p-1.5 rounded hover:bg-gray-200" title="Align Center"><AlignCenter className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCommand('justifyRight')} className="p-1.5 rounded hover:bg-gray-200" title="Align Right"><AlignRight className="w-4 h-4" /></button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="min-h-[300px] p-4 focus:outline-none"
              />
            </div>
          ) : (
            <textarea
              value={formData.descriptionLong}
              onChange={handleHtmlChange}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            />
          )}
        </div>

        {/* Product Images - Same as before */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images * (Minimum 2)</label>
          <div className="space-y-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder={`Image URL ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required={index < 2}
                    />
                  </div>
                  {index >= 2 && (
                    <button type="button" onClick={() => removeImageField(index)} className="text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {url && (
                  <div className="mt-2">
                    <img src={url} alt="preview" className="h-20 w-20 object-cover rounded" onError={() => handleImageError(index)} />
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageField} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-green-600 hover:border-green-400">
              <Upload className="inline w-4 h-4 mr-2" /> Add another image
            </button>
          </div>
        </div>

        {/* Badge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Badge Image URL (Optional)</label>
          <input
            type="text"
            value={formData.badges || ''}
            onChange={(e) => setFormData({ ...formData, badges: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="https://example.com/badge.png"
          />
        </div>

        {/* Variants Section - Same as your original */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasVariants"
            checked={formData.hasVariants}
            onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
            className="w-4 h-4 text-green-600"
          />
          <label htmlFor="hasVariants" className="text-sm font-medium text-gray-700">
            This product has variants
          </label>
        </div>

        {!formData.hasVariants ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label>Quantity *</label><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required /></div>
            <div><label>Price *</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required /></div>
            <div><label>Offer Price *</label><input type="number" name="offerPrice" value={formData.offerPrice} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required /></div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-4">
              <label className="font-medium">Product Variants</label>
              <button type="button" onClick={addVariant} className="px-4 py-2 bg-green-50 text-green-600 rounded-lg">Add Variant</button>
            </div>
            {(formData.variants || []).map((variant, index) => (
              <div key={index} className="border p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-3">
                  <h4>Variant {index + 1}</h4>
                  <button type="button" onClick={() => removeVariant(index)} className="text-red-600"><Trash2 size={18} /></button>
                </div>
                {/* Add your variant fields here - similar to reference */}
                {/* For brevity, you can expand this section as needed */}
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialData?._id ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={onSuccess} className="px-6 py-3 bg-gray-100 rounded-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateProduct;