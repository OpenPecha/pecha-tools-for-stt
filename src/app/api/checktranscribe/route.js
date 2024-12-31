import { checkTranscribingCount } from '@/lib/webhookutils'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Starting transcribe count check...');
    const result = await checkTranscribingCount();
    console.log('Check completed successfully:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}