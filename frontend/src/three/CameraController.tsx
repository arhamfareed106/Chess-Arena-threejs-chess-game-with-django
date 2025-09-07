import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControllerProps {
  preset: 'top-down' | 'isometric' | 'side-view';
  target?: [number, number, number];
  enableControls?: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({
  preset,
  target = [0, 0, 0],
  enableControls: _enableControls = true,
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const currentTarget = useRef(new THREE.Vector3(...target));

  // Camera presets
  const presets = {
    'top-down': {
      position: new THREE.Vector3(0, 12, 0.1),
      lookAt: new THREE.Vector3(0, 0, 0),
    },
    'isometric': {
      position: new THREE.Vector3(8, 8, 8),
      lookAt: new THREE.Vector3(0, 0, 0),
    },
    'side-view': {
      position: new THREE.Vector3(0, 4, 10),
      lookAt: new THREE.Vector3(0, 0, 0),
    },
  };

  React.useEffect(() => {
    const preset_config = presets[preset];
    targetPosition.current.copy(preset_config.position);
    currentTarget.current.copy(preset_config.lookAt);
  }, [preset]);

  React.useEffect(() => {
    currentTarget.current.set(...target);
  }, [target]);

  useFrame(() => {
    if (!cameraRef.current) return;

    // Smooth camera movement
    cameraRef.current.position.lerp(targetPosition.current, 0.05);
    cameraRef.current.lookAt(currentTarget.current);
    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={60}
      near={0.1}
      far={1000}
      position={presets[preset].position.toArray()}
    />
  );
};

export default CameraController;