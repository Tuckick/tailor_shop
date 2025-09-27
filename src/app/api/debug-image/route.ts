import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const imagePath = url.searchParams.get('path');

  if (!imagePath) {
    return NextResponse.json({ error: 'No image path provided' }, { status: 400 });
  }

  try {
    // Log the image path for debugging
    console.log('Debugging image path:', imagePath);

    // Check if the file exists
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), 'public', imagePath);

    console.log('Full file path:', fullPath);
    console.log('File exists:', fs.existsSync(fullPath));

    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log('File size:', stats.size);
      console.log('File modified:', stats.mtime);
    }

    return NextResponse.json({
      imagePath,
      fullPath,
      exists: fs.existsSync(fullPath),
      publicUrl: imagePath,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug image error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}