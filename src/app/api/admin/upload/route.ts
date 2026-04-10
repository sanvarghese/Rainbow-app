// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];   // ← Changed to getAll('file')

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No image uploaded' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue; // Skip invalid files
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name.replace(/\s+/g, '_');
      const filename = `${timestamp}-${originalName}`;

      const uploadDir = path.join(process.cwd(), 'public/uploads/weekend-offers');

      // Create directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      const imageUrl = `/uploads/weekend-offers/${filename}`;
      uploadedUrls.push(imageUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid images uploaded' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,        // Return array of URLs
      message: 'Images uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}