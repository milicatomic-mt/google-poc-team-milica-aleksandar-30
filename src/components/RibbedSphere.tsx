import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface RibbedSphereProps {
  className?: string;
}

const AnimatedRibbedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create custom shader material for liquid ribbed effect
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          
          // Create liquid-like displacement with multiple wave frequencies
          float wave1 = sin(position.x * 8.0 + time * 2.0) * 0.03;
          float wave2 = sin(position.y * 12.0 + time * 1.5) * 0.025;
          float wave3 = sin(position.z * 10.0 + time * 2.5) * 0.02;
          
          // Add flowing liquid effect
          float flow = sin((position.x + position.y) * 6.0 + time * 3.0) * 0.04;
          float ripple = sin(length(position.xy) * 15.0 - time * 4.0) * 0.015;
          
          // Combine all displacements for liquid effect
          float totalDisplacement = wave1 + wave2 + wave3 + flow + ripple;
          
          vec3 newPosition = position + normal * totalDisplacement;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          // Create animated ribbed pattern with liquid flow
          float pattern1 = sin((vPosition.x + vPosition.y) * 15.0 + time * 2.0) * 0.5 + 0.5;
          float pattern2 = sin((vPosition.y + vPosition.z) * 12.0 + time * 1.8) * 0.3 + 0.7;
          float pattern3 = sin((vPosition.x + vPosition.z) * 18.0 + time * 2.3) * 0.4 + 0.6;
          
          // Combine patterns for complex liquid surface
          float combinedPattern = (pattern1 + pattern2 + pattern3) / 3.0;
          combinedPattern = smoothstep(0.3, 0.8, combinedPattern);
          
          // Base color - clean white/light gray
          vec3 baseColor = vec3(0.94, 0.95, 0.97);
          
          // Dynamic lighting calculation
          vec3 lightDirection = normalize(vec3(
            1.0 + sin(time * 1.2) * 0.3, 
            1.0 + cos(time * 0.8) * 0.2, 
            1.0
          ));
          float lightIntensity = max(dot(vNormal, lightDirection), 0.0);
          
          // Add flowing shadow based on pattern
          float shadow = combinedPattern * 0.162;
          
          // Create liquid-like color variation
          float colorShift = sin(vPosition.x * 8.0 + time * 1.5) * 0.02;
          baseColor += vec3(colorShift, colorShift * 0.5, -colorShift * 0.3);
          
          vec3 finalColor = baseColor * (0.65 + lightIntensity * 0.35) - shadow;
          
          // Enhanced rim lighting with animation
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          rim = smoothstep(0.5, 1.0, rim);
          rim *= 1.0 + sin(time * 3.0) * 0.1; // Animated rim
          finalColor += rim * vec3(0.15, 0.12, 0.1);
          
          // Add subtle liquid shine
          float shine = pow(max(dot(vNormal, lightDirection), 0.0), 32.0);
          finalColor += shine * vec3(0.1, 0.1, 0.1);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, []);

  // Enhanced rotation with liquid movement
  useFrame((state) => {
    if (meshRef.current && material) {
      // Update time uniform for shader animation
      material.uniforms.time.value = state.clock.elapsedTime;
      
      // Smooth, liquid-like rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.25) * 0.1;
      
      // Subtle liquid breathing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
      meshRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[1, 80, 80]} />
    </mesh>
  );
};

const RibbedSphere: React.FC<RibbedSphereProps> = ({ className = "" }) => {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[2, 2, 2]} 
          intensity={0.8}
          castShadow
        />
        <directionalLight 
          position={[-1, -1, 1]} 
          intensity={0.3}
          color="#f0f0f0"
        />
        <AnimatedRibbedSphere />
      </Canvas>
    </div>
  );
};

export default RibbedSphere;