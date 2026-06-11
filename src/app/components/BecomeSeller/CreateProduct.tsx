"use client"

import React, { useEffect, useRef, useState } from 'react'
import {
    Box, Button, Container, Paper, TextField, Typography, FormControl, InputLabel, Select,
    MenuItem, Radio, RadioGroup, FormControlLabel, Alert, CircularProgress, IconButton,
    Grid, Switch, Divider, Card, CardContent, Chip, Tooltip,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Undo, Redo, X, Upload,
    Image as ImageIcon, Plus, Trash2, ChevronDown, ChevronUp, Palette,
} from 'lucide-react'
import '../BecomeSeller/BecomeSeller.css'
import '../../components/BecomeSeller/CreateProduct.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantOption {
    id: string;
    optionType: "color" | "size" | "custom";
    optionLabel: string;
    colorHex: string;
    imageFiles: File[];                                        // new files to upload
    imagePreviews: string[];                                   // data-urls for new files
    existingImages: { url: string; publicId: string }[];      // already on Cloudinary
    quantity: string;
    price: string;
    offerPrice: string;
}

interface Variant {
    id: string;
    variantType: string;
    variantUnit?: string;
    variantValue: string;
    displayValue: string;
    colorHex: string;
    imageFiles: File[];                                        // new files to upload
    imagePreviews: string[];                                   // data-urls for new files
    existingImages: { url: string; publicId: string }[];      // already on Cloudinary
    quantity: string;
    price: string;
    offerPrice: string;
    options: VariantOption[];
    optionsExpanded: boolean;
}

interface CreateProductProps {
    onSuccess?: () => void;
    initialData?: any;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const VARIANT_TYPES = {
    weight: { label: 'Weight',  units: ['g', 'kg', 'mg', 'lb', 'oz'] },
    volume: { label: 'Volume',  units: ['ml', 'L', 'fl oz', 'gal'] },
    size:   { label: 'Size',    units: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
    piece:  { label: 'Piece',   units: ['1 pc', '2 pcs', '3 pcs', '5 pcs', '10 pcs', '12 pcs', '20 pcs'] },
    pack:   { label: 'Pack',    units: ['1 pack', '2 packs', '3 packs', '5 packs', '10 packs'] },
    color:  { label: 'Color',   units: [] },
    custom: { label: 'Custom',  units: [] },
};

const OPTION_TYPES = [
    { value: 'color',  label: 'Color' },
    { value: 'size',   label: 'Size' },
    { value: 'custom', label: 'Custom' },
];

const PRESET_COLORS = [
    '#000000','#FFFFFF','#FF0000','#00FF00','#0000FF','#FFFF00',
    '#FF6600','#9900FF','#FF69B4','#00FFFF','#808080','#8B4513',
    '#FFD700','#C0C0C0','#4B0082','#006400',
];

// ─── Small reusable color swatch ──────────────────────────────────────────────
const ColorSwatch: React.FC<{ hex: string; selected: boolean; onClick: () => void }> = ({ hex, selected, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
            backgroundColor: hex,
            border: selected ? '3px solid #006d21ff' : '2px solid #ccc',
            boxShadow: selected ? '0 0 0 2px rgba(0,109,33,0.3)' : 'none',
            transition: 'all 0.2s',
            '&:hover': { transform: 'scale(1.2)' },
        }}
    />
);

// ─── Color picker popover ─────────────────────────────────────────────────────
const ColorPicker: React.FC<{
    value: string;
    onChange: (hex: string) => void;
    label?: string;
}> = ({ value, onChange, label = "Pick Color" }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <Box ref={ref} sx={{ position: 'relative' }}>
            <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                onClick={() => setOpen(o => !o)}
            >
                <Box sx={{
                    width: 32, height: 32, borderRadius: 1,
                    backgroundColor: value || '#cccccc',
                    border: '2px solid #ccc',
                    flexShrink: 0,
                }} />
                <Typography variant="caption" sx={{ color: '#555' }}>
                    {label}: <strong>{value || 'None'}</strong>
                </Typography>
                <Palette size={14} color="#006d21ff" />
            </Box>

            {open && (
                <Box sx={{
                    position: 'absolute', top: 40, left: 0, zIndex: 1300,
                    backgroundColor: 'white', border: '1px solid #ddd',
                    borderRadius: 2, p: 2, boxShadow: 4, minWidth: 240,
                }}>
                    <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                        Presets
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                        {PRESET_COLORS.map(c => (
                            <ColorSwatch key={c} hex={c} selected={value === c} onClick={() => { onChange(c); setOpen(false); }} />
                        ))}
                    </Box>
                    <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                        Custom hex
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={e => onChange(e.target.value)}
                            style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                        />
                        <TextField
                            size="small"
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            placeholder="#000000"
                            sx={{ width: 120 }}
                            inputProps={{ maxLength: 7 }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

// ─── Multi-image uploader for variants / options (up to 5 images) ─────────────
const MultiImageUploader: React.FC<{
    existingImages: { url: string; publicId: string }[];
    newPreviews: string[];
    onAddFiles: (files: File[]) => void;
    onRemoveExisting: (idx: number) => void;
    onRemoveNew: (idx: number) => void;
    maxImages?: number;
    label?: string;
}> = ({
    existingImages, newPreviews, onAddFiles,
    onRemoveExisting, onRemoveNew, maxImages = 5, label = "Images (optional)"
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const totalCount = existingImages.length + newPreviews.length;
    const canAdd = totalCount < maxImages;

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const allowed = maxImages - totalCount;
        const toAdd = files.slice(0, allowed);
        onAddFiles(toAdd);
        e.target.value = '';
    };

    return (
        <Box>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
                {label} ({totalCount}/{maxImages})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
                {/* Existing Cloudinary images */}
                {existingImages.map((img, idx) => (
                    <Box key={`ex-${idx}`} sx={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                        <img
                            src={img.url}
                            alt={`variant-img-${idx}`}
                            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '2px solid #e0e0e0' }}
                        />
                        <IconButton
                            size="small"
                            onClick={() => onRemoveExisting(idx)}
                            sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(255,0,0,0.85)', color: 'white', padding: '2px', '&:hover': { backgroundColor: 'red' } }}
                        >
                            <X size={12} />
                        </IconButton>
                    </Box>
                ))}
                {/* New file previews */}
                {newPreviews.map((src, idx) => (
                    <Box key={`new-${idx}`} sx={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                        <img
                            src={src}
                            alt={`new-img-${idx}`}
                            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '2px dashed #006d21ff' }}
                        />
                        <IconButton
                            size="small"
                            onClick={() => onRemoveNew(idx)}
                            sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(255,0,0,0.85)', color: 'white', padding: '2px', '&:hover': { backgroundColor: 'red' } }}
                        >
                            <X size={12} />
                        </IconButton>
                        {/* "NEW" badge */}
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,109,33,0.75)', borderRadius: '0 0 6px 6px', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.55rem', color: 'white', fontWeight: 700, lineHeight: 1.6 }}>NEW</Typography>
                        </Box>
                    </Box>
                ))}
                {/* Add button */}
                {canAdd && (
                    <Box
                        onClick={() => inputRef.current?.click()}
                        sx={{
                            width: 72, height: 72, border: '2px dashed #006d21ff', borderRadius: 2,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', gap: 0.5, flexShrink: 0,
                            '&:hover': { backgroundColor: '#e9f7ef' },
                        }}
                    >
                        <Upload size={18} color="#006d21ff" />
                        <Typography variant="caption" sx={{ color: '#006d21ff', fontSize: '0.6rem', textAlign: 'center', lineHeight: 1.2 }}>
                            {totalCount === 0 ? 'Upload' : 'Add More'}
                        </Typography>
                    </Box>
                )}
            </Box>
            <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
        </Box>
    );
};

