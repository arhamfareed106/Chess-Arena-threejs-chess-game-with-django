import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Piece as PieceType, PieceType as PieceEnum } from '@/types';
import { getPieceGeometry, createPieceMaterial } from './geometries';

interface PieceProps {
  piece: PieceType;
  position: [number, number, number];
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: (piece: PieceType) => void;
  animateMove?: boolean;
}

const Piece: React.FC<PieceProps> = ({
  piece,
  position,
  isSelected = false,
  isHighlighted = false,
  onClick,
  animateMove = true,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const targetPosition = useRef(new THREE.Vector3(...position));
  const currentPosition = useRef(new THREE.Vector3(...position));

  // Update target position when prop changes
  React.useEffect(() => {
    targetPosition.current.set(...position);
  }, [position]);

  // Animate piece movement
  useFrame(() => {
    if (!meshRef.current || !animateMove) return;

    // Smooth position interpolation
    currentPosition.current.lerp(targetPosition.current, 0.1);
    meshRef.current.position.copy(currentPosition.current);

    // Floating animation for selected pieces
    if (isSelected) {
      const time = Date.now() * 0.002;
      meshRef.current.position.y = position[1] + Math.sin(time) * 0.05 + 0.1;
    }

    // Hover effect
    if (hovered) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (onClick) {
      onClick(piece);
    }
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  // Get geometry and material based on piece type and level
  const geometry = getPieceGeometry(piece.pieceType as PieceEnum);
  const material = createPieceMaterial(piece.ownerColor, piece.level);

  return (
    <group>
      {/* Main piece mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        position={position}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      />

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[position[0], 0.01, position[2]]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial
            color="#ffff00"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Highlight indicator */}
      {isHighlighted && (
        <mesh position={[position[0], 0.02, position[2]]}>
          <ringGeometry args={[0.35, 0.4, 16]} />
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Level indicator */}
      <Text
        position={[position[0], position[1] + 0.8, position[2]]}
        fontSize={0.15}
        color={piece.ownerColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        L{piece.level}
      </Text>

      {/* Transform count indicator */}
      {piece.transformCount > 0 && (
        <group>
          {Array.from({ length: piece.transformCount }, (_, i) => (
            <mesh
              key={i}
              position={[
                position[0] - 0.3 + i * 0.15,
                position[1] + 0.6,
                position[2],
              ]}
            >
              <sphereGeometry args={[0.03]} />
              <meshBasicMaterial color="#ffd700" />
            </mesh>
          ))}
        </group>
      )}

      {/* Special abilities indicator */}
      {piece.pieceType === PieceEnum.INVESTOR && (
        <mesh position={[position[0], position[1] + 1, position[2]]}>
          <ringGeometry args={[0.1, 0.15, 8]} />
          <meshBasicMaterial
            color="#ff6b6b"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {piece.pieceType === PieceEnum.STRATEGIST && (
        <mesh position={[position[0], position[1] + 1, position[2]]}>
          <ringGeometry args={[0.1, 0.15, 6]} />
          <meshBasicMaterial
            color="#4ecdc4"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Temporary buffs indicator */}
      {Object.keys(piece.temporaryBuffs || {}).length > 0 && (
        <mesh position={[position[0] + 0.4, position[1] + 0.5, position[2]]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial
            color="#ff9500"
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
};

export default Piece;