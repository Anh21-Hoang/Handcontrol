
import React from 'react';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { Particles } from './Particles';
import { GestureState } from '../types';
import { OrbitControls, Stars } from '@react-three/drei';

interface SceneProps {
  gesture: GestureState;
  fingerCount: number;
  handPosition: [number, number];
}

export const Scene: React.FC<SceneProps> = ({ gesture, fingerCount, handPosition }) => {
  return (
    <>
      <color attach="background" args={['#020205']} />
      <ambientLight intensity={0.05} />
      <pointLight position={handPosition as any} intensity={15} color="#4cc9f0" distance={15} />
      <pointLight position={[0, 0, 0]} intensity={5} color="#ffd700" distance={20} />
      
      <Stars radius={150} depth={50} count={7000} factor={6} saturation={0} fade speed={0.5} />
      
      <Particles gesture={gesture} fingerCount={fingerCount} handPosition={handPosition} />

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        maxDistance={50} 
        minDistance={8}
        autoRotate={gesture === GestureState.IDLE}
        autoRotateSpeed={0.3}
      />

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={3.0} 
          radius={0.7} 
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};
