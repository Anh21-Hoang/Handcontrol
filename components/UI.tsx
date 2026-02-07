
import React from 'react';
import { GestureState } from '../types';

interface UIProps {
  currentGesture: GestureState;
  fingerCount: number;
}

export const UI: React.FC<UIProps> = ({ currentGesture, fingerCount }) => {
  const getSubTitle = () => {
    if (fingerCount > 0 && fingerCount < 5) return `Magic Creatures Summoned!`;
    if (currentGesture === GestureState.CLENCHED_FIST) return 'Storing Magic Sparkles';
    if (currentGesture === GestureState.OPEN_PALM) return 'Magic Explosion!';
    return 'Wave your hand to start!';
  };

  const animalNames = ["None", "Golden Reindeer", "Magic Penguins", "Star Bears", "Spirit Foxes", "Sky Owls"];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-10 select-none">
      <div className="flex flex-col items-center mt-6">
        <h1 className="font-cinzel text-5xl md:text-7xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-yellow-600 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          CELESTIAL GLOW
        </h1>
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mt-4" />
        <p className="mt-4 text-white/40 tracking-[0.6em] text-[10px] uppercase font-light">
          Move your hand to make magic sound!
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Magic Meter for kids */}
        <div className="flex gap-1 h-8 items-end mb-4">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                currentGesture !== GestureState.IDLE ? 'bg-yellow-400' : 'bg-white/10'
              }`}
              style={{ 
                height: currentGesture !== GestureState.IDLE 
                  ? `${20 + Math.random() * 80}%` 
                  : '10%',
                opacity: currentGesture !== GestureState.IDLE ? 0.8 : 0.2
              }}
            />
          ))}
        </div>

        <div className="relative px-10 py-4 group">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-sm border-x border-yellow-500/20" />
          <div className="relative text-center">
            <div className="text-[9px] text-yellow-500/40 uppercase tracking-[0.4em] mb-2">Magic Mode</div>
            <div className="text-white font-light uppercase tracking-[0.25em] text-xl drop-shadow-lg">
               {getSubTitle()}
            </div>
          </div>
        </div>
        
        {fingerCount > 0 && (
          <div className="text-yellow-400/80 text-xs tracking-[0.5em] uppercase animate-bounce font-bold">
            ✨ {animalNames[fingerCount]} ✨
          </div>
        )}
      </div>

      <div className="flex justify-between items-end">
        <div className="flex gap-10 text-[8px] text-white/20 uppercase tracking-[0.3em]">
          <div>Mana Level: 100%</div>
          <div>Magic Wand: Connected</div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-4">
             <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_yellow]" />
             <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
             <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
          </div>
          <a 
            href="https://aiinsight.vn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="pointer-events-auto text-yellow-500/50 hover:text-white transition-all text-[10px] tracking-[0.4em] uppercase"
          >
            AIINSIGHT.VN
          </a>
        </div>
      </div>
    </div>
  );
};
