import { NextRequest, NextResponse } from 'next/server';
import Product from '../../../../models/Product';
import connectDB from '../../../../lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await Product.findById(id)
      .populate('companyId', 'name companyLogo description')
      .lean() as any;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'approved') {
      return NextResponse.json(
        { error: 'Product is not approved or not available' },
        { status: 404 }
      );
    }

    // ── Availability & stock ──────────────────────────────────────────────
    let isAvailable = false;
    let availableQuantity = 0;

    if (!product.hasVariants) {
      availableQuantity = product.quantity || 0;
      isAvailable = availableQuantity > 0;
    } else if (product.variants?.length > 0) {
      // Sum quantity across variants and their options
      for (const v of product.variants) {
        if (v.options?.length > 0) {
          availableQuantity += v.options.reduce((s: number, o: any) => s + (o.quantity || 0), 0);
        } else {
          availableQuantity += v.quantity || 0;
        }
      }
      isAvailable = availableQuantity > 0;
    }

    if (!isAvailable) {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 404 });
    }

    // ── Discount (for display — variants handle their own) ────────────────
    let discount = 0;
    if (!product.hasVariants) {
      discount =
        product.price > product.offerPrice
          ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
          : 0;
    } else if (product.variants?.length > 0) {
      discount = Math.max(
        ...product.variants.map((v: any) => {
          const candidates = v.options?.length > 0 ? v.options : [v];
          return Math.max(
            ...candidates.map((c: any) => {
              const p = c.price || 0;
              const op = c.offerPrice || p;
              return p > 0 && p > op ? Math.round(((p - op) / p) * 100) : 0;
            })
          );
        })
      );
    }

    // ── Base price/offerPrice for display before variant selection ─────────
    // Use the first available variant/option so the UI has something to show
    let basePrice = product.price || 0;
    let baseOfferPrice = product.offerPrice || 0;

    if (product.hasVariants && product.variants?.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant.options?.length > 0) {
        basePrice = firstVariant.options[0].price;
        baseOfferPrice = firstVariant.options[0].offerPrice;
      } else {
        basePrice = firstVariant.price;
        baseOfferPrice = firstVariant.offerPrice;
      }
    }

    const productResponse = {
      ...product,
      discount,
      company: product.companyId || { name: 'Unknown Brand' },
      quantity: availableQuantity,
      price: basePrice,
      offerPrice: baseOfferPrice,
      // variants is already included from ...product (full array with options)
    };

    return NextResponse.json({ success: true, product: productResponse });
  } catch (error: any) {
    console.error('Get single product error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}