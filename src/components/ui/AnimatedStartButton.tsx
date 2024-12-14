'use client'

interface AnimatedStartButtonProps {
  onComplete: () => void;
  isLocked?: boolean;
  showLockedText?: boolean;
}

const AnimatedStartButton: React.FC<AnimatedStartButtonProps> = ({ onComplete, isLocked, showLockedText }) => {
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
          onComplete();
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [state, onComplete])

  const handleClick = () => {
    if (state === 'idle' && !isLocked) {
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
