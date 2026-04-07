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
  foodType?: string;
  productImages: string[];
  badges?: string;
  hasVariants: boolean;
  quantity?: number;
  price?: number;
  offerPrice?: number;
  variants?: Variant[];
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
    foodType: '',
    productImages: ['', ''],
    badges: '',
    hasVariants: false,
    quantity: 0,
    price: 0,
    offerPrice: 0,
    variants: [],
  });

  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(['', '']);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [showHtmlSource, setShowHtmlSource] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        descriptionShort: initialData.descriptionShort || '',
        descriptionLong: initialData.descriptionLong || '',
        category: initialData.category || '',
        subCategory: initialData.subCategory || '',
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

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !showHtmlSource) {
      editorRef.current.innerHTML = formData.descriptionLong || '';
    }
  }, [formData.descriptionLong, showHtmlSource]);

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setFormData({ ...formData, productImages: newUrls.filter(url => url.trim() !== '') });
    if (imageErrors[index]) {
      setImageErrors({ ...imageErrors, [index]: false });
    }
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageField = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setFormData({ ...formData, productImages: newUrls.filter(url => url.trim() !== '') });
  };

  const handleImageError = (index: number) => {
    setImageErrors({ ...imageErrors, [index]: true });
  };

  // Rich text editor commands
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

      if (!submitData.name || !submitData.descriptionShort || !submitData.category || !submitData.subCategory) {
        throw new Error('Please fill in all required fields');
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
        headers: {
          'Content-Type': 'application/json',
        },
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Category</option>
              <option value="food">🍔 Food</option>
              <option value="powder">⚡ Powder</option>
              <option value="paste">🥫 Paste</option>
              <option value="accessories">🎯 Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Category *
            </label>
            <input
              type="text"
              value={formData.subCategory}
              onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="veg"
                  checked={formData.foodType === 'veg'}
                  onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">🟢 Veg</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="non-veg"
                  checked={formData.foodType === 'non-veg'}
                  onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm">🔴 Non-Veg</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value=""
                  checked={!formData.foodType}
                  onChange={() => setFormData({ ...formData, foodType: '' })}
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
            value={formData.descriptionShort}
            onChange={(e) => setFormData({ ...formData, descriptionShort: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            minLength={50}
          />
          <div className="mt-1 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {formData.descriptionShort.length}/50 characters minimum
            </p>
            {formData.descriptionShort.length >= 50 && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Good length
              </span>
            )}
          </div>
        </div>

        {/* WYSIWYG Long Description Editor */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Long Description
            </label>
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
              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
                <button
                  type="button"
                  onClick={() => execCommand('bold')}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('italic')}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => execCommand('insertUnorderedList')}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter link URL:', 'https://');
                    if (url) execCommand('createLink', url);
                  }}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Insert Link"
                >
                  <Link className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => execCommand('formatBlock', '<h3>')}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Heading"
                >
                  <Heading className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => execCommand('justifyLeft')}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('justifyCenter')}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('justifyRight')}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Editor Content */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.descriptionLong || '' }}
              />
            </div>
          ) : (
            <textarea
              value={formData.descriptionLong}
              onChange={handleHtmlChange}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter HTML content here..."
            />
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            💡 Use the toolbar to format your content. You can create rich text with headings, lists, links, and more.
          </p>
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images * (Minimum 2 images)
          </label>
          <div className="space-y-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        placeholder={`Image URL ${index + 1}`}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          imageErrors[index] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        required={index < 2}
                      />
                    </div>
                    {imageErrors[index] && url && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Invalid image URL or image failed to load
                      </p>
                    )}
                  </div>
                  {index >= 2 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Image Preview */}
                {url && !imageErrors[index] && (
                  <div className="mt-3">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                      onError={() => handleImageError(index)}
                      onLoad={() => setImageErrors({ ...imageErrors, [index]: false })}
                    />
                  </div>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addImageField}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              Add another image
            </button>
          </div>
        </div>

        {/* Badge URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badge Image URL (Optional)
          </label>
          <input
            type="text"
            value={formData.badges}
            onChange={(e) => setFormData({ ...formData, badges: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://example.com/badge.png"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add a badge image (e.g., "Best Seller", "New Arrival") that will appear on the product card
          </p>
        </div>

        {/* Variant Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasVariants"
            checked={formData.hasVariants}
            onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
            className="w-4 h-4 text-green-600 focus:ring-green-500"
          />
          <label htmlFor="hasVariants" className="text-sm font-medium text-gray-700">
            This product has variants (different sizes/weights)
          </label>
        </div>

        {/* Regular Product Fields */}
        {!formData.hasVariants && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={formData.offerPrice}
                  onChange={(e) => setFormData({ ...formData, offerPrice: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Variants Section */}
        {formData.hasVariants && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Product Variants *
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>
            
            <div className="space-y-4">
              {(formData.variants || []).map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-800">Variant {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Variant Type
                      </label>
                      <select
                        value={variant.variantType}
                        onChange={(e) => handleVariantChange(index, 'variantType', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                      >
                        <option value="weight">Weight</option>
                        <option value="volume">Volume</option>
                        <option value="size">Size</option>
                        <option value="piece">Piece</option>
                        <option value="pack">Pack</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Variant Value
                      </label>
                      <input
                        type="text"
                        value={variant.variantValue}
                        onChange={(e) => handleVariantChange(index, 'variantValue', e.target.value)}
                        placeholder="e.g., 1, 500, XL"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Display Value
                      </label>
                      <input
                        type="text"
                        value={variant.displayValue}
                        onChange={(e) => handleVariantChange(index, 'displayValue', e.target.value)}
                        placeholder="e.g., 1 KG, 500 ML, XL Size"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={variant.quantity}
                        onChange={(e) => handleVariantChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Original Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₹</span>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', parseInt(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Offer Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₹</span>
                        <input
                          type="number"
                          value={variant.offerPrice}
                          onChange={(e) => handleVariantChange(index, 'offerPrice', parseInt(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : (initialData?._id ? 'Update Product' : 'Create Product')}
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateProduct;