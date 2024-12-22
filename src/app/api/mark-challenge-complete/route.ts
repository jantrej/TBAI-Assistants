import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { memberId, characterName, completedAt, goals } = await req.json();
    
    // Store in database that this challenge was completed
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/challenge_completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        member_id: memberId,
        character_name: characterName,
        completed_at: completedAt,
        goals_when_completed: goals // Store the goals that were achieved
      })
    });

    if (!response.ok) {
      throw new Error('Failed to store completion');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-completed:', error);
    return NextResponse.json({ error: 'Failed to mark completed' }, { status: 500 });
  }
}
