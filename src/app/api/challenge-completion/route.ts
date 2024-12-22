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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/challenge_completion`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          member_id: memberId,
          character_name: characterName
        }),
        method: 'POST'
      }
    );

    const data = await response.json();
    
    return NextResponse.json({
      isCompleted: Boolean(data.is_completed),
      originalGoals: data.original_goals
    });
  } catch (error) {
    console.error('Error checking challenge completion:', error);
    return NextResponse.json(
      { error: 'Failed to check challenge completion' },
      { status: 500 }
    );
  }
}
