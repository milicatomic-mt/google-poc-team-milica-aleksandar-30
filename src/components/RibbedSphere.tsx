import React, { useRef, useMemo, useState, useEffect } from 'react';
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
          // Multiple dynamic light sources for realistic liquid shadows
          vec3 lightDir1 = normalize(vec3(1.0, 1.0, 1.0));
          vec3 lightDir2 = normalize(vec3(-0.5, 0.8, 0.6));
          vec3 lightDir3 = normalize(vec3(0.0, -1.0, 0.5));
          
          // Calculate lighting for each light source
          float light1 = max(dot(vNormal, lightDir1), 0.0);
          float light2 = max(dot(vNormal, lightDir2), 0.0) * 0.6;
          float light3 = max(dot(vNormal, lightDir3), 0.0) * 0.4;
          
          // Combine lighting
          float totalLight = light1 + light2 + light3;
          
          // Create realistic liquid shadow mapping
          vec3 viewDir = normalize(-vPosition);
          float viewDot = dot(vNormal, viewDir);
          
          // Fresnel effect for liquid surface
          float fresnel = pow(1.0 - abs(viewDot), 2.0);
          
          // Self-shadowing based on surface curvature
          float curvature = length(fwidth(vNormal));
          float selfShadow = 1.0 - smoothstep(0.0, 0.8, curvature * 10.0);
          
          // Dynamic shadows that flow across the surface
          vec3 shadowPos = vPosition + vec3(sin(time * 0.8), cos(time * 1.2), sin(time * 0.6)) * 0.3;
          float dynamicShadow = sin(shadowPos.x * 4.0 + shadowPos.y * 3.0 + time * 2.0) * 0.5 + 0.5;
          dynamicShadow = smoothstep(0.2, 0.8, dynamicShadow);
          
          // Ambient occlusion approximation
          float ao = pow(clamp(viewDot, 0.0, 1.0), 0.8);
          
          // Base liquid color - slightly translucent white
          vec3 baseColor = vec3(0.96, 0.97, 0.98);
          
          // Apply shadows and lighting
          float shadowFactor = selfShadow * dynamicShadow * ao * 0.7 + 0.3;
          vec3 litColor = baseColor * totalLight * shadowFactor;
          
          // Add subsurface scattering effect for liquid
          float scattering = pow(max(dot(-lightDir1, viewDir), 0.0), 8.0) * fresnel;
          litColor += vec3(0.1, 0.15, 0.2) * scattering;
          
          // Specular highlights for wet surface
          vec3 reflectDir = reflect(-lightDir1, vNormal);
          float spec = pow(max(dot(reflectDir, viewDir), 0.0), 64.0);
          litColor += vec3(0.8, 0.9, 1.0) * spec * 0.6;
          
          // Rim lighting for liquid edge definition
          float rimLight = pow(1.0 - abs(viewDot), 1.5) * 0.4;
          litColor += vec3(0.4, 0.5, 0.6) * rimLight;
          
          // Depth-based darkening for more realistic volume
          float depth = smoothstep(0.0, 1.0, abs(vPosition.z));
          litColor *= 0.8 + depth * 0.2;
          
          gl_FragColor = vec4(litColor, 1.0);
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
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[2, 3, 4]} 
          intensity={1.2}
          color="#ffffff"
          castShadow
        />
        <directionalLight 
          position={[-1.5, 1, 2]} 
          intensity={0.6}
          color="#f8f9fa"
        />
        <pointLight 
          position={[0, 2, 3]} 
          intensity={0.8}
          color="#ffffff"
        />
        <pointLight 
          position={[-2, -1, 1]} 
          intensity={0.4}
          color="#e9ecef"
        />
        <AnimatedRibbedSphere />
      </Canvas>
    </div>
  );
};

export default RibbedSphere;