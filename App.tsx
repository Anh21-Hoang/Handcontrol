
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { HandTracker } from './components/HandTracker';
import { UI } from './components/UI';
import { GestureState, HandData } from './types';
import { magicAudio } from './utils/audio';

const App: React.FC = () => {
  const [handData, setHandData] = useState<HandData>({
    gesture: GestureState.IDLE,
    fingerCount: 0,
    x: 0,
    y: 0
  });
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const prevGestureRef = useRef<GestureState>(GestureState.IDLE);
  const prevFingerCountRef = useRef<number>(0);

  const onHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
    
    // Play magic sounds based on state changes
    if (isAudioEnabled) {
      if (data.gesture === GestureState.CLENCHED_FIST && prevGestureRef.current !== GestureState.CLENCHED_FIST) {
        magicAudio.playFocus();
      } else if (data.gesture === GestureState.OPEN_PALM && prevGestureRef.current !== GestureState.OPEN_PALM) {
        magicAudio.playExplosion();
      } else if (data.gesture === GestureState.FINGERS && data.fingerCount !== prevFingerCountRef.current) {
        magicAudio.playSummon(data.fingerCount);
      }
    }
    
    prevGestureRef.current = data.gesture;
    prevFingerCountRef.current = data.fingerCount;
  }, [isAudioEnabled]);

  const startMagic = () => {
    magicAudio.init();
    magicAudio.resume();
    setIsAudioEnabled(true);
  };

  useEffect(() => {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
    ];
    
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    });
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {!isAudioEnabled && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <button 
            onClick={startMagic}
            className="group relative px-12 py-5 overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-white to-yellow-600 animate-gradient-x opacity-20 group-hover:opacity-40" />
            <div className="absolute inset-0 border border-yellow-500/30 rounded-full" />
            <span className="relative font-cinzel text-2xl text-yellow-100 tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              Enter the Magic
            </span>
          </button>
          <p className="absolute bottom-20 text-white/40 text-[10px] uppercase tracking-[0.5em]">
            Click to enable audio for the full experience
          </p>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 2, 20], fov: 45 }}
        className="w-full h-full"
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#020205']} />
        <Scene 
          gesture={handData.gesture} 
          fingerCount={handData.fingerCount}
          handPosition={[handData.x, handData.y]} 
        />
      </Canvas>

      <div className="absolute top-6 right-6 z-50 pointer-events-none opacity-60 overflow-hidden rounded-xl border border-yellow-500/20 shadow-2xl shadow-yellow-500/10 w-48 h-36 bg-black/50">
        <HandTracker onUpdate={onHandUpdate} />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-yellow-400 uppercase tracking-tighter bg-black/60 px-2 py-0.5 rounded">
          Motion Tracker Active
        </div>
      </div>

      <UI currentGesture={handData.gesture} fingerCount={handData.fingerCount} />

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
};

export default App;
