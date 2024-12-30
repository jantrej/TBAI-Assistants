import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const characterName = searchParams.get('characterName');

    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Checking completion for:', { memberId, characterName }); // Add logging

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/check_completion_status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          member_id: memberId,
          character_name: characterName
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    console.log('Completion status:', data); // Add logging

    return NextResponse.json({ 
      isCompleted: Boolean(data.is_completed),
      timestamp: data.completed_at, // Include completion timestamp if available
      metrics: data.completion_metrics // Include metrics from completion if available
    });
  } catch (error) {
    console.error('Error checking challenge completion:', error);
    return NextResponse.json(
      { error: 'Failed to check challenge completion', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
