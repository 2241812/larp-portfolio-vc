import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return a JSON with download URL or serve the file directly
    // For now, we'll return a redirect to the resume file path
    // You can upload the actual PDF to /public/resume.pdf
    
    return NextResponse.json({
      success: true,
      message: 'Resume download',
      downloadUrl: '/resume.pdf'
    });
  } catch (error) {
    console.error('Resume download error:', error);
    return NextResponse.json(
      { error: 'Failed to process resume download' },
      { status: 500 }
    );
  }
}
