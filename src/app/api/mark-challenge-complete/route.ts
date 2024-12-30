import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { memberId, characterName } = await req.json();
    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // First get current metrics
    const metricsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/character_performance`,
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
    
    if (!metricsResponse.ok) {
      throw new Error('Failed to fetch current metrics');
    }

    const metrics = await metricsResponse.json();

    // Then mark as complete with metrics
    const completeResponse = await fetch(
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
          completion_metrics: {
            overall_performance: metrics.overall_performance,
            total_calls: metrics.total_calls,
            engagement: metrics.engagement,
            objection_handling: metrics.objection_handling,
            information_gathering: metrics.information_gathering,
            program_explanation: metrics.program_explanation,
            closing_skills: metrics.closing_skills,
            overall_effectiveness: metrics.overall_effectiveness
          }
        })
      }
    );

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      console.error('Error response from mark_challenge_complete:', errorText);
      throw new Error('Failed to mark challenge as complete');
    }

    const completionData = await completeResponse.json();

    return NextResponse.json({ 
      success: true,
      data: completionData,
      metrics: metrics
    });
  } catch (error) {
    console.error('Error marking challenge complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark challenge as complete', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
