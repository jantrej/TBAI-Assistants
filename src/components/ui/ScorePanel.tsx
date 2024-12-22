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

interface CompletionState {
  isCompleted: boolean;
  originalGoals?: {
    overall_performance_goal: number;
    number_of_calls_average: number;
  };
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
  const [completionState, setCompletionState] = useState<CompletionState>({
    isCompleted: false,
    originalGoals: undefined
  });
  const wasEverCompleted = useRef(false);

  const categories = [
    { key: 'overall_performance', label: 'Overall Performance' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'objection_handling', label: 'Objection Handling' },
    { key: 'information_gathering', label: 'Information Gathering' },
    { key: 'program_explanation', label: 'Program Explanation' },
    { key: 'closing_skills', label: 'Closing Skills' },
    { key: 'overall_effectiveness', label: 'Overall Effectiveness' },
  ] as const;

  // Check initial completion status
  useEffect(() => {
    const checkInitialCompletion = async () => {
      if (!memberId || !characterName) return;

      try {
        const response = await fetch(
          `/api/challenge-completion?memberId=${memberId}&characterName=${characterName}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.isCompleted) {
            wasEverCompleted.current = true;
            setCompletionState({
              isCompleted: true,
              originalGoals: data.originalGoals || performanceGoals
            });

            // Fetch initial metrics if completed
            const metricsResponse = await fetch(
              `/api/character-performance?memberId=${memberId}&characterName=${characterName}`
            );
            if (metricsResponse.ok) {
              const metricsData = await metricsResponse.json();
              setMetrics(metricsData);
            }
          }
        }
      } catch (error) {
        console.error('Error checking completion status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialCompletion();
  }, [memberId, characterName, performanceGoals]);

  const handleRecordsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.top!.location.href = 'https://app.trainedbyai.com/call-records';
  };

  const fetchMetrics = useCallback(async () => {
    if (!memberId || !characterName) return;

    try {
      const timestamp = new Date().getTime();
      const random = Math.random();
      const response = await fetch(
        `/api/character-performance?memberId=${memberId}&characterName=${characterName}&t=${timestamp}&r=${random}`
      );
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const data = await response.json();
      
      // If it was ever completed, just update metrics without checks
      if (wasEverCompleted.current || completionState.isCompleted) {
        setMetrics(data);
        return;
      }

      // Only check completion for non-completed challenges
      if (data.total_calls >= performanceGoals.number_of_calls_average &&
          data.overall_performance >= performanceGoals.overall_performance_goal) {
        wasEverCompleted.current = true;
        setCompletionState({
          isCompleted: true,
          originalGoals: performanceGoals
        });
        await markChallengeComplete();
      }
      
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, [memberId, characterName, performanceGoals, completionState.isCompleted]);

  const markChallengeComplete = useCallback(async () => {
    try {
      await fetch('/api/mark-challenge-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId,
          characterName,
          teamId,
          originalGoals: performanceGoals
        })
      });
    } catch (error) {
      console.error('Error marking challenge complete:', error);
    }
  }, [memberId, characterName, teamId, performanceGoals]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (!metrics && isLoading) {
    return (
      <div className="w-full text-sm h-[320px] flex flex-col">
        <div className="flex-grow">
          <h3 className="text-sm font-semibold mb-2 bg-white py-2">
            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-56"></div>
          </h3>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-[#f8fdf6] p-3 rounded-lg mb-3 mr-2">
              <div className="animate-pulse flex justify-between items-center mb-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full w-full"></div>
            </div>
          ))}
        </div>
        <div className="h-12"></div>
      </div>
    );
  }

  return (
    <div className="w-full text-sm h-[320px] flex flex-col">
      <div className="flex-grow overflow-y-auto scrollbar-thin">
        <h3 className="text-sm font-semibold mb-2 sticky top-0 bg-white py-2 z-10">
          <div className="mb-1">
            {wasEverCompleted.current || completionState.isCompleted ? (
              "The challenge has been completed. ✅"
            ) : (
              `${performanceGoals.number_of_calls_average - (metrics?.total_calls || 0)} ${
                performanceGoals.number_of_calls_average - (metrics?.total_calls || 0) === 1 ? 'call' : 'calls'
              } left to complete the challenge.`
            )}
          </div>
          <div>
            Your score from last {metrics?.total_calls || 0} {(metrics?.total_calls || 0) === 1 ? 'call' : 'calls'}:
          </div>
        </h3>
        {categories.map(({ key, label }) => (
          <div key={key} className="bg-[#f8fdf6] p-3 rounded-lg mb-3 mr-2">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-medium ${key === 'overall_performance' ? 'text-base' : 'text-xs'}`}>
                {label}
              </span>
              <span className={`font-bold text-green-500 ${key === 'overall_performance' ? 'text-lg' : 'text-xs'}`}>
                {(metrics?.[key as keyof PerformanceMetrics] ?? 0)}/100
              </span>
            </div>
            <div className={`bg-gray-200 rounded-full overflow-hidden ${key === 'overall_performance' ? 'h-3' : 'h-2'}`}>
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${metrics?.[key as keyof PerformanceMetrics] ?? 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={handleRecordsClick}
        className="w-full py-3 rounded-[20px] text-black font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg bg-white shadow-md mb-6"
      >
        Go to Call Records
      </button>
    </div>
  );
}
