
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GestureState } from '../types';
import { 
  PARTICLE_COUNT, 
  TREE_HEIGHT, 
  TREE_RADIUS, 
  NEBULA_RADIUS, 
  LERP_FACTOR, 
  HAND_INFLUENCE,
  PALETTE,
  SPARKLE_INTENSITY,
  BASE_INTENSITY
} from '../constants';

interface ParticlesProps {
  gesture: GestureState;
  fingerCount: number;
  handPosition: [number, number];
}

export const Particles: React.FC<ParticlesProps> = ({ gesture, fingerCount, handPosition }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  
  const [hx, hy] = handPosition;

  // Initialize positions
  const currentPositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return arr;
  }, []);

  // Pre-calculate target shapes
  const treeTargets = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ratio = i / PARTICLE_COUNT;
      const angle = ratio * Math.PI * 45; 
      const radius = TREE_RADIUS * (1 - ratio);
      const y = (ratio * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, []);

  const nebulaTargets = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = NEBULA_RADIUS * (0.8 + Math.random() * 0.4);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const animalLocalShapes = useMemo(() => {
    const shapes: Float32Array[] = [];
    for (let type = 1; type <= 5; type++) {
      const arr = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x = 0, y = 0, z = 0;
        const u = Math.random();
        switch(type) {
          case 1: // Reindeer (Noble Gold)
            if (u < 0.6) { x = (Math.random()-0.5)*0.6; y = Math.random()*0.5; z = (Math.random()-0.5)*1.4; }
            else if (u < 0.85) { x = (Math.random()-0.5)*0.3; y = 0.5+Math.random()*0.8; z = 0.5+(Math.random()-0.5)*0.3; }
            else { x = (Math.random()>0.5?0.4:-0.4); y = 1.3+Math.random()*0.6; z = 0.5; }
            break;
          case 2: // Penguin (Cyan Glow)
            const r = 0.6 * Math.sqrt(Math.random()); const t = Math.random()*Math.PI*2;
            x = Math.cos(t)*r; z = Math.sin(t)*r; y = Math.random()*1.3;
            break;
          case 3: // Polar Bear (Starlight White)
            x = (Math.random()-0.5)*1.0; y = Math.random()*0.8; z = (Math.random()-0.5)*1.8;
            break;
          case 4: // Fox (Spirit Orange)
            if (u < 0.7) { x = (Math.random()-0.5)*0.5; y = Math.random()*0.4; z = (Math.random()-0.5)*1.2; }
            else { x = (Math.random()-0.5)*0.3; y = 0.2; z = -0.6 - Math.random()*0.8; }
            break;
          case 5: // Owl (Void Purple)
            const rad = 0.6 * Math.pow(Math.random(), 1/3);
            const to = 2 * Math.PI * Math.random(); const po = Math.acos(2*Math.random()-1);
            x = rad*Math.sin(po)*Math.cos(to); y = rad*Math.sin(po)*Math.sin(to)+0.8; z = rad*Math.cos(po);
            break;
        }
        arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
      }
      shapes[type] = arr;
    }
    return shapes;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isAnimalMode = gesture === GestureState.FINGERS && fingerCount > 0 && fingerCount <= 5;
    const particlesPerAnimal = Math.floor(PARTICLE_COUNT / (isAnimalMode ? fingerCount : 1));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let tx, ty, tz;

      if (isAnimalMode) {
        const animalIndex = Math.floor(i / particlesPerAnimal);
        if (animalIndex >= fingerCount) { tx = 0; ty = 0; tz = 0; }
        else {
          const type = fingerCount;
          const radius = 8 + type * 0.5;
          const speed = 0.4 + type * 0.05;
          const orbitAngle = (time * speed) + (animalIndex * (Math.PI * 2 / fingerCount));
          
          const localI3 = (i % PARTICLE_COUNT) * 3;
          const lx = animalLocalShapes[type][localI3];
          const ly = animalLocalShapes[type][localI3 + 1];
          const lz = animalLocalShapes[type][localI3 + 2];

          const rotY = -orbitAngle + Math.PI / 2;
          const cosR = Math.cos(rotY);
          const sinR = Math.sin(rotY);

          tx = Math.cos(orbitAngle) * radius + (lx * cosR + lz * sinR);
          ty = -2.5 + ly + Math.sin(time * 2 + animalIndex) * 0.2;
          tz = Math.sin(orbitAngle) * radius + (-lx * sinR + lz * cosR);
        }
      } else {
        const targetSet = (gesture === GestureState.CLENCHED_FIST || gesture === GestureState.IDLE) ? treeTargets : nebulaTargets;
        tx = targetSet[i3];
        ty = targetSet[i3 + 1];
        tz = targetSet[i3 + 2];
      }

      // Add magnetism to hand position
      const distToHand = Math.sqrt(Math.pow(tx - hx, 2) + Math.pow(ty - hy, 2));
      if (distToHand < 8) {
        const pull = (1 - distToHand / 8) * HAND_INFLUENCE;
        tx = THREE.MathUtils.lerp(tx, hx, pull);
        ty = THREE.MathUtils.lerp(ty, hy, pull);
      }

      // Smooth Lerp
      currentPositions[i3] = THREE.MathUtils.lerp(currentPositions[i3], tx, LERP_FACTOR);
      currentPositions[i3 + 1] = THREE.MathUtils.lerp(currentPositions[i3 + 1], ty, LERP_FACTOR);
      currentPositions[i3 + 2] = THREE.MathUtils.lerp(currentPositions[i3 + 2], tz, LERP_FACTOR);

      dummy.position.set(currentPositions[i3], currentPositions[i3 + 1], currentPositions[i3 + 2]);
      
      // Magical Sparkle Scale
      let s = 0.045;
      const noise = Math.sin(time * 5 + i * 0.1);
      if (noise > 0.97) s *= (1.5 + Math.random());

      // Magical Color Shifting
      if (isAnimalMode) {
        const colors = [PALETTE.GOLD, PALETTE.AETHER_CYAN, PALETTE.SNOW_WHITE, PALETTE.VOID_PURPLE, PALETTE.MYSTIC_BLUE];
        color.set(colors[fingerCount - 1]);
      } else if (gesture === GestureState.OPEN_PALM) {
        color.set(i % 2 === 0 ? PALETTE.AETHER_CYAN : PALETTE.VOID_PURPLE);
      } else {
        color.set(PALETTE.GOLD);
      }
      
      if (noise > 0.97) color.multiplyScalar(SPARKLE_INTENSITY);
      else color.multiplyScalar(BASE_INTENSITY);

      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 3, 3]} />
      <meshBasicMaterial transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
};
