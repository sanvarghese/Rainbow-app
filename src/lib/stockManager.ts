// lib/stockManager.ts
import mongoose from 'mongoose';
import Product from '../models/Product';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  variantDisplayValue?: string;
}

export async function checkAndDeductStock(
  items: OrderItem[],
  session?: mongoose.ClientSession
) {
  const stockUpdates = [];
  
  for (const item of items) {
    const product = await Product.findById(item.productId).session(session);
    
    if (!product) {
      throw new Error(`Product "${item.name}" not found`);
    }
    
    // Check for variants
    if (item.variantDisplayValue && product.hasVariants && product.variants) {
      const variant = product.variants.find(
        v => v.displayValue === item.variantDisplayValue
      );
      
      if (!variant) {
        throw new Error(`Variant "${item.variantDisplayValue}" for product "${item.name}" not found`);
      }
      
      if (variant.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.name} (${variant.displayValue}). ` +
          `Available: ${variant.quantity}, Requested: ${item.quantity}`
        );
      }
      
      variant.quantity -= item.quantity;
      stockUpdates.push(product.save({ session }));
      
    } else if (!product.hasVariants) {
      if (product.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${item.name}". ` +
          `Available: ${product.quantity}, Requested: ${item.quantity}`
        );
      }
      
      product.quantity -= item.quantity;
      stockUpdates.push(product.save({ session }));
    }
  }
  
  await Promise.all(stockUpdates);
  return true;
}

export async function restoreStock(
  items: OrderItem[],
  session?: mongoose.ClientSession
) {
  const stockUpdates = [];
  
  for (const item of items) {
    const product = await Product.findById(item.productId).session(session);
    
    if (!product) continue;
    
    if (item.variantDisplayValue && product.hasVariants && product.variants) {
      const variant = product.variants.find(
        v => v.displayValue === item.variantDisplayValue
      );
      
      if (variant) {
        variant.quantity += item.quantity;
        stockUpdates.push(product.save({ session }));
      }
    } else if (!product.hasVariants) {
      product.quantity += item.quantity;
      stockUpdates.push(product.save({ session }));
    }
  }
  
  await Promise.all(stockUpdates);
  return true;
}