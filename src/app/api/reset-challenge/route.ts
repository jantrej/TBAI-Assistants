import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { memberId, characterName } = await request.json();
    
    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Member ID and character name are required' },
        { status: 400 }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Delete all interaction records for this member/character
    await pool.sql`
      DELETE FROM character_interactions 
      WHERE member_id = ${memberId} 
      AND character_name = ${characterName};
    `;

    // Reset unlock status
    await pool.sql`
      UPDATE unlock_animations_shown 
      SET unlocked = false 
      WHERE member_id = ${memberId} 
      AND character_name = ${characterName};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to reset challenge' },
      { status: 500 }
    );
  }
}
