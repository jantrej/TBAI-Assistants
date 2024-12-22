'use client'

import { useState, useEffect, useCallback, useRef } from "react";

interface PerformanceMetrics {
  overall_performance: number;
  engagement: number;
  objection_handling: number;
  information_gathering: number;
  program_explanation: number;
  closing_skills: number;
  overall_effectiveness: number;
  total_calls: number;
}

export function ScorePanel({ 
  characterName, 
  memberId,
  performanceGoals,
  teamId 
}: { 
  characterName: string; 
  memberId: string;
  teamId: string | null;
  performanceGoals: {
    overall_performance_goal: number;
    number_of_calls_average: number;
  }; 
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const categories = [
    { key: 'overall_performance', label: 'Overall Performance' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'objection_handling', label: 'Objection Handling' },
    { key: 'information_gathering', label: 'Information Gathering' },
    { key: 'program_explanation', label: 'Program Explanation' },
    { key: 'closing_skills', label: 'Closing Skills' },
    { key: 'overall_effectiveness', label: 'Overall Effectiveness' },
  ] as const;

  // Check if challenge was completed
  useEffect(() => {
    async function checkCompletion() {
      try {
        const response = await fetch(`/api/challenge-status?memberId=${memberId}&characterName=${characterName}`);
        if (response.ok) {
          const { completed } = await response.json();
          setIsCompleted(completed);
        }
      } catch (error) {
        console.error('Error checking completion status:', error);
      }
    }

    if (memberId && characterName) {
      checkCompletion();
    }
  }, [memberId, characterName]);

  // Fetch metrics regularly
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch(
          `/api/metrics?memberId=${memberId}&characterName=${characterName}`
        );
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (memberId && characterName) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [memberId, characterName]);

  // Mark challenge as completed if not already completed
  useEffect(() => {
    async function markCompleted() {
      if (!metrics || isCompleted) return;

      if (metrics.overall_performance >= performanceGoals.overall_performance_goal &&
          metrics.total_calls >= performanceGoals.number_of_calls_average) {
        try {
          await fetch('/api/mark-completed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberId,
              characterName,
              completedAt: new Date().toISOString(),
              goals: performanceGoals // Store the goals that were achieved
            })
          });
          setIsCompleted(true);
        } catch (error) {
          console.error('Error marking challenge completed:', error);
        }
      }
    }

    markCompleted();
  }, [metrics, isCompleted, memberId, characterName, performanceGoals]);

  if (isLoading || !metrics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full text-sm h-[320px] flex flex-col">
      <div className="flex-grow overflow-y-auto scrollbar-thin">
        <h3 className="text-sm font-semibold mb-2 sticky top-0 bg-white py-2 z-10">
          <div className="mb-1">
            {isCompleted ? (
              "The challenge has been completed. ✅"
            ) : (
              `${performanceGoals.number_of_calls_average - metrics.total_calls} ${
                performanceGoals.number_of_calls_average - metrics.total_calls === 1 ? 'call' : 'calls'
              } left to complete the challenge.`
            )}
          </div>
          <div>
            Your score from last {metrics.total_calls} {metrics.total_calls === 1 ? 'call' : 'calls'}:
          </div>
        </h3>
        {categories.map(({ key, label }) => (
          <div key={key} className="bg-[#f8fdf6] p-3 rounded-lg mb-3 mr-2">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-medium ${key === 'overall_performance' ? 'text-base' : 'text-xs'}`}>
                {label}
              </span>
              <span className={`font-bold text-green-500 ${key === 'overall_performance' ? 'text-lg' : 'text-xs'}`}>
                {metrics[key as keyof PerformanceMetrics]}/100
              </span>
            </div>
            <div className={`bg-gray-200 rounded-full overflow-hidden ${key === 'overall_performance' ? 'h-3' : 'h-2'}`}>
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${metrics[key as keyof PerformanceMetrics]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <a 
        href="https://app.trainedbyai.com/call-records"
        target="_top"
        className="block w-full py-3 rounded-[20px] text-black font-semibold text-lg text-center transition-all hover:opacity-90 hover:shadow-lg bg-white shadow-md mb-6"
      >
        Go to Call Records
      </a>
    </div>
  );
}
