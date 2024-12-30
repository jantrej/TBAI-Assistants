import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://app.trainedbyai.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const characterName = searchParams.get('characterName');

    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Member ID and character name are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      SELECT 
        ua.shown,
        ua.unlocked,
        ua.completed_at,
        cm.overall_performance as completion_performance,
        cm.total_calls as completion_calls
      FROM (
        SELECT 
          EXISTS (
            SELECT 1 
            FROM unlock_animations_shown 
            WHERE member_id = ${memberId} 
            AND character_name = ${characterName}
          ) as shown,
          EXISTS (
            SELECT 1 
            FROM unlock_animations_shown 
            WHERE member_id = ${memberId} 
            AND character_name = ${characterName}
            AND unlocked = true
          ) as unlocked,
          completed_at
        FROM unlock_animations_shown
        WHERE member_id = ${memberId} 
        AND character_name = ${characterName}
      ) ua
      LEFT JOIN completion_metrics cm ON 
        cm.member_id = ${memberId} 
        AND cm.character_name = ${characterName};
    `;

    const completionMetrics = rows[0].completion_performance ? {
      overall_performance: rows[0].completion_performance,
      total_calls: rows[0].completion_calls
    } : null;

    return NextResponse.json({ 
      shown: rows[0].shown,
      unlocked: rows[0].unlocked,
      completedAt: rows[0].completed_at,
      completionMetrics
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error checking animation status:', error);
    return NextResponse.json(
      { error: 'Failed to check animation status' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { memberId, characterName, completionMetrics } = await request.json();
    
    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Member ID and character name are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Begin transaction
    await pool.sql`BEGIN`;

    try {
      // Update unlock status
      await pool.sql`
        INSERT INTO unlock_animations_shown (member_id, character_name, unlocked, completed_at)
        VALUES (${memberId}, ${characterName}, true, NOW())
        ON CONFLICT (member_id, character_name) 
        DO UPDATE SET 
          unlocked = true,
          completed_at = EXCLUDED.completed_at;
      `;

      // Store completion metrics if provided
      if (completionMetrics) {
        await pool.sql`
          INSERT INTO completion_metrics (
            member_id, 
            character_name, 
            overall_performance, 
            total_calls
          )
          VALUES (
            ${memberId}, 
            ${characterName}, 
            ${completionMetrics.overall_performance}, 
            ${completionMetrics.total_calls}
          )
          ON CONFLICT (member_id, character_name) 
          DO NOTHING;
        `;
      }

      await pool.sql`COMMIT`;
      return NextResponse.json({ success: true }, { headers: corsHeaders() });
    } catch (error) {
      await pool.sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('Error recording animation shown:', error);
    return NextResponse.json(
      { error: 'Failed to record animation shown' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
