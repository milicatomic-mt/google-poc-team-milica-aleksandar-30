import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface RibbedSphereProps {
  className?: string;
}

const AnimatedRibbedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create custom shader material for flowing ribbed effect
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
          
          // Convert to spherical coordinates for proper mapping
          float theta = atan(position.z, position.x);
          float phi = acos(position.y / length(position));
          
          // Create flowing ribbed pattern displacement
          float ribPattern1 = sin(theta * 6.0 + phi * 4.0 + time * 0.8) * 0.08;
          float ribPattern2 = sin(theta * 8.0 - phi * 3.0 + time * 0.5) * 0.06;
          float ribPattern3 = sin((theta + phi) * 5.0 + time * 0.3) * 0.04;
          
          // Add subtle flowing movement
          float flow = sin(theta * 3.0 + time * 0.6) * cos(phi * 2.0 + time * 0.4) * 0.03;
          
          // Combine displacements for sculptural ribbed effect
          float totalDisplacement = ribPattern1 + ribPattern2 + ribPattern3 + flow;
          
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
          // Convert to spherical coordinates for consistent pattern
          float theta = atan(vPosition.z, vPosition.x);
          float phi = acos(vPosition.y / length(vPosition));
          
          // Create flowing ribbed pattern similar to reference image
          float ribFlow1 = sin(theta * 6.0 + phi * 4.0 + time * 0.8);
          float ribFlow2 = sin(theta * 8.0 - phi * 3.0 + time * 0.5);
          float ribFlow3 = sin((theta + phi) * 5.0 + time * 0.3);
          
          // Combine patterns for sculptural ridges
          float combinedRibs = (ribFlow1 + ribFlow2 + ribFlow3) * 0.5;
          combinedRibs = smoothstep(-0.3, 0.3, combinedRibs);
          
          // Base color - clean white/light gray like reference
          vec3 baseColor = vec3(0.95, 0.96, 0.97);
          
          // Smooth lighting calculation
          vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.2));
          float lightIntensity = max(dot(vNormal, lightDirection), 0.0);
          
          // Add shadow depth based on ribbed pattern
          float shadowDepth = combinedRibs * 0.15;
          
          // Create the flowing ridge effect
          vec3 finalColor = baseColor * (0.7 + lightIntensity * 0.3) - shadowDepth;
          
          // Add subtle rim lighting
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          rim = smoothstep(0.6, 1.0, rim);
          finalColor += rim * vec3(0.1, 0.1, 0.1);
          
          // Add subtle highlight on ridges
          float ridgeHighlight = smoothstep(0.4, 0.6, combinedRibs);
          finalColor += ridgeHighlight * vec3(0.05, 0.05, 0.05);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, []);

  // Enhanced rotation with liquid movement
  useFrame((state) => {
    if (meshRef.current && material) {
      try {
        // Update time uniform for shader animation
        material.uniforms.time.value = state.clock.elapsedTime;
        
        // Smooth, liquid-like rotation
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
        meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.25) * 0.1;
        
        // Subtle liquid breathing effect
        const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
        meshRef.current.scale.setScalar(breathe);
      } catch (error) {
        console.warn('WebGL animation error:', error);
      }
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[1, 80, 80]} />
    </mesh>
  );
};

// Simple fallback component when WebGL fails
const SimpleFallback = ({ className }: { className?: string }) => (
  <div 
    className={`${className} w-full h-full flex items-center justify-center`}
    style={{
      background: 'radial-gradient(circle, #f1f2f4 0%, #e0e1e3 70%)',
      borderRadius: '50%',
      minWidth: '32px',
      minHeight: '32px'
    }}
  >
    <div 
      className="w-4 h-4 rounded-full animate-pulse"
      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
    />
  </div>
);

const RibbedSphere: React.FC<RibbedSphereProps> = ({ className = "" }) => {
  const [hasWebGLError, setHasWebGLError] = useState(false);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGLError(true);
      }
    } catch (error) {
      console.warn('WebGL check failed:', error);
      setHasWebGLError(true);
    }
  }, []);

  if (hasWebGLError) {
    return <SimpleFallback className={className} />;
  }

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        onCreated={(state) => {
          // Add context lost listener to detect WebGL issues
          const canvas = state.gl.domElement;
          canvas.addEventListener('webglcontextlost', (event) => {
            console.warn('WebGL context lost');
            event.preventDefault();
            setHasWebGLError(true);
          });
        }}
        gl={{ 
          preserveDrawingBuffer: false,
          antialias: false,
          alpha: true,
          powerPreference: "default"
        }}
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