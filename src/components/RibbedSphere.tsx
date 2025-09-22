import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface RibbedSphereProps {
  className?: string;
}

const AnimatedRibbedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create custom shader material for elegant flowing ridges
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
          
          // Create elegant spiral ridges like the reference image
          float angle = atan(position.z, position.x);
          float spiralFlow = sin(angle * 3.0 + position.y * 4.0 + time * 0.8) * 0.08;
          
          // Add secondary flowing ridges
          float ridges = sin((position.x + position.z) * 8.0 + time * 1.2) * 0.06;
          
          // Subtle breathing effect
          float breathe = sin(time * 1.5) * 0.02;
          
          // Combine displacements for smooth flowing effect
          float totalDisplacement = spiralFlow + ridges + breathe;
          
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
          // Create flowing spiral ridge pattern
          float angle = atan(vPosition.z, vPosition.x);
          float spiralPattern = sin(angle * 3.0 + vPosition.y * 4.0 + time * 0.8);
          
          // Secondary ridge pattern
          float ridgePattern = sin((vPosition.x + vPosition.z) * 8.0 + time * 1.2);
          
          // Combine patterns for elegant flowing ridges
          float combinedPattern = (spiralPattern + ridgePattern) * 0.5;
          combinedPattern = smoothstep(-0.3, 0.3, combinedPattern);
          
          // Pure white base color like the reference
          vec3 baseColor = vec3(0.98, 0.99, 1.0);
          
          // Soft lighting setup
          vec3 lightDirection = normalize(vec3(1.0, 1.2, 1.5));
          float NdotL = max(dot(vNormal, lightDirection), 0.0);
          
          // Create ridge shadows for depth
          float ridgeShadow = combinedPattern * 0.12;
          
          // Subtle ambient occlusion in recessed areas
          float ao = 1.0 - (combinedPattern * 0.08);
          
          // Calculate final lighting
          vec3 finalColor = baseColor * (0.75 + NdotL * 0.25) * ao - ridgeShadow;
          
          // Soft rim lighting for elegant highlight
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          rim = smoothstep(0.6, 1.0, rim);
          finalColor += rim * vec3(0.08, 0.08, 0.1);
          
          // Subtle specular highlight
          vec3 viewDirection = normalize(vec3(0.0, 0.0, 1.0));
          vec3 reflectDirection = reflect(-lightDirection, vNormal);
          float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 64.0);
          finalColor += spec * vec3(0.15, 0.15, 0.15);
          
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