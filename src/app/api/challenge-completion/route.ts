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
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/challenge_completions?member_id=eq.${memberId}&character_name=eq.${characterName}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check completion status');
    }

    const completions = await response.json();

    // If there's a completion record, return completed status and original goals
    if (completions.length > 0) {
      return NextResponse.json({
        isCompleted: true,
        completedAt: completions[0].completed_at,
        originalGoals: completions[0].goals_when_completed
      });
    }

    // If no completion record found, return not completed
    return NextResponse.json({
      isCompleted: false,
      originalGoals: null
    });

  } catch (error) {
    console.error('Error checking challenge completion:', error);
    return NextResponse.json(
      { error: 'Failed to check challenge completion' },
      { status: 500 }
    );
  }
}
