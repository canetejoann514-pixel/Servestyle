import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

interface Tour360ViewerProps {
  imageUrl: string;
}

function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial side={THREE.BackSide}>
        <primitive attach="map" object={new THREE.TextureLoader().load(imageUrl)} />
      </meshBasicMaterial>
    </mesh>
  );
}

const Tour360Viewer = ({ imageUrl }: Tour360ViewerProps) => {
  return (
    <div className="w-full h-full relative bg-background">
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 75 }}
        gl={{ antialias: true }}
      >
        <PanoramaSphere imageUrl={imageUrl} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={-0.5}
          minDistance={0.1}
          maxDistance={100}
          target={[0, 0, 0]}
        />
        <Environment preset="sunset" />
      </Canvas>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          Drag to look around • Scroll to zoom • Pinch to zoom on mobile
        </p>
      </div>
    </div>
  );
};

export default Tour360Viewer;
