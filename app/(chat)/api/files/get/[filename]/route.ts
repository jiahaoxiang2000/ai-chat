import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { get } from '@/lib/local-storage';
import { auth } from '@/app/(auth)/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const session = await auth();

  // Authentication check if needed
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { filename } = params;
  
  if (!filename) {
    return new Response('Missing filename', { status: 400 });
  }

  try {
    // Get file from local storage
    const file = await get(filename);
    
    if (!file) {
      return new Response('File not found', { status: 404 });
    }

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Default content type
    
    // Set content type based on common file extensions
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.json') contentType = 'application/json';
    
    return new Response(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for a year
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new Response('Error serving file', { status: 500 });
  }
}