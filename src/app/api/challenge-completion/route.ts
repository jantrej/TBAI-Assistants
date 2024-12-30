import { NextResponse } from 'next/server';

export async function POST(req: Request) {  // Changed from GET to POST
  try {
    const { memberId, characterName, teamId } = await req.json();  // Get data from request body
    
    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Marking challenge complete for:', { memberId, characterName });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/mark_challenge_complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          member_id: memberId,
          character_name: characterName,
          completed_at: new Date().toISOString(),
          team_id: teamId
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      isCompleted: true,
      timestamp: data.completed_at
    });
  } catch (error) {
    console.error('Error marking challenge complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark challenge as complete', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
