
import React, { useRef, useEffect } from 'react';
import { GestureState, HandData } from '../types';

interface HandTrackerProps {
  onUpdate: (data: HandData) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hands: any;
    let camera: any;

    const loadMediaPipe = async () => {
      const mpHands = (window as any).Hands || await import('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
      const mpCamera = (window as any).Camera || await import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

      hands = new (window as any).Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(onResults);

      if (videoRef.current) {
        camera = new (window as any).Camera(videoRef.current, {
          onFrame: async () => {
            await hands.send({ image: videoRef.current! });
          },
          width: 640,
          height: 480,
        });
        camera.start();
      }
    };

    const onResults = (results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const palm = landmarks[0];
        
        // Finger counting logic
        const fingerTips = [8, 12, 16, 20];
        const fingerPips = [6, 10, 14, 18];
        let count = 0;

        // Thumb logic (check horizontal distance for simplicity in typical camera angle)
        if (Math.abs(landmarks[4].x - landmarks[2].x) > 0.05) count++;

        // Other fingers logic (tip above pip)
        for (let i = 0; i < 4; i++) {
          if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) count++;
        }

        let gesture = GestureState.IDLE;
        if (count === 0) gesture = GestureState.CLENCHED_FIST;
        else if (count === 5) gesture = GestureState.OPEN_PALM;
        else gesture = GestureState.FINGERS;

        onUpdate({
          gesture,
          fingerCount: count,
          x: (palm.x - 0.5) * 20,
          y: -(palm.y - 0.5) * 20,
        });
      } else {
        onUpdate({ gesture: GestureState.IDLE, fingerCount: 0, x: 0, y: 0 });
      }
    };

    loadMediaPipe();

    return () => {
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, [onUpdate]);

  return (
    <div className="relative">
      <video ref={videoRef} className="hidden" playsInline muted />
    </div>
  );
};
