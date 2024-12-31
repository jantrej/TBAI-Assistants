'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import type { StaticImageData } from "next/image";
const Image = require("next/image").default;

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

interface ScorePanelProps {
  characterName: string;
  memberId: string;
  teamId: string | null;
  performanceGoals: {
    overall_performance_goal: number;
    number_of_calls_average: number;
  };
  resetCharacterState: (characterName: string) => void;
}

export function ScorePanel({ 
  characterName, 
  memberId,
  performanceGoals,
  teamId,
  resetCharacterState
}: ScorePanelProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const completionChecked = useRef(false);
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
      if (completionChecked.current || !memberId || !characterName) return;

      try {
        const response = await fetch(
          `/api/challenge-completion?memberId=${memberId}&characterName=${characterName}`
        );
        
        if (response.ok) {
          const { isCompleted: wasCompleted } = await response.json();
          if (wasCompleted) {
            setIsCompleted(true);
            wasEverCompleted.current = true;
          }
        }
      } catch (error) {
        console.error('Error checking completion status:', error);
      } finally {
        completionChecked.current = true;
      }
    };

    checkInitialCompletion();
  }, [memberId, characterName]);

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
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [memberId, characterName]);

  const resetChallenge = useCallback(async () => {
    try {
      if (wasEverCompleted.current && isCompleted) {
        console.log('Challenge was completed successfully, skipping reset');
        return;
      }

      console.log('Resetting challenge...');

      // Reset completion flags first
      wasEverCompleted.current = false;
      setIsCompleted(false);

      // Reset metrics in UI immediately
      setMetrics({
        overall_performance: 0,
        engagement: 0,
        objection_handling: 0,
        information_gathering: 0,
        program_explanation: 0,
        closing_skills: 0,
        overall_effectiveness: 0,
        total_calls: 0
      });

      // Reset in CharacterSelection state
      resetCharacterState(characterName);

      // Then reset in database
      const response = await fetch('/api/reset-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId,
          characterName,
          teamId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reset challenge');
      }
    } catch (error) {
      console.error('Error resetting challenge:', error);
    }
  }, [memberId, characterName, teamId, isCompleted, resetCharacterState]);

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
    <>
      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #f2f3f8 transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 2px !important;
          display: block !important;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent !important;
          display: block !important;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #f2f3f8 !important;
          border-radius: 20px !important;
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .scrollbar-thin::-webkit-scrollbar-button:single-button {
          display: none !important;
        }
        
        .scrollbar-thin::-webkit-scrollbar-button:start {
          display: none !important;
        }
        
        .scrollbar-thin::-webkit-scrollbar-button:end {
          display: none !important;
        }
        
        .scrollbar-thin::-webkit-scrollbar-button:vertical:start:decrement,
        .scrollbar-thin::-webkit-scrollbar-button:vertical:end:increment,
        .scrollbar-thin::-webkit-scrollbar-button:vertical:start:increment,
        .scrollbar-thin::-webkit-scrollbar-button:vertical:end:decrement {
          display: none !important;
        }
      `}</style>
      <div className="w-full text-sm h-[320px] flex flex-col">
        <div className="flex-grow overflow-y-auto scrollbar-thin">
          <h3 className="text-sm font-semibold mb-2 sticky top-0 bg-white py-2 z-10">
            <div className="mb-1">
              {(wasEverCompleted.current || isCompleted) ? (
                "The challenge has been completed. ✅"
              ) : (
                `${Math.max(0, performanceGoals.number_of_calls_average - (metrics?.total_calls || 0))} ${
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
          className="w-full py-3 rounded-[20px] text-black font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg bg-white shadow-md mb-6 flex items-center justify-center gap-2"
        >
          <img 
            src="https://res.cloudinary.com/dmbzcxhjn/image/upload/Call_Records_duha_ykcxfj.png"
            alt="Call Records Icon"
            width={20}
            height={20}
            className="object-contain"
          />
          Go to Call Records
        </button>
      </div>
    </>
  );
}
