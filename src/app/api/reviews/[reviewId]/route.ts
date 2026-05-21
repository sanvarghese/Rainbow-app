// app/api/reviews/[reviewId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { auth } from '../../../../../auth';
import Review from '../../../../models/Review';
import { deleteFromCloudinary, uploadToCloudinary } from '../../../../lib/cloudinary';

type Params = Promise<{ reviewId: string }>;

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { reviewId } = await params;

    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const existingReview = await Review.findById(reviewId);
    
    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    if (existingReview.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await req.formData();
    const rating = parseInt(formData.get('rating') as string);
    const title = formData.get('title') as string;
    const review = formData.get('review') as string;
    const name = formData.get('name') as string;
    const imagesToKeep = JSON.parse(formData.get('imagesToKeep') as string || '[]');
    const newImages = formData.getAll('newImages') as File[];
    
    if (!rating || !review || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Delete removed images from Cloudinary
    const currentImagePublicIds = existingReview.images.map((img: any) => img.publicId);
    const imagesToDelete = currentImagePublicIds.filter((id: string) => !imagesToKeep.includes(id));
    
    for (const publicId of imagesToDelete) {
      await deleteFromCloudinary(publicId);
    }
    
    // Upload new images
    const uploadedImages = [...existingReview.images.filter((img: any) => 
      imagesToKeep.includes(img.publicId)
    )];
    
    if (newImages && newImages.length > 0) {
      for (const image of newImages) {
        const buffer = Buffer.from(await image.arrayBuffer());
        
        const result = await uploadToCloudinary(buffer, `reviews/${existingReview.productId}`) as CloudinaryUploadResult;
        
        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }
    
    // Update review
    existingReview.rating = rating;
    existingReview.title = title || undefined;
    existingReview.review = review;
    existingReview.name = name;
    existingReview.images = uploadedImages;
    existingReview.status = 'approved';
    
    await existingReview.save();
    
    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: existingReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { reviewId } = await params;

    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    if (review.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete images from Cloudinary
    for (const image of review.images) {
      await deleteFromCloudinary((image as any).publicId);
    }
    
    await review.deleteOne();
    
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}