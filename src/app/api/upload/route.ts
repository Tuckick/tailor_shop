import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API route for image uploads - now saves to database
export async function POST(request: NextRequest) {
  try {
    // Parse the FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderIdStr = formData.get('orderId') as string;
    
    // Ensure the file exists
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Validate orderId if provided (for existing orders)
    let orderId: number | undefined;
    if (orderIdStr && orderIdStr !== 'undefined' && orderIdStr !== 'null') {
      orderId = parseInt(orderIdStr);
      if (isNaN(orderId)) {
        return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
      }
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not supported. Please upload jpeg, png, webp, or gif' 
      }, { status: 400 });
    }
    
    // Check file size (limit to 5MB)
    const fiveMB = 5 * 1024 * 1024;
    if (file.size > fiveMB) {
      return NextResponse.json({ 
        error: 'File size exceeds 5MB limit' 
      }, { status: 400 });
    }
    
    // Convert file to buffer and then to base64
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');
    
    // Get image dimensions using a simple approach
    const width: number | null = null;
    const height: number | null = null;
    
    try {
      // For now, we'll skip dimensions and add them later if needed
      // Getting dimensions on server-side requires additional libraries
    } catch (error) {
      console.warn('Could not get image dimensions:', error);
    }
    
    // Create image record in database
    interface ImageCreateData {
      filename: string;
      mimeType: string;
      data: string;
      size: number;
      width: number | null;
      height: number | null;
      orderId?: number;
    }
    
    const imageCreateData: ImageCreateData = {
      filename: file.name.replace(/\s+/g, '_'),
      mimeType: file.type,
      data: base64Data,
      size: file.size,
      width,
      height,
    };
    
    // Only add orderId if it exists
    if (orderId) {
      imageCreateData.orderId = orderId;
    }
    
    const savedImage = await prisma.image.create({
      data: imageCreateData as any, // TypeScript workaround for Prisma strict typing
    });
    
    // Return image ID and data URL for immediate display
    const dataUrl = `data:${file.type};base64,${base64Data}`;
    
    return NextResponse.json({ 
      success: true, 
      imageId: savedImage.id,
      dataUrl: dataUrl,
      filename: savedImage.filename,
      size: savedImage.size,
      mimeType: savedImage.mimeType
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'Error uploading file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}