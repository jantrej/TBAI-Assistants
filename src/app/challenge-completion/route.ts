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
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/challenge_completion?memberId=${memberId}&characterName=${characterName}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    const data = await response.json();
    return NextResponse.json({ 
      isCompleted: data.is_completed,
      completionMetrics: data.completion_metrics || null 
    });
  } catch (error) {
    console.error('Error checking challenge completion:', error);
    return NextResponse.json(
      { error: 'Failed to check challenge completion' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { memberId, characterName, teamId, metrics } = await req.json();

    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/challenge_completion`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          member_id: memberId,
          character_name: characterName,
          team_id: teamId,
          completion_metrics: metrics,
          is_completed: true
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark challenge as complete');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking challenge complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark challenge as complete' },
      { status: 500 }
    );
  }
}
