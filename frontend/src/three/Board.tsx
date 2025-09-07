import React, { useRef, useMemo } from 'react';
// import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BoardProps {
  onSquareClick?: (x: number, y: number) => void;
  highlightedSquares?: Array<{ x: number; y: number; color?: string }>;
}

const Board: React.FC<BoardProps> = ({ onSquareClick, highlightedSquares = [] }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Create board squares
  const squares = useMemo(() => {
    const result = [];
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const isLight = (x + y) % 2 === 0;
        const color = isLight ? '#f0d9b5' : '#b58863';
        
        result.push({
          x,
          y,
          position: [x - 3.5, 0, y - 3.5] as [number, number, number],
          color,
        });
      }
    }
    return result;
  }, []);

  // Create highlight overlays
  const highlights = useMemo(() => {
    return highlightedSquares.map(({ x, y, color = '#00ff00' }) => ({
      x,
      y,
      position: [x - 3.5, 0.01, y - 3.5] as [number, number, number],
      color,
    }));
  }, [highlightedSquares]);

  const handleSquareClick = (x: number, y: number) => {
    if (onSquareClick) {
      onSquareClick(x, y);
    }
  };

  return (
    <group ref={groupRef}>
      {/* Base board */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.1, 8.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Board squares */}
      {squares.map(({ x, y, position, color }) => (
        <mesh
          key={`${x}-${y}`}
          position={position}
          onClick={() => handleSquareClick(x, y)}
          receiveShadow
        >
          <planeGeometry args={[0.98, 0.98]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}

      {/* Highlight overlays */}
      {highlights.map(({ x, y, position, color }) => (
        <mesh key={`highlight-${x}-${y}`} position={position}>
          <ringGeometry args={[0.3, 0.45, 16]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Board coordinates */}
      {/* Files (a-h) */}
      {Array.from({ length: 8 }, (_, i) => (
        <Text
          key={`file-${i}`}
          position={[i - 3.5, 0.01, -4.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.2}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {String.fromCharCode(97 + i)}
        </Text>
      ))}

      {/* Ranks (1-8) */}
      {Array.from({ length: 8 }, (_, i) => (
        <Text
          key={`rank-${i}`}
          position={[-4.2, 0.01, i - 3.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.2}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {(8 - i).toString()}
        </Text>
      ))}
    </group>
  );
};

export default Board;