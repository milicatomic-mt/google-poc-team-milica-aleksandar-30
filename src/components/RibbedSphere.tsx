import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import sphereTexture from '@/assets/sphere-texture.png';

interface RibbedSphereProps {
  className?: string;
}

const AnimatedRibbedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load the texture
  const texture = useLoader(THREE.TextureLoader, sphereTexture);
  
  // Set texture properties
  useMemo(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  // Create custom shader material with texture
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        map: { value: texture },
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
          
          // Subtle liquid-like displacement
          float wave1 = sin(position.x * 4.0 + time * 1.0) * 0.015;
          float wave2 = sin(position.y * 6.0 + time * 0.8) * 0.012;
          float wave3 = sin(position.z * 5.0 + time * 1.2) * 0.01;
          
          // Gentle flowing effect
          float flow = sin((position.x + position.y) * 3.0 + time * 1.5) * 0.02;
          
          // Combine displacements for subtle liquid effect
          float totalDisplacement = wave1 + wave2 + wave3 + flow;
          
          vec3 newPosition = position + normal * totalDisplacement;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D map;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          // Use spherical UV mapping for full coverage
          vec3 normalized = normalize(vPosition);
          
          // Convert to spherical coordinates for proper texture mapping
          float phi = atan(normalized.z, normalized.x) + 3.14159;
          float theta = acos(normalized.y);
          
          vec2 sphericalUv = vec2(
            phi / (2.0 * 3.14159),
            theta / 3.14159
          );
          
          // Add subtle animation to the UV coordinates
          sphericalUv.x += sin(normalized.y * 3.0 + time * 0.4) * 0.02;
          sphericalUv.y += cos(normalized.x * 3.0 + time * 0.3) * 0.02;
          
          // Ensure texture repeats properly across seams
          sphericalUv = fract(sphericalUv);
          
          // Sample the texture
          vec4 textureColor = texture2D(map, sphericalUv);
          
          // Dynamic lighting calculation
          vec3 lightDirection = normalize(vec3(
            1.0 + sin(time * 0.8) * 0.2, 
            1.0 + cos(time * 0.6) * 0.15, 
            1.0
          ));
          float lightIntensity = max(dot(vNormal, lightDirection), 0.0);
          
          // Use texture as base color
          vec3 baseColor = textureColor.rgb;
          
          // Apply lighting
          vec3 finalColor = baseColor * (0.7 + lightIntensity * 0.3);
          
          // Enhanced rim lighting
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          rim = smoothstep(0.6, 1.0, rim);
          finalColor += rim * vec3(0.1, 0.1, 0.1);
          
          // Add subtle shine on white areas
          float shine = pow(max(dot(vNormal, lightDirection), 0.0), 16.0) * textureColor.r;
          finalColor += shine * vec3(0.15, 0.15, 0.15);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, [texture]);

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