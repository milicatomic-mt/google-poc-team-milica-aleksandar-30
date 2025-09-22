import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface RibbedSphereProps {
  className?: string;
}

const AnimatedRibbedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create custom shader material with working realistic effects
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
          
          // Realistic surface displacement
          float wave1 = sin(position.x * 12.0 + time * 1.5) * 0.01;
          float wave2 = sin(position.y * 18.0 + time * 2.1) * 0.008;
          float wave3 = sin(position.z * 15.0 + time * 1.8) * 0.012;
          
          // Fine surface detail
          float detail = sin(position.x * 35.0 + time * 0.8) * 0.003;
          
          float totalDisplacement = wave1 + wave2 + wave3 + detail;
          
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
          vec3 normal = normalize(vNormal);
          
          // Realistic base color
          vec3 baseColor = vec3(0.96, 0.97, 0.98);
          
          // Multiple light sources
          vec3 lightDir1 = normalize(vec3(1.0, 1.0, 0.8));
          vec3 lightDir2 = normalize(vec3(-0.5, 0.8, 0.3));
          
          // Diffuse lighting
          float diff1 = max(dot(normal, lightDir1), 0.0);
          float diff2 = max(dot(normal, lightDir2), 0.0) * 0.4;
          float totalDiffuse = diff1 + diff2;
          
          // Simple specular
          vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
          vec3 reflectDir = reflect(-lightDir1, normal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
          
          // Surface variation
          float surfaceNoise = sin(vPosition.x * 8.0 + time * 0.1) * 0.02;
          baseColor += vec3(surfaceNoise);
          
          // Combine lighting
          vec3 ambient = baseColor * 0.4;
          vec3 diffuse = baseColor * totalDiffuse * 0.6;
          vec3 specular = vec3(1.0) * spec * 0.3;
          
          vec3 finalColor = ambient + diffuse + specular;
          
          // Rim lighting
          float rim = 1.0 - max(dot(normal, viewDir), 0.0);
          rim = smoothstep(0.6, 1.0, rim);
          finalColor += rim * vec3(0.1, 0.12, 0.15) * 0.3;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, []);

  // Enhanced rotation with realistic material updates
  useFrame((state) => {
    if (meshRef.current && material) {
      // Update time uniform for shader animation
      material.uniforms.time.value = state.clock.elapsedTime;
      
      // Smooth, organic rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.1;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.08;
      
      // Subtle breathing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
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