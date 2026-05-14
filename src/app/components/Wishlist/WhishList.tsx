"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { Trash2, ShoppingBag, Heart, Loader2 } from "lucide-react";

interface ProductType {
    _id: string;
    name: string;
    productImages: string[];
    price: number;
    offerPrice?: number;
}

interface WishlistItemType {
    productId: ProductType | string;
    _id?: string;
    addedAt?: string;
}

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, fetchWishlist, addToWishlist } = useWishlist();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [addingToCart, setAddingToCart] = useState<string | null>(null);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (productId: string) => {
        setRemovingId(productId);
        try {
            await removeFromWishlist(productId);
        } catch (error) {
            console.error("Failed to remove from wishlist:", error);
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = async (productId: string) => {
        setAddingToCart(productId);
        try {
            // You can integrate your cart context/API here
            console.log("Adding to cart:", productId);
            // Example: await addToCart(productId);
            alert("Product added to cart!");
        } catch (error) {
            console.error("Failed to add to cart:", error);
        } finally {
            setAddingToCart(null);
        }
    };

    // Get the actual product data from populated or unpopulated items
    const getProductDetails = (item: WishlistItemType): ProductType | null => {
        if (typeof item.productId === "object" && item.productId !== null) {
            return item.productId;
        }
        return null;
    };

    const getProductId = (item: WishlistItemType): string => {
        if (typeof item.productId === "object" && item.productId !== null) {
            return item.productId._id;
        }
        return item.productId as string;
    };

    const validItems = wishlist.items.filter((item) => {
        const product = getProductDetails(item);
        return product !== null;
    });

    if (wishlist.loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500">Loading your wishlist...</p>
            </div>
        );
    }

    if (validItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                        <Heart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
                    <p className="text-gray-500 mb-8">
                        Save your favorite items here and they'll appear in your wishlist.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-500 mt-1">
                    {validItems.length} {validItems.length === 1 ? "item" : "items"} saved
                </p>
            </div>

            {/* Wishlist Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {validItems.map((item) => {
                    const product = getProductDetails(item);
                    if (!product) return null;

                    const productId = getProductId(item);
                    const imageUrl = product.productImages?.[0] || "/placeholder-image.jpg";
                    const displayPrice = product.offerPrice || product.price;
                    const originalPrice = product.offerPrice ? product.price : null;
                    const discount = originalPrice
                        ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
                        : 0;

                    return (
                        <div
                            key={item._id || productId}
                            className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Product Image */}
                            <Link href={`/products/${productId}`} className="block">
                                <div className="relative aspect-square bg-gray-100">
                                    <Image
                                        src={imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    />
                                    {discount > 0 && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            {discount}% OFF
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* Product Info */}
                            <div className="p-4">
                                <Link href={`/products/${productId}`}>
                                    <h5 className="font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 min-h-[56px]">
                                        {product.name}
                                    </h5>
                                </Link>

                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-gray-900">
                                        ₹{displayPrice.toLocaleString()}
                                    </span>
                                    {originalPrice && (
                                        <>
                                            <span className="text-sm text-gray-400 line-through">
                                                ₹{originalPrice.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-green-600 font-medium">
                                                Save ₹{(originalPrice - displayPrice).toLocaleString()}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => handleAddToCart(productId)}
                                        disabled={addingToCart === productId}
                                        className="green-600 flex-1 primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        style={{ backgroundColor: '#29a63e' }}
                                  >
                                        {addingToCart === productId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ShoppingBag className="w-4 h-4" />
                                        )}
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => handleRemove(productId)}
                                        disabled={removingId === productId}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed "
                                        aria-label="Remove from wishlist"
                                    >
                                        {removingId === productId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Continue Shopping Button at Bottom */}
            <div className="mt-12 text-center">
                <Link
                    href="/products"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}