// ─── Tiptap menu bar (unchanged) ──────────────────────────────────────────────
const MenuBar = ({ editor }: any) => {
    if (!editor) return null;
    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`} title="Bold"><Bold size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`} title="Italic"><Italic size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`} title="Underline"><UnderlineIcon size={18} /></button>
            <div className="w-px h-8 bg-gray-300 mx-1"></div>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`} title="Bullet List"><List size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`} title="Numbered List"><ListOrdered size={18} /></button>
            <div className="w-px h-8 bg-gray-300 mx-1"></div>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`} title="Align Left"><AlignLeft size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`} title="Align Center"><AlignCenter size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`} title="Align Right"><AlignRight size={18} /></button>
            <div className="w-px h-8 bg-gray-300 mx-1"></div>
            <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50" title="Undo"><Undo size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50" title="Redo"><Redo size={18} /></button>
        </div>
    );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeBlankOption(): VariantOption {
    return {
        id: `opt-${Date.now()}-${Math.random()}`,
        optionType: 'color',
        optionLabel: '',
        colorHex: '#000000',
        imageFiles: [],
        imagePreviews: [],
        existingImages: [],
        quantity: '',
        price: '',
        offerPrice: '',
    };
}

function makeBlankVariant(): Variant {
    return {
        id: `variant-${Date.now()}`,
        variantType: 'weight',
        variantUnit: '',
        variantValue: '',
        displayValue: '',
        colorHex: '#000000',
        imageFiles: [],
        imagePreviews: [],
        existingImages: [],
        quantity: '',
        price: '',
        offerPrice: '',
        options: [],
        optionsExpanded: false,
    };
}

function generateDisplayValue(v: Variant): string {
    if (!v.variantValue) return '';
    if (v.variantType === 'color') return v.variantValue;
    if (v.variantType === 'custom') return v.variantUnit ? `${v.variantValue} ${v.variantUnit}` : v.variantValue;
    if (['size', 'piece', 'pack'].includes(v.variantType)) return v.variantValue;
    return v.variantUnit ? `${v.variantValue} ${v.variantUnit}` : v.variantValue;
}

// ─── Main component ───────────────────────────────────────────────────────────

