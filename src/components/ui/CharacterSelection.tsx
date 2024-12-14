'use client'

import { useState, useEffect, useLayoutEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { AnimatedLock } from './AnimatedLock'

declare global {
  interface Window {
    $memberstackDom: {
      getCurrentMember: () => Promise<{
        data: {
          id: string;
        } | null;
      }>;
    };
  }
}

const scrollbarStyles = `
  .scrollbar-thin {
    /* Firefox */
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

  /* Explicitly remove both up and down buttons */
  .scrollbar-thin::-webkit-scrollbar-button:single-button {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
    background: none !important;
  }
  
  .scrollbar-thin::-webkit-scrollbar-button:start {
    display: none !important;
  }
  
  .scrollbar-thin::-webkit-scrollbar-button:end {
    display: none !important;
  }
  
  /* Remove any potential button spaces */
  .scrollbar-thin::-webkit-scrollbar-button:vertical:start:decrement,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:end:increment,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:start:increment,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:end:decrement {
    display: none !important;
  }
`

interface Character {
  name: string
  difficulty: "Easy" | "Intermediate" | "Expert"
  age: number
  description: string
  imageSrc: string
  color: string
  locked?: boolean
  scores?: {
    overallPerformance: number
    engagement: number
    objectionHandling: number
    informationGathering: number
    programExplanation: number
    closingSkills: number
    overallEffectiveness: number
  }
}
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

interface AnimatedStartButtonProps {
  onStart: () => void;
  isLocked?: boolean;
  showLockedText?: boolean;
}

const AnimatedStartButton: React.FC<AnimatedStartButtonProps> = ({ onStart, isLocked, showLockedText }) => {
  const [state, setState] = useState<'idle' | 'loading' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (state === 'loading') {
      const startTime = Date.now();
      const duration = 3000; // 3 seconds

      const updateProgress = () => {
        const elapsedTime = Date.now() - startTime;
        const newProgress = Math.min((elapsedTime / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress < 100) {
          requestAnimationFrame(updateProgress);
        } else {
          setState('complete');
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [state])

  const handleClick = () => {
    if (state === 'idle' && !isLocked) {
      onStart();
      setState('loading')
      setProgress(0)
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-[20px] bg-[#5f0bb9] text-white shadow-lg w-full h-[48px] ${isLocked ? 'opacity-50' : ''}`}
         style={{
           boxShadow: "0 4px 14px 0 rgba(95, 11, 185, 0.39)"
         }}>
      <AnimatePresence mode="wait" initial={false}>
        {state === 'idle' && (
          <motion.button
            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
            onClick={handleClick}
            whileHover={!isLocked ? { scale: 1.05 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 25 },
              opacity: { duration: 0.2 }
            }}
            disabled={isLocked}
          >
            START {showLockedText ? '(LOCKED)' : ''}
          </motion.button>
        )}

        {state === 'loading' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="mb-2 text-sm"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              Preparing call...
            </motion.div>
            <div className="h-2 w-4/5 overflow-hidden rounded-full bg-[#4c098f]">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="text-lg font-bold"
              initial={{ y: 48 }}
              animate={{ y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                delay: 0.1
              }}
            >
              Call Starting
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const characters: Character[] = [
  {
    name: "Megan",
    difficulty: "Easy",
    age: 25,
    description: "I'm Megan, 25, fresh out of college with my marketing degree and diving headfirst into real estate. Everything's new territory for me right now, especially wholesaling - it's like learning a whole new language! I'm super eager to learn though, and I've got plenty of questions. Hope you don't mind walking me through the basics.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/672e571489c14976033b13e0_Obr%C3%A1zek%20WhatsApp%2C%202024-11-08%20v%2019.21.46_99e4962c-p-500.jpg",
    color: "#23c55f",
    locked: false, // Add this line
  },
  {
    name: "David",
    difficulty: "Intermediate",
    age: 40,
    description: "I'm David, 40, and I approach real estate decisions with the same analytical mindset I've developed over years in finance. Currently evaluating multiple offers for my property from wholesalers, and I need to make sure I'm not leaving money on the table. I dig into the details and expect clear, data-backed answers. Let's break down these options systematically.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/6729085f757129974706314d_image%20(6)-p-500.png",
    color: "#FCA147",
    locked: true,
  },
  {
    name: "Linda",
    difficulty: "Expert",
    age: 55,
    description: "I'm Linda, 55, with decades in real estate investing and a legal background that makes me question everything twice. I've seen too many deals go south to take anything at face value. While wholesaling might be legal, I have serious concerns about how it's used with distressed properties. Let's talk ethics and compliance.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/6729085f8a8dc1e8f78eae9b_image%20(7)-p-500.png",
    color: "#DC2626",
    locked: true,
  },
]

function ScorePanel({ 
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
  

  useEffect(() => {
    // Modify the fetchMetrics function in ScorePanel:
const fetchMetrics = async () => {
  try {
    console.log(`Fetching metrics for ${characterName} with memberId ${memberId}`);
    const response = await fetch(
      `/api/character-performance?memberId=${memberId}&characterName=${characterName}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch metrics:', errorText);
      throw new Error(errorText);
    }
    
    const data = await response.json();
    console.log('Received metrics:', data);
    
    if (!data) {
      throw new Error('No data received');
    }
    
    setMetrics(data);
  } catch (error) {
    console.error('Error fetching metrics:', error);
  } finally {
    setIsLoading(false);
  }
};

    if (memberId && characterName) {
      fetchMetrics();
    }
  }, [memberId, characterName, teamId]);

  const handleRecordsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.parent.postMessage({
      type: 'REDIRECT',
      url: 'https://app.trainedbyai.com/call-records'
    }, '*');
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading metrics...</div>;
  }

  if (!metrics) {
    return <div className="text-center py-4">No performance data available</div>;
  }

  const categories = [
    { key: 'overall_performance', label: 'Overall Performance' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'objection_handling', label: 'Objection Handling' },
    { key: 'information_gathering', label: 'Information Gathering' },
    { key: 'program_explanation', label: 'Program Explanation' },
    { key: 'closing_skills', label: 'Closing Skills' },
    { key: 'overall_effectiveness', label: 'Overall Effectiveness' },
  ];

  return (
    <>
      <style jsx>{scrollbarStyles}</style>
      <div className="w-full text-sm h-[320px] flex flex-col">
        <div className="flex-grow overflow-y-auto scrollbar-thin">
          <h3 className="text-sm font-semibold mb-2 sticky top-0 bg-white py-2 z-10">
            Score based on past {performanceGoals.number_of_calls_average} calls
            </h3>
          {categories.map(({ key, label }) => (
            <div key={key} className="bg-[#f8fdf6] p-3 rounded-lg mb-3 mr-2">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-medium ${key === 'overall_performance' ? 'text-base' : 'text-xs'}`}>
                  {label}
                </span>
                <span className={`font-bold text-green-500 ${key === 'overall_performance' ? 'text-lg' : 'text-xs'}`}>
                  {metrics[key as keyof PerformanceMetrics] || 0}/100
                </span>
              </div>
              <div className={`bg-gray-200 rounded-full overflow-hidden ${key === 'overall_performance' ? 'h-3' : 'h-2'}`}>
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${metrics[key as keyof PerformanceMetrics] || 0}%` }}
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
    </>
  );
}

function LockedOverlay({ 
  previousAssistant, 
  isLastLocked, 
  difficulty,
  performanceGoals,
  showUnlockAnimation,
  onAnimationComplete
}: { 
  previousAssistant: string; 
  isLastLocked: boolean; 
  difficulty: string;
  performanceGoals: {
    overall_performance_goal: number;
    number_of_calls_average: number;
  };
  showUnlockAnimation?: boolean;
  onAnimationComplete?: () => void;
}) {
  const glowColor = 
    difficulty === 'Easy' 
      ? 'rgba(72, 199, 174, 0.5)' 
      : difficulty === 'Intermediate'
        ? 'rgba(252, 161, 71, 0.5)'
        : 'rgba(220, 38, 38, 0.5)';

  return (
    <div 
      className="absolute inset-0 rounded-[15px] flex items-center justify-center bg-black/40 backdrop-blur-sm" 
      style={{ 
        boxShadow: `0 0 20px ${
          difficulty === 'Easy' 
            ? 'rgba(72, 199, 174, 0.5)' 
            : difficulty === 'Intermediate'
              ? 'rgba(252, 161, 71, 0.5)'
              : 'rgba(220, 38, 38, 0.5)'
        }`
      }}
    >
      <div className="w-[400px] h-[400px] p-6 pt-16 text-center flex flex-col items-center justify-start">
        <div>
          <div className="flex justify-center items-center gap-4 mb-8 w-full">
  <AnimatedLock 
  characterName={previousAssistant}
  isLocked={!showUnlockAnimation}
  onUnlockShown={onAnimationComplete}
/>
</div>
          <h3 className="text-3xl font-bold text-white mb-4">Character Locked</h3>
          <p className="text-white text-xl mb-8">
            {isLastLocked 
              ? `Unlock ${previousAssistant} First` 
              : `Achieve Overall Performance above ${performanceGoals.overall_performance_goal} from the past ${performanceGoals.number_of_calls_average} calls on ${previousAssistant} to Unlock.`
            }
          </p>
          {!isLastLocked && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Overall Performance</span>
                <span className="text-sm font-bold text-white">{performanceGoals.overall_performance_goal}/100</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-white to-gray-200 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${performanceGoals.overall_performance_goal}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function CharacterSelection() {
  const [teamId, setTeamId] = useState<string | null>(null);
const [activePanel, setActivePanel] = useState<{ [key: string]: 'description' | 'scores' }>({
  Megan: 'description',
  David: 'description',
  Linda: 'description'
});

const [memberId, setMemberId] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

const [previousLockStates, setPreviousLockStates] = useState<{[key: string]: boolean}>({});
const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);

const checkAndShowAnimation = async (character: Character, shouldBeUnlocked: boolean) => {
  if (!memberId) return;

  try {
    // Check if we've shown the animation before
    const response = await fetch(`/api/unlock-animations?memberId=${memberId}&characterName=${character.name}`);
    const { shown } = await response.json();

    // If we haven't shown it and the character should be unlocked, show animation
    if (!shown && shouldBeUnlocked) {
      setShowUnlockAnimation(character.name);

      // Record that we've shown the animation
      await fetch('/api/unlock-animations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          characterName: character.name
        })
      });
    }
  } catch (error) {
    console.error('Error handling unlock animation:', error);
  }
};

useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tid = urlParams.get('teamId');
    setTeamId(tid);
  }, []);

const [characterMetrics, setCharacterMetrics] = useState<{
  [key: string]: {
    overall_performance: number;
    engagement: number;
    objection_handling: number;
    information_gathering: number;
    program_explanation: number;
    closing_skills: number;
    overall_effectiveness: number;
    total_calls: number;
    past_calls_count: number; // Added this line
  } | null;
}>({});

const [performanceGoals, setPerformanceGoals] = useState({
  overall_performance_goal: 85,
  number_of_calls_average: 10
});

  useEffect(() => {
  // Get memberId directly from URL
  const searchParams = new URLSearchParams(window.location.search);
  const mid = searchParams.get('memberId');
  console.log('Found memberId in URL:', mid);
  
  if (mid) {
    setMemberId(mid);
  } else {
    // Only try message approach if no URL parameter
    window.parent.postMessage({ type: 'GET_MEMBER_ID' }, '*');
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'SET_MEMBER_ID' && event.data.memberId) {
      console.log('Received member ID:', event.data.memberId);
      setMemberId(event.data.memberId);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

const handleStart = async (character: Character) => {
  console.log('Start button clicked for:', character.name);
  console.log('Current memberId:', memberId);
  console.log('Current teamId:', teamId);

  if (!memberId) {
    console.error('No member ID found');
    return;
  }

  const apiUrls: Record<string, string> = {
    Megan: 'https://hook.eu2.make.com/0p7hdgmvngx1iraz2a6c90z546ahbqex',
    David: 'https://hook.eu2.make.com/54eb38fg3owjjxp1q9nf95r4dg9ex6op',
    Linda: 'https://hook.eu2.make.com/jtgmjkcvgsltevf475nhjsqohgks97rj'
  };

  const apiUrl = apiUrls[character.name];
  if (!apiUrl) {
    console.error('No API URL found for character:', character.name);
    return;
  }

  try {
    // Create the form directly with the data we need
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';
    form.target = '_top'; // Force top-level navigation

    // Add member_ID input
    const memberInput = document.createElement('input');
    memberInput.type = 'hidden';
    memberInput.name = 'member_ID';
    memberInput.value = memberId;
    form.appendChild(memberInput);

    // Add teamId input if it exists
    if (teamId) {
      const teamInput = document.createElement('input');
      teamInput.type = 'hidden';
      teamInput.name = 'teamId';
      teamInput.value = teamId;
      form.appendChild(teamInput);
    }

    // Add character input
    const characterInput = document.createElement('input');
    characterInput.type = 'hidden';
    characterInput.name = 'character';
    characterInput.value = character.name;
    form.appendChild(characterInput);

    // Set the form action URL with query parameters
    const params = new URLSearchParams({
      member_ID: memberId,
      ...(teamId && { teamId }),
      character: character.name
    });
    form.action = `${apiUrl}?${params.toString()}`;

    // Add the form to the document and submit it
    document.body.appendChild(form);
    form.submit();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(form);
    }, 1000);

  } catch (error) {
    console.error('Error during redirect:', error);
    
    // Fallback: Try direct navigation if form submission fails
    if (window.top) {
      window.top.location.href = apiUrl + '?' + new URLSearchParams({
        member_ID: memberId,
        ...(teamId && { teamId }),
        character: character.name
      }).toString();
    }
  }
};

  const togglePanel = (name: string) => {
    setActivePanel(prev => ({
      ...prev,
      [name]: prev[name] === 'description' ? 'scores' : 'description'
    }));
  };

useEffect(() => {
  const fetchPerformanceGoals = async () => {
    try {
      // Get teamId from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const teamId = urlParams.get('teamId');

      console.log('Fetching performance goals for teamId:', teamId);
      const response = await fetch(`/api/performance-goals?teamId=${teamId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched performance goals:', data);
        setPerformanceGoals(data);
      } else {
        console.error('Failed to fetch performance goals:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching performance goals:', error);
    }
  };

  fetchPerformanceGoals();
}, []);

useEffect(() => {
  const fetchAllMetrics = async () => {
    if (!memberId || !teamId) {
      console.log('Missing memberId or teamId:', { memberId, teamId });
      return;
    }
    
    setIsLoading(true);
    console.log('Starting to fetch metrics with:', { memberId, teamId });
    
    const metrics: typeof characterMetrics = {};
    
    for (const character of characters) {
      try {
        const url = `/api/character-performance?memberId=${memberId}&characterName=${character.name}`;
        console.log('Fetching URL:', url);
        
        const response = await fetch(url);
        console.log(`Response for ${character.name}:`, { 
          status: response.status,
          ok: response.ok 
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Data for ${character.name}:`, data);
          metrics[character.name] = data;
        } else {
          const errorText = await response.text();
          console.error(`Failed to fetch metrics for ${character.name}:`, errorText);
          metrics[character.name] = null;
        }
      } catch (error) {
        console.error(`Error fetching metrics for ${character.name}:`, error);
        metrics[character.name] = null;
      }
    }
    
    console.log('Final metrics to be set:', metrics);
    setCharacterMetrics(metrics);
    setIsLoading(false);
  };

  // Initial fetch
  fetchAllMetrics();

  // Set up polling every 5 seconds
  const intervalId = setInterval(() => {
    fetchAllMetrics();
  }, 5000);

  // Cleanup on unmount
  return () => clearInterval(intervalId);
}, [memberId, teamId]);

useEffect(() => {
  characters.forEach((character) => {
    const currentMetrics = characterMetrics[character.name];
    const prevCharacter = characters[characters.indexOf(character) - 1];
    const prevCharacterMetrics = prevCharacter ? characterMetrics[prevCharacter.name] : null;

    let shouldBeUnlocked = false;
    if (characters.indexOf(character) === 0) {
      shouldBeUnlocked = true;
    } else if (
      prevCharacterMetrics && 
      prevCharacterMetrics.overall_performance >= performanceGoals.overall_performance_goal &&
      prevCharacterMetrics.total_calls >= performanceGoals.number_of_calls_average &&
      !showUnlockAnimation  // Only consider it unlocked if not currently animating
    ) {
      shouldBeUnlocked = true;
    }

    // Check if criteria is met but not yet animating
    const meetsUnlockCriteria = 
      prevCharacterMetrics && 
      prevCharacterMetrics.overall_performance >= performanceGoals.overall_performance_goal &&
      prevCharacterMetrics.total_calls >= performanceGoals.number_of_calls_average;

    const wasLocked = previousLockStates[character.name];
    if (wasLocked && meetsUnlockCriteria && !showUnlockAnimation) {
      console.log('Starting unlock animation for:', character.name);
      setShowUnlockAnimation(character.name);
    }

    // Update lock state for next check
    setPreviousLockStates(prev => ({
      ...prev,
      [character.name]: !shouldBeUnlocked
    }));
  });
}, [characterMetrics, showUnlockAnimation]); // Added showUnlockAnimation to dependencies

useEffect(() => {
  characters.forEach((character) => {
    const currentMetrics = characterMetrics[character.name];
    const prevCharacter = characters[characters.indexOf(character) - 1];
    const prevCharacterMetrics = prevCharacter ? characterMetrics[prevCharacter.name] : null;

    let shouldBeUnlocked = false;
    if (characters.indexOf(character) === 0) {
      shouldBeUnlocked = true;
    } else if (
      prevCharacterMetrics && 
      prevCharacterMetrics.overall_performance >= performanceGoals.overall_performance_goal &&
      prevCharacterMetrics.total_calls >= performanceGoals.number_of_calls_average
    ) {
      shouldBeUnlocked = true;
    }

    // Call our new function to handle the animation
    checkAndShowAnimation(character, shouldBeUnlocked);

    setPreviousLockStates(prev => ({
      ...prev,
      [character.name]: !shouldBeUnlocked
    }));
  });
}, [characterMetrics, performanceGoals, memberId]);

useLayoutEffect(() => {
  const updateHeight = () => {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({
      type: 'RESIZE_IFRAME',
      height: height
    }, '*');
  };

  // Update height on initial render
  updateHeight();

  // Update height when panel state changes
  const observer = new ResizeObserver(updateHeight);
  observer.observe(document.body);

  // Update height when images load
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.complete) {
      updateHeight();
    } else {
      img.addEventListener('load', updateHeight);
    }
  });

  return () => {
    observer.disconnect();
    images.forEach(img => img.removeEventListener('load', updateHeight));
  };
}, [activePanel]);
  
return (
    <div
      className="w-full h-auto bg-white rounded-[20px]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">

{characters.map((character, index) => {
  // Get current character metrics
  const currentMetrics = characterMetrics[character.name];
  
  // Get previous character and their metrics
  const prevCharacter = index > 0 ? characters[index - 1] : null;
  const prevCharacterMetrics = prevCharacter ? characterMetrics[prevCharacter.name] : null;

  // Determine if character should be unlocked
  let shouldBeUnlocked = false;
if (index === 0) {
  shouldBeUnlocked = true;
} else if (
  prevCharacterMetrics && 
  prevCharacterMetrics.overall_performance >= performanceGoals.overall_performance_goal &&
  prevCharacterMetrics.total_calls >= performanceGoals.number_of_calls_average
) {
  shouldBeUnlocked = true;
}

  // Update character's locked status
  const updatedCharacter = {
  ...character,
  locked: character.locked && (!shouldBeUnlocked || showUnlockAnimation === character.name)
};
          
          if (index === 0) {
            // Megan is always unlocked
            shouldBeUnlocked = true;
          } else if (prevCharacterMetrics && prevCharacterMetrics.overall_performance >= 85) {
            // Character should be unlocked if previous character has performance >= 85
            shouldBeUnlocked = true;
          }

          // Debug log
          console.log(`${character.name} unlock status:`, {
            previousCharacter: prevCharacter?.name,
            previousPerformance: prevCharacterMetrics?.overall_performance,
            shouldBeUnlocked,
            isLocked: updatedCharacter.locked
          });

          return (
            <div 
  key={character.name} 
  className="relative rounded-[20px] overflow-hidden" 
  style={{ 
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
  }}
>
              <div className="p-4 flex flex-col items-center text-center">
                <div className="w-full px-5 mb-2">
                  <div 
  className="w-32 h-32 mx-auto relative overflow-hidden rounded-[20px] transition-all duration-300 ease-in-out" 
  style={{ 
    perspective: '1000px',
  }}
>
  <div 
    className="w-full h-full absolute inset-0" 
    style={{ 
      border: `7px solid ${
        character.name === 'Megan'
          ? 'rgba(35, 197, 95, 0.5)'
          : character.name === 'David'
            ? 'rgba(250, 162, 72, 0.5)'
            : 'rgba(236, 27, 38, 0.5)'
      }`,
      borderRadius: '20px',
      zIndex: 2
    }}
  />
  <div className="w-full h-full relative">
    <Image
      src={character.imageSrc}
      alt={character.name}
      fill
      className="object-cover rounded-[14px]"
    />
  </div>
</div>
                </div>
                <div className="w-full mb-2 flex flex-col items-center">
                  <div className="flex items-center gap-2 py-1">
                    <h2 className="text-2xl font-bold text-black">
                      {character.name}
                    </h2>
                    <div
                      className="px-3 py-1 rounded-full text-white font-semibold text-sm"
                      style={{ backgroundColor: character.color }}
                    >
                      {character.difficulty.toUpperCase()}
                    </div>
                  </div>
                  <AnimatedStartButton 
  onStart={() => handleStart(character)}
  isLocked={updatedCharacter.locked}
  showLockedText={updatedCharacter.locked}
/>
                </div>
                <div className="relative w-full mb-6 flex-grow">
                  <button 
                    onClick={() => togglePanel(character.name)}
                    className="w-full py-3 rounded-[20px] text-black font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg bg-white shadow-md mb-6"
                  >
                    <span>
                      {activePanel[character.name] === 'description' ? 'View Performance' : 'Back to Description'}
                    </span>
                    {activePanel[character.name] === 'description' ? (
                      <ChevronDown size={20} className="inline-block ml-2" />
                    ) : (
                      <ChevronUp size={20} className="inline-block ml-2" />
                    )}
                  </button>
<div className="min-h-[300px] overflow-hidden relative">
  <AnimatePresence initial={false}>
    {activePanel[character.name] === 'description' ? (
      <motion.div
        key="description"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
        className="absolute inset-0"
      >
        <p className="text-gray-600 text-base leading-relaxed text-center flex items-center justify-center h-full">
          {character.description}
        </p>
      </motion.div>
    ) : (
      <motion.div
  key="scores"
  initial={{ y: "-100%", opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: "100%", opacity: 0 }}
  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
  className="absolute inset-0 overflow-hidden"
>
  {isLoading ? (
    <div className="flex items-center justify-center h-full">
      <p>Loading metrics...</p>
    </div>
  ) : (
    <ScorePanel 
      characterName={character.name}
      memberId={memberId || ''}
      teamId={teamId}
      performanceGoals={performanceGoals}
    />
  )}
</motion.div>
    )}
  </AnimatePresence>
</div>
                </div>
              </div>
              {updatedCharacter.locked && (
  <LockedOverlay 
  previousAssistant={prevCharacter?.name || ''}
  isLastLocked={index === characters.length - 1}
  difficulty={character.difficulty}
  performanceGoals={performanceGoals}
  showUnlockAnimation={showUnlockAnimation === character.name}
  onAnimationComplete={() => setShowUnlockAnimation(null)}
/>
)}
            </div>
          );
        })}
      </div>
    </div>
);
}
