"use client"

import React, { useEffect, useState } from 'react'
import {
    Box, Button, Container, Paper, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Radio, RadioGroup, FormControlLabel, Alert, CircularProgress, IconButton, Grid,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Undo, Redo, X, Upload, Image as ImageIcon
} from 'lucide-react'
import '../BecomeSeller/BecomeSeller.css'
import '../../components/BecomeSeller/CreateProduct.css'

interface CreateProductProps {
    onSuccess?: () => void;
    initialData?: any;
}

const MenuBar = ({ editor }: any) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
                title="Bold">
                <Bold size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
                title="Italic">
                <Italic size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
                title="Underline">
                <UnderlineIcon size={18} />
            </button>

            <div className="w-px h-8 bg-gray-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
                title="Bullet List">
                <List size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
                title="Numbered List">
                <ListOrdered size={18} />
            </button>

            <div className="w-px h-8 bg-gray-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
                title="Align Left">
                <AlignLeft size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
                title="Align Center">
                <AlignCenter size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
                title="Align Right">
                <AlignRight size={18} />
            </button>

            <div className="w-px h-8 bg-gray-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="Undo">
                <Undo size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="Redo">
                <Redo size={18} />
            </button>
        </div>
    )
}

const AdminCreateProduct: React.FC<CreateProductProps> = ({ onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        productImages: [] as File[],
        badges: null as File | null,
        name: "",
        descriptionShort: "",
        descriptionLong: "",
        quantity: "",
        price: "",
        offerPrice: "",
        category: "",
        subCategory: "",
        foodType: "",
    });

    const [preview, setPreview] = useState({
        productImages: [] as string[],
        badges: ""
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Initialize Tiptap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: 'Write a detailed description of your product...',
            }),
        ],
        content: formData.descriptionLong,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            setFormData((prev) => ({ ...prev, descriptionLong: html }))
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3',
            },
        },
    })

    // Load initial data when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                productImages: [],
                badges: null,
                name: initialData.name || "",
                descriptionShort: initialData.descriptionShort || "",
                descriptionLong: initialData.descriptionLong || "",
                quantity: initialData.quantity?.toString() || "",
                price: initialData.price?.toString() || "",
                offerPrice: initialData.offerPrice?.toString() || "",
                category: initialData.category || "",
                subCategory: initialData.subCategory || "",
                foodType: initialData.foodType || "",
            });
            setPreview({
                productImages: initialData.productImages || [],
                badges: initialData.badges || ""
            });

            if (editor && initialData.descriptionLong) {
                editor.commands.setContent(initialData.descriptionLong)
            }
        }
    }, [initialData, editor]);

    const validateField = (name: string, value: string) => {
        let errorMsg = '';

        switch (name) {
            case 'name':
                if (!value.trim()) errorMsg = 'Product name is required';
                break;
            case 'descriptionShort':
                if (!value.trim()) {
                    errorMsg = 'Description is required';
                } else if (value.length < 50) {
                    errorMsg = `Description must be at least 50 characters (current: ${value.length})`;
                }
                break;
            case 'quantity':
                const qty = Number(value);
                if (!value) {
                    errorMsg = 'Quantity is required';
                } else if (isNaN(qty) || qty < 0) {
                    errorMsg = 'Quantity must be a positive number';
                }
                break;
            case 'price':
                const price = Number(value);
                if (!value) {
                    errorMsg = 'Price is required';
                } else if (isNaN(price) || price < 0) {
                    errorMsg = 'Price must be a positive number';
                }
                break;
            case 'offerPrice':
                const offerPrice = Number(value);
                if (!value) {
                    errorMsg = 'Offer Price is required';
                } else if (isNaN(offerPrice) || offerPrice < 0) {
                    errorMsg = 'Offer Price must be a positive number';
                }
                break;
            case 'category':
                if (!value) errorMsg = 'Please select a category';
                break;
            case 'subCategory':
                if (!value) errorMsg = 'Please select a subcategory';
                break;
        }

        setFieldErrors(prev => ({
            ...prev,
            [name]: errorMsg
        }));

        return !errorMsg;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
    ) => {
        const { name, value } = e.target as HTMLInputElement;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
        validateField(name, value);
    };

    const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        if (files.length === 0) return;

        // Count existing images that are URLs (from server)
        const existingUrlImages = preview.productImages.filter(img => 
            typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:image'))
        ).length;

        // Validate total number of images (max 5)
        const totalImages = existingUrlImages + formData.productImages.length + files.length;
        if (totalImages > 5) {
            setError(`Maximum 5 product images allowed. You currently have ${existingUrlImages + formData.productImages.length} images.`);
            e.target.value = ''; // Clear the input
            return;
        }

        // Validate each file
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Each image must be less than 5MB');
                e.target.value = '';
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                e.target.value = '';
                return;
            }
        }

        setError('');

        // Add files to state
        setFormData(prev => ({
            ...prev,
            productImages: [...prev.productImages, ...files]
        }));

        // Generate previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(prev => ({
                    ...prev,
                    productImages: [...prev.productImages, reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });

        // Clear the input value so same file can be selected again if removed
        e.target.value = '';

        // Clear field errors
        setFieldErrors(prev => ({
            ...prev,
            productImages: ''
        }));
    };

    const removeProductImage = (index: number) => {
        const imageToRemove = preview.productImages[index];
        
        // Check if it's a new file (starts with blob or data:image/png etc from FileReader)
        // vs existing image from server (starts with http or data:image/jpeg;base64 from server)
        const isExistingServerImage = typeof imageToRemove === 'string' && 
            (imageToRemove.startsWith('http') || imageToRemove.includes(';base64,'));

        if (isExistingServerImage) {
            // Remove from preview only (will be handled in existingImages)
            setPreview(prev => ({
                ...prev,
                productImages: prev.productImages.filter((_, i) => i !== index)
            }));
        } else {
            // It's a newly added file, remove from both formData and preview
            // Find the index in formData.productImages
            const newFileIndex = preview.productImages
                .slice(0, index)
                .filter(img => !((typeof img === 'string') && (img.startsWith('http') || img.includes(';base64,'))))
                .length;

            setFormData(prev => ({
                ...prev,
                productImages: prev.productImages.filter((_, i) => i !== newFileIndex)
            }));

            setPreview(prev => ({
                ...prev,
                productImages: prev.productImages.filter((_, i) => i !== index)
            }));
        }
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "badges"
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError(`${field} file size must be less than 5MB`);
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError(`${field} must be an image file`);
                return;
            }

            setFormData((prev) => ({ ...prev, [field]: file }));
            setError('');

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview((prev) => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
        validateField(name, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors({});

        // Count existing server images and new files
        const existingServerImages = preview.productImages.filter(img => 
            typeof img === 'string' && (img.startsWith('http') || img.includes(';base64,'))
        );
        
        const totalProductImages = existingServerImages.length + formData.productImages.length;
        
        // Validate minimum 2 images
        if (totalProductImages < 2) {
            setFieldErrors(prev => ({
                ...prev,
                productImages: 'At least 2 product images are required'
            }));
            setError(`Please add at least 2 product images. You currently have ${totalProductImages} image(s).`);
            return;
        }

        // Validate all required fields
        const requiredFields = ['name', 'descriptionShort', 'quantity', 'price', 'offerPrice', 'category', 'subCategory'];
        let hasErrors = false;

        requiredFields.forEach(field => {
            if (!validateField(field, formData[field as keyof typeof formData] as string)) {
                hasErrors = true;
            }
        });

        if ((formData.category === 'food' || formData.category === 'powder') && !formData.foodType) {
            setFieldErrors(prev => ({
                ...prev,
                foodType: 'Food type is required for food and powder categories'
            }));
            hasErrors = true;
        }

        if (hasErrors) {
            setError('Please fix the errors above');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Add product images (new files) - IMPORTANT: append each file individually
            console.log('Adding product images to FormData:', formData.productImages.length);
            formData.productImages.forEach((file, index) => {
                console.log(`Appending image ${index + 1}:`, file.name, file.type, file.size);
                formDataToSend.append('productImages', file);
            });

            // Add existing images when updating
            if (initialData?.productImages) {
                const existingImages = preview.productImages.filter(img => 
                    typeof img === 'string' && (img.startsWith('http') || img.includes(';base64,'))
                );
                console.log('Existing images count:', existingImages.length);
                formDataToSend.append('existingImages', JSON.stringify(existingImages));
            }

            // Add other fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'productImages' && value !== null && value !== undefined) {
                    if (value instanceof File) {
                        formDataToSend.append(key, value);
                    } else {
                        formDataToSend.append(key, value.toString());
                    }
                }
            });

            if (initialData?._id) {
                formDataToSend.append("productId", initialData._id);
            }

            // Debug: Log FormData contents
            console.log('FormData entries:');
            for (let pair of formDataToSend.entries()) {
                if (pair[1] instanceof File) {
                    console.log(pair[0], ':', pair[1].name, pair[1].type, pair[1].size);
                } else {
                    console.log(pair[0], ':', pair[1]);
                }
            }

            const res = await fetch('/api/admin/products', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || 'Something went wrong');
            }

            setSuccess(data.message);

            // Reset form
            setFormData({
                productImages: [],
                badges: null,
                name: "",
                descriptionShort: "",
                descriptionLong: "",
                quantity: "",
                price: "",
                offerPrice: "",
                category: "",
                subCategory: "",
                foodType: "",
            });
            setPreview({ productImages: [], badges: "" });

            if (editor) {
                editor.commands.clearContent()
            }

            if (onSuccess) {
                setTimeout(() => onSuccess(), 1500);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-product-section min-vh-100 bg-light">
            <Box
                sx={{
                    background: "linear-gradient(135deg, #006d21ff 0%, #00bb38ff 100%)",
                    color: "white",
                    py: 6,
                    my: 6,
                    textAlign: "center",
                }}
            >
                <Container>
                    <Typography variant="h3" fontWeight="bold">
                        {initialData ? 'Edit Product' : 'Create Your Product'}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                        {initialData ? 'Update product details' : 'Step 3 of 3: Add Product Details'}
                    </Typography>
                </Container>
            </Box>

            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            {/* Product Images Section - Enhanced UI */}
                            <div className="col-12">
                                <Box sx={{ 
                                    border: '2px dashed #006d21ff', 
                                    borderRadius: 2, 
                                    p: 3,
                                    backgroundColor: '#f8f9fa',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#e9f7ef',
                                        borderColor: '#00bb38ff'
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ImageIcon size={24} style={{ color: '#006d21ff', marginRight: '8px' }} />
                                        <Typography variant="h6" fontWeight={600} sx={{ color: '#006d21ff' }}>
                                            Product Images *
                                        </Typography>
                                    </Box>
                                    
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        Upload minimum 2 and maximum 5 high-quality product images. First image will be the main display image.
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<Upload />}
                                            disabled={preview.productImages.length >= 5}
                                            sx={{
                                                backgroundColor: '#006d21ff',
                                                '&:hover': { backgroundColor: '#00bb38ff' },
                                                '&:disabled': { backgroundColor: '#ccc' }
                                            }}
                                        >
                                            {preview.productImages.length === 0 ? 'Upload Images' : 'Add More Images'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                hidden
                                                onChange={handleMultipleFileChange}
                                                disabled={preview.productImages.length >= 5}
                                            />
                                        </Button>
                                        
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            px: 2,
                                            py: 1,
                                            backgroundColor: preview.productImages.length >= 2 ? '#d4edda' : '#fff3cd',
                                            borderRadius: 1,
                                            border: `1px solid ${preview.productImages.length >= 2 ? '#c3e6cb' : '#ffeaa7'}`
                                        }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {preview.productImages.length}/5 images
                                            </Typography>
                                            {preview.productImages.length < 2 && (
                                                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                                    (Need {2 - preview.productImages.length} more)
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {fieldErrors.productImages && (
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            {fieldErrors.productImages}
                                        </Alert>
                                    )}

                                    {/* Image Preview Grid */}
                                    {preview.productImages.length > 0 && (
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            {preview.productImages.map((img, index) => (
                                                <Grid item xs={6} sm={4} md={3} key={index}>
                                                    <Box sx={{ 
                                                        position: 'relative',
                                                        paddingTop: '100%', // 1:1 Aspect Ratio
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        boxShadow: 2,
                                                        border: index === 0 ? '3px solid #006d21ff' : '2px solid #e0e0e0',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: 4
                                                        }
                                                    }}>
                                                        {index === 0 && (
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                left: 8,
                                                                backgroundColor: '#006d21ff',
                                                                color: 'white',
                                                                px: 1,
                                                                py: 0.5,
                                                                borderRadius: 1,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                zIndex: 2
                                                            }}>
                                                                MAIN
                                                            </Box>
                                                        )}
                                                        <img
                                                            src={img}
                                                            alt={`Product ${index + 1}`}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeProductImage(index)}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                right: 8,
                                                                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                                                color: 'white',
                                                                zIndex: 2,
                                                                '&:hover': { 
                                                                    backgroundColor: 'rgba(200, 0, 0, 1)' 
                                                                }
                                                            }}
                                                        >
                                                            <X size={16} />
                                                        </IconButton>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: 8,
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                                color: 'white',
                                                                px: 1,
                                                                py: 0.5,
                                                                borderRadius: 1,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            Image {index + 1}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}

                                    {preview.productImages.length === 0 && (
                                        <Box sx={{ 
                                            textAlign: 'center', 
                                            py: 4,
                                            border: '1px dashed #ccc',
                                            borderRadius: 2,
                                            backgroundColor: 'white'
                                        }}>
                                            <ImageIcon size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                                            <Typography variant="body2" color="textSecondary">
                                                No images uploaded yet
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Click "Upload Images" button above to add product images
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </div>

                            <div className="col-md-6">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Badges (Optional)
                                </Typography>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "badges")}
                                />
                                {preview.badges && (
                                    <img
                                        src={preview.badges}
                                        alt="Badges"
                                        style={{ maxWidth: "200px", marginTop: "10px", borderRadius: "8px" }}
                                    />
                                )}
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    type='text'
                                    error={!!fieldErrors.name}
                                    helperText={fieldErrors.name}
                                />
                            </div>

                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Short Description (At least 50 characters)"
                                    name="descriptionShort"
                                    value={formData.descriptionShort}
                                    onChange={handleInputChange}
                                    required
                                    multiline
                                    rows={3}
                                    error={!!fieldErrors.descriptionShort}
                                    helperText={fieldErrors.descriptionShort || `${formData.descriptionShort.length}/50 characters`}
                                />
                            </div>

                            <div className="col-12">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Long Description (Optional)
                                </Typography>
                                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <MenuBar editor={editor} />
                                    <EditorContent editor={editor} />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    type='number'
                                    error={!!fieldErrors.quantity}
                                    helperText={fieldErrors.quantity}
                                />
                            </div>

                            <div className="col-md-4">
                                <TextField
                                    fullWidth
                                    label="Price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    type='number'
                                    error={!!fieldErrors.price}
                                    helperText={fieldErrors.price}
                                />
                            </div>

                            <div className="col-md-4">
                                <TextField
                                    fullWidth
                                    label="Offer Price"
                                    name="offerPrice"
                                    value={formData.offerPrice}
                                    onChange={handleInputChange}
                                    required
                                    type='number'
                                    error={!!fieldErrors.offerPrice}
                                    helperText={fieldErrors.offerPrice}
                                />
                            </div>

                            <div className="col-md-6">
                                <FormControl fullWidth required error={!!fieldErrors.category}>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value="food">Food</MenuItem>
                                        <MenuItem value="powder">Powder</MenuItem>
                                        <MenuItem value="paste">Paste</MenuItem>
                                        <MenuItem value="accessories">Accessories</MenuItem>
                                    </Select>
                                    {fieldErrors.category && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                            {fieldErrors.category}
                                        </Typography>
                                    )}
                                </FormControl>
                            </div>

                            <div className="col-md-6">
                                <FormControl fullWidth required error={!!fieldErrors.subCategory}>
                                    <InputLabel>Subcategory</InputLabel>
                                    <Select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleSelectChange}>
                                        <MenuItem value="pickle">Pickle</MenuItem>
                                        <MenuItem value="spices">Spices</MenuItem>
                                        <MenuItem value="snacks">Snacks</MenuItem>
                                    </Select>
                                    {fieldErrors.subCategory && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                            {fieldErrors.subCategory}
                                        </Typography>
                                    )}
                                </FormControl>
                            </div>

                            {(formData.category === "food" || formData.category === "powder") && (
                                <div className="col-12">
                                    <FormControl required error={!!fieldErrors.foodType}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                            Food Type
                                        </Typography>
                                        <RadioGroup
                                            row
                                            name="foodType"
                                            value={formData.foodType}
                                            onChange={handleInputChange}
                                        >
                                            <FormControlLabel value="veg" control={<Radio />} label="Veg" />
                                            <FormControlLabel value="non-veg" control={<Radio />} label="Non-Veg" />
                                        </RadioGroup>
                                        {fieldErrors.foodType && (
                                            <Typography variant="caption" color="error">
                                                {fieldErrors.foodType}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </div>
                            )}

                            <div className="col-12">
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    pt: 2,
                                    borderTop: '2px solid #e0e0e0'
                                }}>
                                    <Typography variant="body2" color="textSecondary">
                                        * Required fields
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            className="cancel-btn"
                                            disabled={loading}
                                            sx={{
                                                borderColor: '#006d21ff',
                                                color: '#006d21ff',
                                                '&:hover': {
                                                    borderColor: '#00bb38ff',
                                                    backgroundColor: 'rgba(0, 109, 33, 0.04)'
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            className="create-btn"
                                            disabled={loading}
                                            sx={{
                                                backgroundColor: '#006d21ff',
                                                minWidth: '160px',
                                                '&:hover': { backgroundColor: '#00bb38ff' },
                                                '&:disabled': { backgroundColor: '#ccc' }
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                                    {initialData ? 'Updating...' : 'Creating...'}
                                                </>
                                            ) : (
                                                <>
                                                    {initialData ? 'Update Product' : 'Create Product'}
                                                </>
                                            )}
                                        </Button>
                                    </Box>
                                </Box>
                            </div>
                        </div>
                    </form>
                </Paper>
            </Container>
        </div>
    )
}

export default AdminCreateProduct