const CreateProduct: React.FC<CreateProductProps> = ({ onSuccess, initialData }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

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
        childSubCategory: "",
        foodType: "",
        hasVariants: false,
    });

    const [variants, setVariants] = useState<Variant[]>([]);
    const [preview, setPreview] = useState({ productImages: [] as string[], badges: "" });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // ── Category derived values ────────────────────────────────────────────
    const availableSubCategories = React.useMemo(() => {
        const cat = categories.find(c => c.name === formData.category);
        return cat?.subCategories || [];
    }, [categories, formData.category]);

    const availableChildSubCategories = React.useMemo(() => {
        const cat = categories.find(c => c.name === formData.category);
        const sub = cat?.subCategories.find(s => s.name === formData.subCategory);
        return sub?.hasChildSubCategories ? sub.childSubCategories : [];
    }, [categories, formData.category, formData.subCategory]);

    const hasChildSubCategories = React.useMemo(() => {
        const cat = categories.find(c => c.name === formData.category);
        const sub = cat?.subCategories.find(s => s.name === formData.subCategory);
        return sub?.hasChildSubCategories || false;
    }, [categories, formData.category, formData.subCategory]);

    // ── Tiptap ────────────────────────────────────────────────────────────
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Write a detailed description of your product...' }),
        ],
        content: formData.descriptionLong,
        immediatelyRender: false,
        onUpdate: ({ editor }) => setFormData(p => ({ ...p, descriptionLong: editor.getHTML() })),
        editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3' } },
    });

    // ── Fetch categories ───────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                setLoadingCategories(true);
                const res = await fetch('/api/merchant/categories');
                const data = await res.json();
                if (data.success) setCategories(data.categories);
                else setError('Failed to load categories. Please refresh the page.');
            } catch { setError('Failed to load categories. Please check your connection.'); }
            finally { setLoadingCategories(false); }
        })();
    }, []);

    // ── Load initial data (edit mode) ──────────────────────────────────────
    useEffect(() => {
        if (!initialData) return;
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
            childSubCategory: initialData.childSubCategory || "",
            foodType: initialData.foodType || "",
            hasVariants: initialData.hasVariants || false,
        });
        setPreview({
            productImages: initialData.productImages?.map((img: any) =>
                typeof img === 'string' ? img : img.url
            ) || [],
            badges: initialData.badges || "",
        });
        if (initialData.variants?.length > 0) {
            setVariants(initialData.variants.map((v: any, i: number) => ({
                id: `variant-${Date.now()}-${i}`,
                variantType: v.variantType,
                variantUnit: v.variantUnit || '',
                variantValue: v.variantValue,
                displayValue: v.displayValue,
                colorHex: v.colorHex || '#000000',
                imageFiles: [],
                imagePreviews: [],
                existingImages: v.images || [],
                quantity: v.quantity?.toString() || '',
                price: v.price?.toString() || '',
                offerPrice: v.offerPrice?.toString() || '',
                options: (v.options || []).map((opt: any, j: number) => ({
                    id: `opt-${Date.now()}-${i}-${j}`,
                    optionType: opt.optionType,
                    optionLabel: opt.optionLabel,
                    colorHex: opt.colorHex || '#000000',
                    imageFiles: [],
                    imagePreviews: [],
                    existingImages: opt.images || [],
                    quantity: opt.quantity?.toString() || '',
                    price: opt.price?.toString() || '',
                    offerPrice: opt.offerPrice?.toString() || '',
                })),
                optionsExpanded: (v.options?.length || 0) > 0,
            })));
        }
        if (editor && initialData.descriptionLong) editor.commands.setContent(initialData.descriptionLong);
    }, [initialData, editor]);

    // ── Variant CRUD ───────────────────────────────────────────────────────
    const handleVariantToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setFormData(p => ({ ...p, hasVariants: checked }));
        if (checked && variants.length === 0) setVariants([makeBlankVariant()]);
    };

    const addVariant = () => setVariants(v => [...v, makeBlankVariant()]);
    const removeVariant = (id: string) => setVariants(v => v.filter(x => x.id !== id));

    const updateVariant = (id: string, patch: Partial<Variant>) => {
        setVariants(vs => vs.map(v => {
            if (v.id !== id) return v;
            const updated = { ...v, ...patch };
            // Auto-generate displayValue if it hasn't been manually set
            const autoFields: Array<keyof Variant> = ['variantType', 'variantValue', 'variantUnit', 'colorHex'];
            const touchedAutoField = Object.keys(patch).some(k => autoFields.includes(k as keyof Variant));
            if (touchedAutoField && (!v.displayValue || v.displayValue === generateDisplayValue(v))) {
                updated.displayValue = generateDisplayValue(updated);
            }
            return updated;
        }));
    };

    // ── Variant multi-image handlers ───────────────────────────────────────
    const addVariantImages = (id: string, files: File[]) => {
        const readers = files.map(file => new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        }));
        Promise.all(readers).then(previews => {
            setVariants(vs => vs.map(v => {
                if (v.id !== id) return v;
                const allowed = 5 - v.existingImages.length - v.imageFiles.length;
                const toAdd = files.slice(0, allowed);
                const toPreview = previews.slice(0, allowed);
                return { ...v, imageFiles: [...v.imageFiles, ...toAdd], imagePreviews: [...v.imagePreviews, ...toPreview] };
            }));
        });
    };

    const removeVariantExistingImage = (id: string, idx: number) => {
        setVariants(vs => vs.map(v =>
            v.id !== id ? v : { ...v, existingImages: v.existingImages.filter((_, i) => i !== idx) }
        ));
    };

    const removeVariantNewImage = (id: string, idx: number) => {
        setVariants(vs => vs.map(v =>
            v.id !== id ? v : {
                ...v,
                imageFiles: v.imageFiles.filter((_, i) => i !== idx),
                imagePreviews: v.imagePreviews.filter((_, i) => i !== idx),
            }
        ));
    };

    // ── Option multi-image handlers ────────────────────────────────────────
    const addOptionImages = (variantId: string, optId: string, files: File[]) => {
        const readers = files.map(file => new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        }));
        Promise.all(readers).then(previews => {
            setVariants(vs => vs.map(v => {
                if (v.id !== variantId) return v;
                return {
                    ...v,
                    options: v.options.map(o => {
                        if (o.id !== optId) return o;
                        const allowed = 5 - o.existingImages.length - o.imageFiles.length;
                        const toAdd = files.slice(0, allowed);
                        const toPreview = previews.slice(0, allowed);
                        return { ...o, imageFiles: [...o.imageFiles, ...toAdd], imagePreviews: [...o.imagePreviews, ...toPreview] };
                    }),
                };
            }));
        });
    };

    const removeOptionExistingImage = (variantId: string, optId: string, idx: number) => {
        setVariants(vs => vs.map(v =>
            v.id !== variantId ? v : {
                ...v,
                options: v.options.map(o =>
                    o.id !== optId ? o : { ...o, existingImages: o.existingImages.filter((_, i) => i !== idx) }
                ),
            }
        ));
    };

    const removeOptionNewImage = (variantId: string, optId: string, idx: number) => {
        setVariants(vs => vs.map(v =>
            v.id !== variantId ? v : {
                ...v,
                options: v.options.map(o =>
                    o.id !== optId ? o : {
                        ...o,
                        imageFiles: o.imageFiles.filter((_, i) => i !== idx),
                        imagePreviews: o.imagePreviews.filter((_, i) => i !== idx),
                    }
                ),
            }
        ));
    };
    // ── Option CRUD ────────────────────────────────────────────────────────
    const addOption = (variantId: string) => {
        setVariants(vs => vs.map(v =>
            v.id === variantId
                ? { ...v, options: [...v.options, makeBlankOption()], optionsExpanded: true }
                : v
        ));
    };
    const removeOption = (variantId: string, optId: string) => {
        setVariants(vs => vs.map(v =>
            v.id === variantId ? { ...v, options: v.options.filter(o => o.id !== optId) } : v
        ));
    };
    const updateOption = (variantId: string, optId: string, patch: Partial<VariantOption>) => {
        setVariants(vs => vs.map(v =>
            v.id !== variantId ? v : {
                ...v,
                options: v.options.map(o => o.id === optId ? { ...o, ...patch } : o),
            }
        ));
    };

    // ── Product image handlers (unchanged) ────────────────────────────────
    const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const existingCount = preview.productImages.filter(img =>
            typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:image'))
        ).length;

        if (existingCount + formData.productImages.length + files.length > 5) {
            setError(`Maximum 5 product images allowed.`);
            e.target.value = '';
            return;
        }
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) { setError('Each image must be less than 5MB'); e.target.value = ''; return; }
            if (!file.type.startsWith('image/')) { setError('Only image files are allowed'); e.target.value = ''; return; }
        }
        setError('');
        setFormData(p => ({ ...p, productImages: [...p.productImages, ...files] }));
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(p => ({ ...p, productImages: [...p.productImages, reader.result as string] }));
            reader.readAsDataURL(file);
        });
        e.target.value = '';
        setFieldErrors(p => ({ ...p, productImages: '' }));
    };

    const removeProductImage = (index: number) => {
        const img = preview.productImages[index];
        const isServer = typeof img === 'string' && (img.startsWith('http') || img.includes(';base64,'));
        if (isServer) {
            setPreview(p => ({ ...p, productImages: p.productImages.filter((_, i) => i !== index) }));
        } else {
            const fileIdx = preview.productImages.slice(0, index).filter(i => !(typeof i === 'string' && (i.startsWith('http') || i.includes(';base64,')))).length;
            setFormData(p => ({ ...p, productImages: p.productImages.filter((_, i) => i !== fileIdx) }));
            setPreview(p => ({ ...p, productImages: p.productImages.filter((_, i) => i !== index) }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "badges") => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError(`${field} file size must be less than 5MB`); return; }
        if (!file.type.startsWith('image/')) { setError(`${field} must be an image file`); return; }
        setFormData(p => ({ ...p, [field]: file }));
        const reader = new FileReader();
        reader.onloadend = () => setPreview(p => ({ ...p, [field]: reader.result as string }));
        reader.readAsDataURL(file);
    };

    // ── Generic handlers ───────────────────────────────────────────────────
    const validateField = (name: string, value: string) => {
        let msg = '';
        switch (name) {
            case 'name': if (!value.trim()) msg = 'Product name is required'; break;
            case 'descriptionShort':
                if (!value.trim()) msg = 'Description is required';
                else if (value.length < 50) msg = `At least 50 characters (current: ${value.length})`;
                break;
            case 'quantity': if (!formData.hasVariants && (!value || isNaN(Number(value)) || Number(value) < 0)) msg = 'Valid quantity required'; break;
            case 'price':    if (!formData.hasVariants && (!value || isNaN(Number(value)) || Number(value) < 0)) msg = 'Valid price required'; break;
            case 'offerPrice': if (!formData.hasVariants && (!value || isNaN(Number(value)) || Number(value) < 0)) msg = 'Valid offer price required'; break;
            case 'category': if (!value) msg = 'Please select a category'; break;
            case 'subCategory': if (!value) msg = 'Please select a subcategory'; break;
            case 'childSubCategory': if (hasChildSubCategories && !value) msg = 'Please select a child subcategory'; break;
        }
        setFieldErrors(p => ({ ...p, [name]: msg }));
        return !msg;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target as HTMLInputElement;
        setFormData(p => ({ ...p, [name]: value }));
        setError('');
        validateField(name, value as string);
        if (name === 'category') setFormData(p => ({ ...p, subCategory: '', childSubCategory: '' }));
        if (name === 'subCategory') setFormData(p => ({ ...p, childSubCategory: '' }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
        setError('');
        validateField(name, value);
        if (name === 'category') setFormData(p => ({ ...p, subCategory: '', childSubCategory: '' }));
        if (name === 'subCategory') setFormData(p => ({ ...p, childSubCategory: '' }));
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors({});

        const existingServerImages = preview.productImages.filter(img =>
            typeof img === 'string' && (img.startsWith('http') || img.includes(';base64,'))
        );
        const totalImages = existingServerImages.length + formData.productImages.length;

        if (totalImages < 2) {
            setFieldErrors(p => ({ ...p, productImages: 'At least 2 product images are required' }));
            setError(`Please add at least 2 product images.`);
            return;
        }

        const requiredFields = ['name', 'descriptionShort', 'category', 'subCategory'];
        if (hasChildSubCategories) requiredFields.push('childSubCategory');
        if (!formData.hasVariants) requiredFields.push('quantity', 'price', 'offerPrice');

        let hasErrors = false;
        requiredFields.forEach(f => { if (!validateField(f, formData[f as keyof typeof formData] as string)) hasErrors = true; });

        if (formData.hasVariants) {
            if (variants.length === 0) { setError('Please add at least one variant'); hasErrors = true; }
            else {
                variants.forEach((v, i) => {
                    if (!v.variantValue) { setError(`Variant ${i + 1}: Value is required`); hasErrors = true; }
                    if (v.variantType === 'color' && !v.colorHex) { setError(`Variant ${i + 1}: Color is required`); hasErrors = true; }
                    if (v.variantType === 'custom' && !v.variantUnit) { setError(`Variant ${i + 1}: Custom unit is required`); hasErrors = true; }

                    // If no child options, the variant itself needs price/qty
                    if (v.options.length === 0) {
                        if (!v.quantity || Number(v.quantity) < 0) { setError(`Variant ${i + 1}: Valid quantity required`); hasErrors = true; }
                        if (!v.price || Number(v.price) < 0) { setError(`Variant ${i + 1}: Valid price required`); hasErrors = true; }
                        if (!v.offerPrice || Number(v.offerPrice) < 0) { setError(`Variant ${i + 1}: Valid offer price required`); hasErrors = true; }
                    }

                    v.options.forEach((opt, j) => {
                        if (!opt.optionLabel) { setError(`Variant ${i + 1} Option ${j + 1}: Label required`); hasErrors = true; }
                        if (opt.optionType === 'color' && !opt.colorHex) { setError(`Variant ${i + 1} Option ${j + 1}: Color required`); hasErrors = true; }
                        if (!opt.quantity || Number(opt.quantity) < 0) { setError(`Variant ${i + 1} Option ${j + 1}: Valid quantity required`); hasErrors = true; }
                        if (!opt.price || Number(opt.price) < 0) { setError(`Variant ${i + 1} Option ${j + 1}: Valid price required`); hasErrors = true; }
                        if (!opt.offerPrice || Number(opt.offerPrice) < 0) { setError(`Variant ${i + 1} Option ${j + 1}: Valid offer price required`); hasErrors = true; }
                    });
                });
            }
        }

        if ((formData.category === 'food' || formData.category === 'powder') && !formData.foodType) {
            setFieldErrors(p => ({ ...p, foodType: 'Food type is required' }));
            hasErrors = true;
        }

        if (hasErrors) { setError(prev => prev || 'Please fix the errors above'); return; }

        setLoading(true);
        try {
            const fd = new FormData();

            // Product images
            formData.productImages.forEach(file => fd.append('productImages', file));

            if (initialData?.productImages) {
                const existing = preview.productImages.filter(img =>
                    typeof img === 'string' && (img.startsWith('http') || img.includes(';base64,'))
                );
                fd.append('existingImages', JSON.stringify(existing));
            }

            // Variant image files — keyed as variantImage_<vi>_<imgIdx>
            variants.forEach((v, i) => {
                v.imageFiles.forEach((file, imgIdx) => {
                    fd.append(`variantImage_${i}_${imgIdx}`, file);
                });
                v.options.forEach((opt, j) => {
                    opt.imageFiles.forEach((file, imgIdx) => {
                        fd.append(`optionImage_${i}_${j}_${imgIdx}`, file);
                    });
                });
            });

            // Variants JSON (no File objects, images are sent separately)
            fd.append('hasVariants', formData.hasVariants.toString());

            if (formData.hasVariants) {
                const variantsPayload = variants.map(v => ({
                    variantType: v.variantType,
                    variantUnit: v.variantUnit || undefined,
                    variantValue: v.variantValue,
                    displayValue: v.displayValue || generateDisplayValue(v),
                    colorHex: v.variantType === 'color' ? v.colorHex : undefined,
                    images: v.existingImages,   // kept Cloudinary images (new uploads are in fd)
                    quantity: Number(v.quantity || 0),
                    price: Number(v.price || 0),
                    offerPrice: Number(v.offerPrice || 0),
                    options: v.options.map(opt => ({
                        optionType: opt.optionType,
                        optionLabel: opt.optionLabel,
                        colorHex: opt.optionType === 'color' ? opt.colorHex : undefined,
                        images: opt.existingImages,
                        quantity: Number(opt.quantity || 0),
                        price: Number(opt.price || 0),
                        offerPrice: Number(opt.offerPrice || 0),
                    })),
                }));
                fd.append('variants', JSON.stringify(variantsPayload));
            }

            // Other form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'productImages' || key === 'hasVariants') return;
                if (value === null || value === undefined) return;
                if (value instanceof File) fd.append(key, value);
                else fd.append(key, value.toString());
            });

            if (initialData?._id) fd.append('productId', initialData._id);

            const res = await fetch('/api/merchant/product', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error || 'Something went wrong');

            setSuccess(data.message);
            setFormData({ productImages: [], badges: null, name: "", descriptionShort: "", descriptionLong: "", quantity: "", price: "", offerPrice: "", category: "", subCategory: "", childSubCategory: "", foodType: "", hasVariants: false });
            setVariants([]);
            setPreview({ productImages: [], badges: "" });
            editor?.commands.clearContent();
            if (onSuccess) setTimeout(() => onSuccess(), 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    if (loadingCategories) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
    }

    return (
        <div className="create-product-section min-vh-100 bg-light">
            <Box sx={{ background: "linear-gradient(135deg, #006d21ff 0%, #00bb38ff 100%)", color: "white", py: 6, my: 6, textAlign: "center" }}>
                <Container>
                    <Typography variant="h3" fontWeight="bold">{initialData ? 'Edit Product' : 'Create Your Product'}</Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>{initialData ? 'Update product details' : 'Step 3 of 3: Add Product Details'}</Typography>
                </Container>
            </Box>

            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    {error   && <Alert severity="error"   sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">

                            {/* ── Product Images ── */}
                            <div className="col-12">
                                <Box sx={{ border: '2px dashed #006d21ff', borderRadius: 2, p: 3, backgroundColor: '#f8f9fa', transition: 'all 0.3s ease', '&:hover': { backgroundColor: '#e9f7ef', borderColor: '#00bb38ff' } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ImageIcon size={24} style={{ color: '#006d21ff', marginRight: '8px' }} />
                                        <Typography variant="h6" fontWeight={600} sx={{ color: '#006d21ff' }}>Product Images *</Typography>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Upload minimum 2 and maximum 5 high-quality product images.</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Button component="label" variant="contained" startIcon={<Upload />} disabled={preview.productImages.length >= 5} sx={{ backgroundColor: '#006d21ff', '&:hover': { backgroundColor: '#00bb38ff' }, '&:disabled': { backgroundColor: '#ccc' } }}>
                                            {preview.productImages.length === 0 ? 'Upload Images' : 'Add More Images'}
                                            <input type="file" accept="image/*" multiple hidden onChange={handleMultipleFileChange} />
                                        </Button>
                                        <Box sx={{ px: 2, py: 1, backgroundColor: preview.productImages.length >= 2 ? '#d4edda' : '#fff3cd', borderRadius: 1, border: `1px solid ${preview.productImages.length >= 2 ? '#c3e6cb' : '#ffeaa7'}` }}>
                                            <Typography variant="body2" fontWeight={600}>{preview.productImages.length}/5 images</Typography>
                                            {preview.productImages.length < 2 && <Typography variant="caption" color="error">(Need {2 - preview.productImages.length} more)</Typography>}
                                        </Box>
                                    </Box>
                                    {fieldErrors.productImages && <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.productImages}</Alert>}
                                    {preview.productImages.length > 0 ? (
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            {preview.productImages.map((img, index) => (
                                                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                                                    <Box sx={{ position: 'relative', paddingTop: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 2, border: index === 0 ? '3px solid #006d21ff' : '2px solid #e0e0e0' }}>
                                                        {index === 0 && <Box sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#006d21ff', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 'bold', zIndex: 2 }}>MAIN</Box>}
                                                        <img src={img} alt={`Product ${index + 1}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <IconButton size="small" onClick={() => removeProductImage(index)} sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', zIndex: 2 }}><X size={16} /></IconButton>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4, border: '1px dashed #ccc', borderRadius: 2, backgroundColor: 'white' }}>
                                            <ImageIcon size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                                            <Typography variant="body2" color="textSecondary">No images uploaded yet</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </div>

                            {/* ── Badges ── */}
                            <div className="col-md-6">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Badges (Optional)</Typography>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, "badges")} />
                                {preview.badges && <img src={preview.badges} alt="Badges" style={{ maxWidth: "200px", marginTop: "10px", borderRadius: "8px" }} />}
                            </div>

                            {/* ── Name ── */}
                            <div className="col-md-6">
                                <TextField fullWidth label="Product Name" name="name" value={formData.name} onChange={handleInputChange} required error={!!fieldErrors.name} helperText={fieldErrors.name} />
                            </div>

                            {/* ── Short description ── */}
                            <div className="col-12">
                                <TextField fullWidth label="Short Description (At least 50 characters)" name="descriptionShort" value={formData.descriptionShort} onChange={handleInputChange} required multiline rows={3} error={!!fieldErrors.descriptionShort} helperText={fieldErrors.descriptionShort || `${formData.descriptionShort.length}/50 characters`} />
                            </div>

                            {/* ── Long description ── */}
                            <div className="col-12">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Long Description (Optional)</Typography>
                                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <MenuBar editor={editor} />
                                    <EditorContent editor={editor} />
                                </div>
                            </div>

                            {/* ── Category selects ── */}
                            <div className="col-md-6">
                                <FormControl fullWidth required error={!!fieldErrors.category}>
                                    <InputLabel>Category</InputLabel>
                                    <Select name="category" value={formData.category} onChange={handleSelectChange} disabled={loadingCategories}>
                                        {categories.map(c => <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>)}
                                    </Select>
                                    {fieldErrors.category && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{fieldErrors.category}</Typography>}
                                </FormControl>
                            </div>

                            {formData.category && availableSubCategories.length > 0 && (
                                <div className="col-md-6">
                                    <FormControl fullWidth required error={!!fieldErrors.subCategory}>
                                        <InputLabel>Subcategory</InputLabel>
                                        <Select name="subCategory" value={formData.subCategory} onChange={handleSelectChange}>
                                            {availableSubCategories.map((s, i) => <MenuItem key={i} value={s.name}>{s.name}</MenuItem>)}
                                        </Select>
                                        {fieldErrors.subCategory && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{fieldErrors.subCategory}</Typography>}
                                    </FormControl>
                                </div>
                            )}

                            {formData.subCategory && hasChildSubCategories && availableChildSubCategories.length > 0 && (
                                <div className="col-md-6">
                                    <FormControl fullWidth required error={!!fieldErrors.childSubCategory}>
                                        <InputLabel>Child Subcategory</InputLabel>
                                        <Select name="childSubCategory" value={formData.childSubCategory} onChange={handleSelectChange}>
                                            {availableChildSubCategories.map((c, i) => <MenuItem key={i} value={c.name}>{c.name}</MenuItem>)}
                                        </Select>
                                        {fieldErrors.childSubCategory && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{fieldErrors.childSubCategory}</Typography>}
                                    </FormControl>
                                </div>
                            )}

                            {/* ── Variants toggle ── */}
                            <div className="col-12">
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600}>Product Variants</Typography>
                                        <Typography variant="body2" color="textSecondary">Enable if your product has multiple size, weight, colour, or volume options</Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={<Switch checked={formData.hasVariants} onChange={handleVariantToggle} color="success" />}
                                        label={formData.hasVariants ? "Enabled" : "Disabled"}
                                    />
                                </Box>
                                <Divider sx={{ my: 2 }} />
                            </div>

                            {/* ── No variants: simple price/qty ── */}
                            {!formData.hasVariants ? (
                                <>
                                    <div className="col-md-4"><TextField fullWidth label="Quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} required type="number" error={!!fieldErrors.quantity} helperText={fieldErrors.quantity} /></div>
                                    <div className="col-md-4"><TextField fullWidth label="Price"    name="price"    value={formData.price}    onChange={handleInputChange} required type="number" error={!!fieldErrors.price}    helperText={fieldErrors.price} /></div>
                                    <div className="col-md-4"><TextField fullWidth label="Offer Price" name="offerPrice" value={formData.offerPrice} onChange={handleInputChange} required type="number" error={!!fieldErrors.offerPrice} helperText={fieldErrors.offerPrice} /></div>
                                </>
                            ) : (
                                /* ── Variant cards ── */
                                <div className="col-12">
                                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Product Variants *</Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Add variants (e.g. 500g, 1kg) and optionally child options (e.g. colour, size) within each variant.</Typography>

                                    {variants.map((variant, vIdx) => (
                                        <Card key={variant.id} sx={{ mb: 3, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                                            <CardContent>
                                                {/* Variant header */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight={700}>Variant {vIdx + 1}</Typography>
                                                        {variant.displayValue && (
                                                            <Chip label={variant.displayValue} size="small" sx={{ backgroundColor: '#006d21ff', color: 'white', fontSize: '0.7rem' }} />
                                                        )}
                                                        {variant.variantType === 'color' && variant.colorHex && (
                                                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: variant.colorHex, border: '2px solid #ccc' }} />
                                                        )}
                                                    </Box>
                                                    {variants.length > 1 && (
                                                        <IconButton size="small" onClick={() => removeVariant(variant.id)} sx={{ color: 'error.main' }}>
                                                            <Trash2 size={18} />
                                                        </IconButton>
                                                    )}
                                                </Box>

                                                {/* Variant fields */}
                                                <Grid container spacing={2}>
                                                    {/* Type */}
                                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Variant Type *</InputLabel>
                                                            <Select value={variant.variantType} label="Variant Type *" onChange={e => updateVariant(variant.id, { variantType: e.target.value, variantUnit: '', variantValue: '', displayValue: '' })}>
                                                                {Object.entries(VARIANT_TYPES).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>

                                                    {/* Color picker when type = color */}
                                                    {variant.variantType === 'color' ? (
                                                        <>
                                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                <TextField fullWidth size="small" label="Color Name *" value={variant.variantValue} onChange={e => updateVariant(variant.id, { variantValue: e.target.value })} placeholder="e.g. Midnight Blue" />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                <ColorPicker value={variant.colorHex} onChange={hex => updateVariant(variant.id, { colorHex: hex })} label="Hex" />
                                                            </Grid>
                                                        </>
                                                    ) : variant.variantType === 'custom' ? (
                                                        <>
                                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                <TextField fullWidth size="small" label="Value *" value={variant.variantValue} onChange={e => updateVariant(variant.id, { variantValue: e.target.value })} />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                <TextField fullWidth size="small" label="Unit *" value={variant.variantUnit} onChange={e => updateVariant(variant.id, { variantUnit: e.target.value })} placeholder="e.g. meters" />
                                                            </Grid>
                                                        </>
                                                    ) : ['weight', 'volume'].includes(variant.variantType) ? (
                                                        <>
                                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                <TextField fullWidth size="small" label="Value *" type="number" value={variant.variantValue} onChange={e => updateVariant(variant.id, { variantValue: e.target.value })} />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                <FormControl fullWidth size="small">
                                                                    <InputLabel>Unit *</InputLabel>
                                                                    <Select value={variant.variantUnit} label="Unit *" onChange={e => updateVariant(variant.id, { variantUnit: e.target.value })}>
                                                                        {VARIANT_TYPES[variant.variantType as keyof typeof VARIANT_TYPES].units.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                        </>
                                                    ) : (
                                                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                            <FormControl fullWidth size="small">
                                                                <InputLabel>Value *</InputLabel>
                                                                <Select value={variant.variantValue} label="Value *" onChange={e => updateVariant(variant.id, { variantValue: e.target.value })}>
                                                                    {VARIANT_TYPES[variant.variantType as keyof typeof VARIANT_TYPES].units.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                    )}

                                                    {/* Display value */}
                                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <TextField fullWidth size="small" label="Display As" value={variant.displayValue} onChange={e => updateVariant(variant.id, { displayValue: e.target.value })} placeholder="Auto-generated" helperText="Leave blank for auto" />
                                                    </Grid>
                                                </Grid>

                                                {/* Variant image uploader */}
                                                <Box sx={{ mt: 2 }}>
                                                    <MultiImageUploader
                                                        existingImages={variant.existingImages}
                                                        newPreviews={variant.imagePreviews}
                                                        onAddFiles={files => addVariantImages(variant.id, files)}
                                                        onRemoveExisting={idx => removeVariantExistingImage(variant.id, idx)}
                                                        onRemoveNew={idx => removeVariantNewImage(variant.id, idx)}
                                                        label="Variant images (optional, up to 5)"
                                                    />
                                                </Box>

                                                {/* Price / qty — only shown when no child options exist */}
                                                {variant.options.length === 0 && (
                                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                                        <Grid size={{ xs: 12, sm: 4 }}>
                                                            <TextField fullWidth size="small" label="Quantity *" type="number" value={variant.quantity} onChange={e => updateVariant(variant.id, { quantity: e.target.value })} />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 4 }}>
                                                            <TextField fullWidth size="small" label="Price *" type="number" value={variant.price} onChange={e => updateVariant(variant.id, { price: e.target.value })} />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 4 }}>
                                                            <TextField fullWidth size="small" label="Offer Price *" type="number" value={variant.offerPrice} onChange={e => updateVariant(variant.id, { offerPrice: e.target.value })} />
                                                        </Grid>
                                                    </Grid>
                                                )}

                                                {/* ── Child Options ── */}
                                                <Box sx={{ mt: 2 }}>
                                                    <Box
                                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', py: 1, px: 1.5, borderRadius: 1, backgroundColor: '#e9f7ef', '&:hover': { backgroundColor: '#d4f0de' } }}
                                                        onClick={() => updateVariant(variant.id, { optionsExpanded: !variant.optionsExpanded })}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="body2" fontWeight={600} sx={{ color: '#006d21ff' }}>
                                                                Child Options
                                                            </Typography>
                                                            {variant.options.length > 0 && (
                                                                <Chip label={variant.options.length} size="small" sx={{ backgroundColor: '#006d21ff', color: 'white', height: 18, fontSize: '0.65rem' }} />
                                                            )}
                                                            <Typography variant="caption" color="textSecondary">
                                                                (e.g. colors / sizes within this variant)
                                                            </Typography>
                                                        </Box>
                                                        {variant.optionsExpanded ? <ChevronUp size={16} color="#006d21ff" /> : <ChevronDown size={16} color="#006d21ff" />}
                                                    </Box>

                                                    {variant.optionsExpanded && (
                                                        <Box sx={{ mt: 1.5, pl: 1, borderLeft: '3px solid #006d21ff' }}>
                                                            {variant.options.map((opt, oIdx) => (
                                                                <Box key={opt.id} sx={{ mb: 2, p: 1.5, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#555' }}>
                                                                            Option {oIdx + 1}
                                                                            {opt.optionType === 'color' && opt.colorHex && (
                                                                                <Box component="span" sx={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: opt.colorHex, ml: 1, border: '1px solid #ccc', verticalAlign: 'middle' }} />
                                                                            )}
                                                                        </Typography>
                                                                        <IconButton size="small" onClick={() => removeOption(variant.id, opt.id)} sx={{ color: 'error.main', padding: '2px' }}>
                                                                            <Trash2 size={15} />
                                                                        </IconButton>
                                                                    </Box>

                                                                    <Grid container spacing={1.5}>
                                                                        {/* Option type */}
                                                                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                            <FormControl fullWidth size="small">
                                                                                <InputLabel>Type *</InputLabel>
                                                                                <Select value={opt.optionType} label="Type *" onChange={e => updateOption(variant.id, opt.id, { optionType: e.target.value as any, optionLabel: '', colorHex: '#000000' })}>
                                                                                    {OPTION_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                                                                                </Select>
                                                                            </FormControl>
                                                                        </Grid>

                                                                        {/* Label */}
                                                                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                            <TextField fullWidth size="small" label="Label *" value={opt.optionLabel} onChange={e => updateOption(variant.id, opt.id, { optionLabel: e.target.value })} placeholder={opt.optionType === 'color' ? 'e.g. Red' : opt.optionType === 'size' ? 'e.g. M' : 'e.g. Matte'} />
                                                                        </Grid>

                                                                        {/* Color picker for color type */}
                                                                        {opt.optionType === 'color' && (
                                                                            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                                                                                <ColorPicker value={opt.colorHex} onChange={hex => updateOption(variant.id, opt.id, { colorHex: hex })} label="Color" />
                                                                            </Grid>
                                                                        )}

                                                                        {/* Price / Qty */}
                                                                        <Grid size={{ xs: 12, sm: 4 }}>
                                                                            <TextField fullWidth size="small" label="Quantity *" type="number" value={opt.quantity} onChange={e => updateOption(variant.id, opt.id, { quantity: e.target.value })} />
                                                                        </Grid>
                                                                        <Grid size={{ xs: 12, sm: 4 }}>
                                                                            <TextField fullWidth size="small" label="Price *" type="number" value={opt.price} onChange={e => updateOption(variant.id, opt.id, { price: e.target.value })} />
                                                                        </Grid>
                                                                        <Grid size={{ xs: 12, sm: 4 }}>
                                                                            <TextField fullWidth size="small" label="Offer Price *" type="number" value={opt.offerPrice} onChange={e => updateOption(variant.id, opt.id, { offerPrice: e.target.value })} />
                                                                        </Grid>

                                                                        {/* Option image */}
                                                                        <Grid size={{ xs: 12 }}>
                                                                            <MultiImageUploader
                                                                                existingImages={opt.existingImages}
                                                                                newPreviews={opt.imagePreviews}
                                                                                onAddFiles={files => addOptionImages(variant.id, opt.id, files)}
                                                                                onRemoveExisting={idx => removeOptionExistingImage(variant.id, opt.id, idx)}
                                                                                onRemoveNew={idx => removeOptionNewImage(variant.id, opt.id, idx)}
                                                                                label="Option images (optional)"
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Box>
                                                            ))}

                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<Plus size={14} />}
                                                                onClick={() => addOption(variant.id)}
                                                                sx={{ borderColor: '#006d21ff', color: '#006d21ff', '&:hover': { borderColor: '#00bb38ff', backgroundColor: 'rgba(0,109,33,0.04)' } }}
                                                            >
                                                                Add Option
                                                            </Button>

                                                            {variant.options.length > 0 && (
                                                                <Alert severity="info" sx={{ mt: 1.5, py: 0.5 }}>
                                                                    When child options exist, price & quantity are set per option, not on the variant itself.
                                                                </Alert>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>

                                            </CardContent>
                                        </Card>
                                    ))}

                                    <Button variant="outlined" startIcon={<Plus size={18} />} onClick={addVariant} sx={{ borderColor: '#006d21ff', color: '#006d21ff', '&:hover': { borderColor: '#00bb38ff', backgroundColor: 'rgba(0,109,33,0.04)' } }}>
                                        Add Another Variant
                                    </Button>
                                </div>
                            )}

                            {/* ── Food type ── */}
                            {(formData.category === "food" || formData.category === "powder") && (
                                <div className="col-12">
                                    <FormControl required error={!!fieldErrors.foodType}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Food Type</Typography>
                                        <RadioGroup row name="foodType" value={formData.foodType} onChange={handleInputChange}>
                                            <FormControlLabel value="veg"     control={<Radio />} label="Veg" />
                                            <FormControlLabel value="non-veg" control={<Radio />} label="Non-Veg" />
                                        </RadioGroup>
                                        {fieldErrors.foodType && <Typography variant="caption" color="error">{fieldErrors.foodType}</Typography>}
                                    </FormControl>
                                </div>
                            )}

                            {/* ── Submit ── */}
                            <div className="col-12">
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '2px solid #e0e0e0' }}>
                                    <Typography variant="body2" color="textSecondary">* Required fields</Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button variant="outlined" disabled={loading} sx={{ borderColor: '#006d21ff', color: '#006d21ff', '&:hover': { borderColor: '#00bb38ff', backgroundColor: 'rgba(0,109,33,0.04)' } }}>Cancel</Button>
                                        <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#006d21ff', minWidth: '160px', '&:hover': { backgroundColor: '#00bb38ff' }, '&:disabled': { backgroundColor: '#ccc' } }}>
                                            {loading ? <><CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />{initialData ? 'Updating...' : 'Creating...'}</> : (initialData ? 'Update Product' : 'Create Product')}
                                        </Button>
                                    </Box>
                                </Box>
                            </div>

                        </div>
                    </form>
                </Paper>
            </Container>
        </div>
    );
};

export default CreateProduct;