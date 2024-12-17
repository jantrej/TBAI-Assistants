import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { memberId, characterName, teamId } = await req.json();

    // Call your database endpoint to reset metrics
    const resetResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/reset_character_metrics`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          member_id: memberId,
          character_name: characterName,
          team_id: teamId
        })
      }
    );

    if (!resetResponse.ok) {
      throw new Error('Failed to reset character metrics');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reset-challenge:', error);
    return NextResponse.json(
      { error: 'Failed to reset challenge' },
      { status: 500 }
    );
  }
}
