import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface RibbedSphereProps {
  className?: string;
}

const AnimatedRibbedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create custom shader material for realistic surface
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        cameraPosition: { value: new THREE.Vector3() },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying vec3 vViewDirection;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Multi-octave noise for realistic surface detail
          float noise1 = sin(position.x * 12.0 + time * 1.5) * 0.015;
          float noise2 = sin(position.y * 18.0 + time * 2.1) * 0.008;
          float noise3 = sin(position.z * 15.0 + time * 1.8) * 0.012;
          
          // Add fine surface detail
          float detail1 = sin(position.x * 35.0 + time * 0.8) * 0.003;
          float detail2 = sin(position.y * 42.0 + time * 1.2) * 0.002;
          float detail3 = sin((position.x + position.z) * 28.0 + time * 0.6) * 0.004;
          
          // Create realistic surface undulation
          float displacement = noise1 + noise2 + noise3 + detail1 + detail2 + detail3;
          
          vec3 newPosition = position + normal * displacement;
          vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          // Calculate proper normals for realistic lighting
          vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
          vec3 bitangent = normalize(cross(normal, tangent));
          float offset = 0.001;
          
          vec3 neighborPos1 = position + tangent * offset;
          vec3 neighborPos2 = position + bitangent * offset;
          
          float disp1 = sin(neighborPos1.x * 12.0 + time * 1.5) * 0.015 + sin(neighborPos1.y * 18.0 + time * 2.1) * 0.008;
          float disp2 = sin(neighborPos2.x * 12.0 + time * 1.5) * 0.015 + sin(neighborPos2.y * 18.0 + time * 2.1) * 0.008;
          
          vec3 newNorm1 = neighborPos1 + normal * disp1;
          vec3 newNorm2 = neighborPos2 + normal * disp2;
          
          vec3 calculatedNormal = normalize(cross(newNorm1 - newPosition, newNorm2 - newPosition));
          vNormal = normalize(normalMatrix * calculatedNormal);
          
          vViewDirection = normalize(cameraPosition - worldPosition.xyz);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 cameraPosition;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying vec3 vViewDirection;
        
        // Fresnel function for realistic reflections
        float fresnel(vec3 viewDir, vec3 normal, float power) {
          float cosTheta = dot(viewDir, normal);
          return pow(1.0 - max(cosTheta, 0.0), power);
        }
        
        // Noise function for surface variation
        float noise(vec3 pos) {
          return sin(pos.x * 8.0) * sin(pos.y * 8.0) * sin(pos.z * 8.0) * 0.5 + 0.5;
        }
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewDirection);
          
          // Realistic base material color with subtle variation
          vec3 baseColor = vec3(0.96, 0.97, 0.98);
          
          // Add surface color variation based on position
          float colorNoise = noise(vPosition * 3.0 + time * 0.1);
          baseColor += vec3(colorNoise * 0.03 - 0.015);
          
          // Multiple light sources for realistic lighting
          vec3 lightDir1 = normalize(vec3(1.0, 1.0, 0.8));
          vec3 lightDir2 = normalize(vec3(-0.5, 0.8, 0.3));
          vec3 lightDir3 = normalize(vec3(0.0, -0.3, 1.0));
          
          // Calculate diffuse lighting
          float diff1 = max(dot(normal, lightDir1), 0.0);
          float diff2 = max(dot(normal, lightDir2), 0.0) * 0.4;
          float diff3 = max(dot(normal, lightDir3), 0.0) * 0.2;
          float totalDiffuse = diff1 + diff2 + diff3;
          
          // Calculate specular highlights
          vec3 reflectDir1 = reflect(-lightDir1, normal);
          vec3 reflectDir2 = reflect(-lightDir2, normal);
          float spec1 = pow(max(dot(viewDir, reflectDir1), 0.0), 64.0);
          float spec2 = pow(max(dot(viewDir, reflectDir2), 0.0), 32.0) * 0.5;
          float totalSpecular = spec1 + spec2;
          
          // Fresnel reflection for realism
          float fresnelTerm = fresnel(viewDir, normal, 2.0);
          
          // Surface roughness variation
          float roughness = 0.15 + noise(vPosition * 8.0 + time * 0.2) * 0.1;
          
          // Ambient occlusion approximation
          float ao = 1.0 - smoothstep(0.0, 0.5, length(vPosition) * 0.3);
          ao = mix(0.7, 1.0, ao);
          
          // Subsurface scattering approximation
          float subsurface = pow(max(dot(-lightDir1, normal), 0.0), 1.5) * 0.3;
          
          // Combine all lighting components
          vec3 ambient = baseColor * 0.4 * ao;
          vec3 diffuse = baseColor * totalDiffuse * 0.6;
          vec3 specular = vec3(1.0) * totalSpecular * (1.0 - roughness);
          vec3 fresnel = vec3(0.9, 0.95, 1.0) * fresnelTerm * 0.2;
          vec3 scatter = baseColor * subsurface;
          
          vec3 finalColor = ambient + diffuse + specular + fresnel + scatter;
          
          // Add subtle rim lighting for depth
          float rim = 1.0 - max(dot(viewDir, normal), 0.0);
          rim = smoothstep(0.6, 1.0, rim);
          finalColor += rim * vec3(0.1, 0.12, 0.15) * 0.5;
          
          // Tone mapping for realistic appearance
          finalColor = finalColor / (finalColor + vec3(1.0));
          finalColor = pow(finalColor, vec3(1.0/2.2)); // Gamma correction
          
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
      
      // Update camera position for view-dependent effects
      material.uniforms.cameraPosition.value.copy(state.camera.position);
      
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