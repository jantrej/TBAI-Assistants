import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Type definitions
interface PerformanceMetrics {
  overall_performance: number;
  engagement: number;
  objection_handling: number;
  information_gathering: number;
  program_explanation: number;
  closing_skills: number;
  overall_effectiveness: number;
}

// GET endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const teamId = searchParams.get('teamId');
    const characterName = searchParams.get('characterName');

    if (!memberId || !teamId || !characterName) {
      return NextResponse.json(
        { error: 'Member ID, Team ID, and Character Name are required' },
        { status: 400 }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // First, get the past_calls_count setting for this team
    const settingsResult = await pool.sql`
      SELECT past_calls_count 
      FROM team_settings 
      WHERE team_id = ${teamId}`;

    const pastCallsCount = settingsResult.rows[0]?.past_calls_count || 10; // Default to 10 if not set

    // Get metrics based on past X calls
    const { rows } = await pool.sql`
      WITH recent_calls AS (
        SELECT *
        FROM character_interactions
        WHERE member_id = ${memberId}
          AND team_id = ${teamId}
          AND character_name = ${characterName}
        ORDER BY session_date DESC
        LIMIT ${pastCallsCount}
      )
      SELECT 
        ROUND(AVG(overall_performance)) as overall_performance,
        ROUND(AVG(engagement)) as engagement,
        ROUND(AVG(objection_handling)) as objection_handling,
        ROUND(AVG(information_gathering)) as information_gathering,
        ROUND(AVG(program_explanation)) as program_explanation,
        ROUND(AVG(closing_skills)) as closing_skills,
        ROUND(AVG(overall_effectiveness)) as overall_effectiveness,
        COUNT(*) as total_calls
      FROM recent_calls;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500 }
    );
  }
}

// POST endpoint for recording new interactions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      memberId,
      teamId,
      characterName,
      metrics
    }: {
      memberId: string;
      teamId: string;
      characterName: string;
      metrics: PerformanceMetrics;
    } = body;

    if (!memberId || !teamId || !characterName || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Insert new interaction
    await pool.sql`
      INSERT INTO character_interactions (
        member_id,
        team_id,
        character_name,
        overall_performance,
        engagement,
        objection_handling,
        information_gathering,
        program_explanation,
        closing_skills,
        overall_effectiveness
      ) VALUES (
        ${memberId},
        ${teamId},
        ${characterName},
        ${metrics.overall_performance},
        ${metrics.engagement},
        ${metrics.objection_handling},
        ${metrics.information_gathering},
        ${metrics.program_explanation},
        ${metrics.closing_skills},
        ${metrics.overall_effectiveness}
      )
    `;

    // Return updated metrics
    return GET(request);
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating past_calls_count setting
export async function PUT(request: Request) {
  try {
    const { teamId, pastCallsCount } = await request.json();

    if (!teamId || !pastCallsCount) {
      return NextResponse.json(
        { error: 'Team ID and past calls count are required' },
        { status: 400 }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Update or insert team settings
    await pool.sql`
      INSERT INTO team_settings (team_id, past_calls_count)
      VALUES (${teamId}, ${pastCallsCount})
      ON CONFLICT (team_id) 
      DO UPDATE SET 
        past_calls_count = ${pastCallsCount},
        last_updated = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
