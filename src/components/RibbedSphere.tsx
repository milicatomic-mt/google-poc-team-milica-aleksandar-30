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
          
          // Create flowing ridge pattern like the reference
          float angle = atan(position.y, position.x);
          float height = position.z;
          
          // Main flowing ridges that wrap around the sphere
          float ridge1 = sin((angle * 3.0 + height * 2.0) + time * 0.5) * 0.08;
          float ridge2 = sin((angle * 4.5 + height * 1.5) + time * 0.3) * 0.06;
          float ridge3 = sin((angle * 2.0 + height * 3.0) + time * 0.7) * 0.04;
          
          // Add subtle flowing motion
          float flow = sin(angle * 6.0 + time * 0.8) * 0.02;
          
          // Combine ridges for clean flowing pattern
          float totalDisplacement = ridge1 + ridge2 + ridge3 + flow;
          
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
          // Create flowing ridge pattern for surface coloring
          float angle = atan(vPosition.y, vPosition.x);
          float height = vPosition.z;
          
          // Ridge patterns that match the geometry displacement
          float ridgePattern = sin((angle * 3.0 + height * 2.0) + time * 0.5) * 0.5 + 0.5;
          ridgePattern = smoothstep(0.2, 0.8, ridgePattern);
          
          // Base color - clean white/light gray
          vec3 baseColor = vec3(0.96, 0.97, 0.98);
          
          // Dynamic lighting calculation
          vec3 lightDirection = normalize(vec3(
            1.0 + sin(time * 1.2) * 0.3, 
            1.0 + cos(time * 0.8) * 0.2, 
            1.0
          ));
          float lightIntensity = max(dot(vNormal, lightDirection), 0.0);
          
          // Add subtle shadows for ridge definition
          float shadow = ridgePattern * 0.15;
          
          vec3 finalColor = baseColor * (0.75 + lightIntensity * 0.25) - shadow;
          
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